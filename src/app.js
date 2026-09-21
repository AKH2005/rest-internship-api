const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Application routes
app.use(routes);

// Catch 404 for any undefined routes and return standardized JSON
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
