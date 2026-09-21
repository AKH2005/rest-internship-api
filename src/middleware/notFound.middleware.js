const { sendError } = require('../utils/response');

/**
 * 404 Route Not Found Middleware
 * Returns consistent JSON response instead of default HTML error.
 */
function notFoundHandler(req, res, next) {
  return sendError(
    res,
    {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    },
    404
  );
}

module.exports = notFoundHandler;
