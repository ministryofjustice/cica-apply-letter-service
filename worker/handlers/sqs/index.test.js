'use strict';

const {mockClient} = require('aws-sdk-client-mock');
const {
    SendMessageCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand,
    SQSClient
} = require('@aws-sdk/client-sqs');
const fs = require('fs');
const createSQSService = require('.');

describe('SQS Service', () => {
    const sqsMock = mockClient(SQSClient);

    it('Should send a message to the queue', async () => {
        sqsMock.on(SendMessageCommand).resolves('Message Sent');
        const sqsInput = {
            QueueUrl: 'Queue',
            MaxNumberOfMessages: 10
        };
        const testMessage = `{
            "applicationPDFDocumentSummaryKey": "pdfLoc",
            "applicationJSONDocumentSummaryKey": "jsonKey"
        }`;

        const sqsService = createSQSService();
        const queueMessage = await sqsService.sendSQS(sqsInput, testMessage);

        expect(queueMessage).toBe('Message Sent');
    });

    it('Should receive a message from the queue', async () => {
        const testMessage = {
            $metadata: {
                httpStatusCode: 200,
                requestId: "3f2b1f7c-1234-5678-9abc-1d2e3f4a5b6c",
                attempts: 1,
                totalRetryDelay: 0,
            },
            Messages: [
                {
                    MessageId: "d1c2b3a4-5678-90ab-cdef-111213141516",
                    ReceiptHandle:
                        "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0aF...snip...l1k5hQ==",
                    Body: `{type: "SEND",key: "s3://blah",requestedAt: "2026-01-30T17:05:12.345Z"}`,
                    MessageAttributes: {
                        MessageType: {
                            StringValue: "SEND",
                            DataType: "String",
                        },
                    },
                    Attributes: {
                        ApproximateReceiveCount: "1",
                        SentTimestamp: "1769792712345",
                        SenderId: "AIDAEXAMPLEID",
                        ApproximateFirstReceiveTimestamp: "1769792715678",
                    },

                    MD5OfBody: "9c3b1d2e5f6a7b8c9d0e1f2a3b4c5d6e",
                    MD5OfMessageAttributes: "0a1b2c3d4e5f67890123456789abcdef",
                },
            ],
        };
        sqsMock.on(ReceiveMessageCommand).resolves(testMessage);

        const sqsService = createSQSService();
        const response = await sqsService.receiveSQS({
            QueueUrl: 'Queue',
            MaxNumberOfMessages: 10
        });

        expect(response).toHaveProperty("Messages");
        expect(Array.isArray(response.Messages)).toBe(true);

    });

    it('Should delete a message from the queue', async () => {
        sqsMock.on(DeleteMessageCommand).resolves('Message Deleted');

        const sqsService = createSQSService();
        const response = await sqsService.deleteSQS({
            QueueUrl: 'Queue',
            ReceiptHandle: 'Receipt Handle'
        });

        expect(response).toBe('Message Deleted');
    });
});
