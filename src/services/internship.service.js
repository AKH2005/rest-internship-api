const internshipRepository = require('../repositories/internship.repository');
const { NotFoundError, ConflictError } = require('../utils/errors');

class InternshipService {
  /**
   * Retrieves a paginated list of internships.
   * @param {{ page: number, limit: number }} params
   */
  listInternships({ page = 1, limit = 10 } = {}) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (safePage - 1) * safeLimit;

    const total = internshipRepository.count();
    const data = internshipRepository.findAll({ offset, limit: safeLimit });
    const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages
      }
    };
  }

  /**
   * Retrieves a single internship by its unique ID.
   * @param {string} id
   */
  getInternship(id) {
    const internship = internshipRepository.findById(id);
    if (!internship) {
      throw new NotFoundError(`Internship not found`);
    }
    return internship;
  }

  /**
   * Creates a new internship record.
   * @param {object} data
   */
  createInternship(data) {
    const existing = internshipRepository.findById(data.id);
    if (existing) {
      throw new ConflictError(`Internship with ID '${data.id}' already exists`);
    }

    return internshipRepository.create(data);
  }

  /**
   * Updates an existing internship.
   * @param {string} id
   * @param {object} data
   */
  updateInternship(id, data) {
    const existing = internshipRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Internship not found`);
    }

    return internshipRepository.update(id, data);
  }

  /**
   * Deletes an internship by its ID.
   * @param {string} id
   */
  deleteInternship(id) {
    const existing = internshipRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Internship not found`);
    }

    internshipRepository.remove(id);
    return {
      message: 'Internship deleted successfully'
    };
  }
}

module.exports = new InternshipService();
