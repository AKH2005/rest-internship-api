/**
 * Standard API Response Helpers
 */

/**
 * Send a successful data response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} statusCode
 */
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

/**
 * Send a successful response with message.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 */
function sendMessage(res, message, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message
  });
}

/**
 * Send a paginated data response.
 * @param {import('express').Response} res
 * @param {Array} data
 * @param {{ page: number, limit: number, total: number, totalPages: number }} pagination
 * @param {number} statusCode
 */
function sendPaginated(res, data, pagination, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages
    }
  });
}

/**
 * Send a standardized error response.
 * @param {import('express').Response} res
 * @param {{ code: string, message: string, details?: Array }} error
 * @param {number} statusCode
 */
function sendError(res, error, statusCode = 500) {
  const payload = {
    code: error.code || 'INTERNAL_SERVER_ERROR',
    message: error.message || 'An unexpected error occurred'
  };

  if (error.details && Array.isArray(error.details) && error.details.length > 0) {
    payload.details = error.details;
  }

  return res.status(statusCode).json({
    success: false,
    error: payload
  });
}

module.exports = {
  sendSuccess,
  sendMessage,
  sendPaginated,
  sendError
};
