const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
require('dotenv').config();

let dbInstance = null;

/**
 * Resolves the SQLite database file path.
 * In-memory databases are supported when DATABASE_PATH=":memory:" (useful for unit/integration tests).
 */
function getDatabasePath() {
  const envPath = process.env.DATABASE_PATH;
  if (!envPath) {
    return path.resolve(__dirname, '../../database/internships.db');
  }
  if (envPath === ':memory:') {
    return ':memory:';
  }
  return path.resolve(process.cwd(), envPath);
}

/**
 * Initializes and returns the SQLite database connection.
 * Automatically ensures directory existence and executes schema.sql if tables are not initialized.
 */
function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDatabasePath();

  if (dbPath !== ':memory:') {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  dbInstance = new DatabaseSync(dbPath);

  // Enable foreign keys and WAL journal mode for performance and integrity
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') {
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  }

  initSchema(dbInstance);

  return dbInstance;
}

/**
 * Executes schema.sql to ensure required tables exist.
 * @param {DatabaseSync} db
 */
function initSchema(db) {
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schemaSql);
  }
}

/**
 * Closes the active database connection. Useful for test cleanup.
 */
function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
  getDatabasePath
};
