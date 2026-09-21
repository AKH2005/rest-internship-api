# REST Internship API - API Examples & Documentation

Complete guide to testing and interacting with the REST Internship API using `curl`.

Base URL: `http://localhost:3000`  
API Prefix: `/api/v1`

---

## Table of Contents
1. [Health Check](#1-health-check)
2. [List Internships (Pagination)](#2-list-internships-pagination)
3. [Get Internship by ID](#3-get-internship-by-id)
4. [Create Internship](#4-create-internship)
5. [Update Internship](#5-update-internship)
6. [Delete Internship](#6-delete-internship)
7. [Error Scenarios](#7-error-scenarios)
   - [Validation Error (400)](#71-validation-error-400)
   - [Invalid Pagination (400)](#72-invalid-pagination-error-400)
   - [Resource Not Found (404)](#73-resource-not-found-404)
   - [Duplicate Resource / Conflict (409)](#74-duplicate-resource--conflict-409)
   - [Route Not Found (404)](#75-route-not-found-404)
   - [Malformed JSON (400)](#76-malformed-json-request-400)

---

## 1. Health Check

Verifies server status and availability.

### Request
```bash
curl -X GET http://localhost:3000/health
```

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

---

## 2. List Internships (Pagination)

Returns paginated internship records. Supports `page` (default: 1) and `limit` (default: 10, max: 100).

### Request (Default Pagination)
```bash
curl -X GET http://localhost:3000/api/v1/internships
```

### Request (Custom Page and Limit)
```bash
curl -X GET "http://localhost:3000/api/v1/internships?page=1&limit=2"
```

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "INT-101",
      "title": "Frontend Intern",
      "domain": "Full Stack Development",
      "mode": "Remote",
      "location": "India",
      "skills": [
        "HTML",
        "CSS",
        "JavaScript"
      ],
      "openings": 3
    },
    {
      "id": "INT-102",
      "title": "API Engineering Intern",
      "domain": "Full Stack Development",
      "mode": "Hybrid",
      "location": "Pune",
      "skills": [
        "Node.js",
        "SQL",
        "Testing"
      ],
      "openings": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 5,
    "totalPages": 3
  }
}
```

---

## 3. Get Internship by ID

Retrieves a single internship by its unique identifier.

### Request
```bash
curl -X GET http://localhost:3000/api/v1/internships/INT-101
```

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "INT-101",
    "title": "Frontend Intern",
    "domain": "Full Stack Development",
    "mode": "Remote",
    "location": "India",
    "skills": [
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "openings": 3
  }
}
```

---

## 4. Create Internship

Creates a new internship record.

### Request
```bash
curl -X POST http://localhost:3000/api/v1/internships \
  -H "Content-Type: application/json" \
  -d '{
    "id": "INT-106",
    "title": "Backend Intern",
    "domain": "Backend Development",
    "mode": "Remote",
    "location": "Hyderabad",
    "skills": [
      "Node.js",
      "Express",
      "SQL"
    ],
    "openings": 2
  }'
```

### Response (`HTTP 201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "INT-106",
    "title": "Backend Intern",
    "domain": "Backend Development",
    "mode": "Remote",
    "location": "Hyderabad",
    "skills": [
      "Node.js",
      "Express",
      "SQL"
    ],
    "openings": 2
  }
}
```

---

## 5. Update Internship

Replaces all editable fields of an existing internship.

### Request
```bash
curl -X PUT http://localhost:3000/api/v1/internships/INT-106 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Intern",
    "domain": "Backend Engineering",
    "mode": "Hybrid",
    "location": "Hyderabad",
    "skills": [
      "Node.js",
      "Express",
      "PostgreSQL",
      "Docker"
    ],
    "openings": 4
  }'
```

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "INT-106",
    "title": "Senior Backend Intern",
    "domain": "Backend Engineering",
    "mode": "Hybrid",
    "location": "Hyderabad",
    "skills": [
      "Node.js",
      "Express",
      "PostgreSQL",
      "Docker"
    ],
    "openings": 4
  }
}
```

---

## 6. Delete Internship

Deletes an internship record by ID.

### Request
```bash
curl -X DELETE http://localhost:3000/api/v1/internships/INT-106
```

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "Internship deleted successfully"
}
```

---

## 7. Error Scenarios

### 7.1. Validation Error (`400 Bad Request`)

Triggered when request body contains missing, empty, or invalid fields.

#### Request
```bash
curl -X POST http://localhost:3000/api/v1/internships \
  -H "Content-Type: application/json" \
  -d '{
    "id": "INT-999",
    "title": "",
    "domain": "Engineering",
    "mode": "Virtual",
    "location": "Remote",
    "skills": [],
    "openings": -1
  }'
```

#### Response (`HTTP 400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      {
        "field": "title",
        "message": "Title must not be empty"
      },
      {
        "field": "mode",
        "message": "Mode must be one of: Remote, Hybrid, On-site"
      },
      {
        "field": "skills",
        "message": "At least one skill is required"
      },
      {
        "field": "openings",
        "message": "Openings must be greater than or equal to 0"
      }
    ]
  }
}
```

---

### 7.2. Invalid Pagination Error (`400 Bad Request`)

Triggered when `page < 1`, `limit < 1`, or `limit > 100`.

#### Request
```bash
curl -X GET "http://localhost:3000/api/v1/internships?page=0&limit=500"
```

#### Response (`HTTP 400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PAGINATION",
    "message": "Invalid pagination parameters",
    "details": [
      {
        "field": "page",
        "message": "Page must be greater than or equal to 1"
      },
      {
        "field": "limit",
        "message": "Limit must be less than or equal to 100"
      }
    ]
  }
}
```

---

### 7.3. Resource Not Found (`404 Not Found`)

Triggered when requested ID does not exist.

#### Request
```bash
curl -X GET http://localhost:3000/api/v1/internships/INT-UNKNOWN
```

#### Response (`HTTP 404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "INTERNSHIP_NOT_FOUND",
    "message": "Internship not found"
  }
}
```

---

### 7.4. Duplicate Resource / Conflict (`409 Conflict`)

Triggered when attempting to create an internship with an ID that already exists.

#### Request
```bash
curl -X POST http://localhost:3000/api/v1/internships \
  -H "Content-Type: application/json" \
  -d '{
    "id": "INT-101",
    "title": "Frontend Intern",
    "domain": "Engineering",
    "mode": "Remote",
    "location": "India",
    "skills": ["HTML"],
    "openings": 1
  }'
```

#### Response (`HTTP 409 Conflict`)
```json
{
  "success": false,
  "error": {
    "code": "INTERNSHIP_ALREADY_EXISTS",
    "message": "Internship with ID 'INT-101' already exists"
  }
}
```

---

### 7.5. Route Not Found (`404 Not Found`)

Triggered when sending a request to an unrecognized path. Always returns JSON.

#### Request
```bash
curl -X GET http://localhost:3000/api/v1/nonexistent
```

#### Response (`HTTP 404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Route GET /api/v1/nonexistent not found"
  }
}
```

---

### 7.6. Malformed JSON Request (`400 Bad Request`)

Triggered when request payload is not valid JSON.

#### Request
```bash
curl -X POST http://localhost:3000/api/v1/internships \
  -H "Content-Type: application/json" \
  -d '{"invalid": json'
```

#### Response (`HTTP 400 Bad Request`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Malformed JSON payload in request body"
  }
}
```
