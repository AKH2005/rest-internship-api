-- Schema definition for REST Internship API

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

-- Index on created_at for fast pagination ordering
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON internships (created_at DESC);
