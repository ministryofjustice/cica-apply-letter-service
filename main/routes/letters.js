'use strict';

const express = require('express');
const { expressjwt: validateJWT } = require('express-jwt');

const permissions = require('../middleware/route-permissions');

const {
    getLettersForUser,
    getLettersForCase,
    getLetter
} = require('../handlers/letters');

const router = express.Router();

// Ensure JWT is valid for all /letters routes
router.use(
    validateJWT({
        secret: process.env.CLS_JWT_SECRET,
        algorithms: ['HS256']
    })
);

/**
 * GET /letters/{userId}
 * Returns all letters for a user.
 */
router.get(
    '/:userId',
    permissions('letters:read'),
    getLettersForUser
);

/**
 * GET /letters/{userId}/{caseReferenceNumber}
 * Returns all letters for a specific case.
 */
router.get(
    '/:userId/:caseReferenceNumber',
    permissions('letters:read'),
    getLettersForCase
);

/**
 * GET /letters/{userId}/{caseReferenceNumber}/{letterId}
 * Returns a specific letter.
 *
 * Supports:
 * - ?format=json
 * - ?format=template
 * - ?format=pdf
 */
router.get(
    '/:userId/:caseReferenceNumber/:letterId',
    permissions('letters:read'),
    getLetter
);

module.exports = router;