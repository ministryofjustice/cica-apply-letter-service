const app = require('./app');

const PORT = process.env.PORT || 3000;

// Don’t start the server when running tests
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
        console.log(`Swagger docs:    http://localhost:${PORT}/docs`);
    });
}

module.exports = app;
