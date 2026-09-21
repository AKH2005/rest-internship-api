const { ValidationError, PaginationError } = require('../utils/errors');

/**
 * Higher-order middleware function to validate request data against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} target
 */
function validate(schema, target = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.errors.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message
      }));

      if (target === 'query') {
        return next(new PaginationError('Invalid pagination parameters', details));
      }

      return next(new ValidationError(details, 'Invalid request'));
    }

    // Replace request data with parsed/sanitized data from Zod
    req[target] = result.data;
    return next();
  };
}

module.exports = validate;
