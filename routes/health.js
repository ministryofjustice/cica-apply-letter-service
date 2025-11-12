const { Router } = require('express');

const router = Router();

/**
 * GET /health
 * Simple liveness endpoint
 */
router.get('/', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

module.exports = router;
