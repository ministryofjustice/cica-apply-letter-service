const fs = require('node:fs/promises');
const path = require('node:path');

const {
    SQSClient,
    SendMessageCommand,
    GetQueueUrlCommand,
} = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({
    region: 'eu-west-2',
    endpoint: 'http://localstack:4566',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
    },
});

async function main() {
    const queueName = 'letter-queue';
    const messagePath = path.join(__dirname, '..', 'fixtures', 'message.json');

    const rawMessage = await fs.readFile(messagePath, 'utf8');

    const { QueueUrl } = await sqs.send(new GetQueueUrlCommand({
        QueueName: queueName,
    }));

    await sqs.send(new SendMessageCommand({
        QueueUrl,
        MessageBody: rawMessage,
    }));

    console.log('Message sent');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});