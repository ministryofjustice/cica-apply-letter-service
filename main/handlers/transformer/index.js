'use strict';

const createLetterTransformer = require('q-letter-transformer');

function createTransformer() {
    const letterTransformer = createLetterTransformer();

    async function getTransformedLetter(data, options = { format: 'JSON'}) {
        try {
            return letterTransformer.getLetter(data, options);
        } catch (err) {
            throw new Error(`Failed to transform letter:${data.letterId}. Error: ${err}`);
        }
    }

    return Object.freeze({
        getTransformedLetter
    });
}

module.exports = createTransformer;
