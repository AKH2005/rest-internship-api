const express = require('express');
const router = express.Router();
const internshipRoutes = require('./internship.routes');
const { sendSuccess } = require('../utils/response');

/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'ok' }, 200);
});

/**
 * Internship v1 API routes
 * /api/v1/internships
 */
router.use('/api/v1/internships', internshipRoutes);

module.exports = router;
