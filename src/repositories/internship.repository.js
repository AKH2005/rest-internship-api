const { getDatabase } = require('../config/database');

/**
 * Maps a raw SQLite database row into the standardized internship entity.
 * Safely parses the JSON-encoded skills field.
 *
 * @param {object|null} row
 * @returns {object|null}
 */
function toEntity(row) {
  if (!row) return null;

  let skills = [];
  try {
    skills = typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills;
  } catch {
    skills = [];
  }

  return {
    id: row.id,
    title: row.title,
    domain: row.domain,
    mode: row.mode,
    location: row.location,
    skills,
    openings: Number(row.openings)
  };
}

class InternshipRepository {
  /**
   * Fetches paginated internship records.
   * @param {{ offset: number, limit: number }} params
   * @returns {Array<object>}
   */
  findAll({ offset = 0, limit = 10 } = {}) {
    const db = getDatabase();
    const query = `
      SELECT id, title, domain, mode, location, skills, openings, created_at
      FROM internships
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `;
    const rows = db.prepare(query).all(limit, offset);
    return rows.map(toEntity);
  }

  /**
   * Counts the total number of internship records.
   * @returns {number}
   */
  count() {
    const db = getDatabase();
    const query = `SELECT COUNT(*) AS total FROM internships`;
    const result = db.prepare(query).get();
    return result ? Number(result.total) : 0;
  }

  /**
   * Finds an internship by its unique ID.
   * @param {string} id
   * @returns {object|null}
   */
  findById(id) {
    const db = getDatabase();
    const query = `
      SELECT id, title, domain, mode, location, skills, openings, created_at
      FROM internships
      WHERE id = ?
    `;
    const row = db.prepare(query).get(id);
    return toEntity(row);
  }

  /**
   * Inserts a new internship into the database.
   * @param {object} data
   * @returns {object}
   */
  create(data) {
    const db = getDatabase();
    const skillsJson = JSON.stringify(data.skills);
    const query = `
      INSERT INTO internships (id, title, domain, mode, location, skills, openings)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.prepare(query).run(
      data.id,
      data.title,
      data.domain,
      data.mode,
      data.location,
      skillsJson,
      data.openings
    );

    return this.findById(data.id);
  }

  /**
   * Updates an existing internship record.
   * @param {string} id
   * @param {object} data
   * @returns {object}
   */
  update(id, data) {
    const db = getDatabase();
    const skillsJson = JSON.stringify(data.skills);
    const query = `
      UPDATE internships
      SET title = ?,
          domain = ?,
          mode = ?,
          location = ?,
          skills = ?,
          openings = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.prepare(query).run(
      data.title,
      data.domain,
      data.mode,
      data.location,
      skillsJson,
      data.openings,
      id
    );

    return this.findById(id);
  }

  /**
   * Deletes an internship by its unique ID.
   * @param {string} id
   * @returns {boolean} True if a record was deleted, false otherwise
   */
  remove(id) {
    const db = getDatabase();
    const query = `DELETE FROM internships WHERE id = ?`;
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }
}

module.exports = new InternshipRepository();
