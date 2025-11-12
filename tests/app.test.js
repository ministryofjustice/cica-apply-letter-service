const request = require('supertest');
const app = require('../app');

describe('API', () => {
    it('GET /health should respond with status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(typeof res.body.uptime).toBe('number');
    });

    it('serves Swagger UI at /docs (HTML)', async () => {
        const res = await request(app).get('/docs/');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/html/);
    });

    it('serves OpenAPI spec at /openapi.json', async () => {
        const res = await request(app).get('/openapi.json');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('openapi');
        expect(res.body).toHaveProperty('paths');
    });
});
