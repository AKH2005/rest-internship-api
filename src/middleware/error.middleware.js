const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');

/**
 * Centralized Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  // 1. Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(
      res,
      {
        code: 'VALIDATION_ERROR',
        message: 'Malformed JSON payload in request body'
      },
      400
    );
  }

  // 2. Handle Custom AppErrors (ValidationError, NotFoundError, ConflictError, PaginationError)
  if (err instanceof AppError) {
    return sendError(
      res,
      {
        code: err.code,
        message: err.message,
        details: err.details
      },
      err.statusCode
    );
  }

  // 3. Handle SQLite Unique Constraint errors that bubble up
  if (err.message && err.message.includes('UNIQUE constraint failed: internships.id')) {
    return sendError(
      res,
      {
        code: 'INTERNSHIP_ALREADY_EXISTS',
        message: 'Internship with this ID already exists'
      },
      409
    );
  }

  // 4. Log unexpected server errors internally (do not expose stack trace to client)
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Server Error:', err);
  }

  // 5. Fallback for all other unexpected errors
  return sendError(
    res,
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    },
    500
  );
}

module.exports = errorHandler;
