'use strict';

const createS3Service = require('./s3');
const createTransformer = require('./transformer');

function buildLetterResource(userId, caseReferenceNumber, letterId) {
    return {
        userId,
        caseReferenceNumber,
        letterId,
        letterType: 'AA01',
        letterData: {
            recipientName: 'Mr Test Testcase',
            caseReference: caseReferenceNumber,
            decisionDate: '2026-01-15'
        }
    };
}

function errorResponse(status, title, detail) {
    return {
        errors: [
            {
                status,
                title,
                detail
            }
        ]
    };
}

function getLettersForUser(req, res) {
    const { userId } = req.params;

    return res.json([
        buildLetterResource(userId, '26-700000', 'some-letter-id'),
        buildLetterResource(userId, '26-700000', 'another-letter-id'),
        buildLetterResource(userId, '26-800000', 'fatal-letter-id')
    ]);
}

function getLettersForCase(req, res) {
    const { userId, caseReferenceNumber } = req.params;

    return res.json([
        buildLetterResource(userId, caseReferenceNumber, 'some-letter-id'),
        buildLetterResource(userId, caseReferenceNumber, 'another-letter-id')
    ]);
}

async function getLetter(req, res) {
    const s3Client = createS3Service();
    const { userId, caseReferenceNumber, letterId } = req.params;
    const { format = 'json' } = req.query;

    const supportedFormats = ['json', 'template', 'pdf'];

    if (!supportedFormats.includes(format)) {
        return res
            .status(400)
            .type('application/vnd.api+json')
            .json(errorResponse(
                400,
                '400 Bad Request',
                `Unsupported format '${format}'. Supported formats are: ${supportedFormats.join(', ')}.`
            ));
    }
    const letterJson = await s3Client.getLetterDocument(process.env.CLS_LETTER_BUCKET, { userId, caseReferenceNumber, letterId });

    if (format === 'json') {
        return res.json(letterJson);
    }

    const transformer = createTransformer();

    if (format === 'template') {
        const transformedLetter = await transformer.getTransformedLetter(letterJson, {format});
        return res.json(transformedLetter);
    }

    const decisionLetterSchema = letterJson.template?.sections?.[letterJson.template?.routes?.initial]?.schema;

    const pdfData = {
        letterId,
        template: decisionLetterSchema,
        isPreview: false,
        letterJson
    };

    const transformedLetterPdf = await transformer.getTransformedLetter(pdfData, {format});
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${letterId}.pdf"`
    });

    return transformedLetterPdf.pipe(res);

}

module.exports = {
    getLettersForUser,
    getLettersForCase,
    getLetter
};