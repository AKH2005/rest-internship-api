const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internship.controller');
const validate = require('../middleware/validate.middleware');
const {
  createInternshipSchema,
  updateInternshipSchema,
  idParamSchema,
  paginationQuerySchema
} = require('../validators/internship.validator');

/**
 * @route   GET /api/v1/internships
 * @desc    List all internships with pagination
 */
router.get(
  '/',
  validate(paginationQuerySchema, 'query'),
  internshipController.list
);

/**
 * @route   GET /api/v1/internships/:id
 * @desc    Get internship by ID
 */
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  internshipController.getById
);

/**
 * @route   POST /api/v1/internships
 * @desc    Create a new internship
 */
router.post(
  '/',
  validate(createInternshipSchema, 'body'),
  internshipController.create
);

/**
 * @route   PUT /api/v1/internships/:id
 * @desc    Update an existing internship (full representation)
 */
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateInternshipSchema, 'body'),
  internshipController.update
);

/**
 * @route   DELETE /api/v1/internships/:id
 * @desc    Delete an internship by ID
 */
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  internshipController.delete
);

module.exports = router;
