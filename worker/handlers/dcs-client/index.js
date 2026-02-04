'use strict';

const crypto = require('crypto');

function dcsClient() {
    async function sendLetter(template, templateData) {
        const response = await fetch(`${process.env.CLS_DCS_URL}/api/questionnaires`, {
            method: 'POST',
            headers: {
                accept: 'application/vnd.api+json',
                'content-type': 'application/vnd.api+json',
                Authorization: `Bearer ${process.env.CLS_DCS_JWT}`,
                'On-Behalf-Of': templateData.userId,
                'Dcs-Api-Version': '2023-05-17'
            },
            body: JSON.stringify({
                data: {
                    type: 'questionnaires',
                    attributes: {
                        template,
                        owner: {
                            'owner-id': templateData.userId,
                            'is-authenticated': true,
                            'contact-preference': templateData.contactPreference,
                            'email': templateData.userEmail,
                            'phone': templateData.userPhone
                        },
                        origin: {
                            channel: 'dashboard'
                        },
                        system: {
                            'letter-id': templateData.letterId,
                            'letter-type': templateData.letterType,
                            'case-reference': templateData.caseReferenceNumber,
                            'expiry-date': templateData.requestReviewBy,
                            'external-id': `urn:uuid:${crypto.randomUUID()}`
                        }
                    }
                }
            })
        });

        const body = await response.json();

        return {
            statusCode: response.status,
            body
        };
    }

    return Object.freeze({
        sendLetter
    });
}

module.exports = dcsClient;