# REST Internship API

A production-style, beginner-friendly REST API built with Node.js, Express, and SQLite for managing internship postings. It emphasizes clean software architecture, predictable API contracts, input validation, SQL pagination, and consistent error handling.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Pagination](#pagination)
- [Validation Rules](#validation-rules)
- [Error Handling & Contracts](#error-handling--contracts)
- [Setup & Installation](#setup--installation)
- [Running in Production](#running-in-production)
- [API Examples & Documentation](#api-examples--documentation)
- [Testing](#testing)
- [Security & Robustness](#security--robustness)
- [Submission & Deployment](#submission--deployment)

---

## Overview

The **REST Internship API** provides a backend service to create, read, update, and delete internship opportunities. Designed for both learning and production readiness, it demonstrates:
- Clean multi-layered architecture (Routes → Controllers → Services → Repositories → Database).
- Strict separation of concerns without mixing SQL queries into HTTP handlers.
- Input validation using declarative Zod schemas.
- Safe, parameterized database operations powered by SQLite.

---

## Features

- **RESTful Architecture**: Follows standard REST conventions with semantic HTTP methods and status codes.
- **Full CRUD Operations**: Create, Read (List & Detail), Update, and Delete internships.
- **SQLite Persistence**: Embedded, zero-configuration relational database with automatic table migrations.
- **Strict Input Validation**: Request body, path params, and query string validation before touching the database.
- **SQL Pagination**: Efficient `LIMIT` / `OFFSET` pagination with dynamic metadata calculation.
- **Predictable API Contracts**: Uniform responses for success (`{ success: true, data: ... }`) and errors (`{ success: false, error: ... }`).
- **Standardized Error Handling**: Centralized error middleware handling validation errors, conflicts, route 404s, and unexpected server failures without exposing stack traces.
- **Safe Database Seeder**: Idempotent database seed script (`npm run seed`) that can be executed repeatedly without generating duplicate records.
- **System Health Check**: Dedicated `/health` endpoint for monitoring and uptime probes.
- **Automated Tests**: Comprehensive test suite using Node.js built-in test runner and `supertest`.

---

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v22+ / v24+)
- **Framework**: [Express 4](https://expressjs.com/)
- **Database**: [SQLite](https://www.sqlite.org/) (via Node native `DatabaseSync` / SQLite engine)
- **Validation**: [Zod](https://zod.dev/)
- **Security & Utilities**: `cors`, `dotenv`
- **Testing**: `node:test`, `node:assert`, `supertest`
- **Dev Tooling**: `nodemon`

---

## Project Structure

```
rest-internship-api/
│
├── database/                   # SQLite schema, seed data, and runners
│   ├── schema.sql              # Table definitions and constraints
│   ├── seed.sql                # Raw SQL seed records
│   ├── seed.js                 # Safe, idempotent Node.js seed runner
│   └── internships.db          # SQLite database file (created on init)
│
├── docs/                       # Detailed API documentation
│   └── api-examples.md         # Comprehensive curl commands & response samples
│
├── src/                        # Application source code
│   ├── app.js                  # Express app setup, CORS, JSON parser & middlewares
│   ├── server.js               # Entry point: DB initialization & HTTP server listener
│   │
│   ├── config/
│   │   └── database.js         # SQLite connection manager, WAL mode & auto-migrations
│   │
│   ├── controllers/
│   │   └── internship.controller.js # HTTP request handler, invokes service, returns responses
│   │
│   ├── routes/
│   │   ├── index.js            # Route aggregator (/health, /api/v1/internships)
│   │   └── internship.routes.js# Internship route definitions with validation middleware
│   │
│   ├── services/
│   │   └── internship.service.js    # Business logic, conflict checks, pagination math
│   │
│   ├── repositories/
│   │   └── internship.repository.js # Parameterized SQL queries & data formatting
│   │
│   ├── validators/
│   │   └── internship.validator.js  # Zod schemas for body, query params, and IDs
│   │
│   ├── middleware/
│   │   ├── error.middleware.js      # Centralized error handler and JSON formatter
│   │   ├── notFound.middleware.js   # 404 JSON response for unknown routes
│   │   └── validate.middleware.js   # Middleware executing Zod validation schemas
│   │
│   └── utils/
│       ├── errors.js           # Custom AppError classes (NotFoundError, ConflictError, etc.)
│       └── response.js         # Standard response wrappers (success, paginated, error)
│
├── tests/
│   └── api.test.js             # Automated API test suite
│
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore rules (node_modules, .env, *.db)
├── package.json                # Project dependencies & npm scripts
└── README.md                   # Project documentation
```

---

## Database Schema

Table name: `internships`

```sql
CREATE TABLE IF NOT EXISTS internships (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('Remote', 'Hybrid', 'On-site')),
    location TEXT NOT NULL,
    skills TEXT NOT NULL,
    openings INTEGER NOT NULL CHECK (openings >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Skills Storage Strategy
Because SQLite does not have a native array data type, skills are stored as a serialized JSON string:
```
'["HTML","CSS","JavaScript"]'
```
The repository automatically serializes JavaScript arrays to JSON on write, and parses the JSON string back into a clean JavaScript array upon read.

---

## API Endpoints

All internship routes are prefixed with `/api/v1/internships`.

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/health` | Server health check probe | `200` |
| `GET` | `/api/v1/internships` | List internships with pagination | `200`, `400`, `500` |
| `GET` | `/api/v1/internships/:id` | Get single internship by ID | `200`, `404`, `500` |
| `POST` | `/api/v1/internships` | Create a new internship | `201`, `400`, `409`, `500` |
| `PUT` | `/api/v1/internships/:id` | Update an existing internship | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/v1/internships/:id` | Delete an internship | `200`, `404`, `500` |

---

## Pagination

Pagination is performed at the database level using `LIMIT ? OFFSET ?`.

### Query Parameters
- `page`: Page number (integer, `>= 1`, default: `1`).
- `limit`: Records per page (integer, `>= 1` and `<= 100`, default: `10`).

### Example
```
GET /api/v1/internships?page=1&limit=2
```

### Response Format
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
      "skills": ["HTML", "CSS", "JavaScript"],
      "openings": 3
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

## Validation Rules

Inputs are validated before executing database queries:

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | String | Yes | Non-empty string, must be unique |
| `title` | String | Yes | Non-empty string |
| `domain` | String | Yes | Non-empty string |
| `mode` | String | Yes | Must be one of: `'Remote'`, `'Hybrid'`, `'On-site'` |
| `location` | String | Yes | Non-empty string |
| `skills` | Array | Yes | Non-empty array, items must be non-empty strings |
| `openings` | Integer | Yes | Integer `>= 0` |

---

## Error Handling & Contracts

All API errors return a uniform JSON format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

### Standard Error Codes
- `VALIDATION_ERROR` (`HTTP 400`): Malformed body, missing required fields, or validation constraint violations.
- `INVALID_PAGINATION` (`HTTP 400`): `page < 1`, `limit < 1`, or `limit > 100`.
- `INTERNSHIP_NOT_FOUND` (`HTTP 404`): The requested ID does not exist.
- `INTERNSHIP_ALREADY_EXISTS` (`HTTP 409`): Attempting to create an internship with an ID that already exists.
- `ROUTE_NOT_FOUND` (`HTTP 404`): The requested endpoint path does not exist.
- `INTERNAL_SERVER_ERROR` (`HTTP 500`): Unexpected server failure. Stack traces are suppressed from client responses.

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v22+ or v24+
- `npm` v10+

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd rest-internship-api
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Default values:
```env
PORT=3000
DATABASE_PATH=./database/internships.db
NODE_ENV=development
```

### 3. Seed Database
Run the idempotent database seeder to populate sample internships:
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

---

## Running in Production

To start the application in production mode:
```bash
npm start
```
Make sure `NODE_ENV=production` is configured in your production environment.

---

## API Examples & Documentation

For complete `curl` examples covering all endpoints, query parameters, update flows, deletion, and negative error scenarios, see:
👉 [docs/api-examples.md](docs/api-examples.md)

---

## Testing

An automated test suite is provided using Node's native test runner (`node:test`) and `supertest`.

### Run Tests
```bash
npm test
```

### Test Coverage Highlights
- `GET /health` returns 200 OK
- `GET /api/v1/internships` default pagination and metadata
- Custom pagination with `page` and `limit`
- Pagination boundary validation (`page=0`, `limit=105`)
- `GET /api/v1/internships/:id` retrieves existing record
- `GET /api/v1/internships/:id` returns 404 for missing ID
- `POST /api/v1/internships` creates record with 201 Created
- Duplicate ID returns 409 Conflict
- Body validation rejections (empty body, negative openings, invalid mode, empty skills array)
- `PUT /api/v1/internships/:id` updates existing record
- `PUT` on missing ID returns 404 Not Found
- `DELETE /api/v1/internships/:id` deletes record with 200 OK
- `DELETE` on missing ID returns 404 Not Found
- Unknown routes return JSON 404 (`ROUTE_NOT_FOUND`)
- Malformed JSON in request bodies returns JSON 400 (`VALIDATION_ERROR`)

---

## Security & Robustness

1. **SQL Injection Prevention**: All database interactions use prepared statements with positional parameter binding (`?`). User inputs are never interpolated directly into SQL.
2. **Schema Sanitization**: Inbound requests are parsed and stripped through Zod before reaching repositories.
3. **No Stack Traces**: Internal errors log to server console during development/production, but API clients receive generic sanitized messages.
4. **CORS Configured**: Cross-origin requests handled cleanly via standard middleware.
5. **Clean Shutdown**: Listens to `SIGINT` / `SIGTERM` to close database handles and finish active requests gracefully.

---

## Submission & Deployment

### Push to GitHub
```bash
git init
git add .
git commit -m "feat: complete REST Internship API with SQLite and Zod"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Deployment Considerations
- **Environment**: Suitable for deployment on platforms such as Render, Railway, Fly.io, or any VPS running Node.js.
- **Persistent Disk**: If deploying on ephemeral containers (e.g. Render/Fly.io), mount a persistent volume for `./database` so `internships.db` persists across restarts.
- **Port Binding**: The application reads `process.env.PORT` automatically.
