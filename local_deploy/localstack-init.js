const fs = require('node:fs/promises');
const path = require('node:path');

const {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
} = require('@aws-sdk/client-s3');

const {
    SQSClient,
    CreateQueueCommand,
} = require('@aws-sdk/client-sqs');

const s3 = new S3Client({
    region: 'eu-west-2',
    endpoint: 'http://localstack:4566',
    forcePathStyle: true,
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
    },
});

const sqs = new SQSClient({
    region: 'eu-west-2',
    endpoint: 'http://localstack:4566',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
    },
});

async function main() {
    const bucket = 'letter-bucket';
    const queueName = 'letter-queue';
    const key = 'letters/test-user/99-123456/test-letter.json';

    const letterPath = path.join(__dirname, '..', 'fixtures', 'letter.json');
    const letterBody = await fs.readFile(letterPath, 'utf8');

    await s3.send(new CreateBucketCommand({
        Bucket: bucket,
    }));

    await sqs.send(new CreateQueueCommand({
        QueueName: queueName,
    }));

    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: letterBody,
        ContentType: 'application/json',
    }));

    console.log('LocalStack seeded');
    console.log(`Bucket: ${bucket}`);
    console.log(`Queue: ${queueName}`);
    console.log(`Key: ${key}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});