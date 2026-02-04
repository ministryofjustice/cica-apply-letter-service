'use strict';

const logger = require('../logger');
const createS3Service = require('../s3');
const createDcsClient = require('../dcs-client');
const createTransformer = require('../transformer');

function isNil(x) {
    return x === null || x === undefined || x === '';
}

function getDeleteType({ userId, caseReferenceNumber, letterId }) {
    if (isNil(userId)) {
        throw new Error('DELETE message missing required field: userId');
    }

    const hasCase = !isNil(caseReferenceNumber);
    const hasLetter = !isNil(letterId);

    if (hasCase && hasLetter) return 'DELETE_LETTER';
    if (hasCase && !hasLetter) return 'DELETE_CASE';
    if (!hasCase && !hasLetter) return 'DELETE_USER';

    throw new Error(
        `DELETE message has invalid combination: caseReferenceNumber=${caseReferenceNumber} letterId=${letterId}`
    );
}

module.exports = async (message) => {
    const messageId = message?.MessageId;

    logger.info(
        {
            messageId,
            body: message?.Body,
            attributes: message?.MessageAttributes,
        },
        'Handling SQS message'
    );

    try {
        const s3Client = createS3Service();
        const body = JSON.parse(message.Body);
        const { type } = body;

        if (!type || (type !== 'SEND' && type !== 'DELETE')) {
            const e = new Error(`Message missing/invalid "type" field`);
            e.code = 'INVALID_TYPE';
            throw e;
        }

        const requestedAt = body.requestedAt;

        if (type === 'DELETE') {
            const { userId, caseReferenceNumber, letterId } = body;
            const deleteType = getDeleteType({ userId, caseReferenceNumber, letterId });

            if (deleteType === 'DELETE_CASE') {
                logger.info(
                    { messageId, requestedAt, userId, caseReferenceNumber },
                    'DELETE_CASE'
                );
                return 'DONE!';
            }

            if (deleteType === 'DELETE_USER') {
                logger.info(
                    { messageId, requestedAt, userId },
                    'DELETE_USER'
                );
                return 'DONE!';
            }

            logger.info(
                { messageId, requestedAt, userId, caseReferenceNumber, letterId },
                'DELETE_LETTER'
            );
            return 'DONE!';
        }

        const key = body.key;

        if (isNil(key)) {
            const e = new Error('SEND message missing required field: key');
            e.code = 'MISSING_KEY';
            throw e;
        }

        logger.info(
            { messageId, requestedAt, key },
            'SEND_LETTER'
        );

        // get data from S3
        const letterDocument = await s3Client.getLetterDocument(process.env.CLS_LETTER_BUCKET, key);
        // transform data
        const transformer = createTransformer();
        const { template, letterData } = letterDocument;
        const transformedLetterTemplate = await transformer.getTransformedTemplate({ template, ...letterData });
        // Call DCS
        const dcsClient = createDcsClient();
        await dcsClient.sendLetter(transformedLetterTemplate, letterDocument);

        return 'DONE!';
    } catch (err) {
        logger.error(
            {
                messageId,
                err,
                body: message?.Body,
            },
            'Failed to handle SQS message'
        );

        err.message = `${err.message} (messageId=${messageId})`;
        throw err;
    }
};
