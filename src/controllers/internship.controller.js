const internshipService = require('../services/internship.service');
const { sendSuccess, sendPaginated, sendMessage } = require('../utils/response');

class InternshipController {
  /**
   * GET /api/v1/internships
   * Lists internships with pagination.
   */
  async list(req, res, next) {
    try {
      const { page, limit } = req.query;
      const { data, pagination } = internshipService.listInternships({ page, limit });
      return sendPaginated(res, data, pagination, 200);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/internships/:id
   * Fetches single internship by ID.
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = internshipService.getInternship(id);
      return sendSuccess(res, data, 200);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/internships
   * Creates a new internship.
   */
  async create(req, res, next) {
    try {
      const data = internshipService.createInternship(req.body);
      return sendSuccess(res, data, 201);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/internships/:id
   * Updates an existing internship.
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = internshipService.updateInternship(id, req.body);
      return sendSuccess(res, data, 200);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/internships/:id
   * Deletes an internship by ID.
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = internshipService.deleteInternship(id);
      return sendMessage(res, result.message, 200);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new InternshipController();
