const pino = require("pino");

const logger = pino({
    level: process.env.CLS_LOG_LEVEL || "info",
});

module.exports = logger;
