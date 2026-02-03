'use strict';

const express = require('express');
const { expressjwt: validateJWT } = require('express-jwt');

const permissions = require('../middleware/route-permissions');

const router = express.Router();

// Ensure JWT is valid for all /letters routes
router.use(
    validateJWT({
        secret: process.env.CLS_JWT_SECRET,
        algorithms: ['HS256']
    })
);

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
        }
    };
}

/**
 * GET /letters/{userId}
 * Returns all letters for a user.
 */
router.get('/:userId', permissions('letters:read'), (req, res) => {
    const { userId } = req.params;
    res.json([
        buildLetterResource(userId, "26-700000", "some-letter-id"),
        buildLetterResource(userId, "26-700000", "another-letter-id"),
        buildLetterResource(userId, "26-800000", "fatal-letter-id")
    ]);
});

/**
 * GET /letters/{userId}/{caseReferenceNumber}
 * Returns all letters for a specific case.
 */
router.get('/:userId/:caseReferenceNumber', permissions('letters:read'), (req, res) => {
    const { userId, caseReferenceNumber } = req.params;
    res.json([
        buildLetterResource(userId, caseReferenceNumber, "some-letter-id"),
        buildLetterResource(userId, caseReferenceNumber, "another-letter-id")
    ]);
});

/**
 * GET /letters/{userId}/{caseReferenceNumber}/{letterId}
 * Returns a specific letter.
 */
router.get('/:userId/:caseReferenceNumber/:letterId', permissions('letters:read'), (req, res) => {
    const { userId, caseReferenceNumber, letterId } = req.params;

    const letter = buildLetterResource(userId, caseReferenceNumber, letterId);
    res.json(letter);
});

module.exports = router;
