'use strict';

const {
    S3Client,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');

const letterKey = ({ userId, caseReferenceNumber, letterId }) =>
    `letters/${userId}/${caseReferenceNumber}/${letterId}.json`;

const casePrefix = ({ userId, caseReferenceNumber }) =>
    `letters/${userId}/${caseReferenceNumber}/`;

const userPrefix = ({ userId }) =>
    `letters/${userId}/`;

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

    async function getLetterDocument(bucket, key) {
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

    async function deleteBatch ({ bucket, keys }) {
        if (keys.length === 0) return;

        const res = await s3.send(
            new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
            })
        );

        if (res.Errors?.length) {
            throw new Error(`S3 multi-delete failed with ${res.Errors.length} error(s)`);
        }
    }

    async function listKeysByPrefix({ bucket, prefix }) {
        const res = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                MaxKeys: 1000,
            })
        );

        if (res.IsTruncated) {
            throw new Error(
                `Failed to delete for resource "${prefix}": >1000 keys for "${prefix}"`
            );
        }

        return (res.Contents ?? []).map((letterToDelete) => {
            if (!letterToDelete || typeof letterToDelete.Key !== "string" || letterToDelete.Key.length === 0) {
                throw new Error(`"${prefix}" contains an item with a missing/invalid Key: ${letterToDelete}`);
            }
            return letterToDelete.Key;
        });
    }

    async function deleteLetter({ bucket, userId, caseReferenceNumber, letterId }) {
        const Key = letterKey({userId, caseReferenceNumber, letterId});
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key }));
    }

    async function deleteCase({ bucket, userId, caseReferenceNumber }) {
        const prefix = casePrefix({userId, caseReferenceNumber});
        const keys = await listKeysByPrefix({ bucket, prefix });
        await deleteBatch({ bucket, keys });
    }

    async function deleteUser ({ bucket, userId }) {
        const prefix = userPrefix({userId});
        const keys = await listKeysByPrefix({ bucket, prefix });
        await deleteBatch({ bucket, keys });
    }

    return Object.freeze({
        getLetterDocument,
        deleteLetter,
        deleteCase,
        deleteUser
    });
}

module.exports = createS3Service;
