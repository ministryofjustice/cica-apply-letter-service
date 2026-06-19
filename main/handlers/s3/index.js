'use strict';

const {
    S3Client,
    GetObjectCommand
} = require('@aws-sdk/client-s3');

function createS3Service() {
    const s3 = new S3Client({
        region: 'eu-west-2',
        endpoint: process.env.NODE_ENV === 'local' ? 'http://localstack:4566' : undefined,
        forcePathStyle: process.env.NODE_ENV === 'local' ? true : undefined,
        credentials: process.env.NODE_ENV === 'local'
            ? {
                accessKeyId: 'test',
                secretAccessKey: 'test',
            }
            : undefined
    });

    const letterKey = ({ userId, caseReferenceNumber, letterId }) =>
        `letters/${userId}/${caseReferenceNumber}/${letterId}.json`;

    async function getLetterDocument(bucket, { userId, caseReferenceNumber, letterId }) {
        const key = letterKey({ userId, caseReferenceNumber, letterId });
        try {
            const resp = await s3.send(
                new GetObjectCommand({
                    Bucket: bucket,
                    Key: key,
                })
            );

            const body = await resp.Body.transformToString();
            return JSON.parse(body);

        } catch (err) {
            throw new Error(`Failed to get data for letter:${key}. Error: ${err}`);
        }
    }

    return Object.freeze({
        getLetterDocument
    });
}

module.exports = createS3Service;
