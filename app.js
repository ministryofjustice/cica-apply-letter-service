'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const healthRouter = require('./routes/health');
const lettersRouter = require('./routes/letters');
const openapiDocument = require('./openapi/openapi.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));

// Serve OpenAPI JSON
app.get('/openapi.json', (req, res) => res.json(openapiDocument));

// Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));

app.use(
    OpenApiValidator.middleware({
        apiSpec: './openapi/openapi.json',
        validateRequests: true,
        validateResponses: false,
        validateSecurity: false
    })
);

// Routes
app.use('/health', healthRouter);
app.use('/letters', lettersRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    if (err && err.status && err.errors) {
        return res.status(err.status).json({
            message: err.message,
            errors: err.errors
        });
    }

    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
