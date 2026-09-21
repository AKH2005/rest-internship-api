/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Resource Not Found Error
 */
class NotFoundError extends AppError {
  constructor(message = 'Internship not found', code = 'INTERNSHIP_NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * 409 Conflict / Duplicate Resource Error
 */
class ConflictError extends AppError {
  constructor(message = 'Internship with this ID already exists', code = 'INTERNSHIP_ALREADY_EXISTS') {
    super(message, 409, code);
  }
}

/**
 * 400 Validation Error
 */
class ValidationError extends AppError {
  constructor(details = [], message = 'Invalid request') {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 400 Invalid Pagination Error
 */
class PaginationError extends AppError {
  constructor(message = 'Invalid pagination parameters', details = null) {
    super(message, 400, 'INVALID_PAGINATION', details);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
  PaginationError
};
