'use strict';

const createLetterTransformer = require('q-letter-transformer');

function createTransformer() {
    const letterTransformer = createLetterTransformer();

    async function getTransformedTemplate(data) {
        try {
            const options = {format: "TEMPLATE"};
            return letterTransformer.getLetter(data, options);
        } catch (err) {
            throw new Error(`Failed to transform letter:${data.letterId}. Error: ${err}`);
        }
    }

    return Object.freeze({
        getTransformedTemplate
    });
}

module.exports = createTransformer;
