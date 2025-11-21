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

    it('DELETE /letters/{userId}', async () => {
        const res = await request(app).delete(`/letters/${userId}`);
        expect(res).toSatisfyApiSpec();
    });

    it('GET /letters/{userId}/{caseReferenceNumber}', async () => {
        const res = await request(app).get(`/letters/${userId}/${caseRef}`);
        expect(res).toSatisfyApiSpec();
    });

    it('DELETE /letters/{userId}/{caseReferenceNumber}', async () => {
        const res = await request(app).delete(`/letters/${userId}/${caseRef}`);
        expect(res).toSatisfyApiSpec();
    });

    it('GET /letters/{userId}/{caseReferenceNumber}/{letterId}', async () => {
        const res = await request(app).get(`/letters/${userId}/${caseRef}/${letterId}`);
        expect(res).toSatisfyApiSpec();
    });

    it('DELETE /letters/{userId}/{caseReferenceNumber}/{letterId}', async () => {
        const res = await request(app).delete(`/letters/${userId}/${caseRef}/${letterId}`);
        expect(res).toSatisfyApiSpec();
    });

    it('POST /letters/{userId}/{caseReferenceNumber}/{letterId}/send', async () => {
        const res = await request(app)
            .post(`/letters/${userId}/${caseRef}/${letterId}/send`)
            .send({
                letterType: 'AA01',
                letterData: {
                    recipientName: 'Mr Test Testcase',
                    caseReference: '25-700123',
                    decisionDate: '2026-01-15'
                },
                contactPreference: 'E',
                userEmail: 'user@223e4567-e89b-12d3-a456-426614174111.com'
            });

        expect(res).toSatisfyApiSpec();
    });

    it('POST /letters/{userId}/{caseReferenceNumber}/{letterId}/pdf', async () => {
        const res = await request(app)
            .post(`/letters/${userId}/${caseRef}/${letterId}/pdf`)
            .send({
                letterType: 'AA01',
                letterData: {
                    recipientName: 'Mr Test Testcase',
                    caseReference: '25-700123',
                    decisionDate: '2026-01-15'
                },
                isPreview: true
            });

        expect(res).toSatisfyApiSpec();
    });
});
