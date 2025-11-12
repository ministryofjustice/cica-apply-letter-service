const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const healthRouter = require('./routes/health');
// Load OpenAPI JSON directly via require
const openapiDocument = require('./openapi/openapi.json');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));

// Routes
app.use('/health', healthRouter);
app.get('/ping', (req, res) => res.json({ message: 'pong' }));

// Serve OpenAPI JSON
app.get('/openapi.json', (req, res) => res.json(openapiDocument));

// Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res) => {
     
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
