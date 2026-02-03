'use strict';

const logger = require('../logger');

module.exports = (message) => {
    logger.info(
        {
            messageId: message.MessageId,
            body: message.Body,
        },
        "Handling SQS message"
    );
  return "DONE!"
};
