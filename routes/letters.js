'use strict';

const express = require('express');

const router = express.Router();

// helper function
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
        },
        jsonUri: `s3://letter-bucket/${userId}/${caseReferenceNumber}/${letterId}.json`,
        pdfUri: `s3://letter-bucket/${userId}/${caseReferenceNumber}/${letterId}.pdf`
    };
}

/**
 * GET /letters/{userId}
 * Returns all letters for a user.
 */
router.get('/:userId', (req, res) => {
    res.json([]);
});

/**
 * DELETE /letters/{userId}
 * Deletes all letters for a user.
 */
router.delete('/:userId', (req, res) => {
    res.status(204).send();
});

/**
 * GET /letters/{userId}/{caseReferenceNumber}
 * Returns all letters for a specific case.
 */
router.get('/:userId/:caseReferenceNumber', (req, res) => {
    res.json([]);
});

/**
 * DELETE /letters/{userId}/{caseReferenceNumber}
 * Deletes all letters for a specific case.
 */
router.delete('/:userId/:caseReferenceNumber', (req, res) => {
    res.status(204).send();
});

/**
 * GET /letters/{userId}/{caseReferenceNumber}/{letterId}
 * Returns a specific letter.
 */
router.get('/:userId/:caseReferenceNumber/:letterId', (req, res) => {
    const { userId, caseReferenceNumber, letterId } = req.params;

    const letter = buildLetterResource(userId, caseReferenceNumber, letterId);
    res.json(letter);
});

/**
 * DELETE /letters/{userId}/{caseReferenceNumber}/{letterId}
 * Deletes a specific letter.
 */
router.delete('/:userId/:caseReferenceNumber/:letterId', (req, res) => {
    res.status(204).send();
});

/**
 * POST /letters/{userId}/{caseReferenceNumber}/{letterId}/send
 * Sends a specific letter.
 */
router.post('/:userId/:caseReferenceNumber/:letterId/send', (req, res) => {
    const { letterId } = req.params;

    res.json({
        letterId,
        status: 'sent'
    });
});

/**
 * POST /letters/{userId}/{caseReferenceNumber}/{letterId}/pdf
 * Generates a PDF for a specific letter.
 */
router.post('/:userId/:caseReferenceNumber/:letterId/pdf', (req, res) => {
    const { userId, caseReferenceNumber, letterId } = req.params;

    const uri = `s3://letter-bucket/${userId}/${caseReferenceNumber}/${letterId}.pdf`;

    res.status(201).json({
        letterId,
        uri
    });
});

module.exports = router;
