'use strict';

const pino = require('pino-http');

function buildDefaults() {
    return {
        level: process.env.CLS_LOG_LEVEL || 'info',
        redact: {
            paths: ['req.headers.authorization'],
            censor: unredactedValue => {
                const authorizationHeaderParts = unredactedValue.split('.');
                return authorizationHeaderParts.length > 1
                    ? `Bearer REDACTED.${authorizationHeaderParts[1]}.REDACTED`
                    : 'REDACTED';
            }
        },
        transport:
            process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test'
                ? undefined
                : {
                    target: 'pino-pretty',
                    options: {
                        levelFirst: true,
                        colorize: true,
                        translateTime: true
                    }
                },
        customLogLevel: (res, err) => {
            if (res.statusCode >= 500 || err) {
                return 'error';
            }

            if (res.statusCode >= 400 && res.statusCode < 500) {
                return 'warn';
            }

            return 'info';
        }
    }
}

function createLogger(opts = {}) {
    return pino({...buildDefaults(), ...opts});
}

module.exports = createLogger;
