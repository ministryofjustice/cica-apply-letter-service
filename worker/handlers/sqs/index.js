'use strict';

const {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand
} = require('@aws-sdk/client-sqs');
const logger = require('../logger');

function createSqsService() {
    const client = new SQSClient({
        region: 'eu-west-2',
        endpoint: process.env.NODE_ENV === 'local' ? 'http://localstack:4566' : undefined,
        credentials: process.env.NODE_ENV === 'local'
            ? {
                accessKeyId: 'test',
                secretAccessKey: 'test',
            }
            : undefined
    });

    /**
     * Deletes a given message from a given SQS queue
     * @param {object} input - Contains the details of the queue and message to delete
     */
    async function deleteSQS(input) {
        const command = new DeleteMessageCommand(input);
        const response = await client.send(command);
        logger.info(response);
        return response;
    }

    /**
     * Receives the next message from a given queue
     * @param {object} input - The details of the queue to receive from
     * @returns Message received from the queue
     */
    async function receiveSQS(input) {
        const command = new ReceiveMessageCommand(input);
        const response = await client.send(command);
        return response;
    }

    return Object.freeze({
        deleteSQS,
        receiveSQS
    });
}

module.exports = createSqsService;
