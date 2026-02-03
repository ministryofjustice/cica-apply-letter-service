'use strict';

const createSqsService = require('./handlers/sqs');
const messageHandler = require("./handlers/message");
const logger = require("./handlers/logger");

const sqsService = createSqsService();

async function pollOnce() {
    const receiveInput = {
        QueueUrl: process.env.SQS_QUEUE_URL,
        MaxNumberOfMessages: 1
    };
    const result = await sqsService.receiveSQS(receiveInput);

    const messages = result.Messages || [];

    if (messages.length === 0) {
        logger.info(
            "No messages."
        );
        return;
    }

    const message = messages[0];

    await messageHandler(message);

    const deleteInput = {
        QueueUrl: process.env.SQS_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle
    };
    await sqsService.deleteSQS(deleteInput);

    logger.info(
        {
            messageId: message.MessageId,
            body: message.Body,
        },
        "Message processed and deleted:"
    );
}

setInterval(() => {
    pollOnce().catch((err) => {
        logger.error({ err }, "CICA letter service error");
    });
}, 30000);

logger.info("CICA Letter service started");
