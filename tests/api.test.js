process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { getDatabase, closeDatabase } = require('../src/config/database');
const { runSeed } = require('../database/seed');

describe('REST Internship API Test Suite', () => {
  before(() => {
    // Initialize in-memory SQLite database and seed initial 5 records
    getDatabase();
    runSeed();
  });

  after(() => {
    closeDatabase();
  });

  // -------------------------------------------------------------
  // 1. Health Check
  // -------------------------------------------------------------
  describe('GET /health', () => {
    test('should return 200 OK with status ok', async () => {
      const res = await request(app).get('/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.data, { status: 'ok' });
    });
  });

  // -------------------------------------------------------------
  // 2. List Internships & Pagination
  // -------------------------------------------------------------
  describe('GET /api/v1/internships', () => {
    test('should return list of internships with default pagination', async () => {
      const res = await request(app).get('/api/v1/internships');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.equal(res.body.data.length, 5);
      assert.equal(res.body.pagination.page, 1);
      assert.equal(res.body.pagination.limit, 10);
      assert.equal(res.body.pagination.total, 5);
      assert.equal(res.body.pagination.totalPages, 1);
      // Skills should be deserialized as an array
      assert.ok(Array.isArray(res.body.data[0].skills));
    });

    test('should paginate correctly with custom page and limit', async () => {
      const res = await request(app).get('/api/v1/internships?page=1&limit=2');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 2);
      assert.equal(res.body.pagination.page, 1);
      assert.equal(res.body.pagination.limit, 2);
      assert.equal(res.body.pagination.total, 5);
      assert.equal(res.body.pagination.totalPages, 3);
    });

    test('should fetch page 2 correctly', async () => {
      const res = await request(app).get('/api/v1/internships?page=2&limit=2');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 2);
      assert.equal(res.body.pagination.page, 2);
      assert.equal(res.body.data[0].id, 'INT-103');
    });

    test('should reject invalid pagination parameters (page < 1)', async () => {
      const res = await request(app).get('/api/v1/internships?page=0');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_PAGINATION');
    });

    test('should reject invalid pagination parameters (limit > 100)', async () => {
      const res = await request(app).get('/api/v1/internships?limit=105');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_PAGINATION');
    });
  });

  // -------------------------------------------------------------
  // 3. Get Internship by ID
  // -------------------------------------------------------------
  describe('GET /api/v1/internships/:id', () => {
    test('should return existing internship by ID with 200 OK', async () => {
      const res = await request(app).get('/api/v1/internships/INT-101');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, 'INT-101');
      assert.equal(res.body.data.title, 'Frontend Intern');
      assert.deepEqual(res.body.data.skills, ['HTML', 'CSS', 'JavaScript']);
      assert.equal(res.body.data.openings, 3);
    });

    test('should return 404 for non-existent internship ID', async () => {
      const res = await request(app).get('/api/v1/internships/INT-999');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INTERNSHIP_NOT_FOUND');
      assert.equal(res.body.error.message, 'Internship not found');
    });
  });

  // -------------------------------------------------------------
  // 4. Create Internship
  // -------------------------------------------------------------
  describe('POST /api/v1/internships', () => {
    test('should successfully create a valid internship with 201 Created', async () => {
      const newInternship = {
        id: 'INT-106',
        title: 'Backend Intern',
        domain: 'Backend Development',
        mode: 'Remote',
        location: 'Hyderabad',
        skills: ['Node.js', 'Express', 'SQL'],
        openings: 2
      };

      const res = await request(app)
        .post('/api/v1/internships')
        .send(newInternship);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, 'INT-106');
      assert.equal(res.body.data.title, 'Backend Intern');
      assert.deepEqual(res.body.data.skills, ['Node.js', 'Express', 'SQL']);
      assert.equal(res.body.data.openings, 2);
    });

    test('should return 409 Conflict when attempting to create duplicate ID', async () => {
      const duplicateInternship = {
        id: 'INT-101',
        title: 'Duplicate Intern',
        domain: 'Engineering',
        mode: 'Remote',
        location: 'India',
        skills: ['JavaScript'],
        openings: 1
      };

      const res = await request(app)
        .post('/api/v1/internships')
        .send(duplicateInternship);

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INTERNSHIP_ALREADY_EXISTS');
    });

    test('should return 400 when body is empty', async () => {
      const res = await request(app)
        .post('/api/v1/internships')
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(Array.isArray(res.body.error.details));
      assert.ok(res.body.error.details.length > 0);
    });

    test('should return 400 when required fields are empty or invalid', async () => {
      const invalidPayload = {
        id: 'INT-107',
        title: '',
        domain: 'DevOps',
        mode: 'InvalidMode',
        location: 'Delhi',
        skills: [],
        openings: -3
      };

      const res = await request(app)
        .post('/api/v1/internships')
        .send(invalidPayload);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');

      const fieldsWithErrors = res.body.error.details.map((d) => d.field);
      assert.ok(fieldsWithErrors.includes('title'));
      assert.ok(fieldsWithErrors.includes('mode'));
      assert.ok(fieldsWithErrors.includes('skills'));
      assert.ok(fieldsWithErrors.includes('openings'));
    });

    test('should return 400 when skills is not an array', async () => {
      const invalidPayload = {
        id: 'INT-108',
        title: 'Cloud Intern',
        domain: 'Cloud',
        mode: 'Remote',
        location: 'Remote',
        skills: 'JavaScript',
        openings: 1
      };

      const res = await request(app)
        .post('/api/v1/internships')
        .send(invalidPayload);

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  // -------------------------------------------------------------
  // 5. Update Internship
  // -------------------------------------------------------------
  describe('PUT /api/v1/internships/:id', () => {
    test('should update existing internship with 200 OK', async () => {
      const updateData = {
        title: 'Senior Frontend Intern',
        domain: 'Full Stack Development',
        mode: 'Hybrid',
        location: 'Mumbai',
        skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
        openings: 5
      };

      const res = await request(app)
        .put('/api/v1/internships/INT-101')
        .send(updateData);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, 'INT-101');
      assert.equal(res.body.data.title, 'Senior Frontend Intern');
      assert.equal(res.body.data.mode, 'Hybrid');
      assert.equal(res.body.data.location, 'Mumbai');
      assert.equal(res.body.data.openings, 5);
      assert.deepEqual(res.body.data.skills, ['HTML', 'CSS', 'JavaScript', 'TypeScript']);
    });

    test('should return 404 when updating non-existent internship', async () => {
      const updateData = {
        title: 'Non-existent',
        domain: 'Unknown',
        mode: 'Remote',
        location: 'Nowhere',
        skills: ['Go'],
        openings: 1
      };

      const res = await request(app)
        .put('/api/v1/internships/INT-999')
        .send(updateData);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INTERNSHIP_NOT_FOUND');
    });

    test('should return 400 when update payload has invalid values', async () => {
      const invalidData = {
        title: '',
        domain: '',
        mode: 'Space',
        location: '',
        skills: [],
        openings: -1
      };

      const res = await request(app)
        .put('/api/v1/internships/INT-101')
        .send(invalidData);

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  // -------------------------------------------------------------
  // 6. Delete Internship
  // -------------------------------------------------------------
  describe('DELETE /api/v1/internships/:id', () => {
    test('should delete an existing internship with 200 OK', async () => {
      const res = await request(app).delete('/api/v1/internships/INT-105');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, 'Internship deleted successfully');

      // Verify it is actually gone
      const checkRes = await request(app).get('/api/v1/internships/INT-105');
      assert.equal(checkRes.status, 404);
    });

    test('should return 404 when deleting non-existent internship', async () => {
      const res = await request(app).delete('/api/v1/internships/INT-999');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INTERNSHIP_NOT_FOUND');
    });
  });

  // -------------------------------------------------------------
  // 7. Unknown Route & Malformed JSON
  // -------------------------------------------------------------
  describe('Route Not Found & Error Handling', () => {
    test('should return 404 JSON for unknown API endpoint', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'ROUTE_NOT_FOUND');
    });

    test('should return 400 JSON when request body is malformed JSON', async () => {
      const res = await request(app)
        .post('/api/v1/internships')
        .set('Content-Type', 'application/json')
        .send('{"id": "INT-100", title: bad json}');

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });
  });
});
