const { z } = require('zod');

// Allowed work modes
const VALID_MODES = ['Remote', 'Hybrid', 'On-site'];

/**
 * Validation schema for creating a new internship
 */
const createInternshipSchema = z.object({
  id: z
    .string({ required_error: 'ID is required', invalid_type_error: 'ID must be a string' })
    .trim()
    .min(1, 'ID must not be empty'),
  title: z
    .string({ required_error: 'Title is required', invalid_type_error: 'Title must be a string' })
    .trim()
    .min(1, 'Title must not be empty'),
  domain: z
    .string({ required_error: 'Domain is required', invalid_type_error: 'Domain must be a string' })
    .trim()
    .min(1, 'Domain must not be empty'),
  mode: z.enum(VALID_MODES, {
    errorMap: () => ({
      message: `Mode must be one of: ${VALID_MODES.join(', ')}`
    })
  }),
  location: z
    .string({ required_error: 'Location is required', invalid_type_error: 'Location must be a string' })
    .trim()
    .min(1, 'Location must not be empty'),
  skills: z
    .array(
      z.string({ invalid_type_error: 'Skill item must be a string' })
        .trim()
        .min(1, 'Skill cannot be empty'),
      {
        required_error: 'Skills are required',
        invalid_type_error: 'Skills must be an array of strings'
      }
    )
    .min(1, 'At least one skill is required'),
  openings: z
    .number({
      required_error: 'Openings is required',
      invalid_type_error: 'Openings must be a number'
    })
    .int('Openings must be an integer')
    .min(0, 'Openings must be greater than or equal to 0')
});

/**
 * Validation schema for updating an existing internship (full representation)
 */
const updateInternshipSchema = z.object({
  id: z
    .string({ invalid_type_error: 'ID must be a string' })
    .trim()
    .min(1, 'ID must not be empty')
    .optional(),
  title: z
    .string({ required_error: 'Title is required', invalid_type_error: 'Title must be a string' })
    .trim()
    .min(1, 'Title must not be empty'),
  domain: z
    .string({ required_error: 'Domain is required', invalid_type_error: 'Domain must be a string' })
    .trim()
    .min(1, 'Domain must not be empty'),
  mode: z.enum(VALID_MODES, {
    errorMap: () => ({
      message: `Mode must be one of: ${VALID_MODES.join(', ')}`
    })
  }),
  location: z
    .string({ required_error: 'Location is required', invalid_type_error: 'Location must be a string' })
    .trim()
    .min(1, 'Location must not be empty'),
  skills: z
    .array(
      z.string({ invalid_type_error: 'Skill item must be a string' })
        .trim()
        .min(1, 'Skill cannot be empty'),
      {
        required_error: 'Skills are required',
        invalid_type_error: 'Skills must be an array of strings'
      }
    )
    .min(1, 'At least one skill is required'),
  openings: z
    .number({
      required_error: 'Openings is required',
      invalid_type_error: 'Openings must be a number'
    })
    .int('Openings must be an integer')
    .min(0, 'Openings must be greater than or equal to 0')
});

/**
 * Route parameter validation (:id)
 */
const idParamSchema = z.object({
  id: z
    .string({ required_error: 'Internship ID parameter is required' })
    .trim()
    .min(1, 'Internship ID must not be empty')
});

/**
 * Query parameter validation for pagination
 */
const paginationQuerySchema = z.object({
  page: z
    .preprocess(
      (val) => (val === undefined || val === '' ? 1 : Number(val)),
      z
        .number({ invalid_type_error: 'Page must be a valid number' })
        .int('Page must be an integer')
        .min(1, 'Page must be greater than or equal to 1')
    )
    .default(1),
  limit: z
    .preprocess(
      (val) => (val === undefined || val === '' ? 10 : Number(val)),
      z
        .number({ invalid_type_error: 'Limit must be a valid number' })
        .int('Limit must be an integer')
        .min(1, 'Limit must be greater than or equal to 1')
        .max(100, 'Limit must be less than or equal to 100')
    )
    .default(10)
});

module.exports = {
  createInternshipSchema,
  updateInternshipSchema,
  idParamSchema,
  paginationQuerySchema,
  VALID_MODES
};
