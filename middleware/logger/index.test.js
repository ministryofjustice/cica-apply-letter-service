/* eslint-disable global-require, no-shadow */

'use strict';

const pino = require('pino-http');
const request = require('supertest');
const createLogger = require('./index');

// Mock pino-http
jest.mock('pino-http');

describe('logger', () => {
    describe('Logger Middleware', () => {
        let mockPinoHttp;
        let originalEnv;

        beforeEach(() => {
            // Save original environment
            originalEnv = {...process.env};

            // Reset mock
            jest.clearAllMocks();

            // Create a mock pino-http function
            mockPinoHttp = jest.fn((req, res, next) => next());
            pino.mockReturnValue(mockPinoHttp);
        });

        afterEach(() => {
            // Restore original environment
            process.env = originalEnv;
        });

        describe('createLogger function', () => {
            it('should call pino-http with default configuration', () => {
                createLogger();

                expect(pino).toHaveBeenCalledTimes(1);
                const config = pino.mock.calls[0][0];

                expect(config).toHaveProperty('redact');
                expect(config).toHaveProperty('transport');
                expect(config).toHaveProperty('customLogLevel');
            });

            it('should merge custom options with defaults', () => {
                const customOpts = {
                    level: 'debug',
                    customProperty: 'test'
                };

                createLogger(customOpts);

                expect(pino).toHaveBeenCalledTimes(1);
                const config = pino.mock.calls[0][0];

                expect(config.customProperty).toBe('test');
                expect(config.level).toBe('debug');
            });

            it('should use DCS_LOG_LEVEL environment variable when set', () => {
                process.env.DCS_LOG_LEVEL = 'silent';

                createLogger();

                const config = pino.mock.calls[0][0];
                expect(config.level).toBe('silent');
            });

            it('should return the pino-http middleware', () => {
                const logger = createLogger();
                expect(logger).toBe(mockPinoHttp);
            });
        });

        describe('redact configuration', () => {
            it('should configure redaction for authorization headers', () => {
                createLogger();

                const config = pino.mock.calls[0][0];
                expect(config.redact.paths).toContain('req.headers.authorization');
            });

            it('should redact JWT tokens correctly (with dots)', () => {
                createLogger();

                const config = pino.mock.calls[0][0];
                const {censor} = config.redact;

                const token =
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
                const redacted = censor(token);

                expect(redacted).toBe('Bearer REDACTED.eyJzdWIiOiIxMjM0NTY3ODkwIn0.REDACTED');
                expect(redacted).toContain('REDACTED');
                expect(redacted).toContain('eyJzdWIiOiIxMjM0NTY3ODkwIn0');
            });

            it('should redact non-JWT tokens correctly (without dots)', () => {
                createLogger();

                const config = pino.mock.calls[0][0];
                const {censor} = config.redact;

                const simpleToken = 'simple-bearer-token';
                const redacted = censor(simpleToken);

                expect(redacted).toBe('REDACTED');
            });

            it('should handle empty authorization values', () => {
                createLogger();

                const config = pino.mock.calls[0][0];
                const {censor} = config.redact;

                const redacted = censor('');
                expect(redacted).toBe('REDACTED');
            });
        });

        describe('transport configuration', () => {
            it('should have correct transport configuration based on NODE_ENV at module load', () => {
                createLogger();

                const config = pino.mock.calls[0][0];
                expect(config.transport).toBeDefined();
            });
        });

        describe('customLogLevel function', () => {
            let customLogLevel;

            beforeEach(() => {
                createLogger();
                const config = pino.mock.calls[0][0];
                customLogLevel = config.customLogLevel;
            });

            it('should return "info" for 2xx status codes', () => {
                expect(customLogLevel({statusCode: 200})).toBe('info');
                expect(customLogLevel({statusCode: 201})).toBe('info');
                expect(customLogLevel({statusCode: 204})).toBe('info');
            });

            it('should return "info" for 3xx status codes', () => {
                expect(customLogLevel({statusCode: 301})).toBe('info');
                expect(customLogLevel({statusCode: 302})).toBe('info');
                expect(customLogLevel({statusCode: 304})).toBe('info');
            });

            it('should return "warn" for 4xx status codes', () => {
                expect(customLogLevel({statusCode: 400})).toBe('warn');
                expect(customLogLevel({statusCode: 401})).toBe('warn');
                expect(customLogLevel({statusCode: 403})).toBe('warn');
                expect(customLogLevel({statusCode: 404})).toBe('warn');
                expect(customLogLevel({statusCode: 499})).toBe('warn');
            });

            it('should return "error" for 5xx status codes even without error object', () => {
                expect(customLogLevel({statusCode: 500})).toBe('error');
                expect(customLogLevel({statusCode: 502})).toBe('error');
                expect(customLogLevel({statusCode: 503})).toBe('error');
            });

            it('should return "error" when error is present regardless of status code', () => {
                const error = new Error('Test error');
                expect(customLogLevel({statusCode: 200}, error)).toBe('error');
                expect(customLogLevel({statusCode: 400}, error)).toBe('error');
                expect(customLogLevel({statusCode: 500}, error)).toBe('error');
            });

            it('should prioritize error over status code', () => {
                const error = new Error('Test error');
                expect(customLogLevel({statusCode: 200}, error)).toBe('error');
                expect(customLogLevel({statusCode: 404}, error)).toBe('error');
            });
        });

        describe('configuration precedence', () => {
            it('should allow custom options to override defaults', () => {
                const customLogLevel = () => 'custom';
                const customOpts = {
                    level: 'trace',
                    customLogLevel
                };

                createLogger(customOpts);

                const config = pino.mock.calls[0][0];
                expect(config.level).toBe('trace');
                expect(config.customLogLevel).toBe(customLogLevel);
            });

            it('should preserve default redact config when not overridden', () => {
                createLogger({level: 'debug'});

                const config = pino.mock.calls[0][0];
                expect(config.redact).toBeDefined();
                expect(config.redact.paths).toContain('req.headers.authorization');
            });
        });
    });
    describe('Logger Integration Tests', () => {
        let app;

        beforeEach(() => {
            // Unmock pino-http for integration tests
            jest.unmock('pino-http');

            // Clear the module cache to get fresh imports
            jest.resetModules();

            // Re-require modules
            const express = require('express');
            const createLogger = require('./index');

            // Create a fresh app instance
            app = express();
            // transport creates a worker thread which jest interprets as a memory leak.
            // We don't want pretty print in prod, so forcing it to be undefined here emulates this.
            app.use(createLogger({transport: undefined}));

            app.get('/test', (req, res) => {
                res.json({message: 'test'});
            });

            app.get('/error', (req, res) => {
                res.status(500).json({error: 'server error'});
            });
        });

        afterEach(() => {
            jest.resetModules();
        });

        it('should attach logger to request object', async () => {
            const express = require('express');
            const createLogger = require('./index');

            app = express();
            app.use(createLogger());

            app.get('/check-logger', (req, res) => {
                // In pino-http v5, the logger is attached to req.log
                res.json({hasLogger: !!req.log});
            });

            const response = await request(app)
                .get('/check-logger')
                .expect(200);

            expect(response.body.hasLogger).toBe(true);
        });

        it('should successfully handle requests with the middleware', async () => {
            const response = await request(app)
                .get('/test')
                .expect(200);

            expect(response.body.message).toBe('test');
        });

        it('should handle error responses', async () => {
            const response = await request(app)
                .get('/error')
                .expect(500);

            expect(response.body.error).toBe('server error');
        });
    });
});
