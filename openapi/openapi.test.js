'use strict';

const request = require('supertest');
const app = require('../app');
const jestOpenAPI = require('jest-openapi').default;

beforeAll(() => {
    const openapiDocument = require('../openapi/openapi.json');
    jestOpenAPI(openapiDocument);
});

describe('Letter Service API contract', () => {
    const userId = '223e4567-e89b-12d3-a456-426614174111';
    const caseRef = '25-700123';
    const letterId = '123e4567-e89b-12d3-a456-426614174000';

    it('GET /health', async () => {
        const res = await request(app).get('/health');
        expect(res).toSatisfyApiSpec();
    });

    it('GET /letters/{userId}', async () => {
        const res = await request(app).get(`/letters/${userId}`);
        expect(res).toSatisfyApiSpec();
    });

    it('GET /letters/{userId}/{caseReferenceNumber}', async () => {
        const res = await request(app).get(`/letters/${userId}/${caseRef}`);
        expect(res).toSatisfyApiSpec();
    });

    it('GET /letters/{userId}/{caseReferenceNumber}/{letterId}', async () => {
        const res = await request(app).get(`/letters/${userId}/${caseRef}/${letterId}`);
        expect(res).toSatisfyApiSpec();
    });
});
