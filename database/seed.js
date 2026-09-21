const { getDatabase, closeDatabase, getDatabasePath } = require('../src/config/database');

const seedInternships = [
  {
    id: 'INT-101',
    title: 'Frontend Intern',
    domain: 'Full Stack Development',
    mode: 'Remote',
    location: 'India',
    skills: ['HTML', 'CSS', 'JavaScript'],
    openings: 3
  },
  {
    id: 'INT-102',
    title: 'API Engineering Intern',
    domain: 'Full Stack Development',
    mode: 'Hybrid',
    location: 'Pune',
    skills: ['Node.js', 'SQL', 'Testing'],
    openings: 2
  },
  {
    id: 'INT-103',
    title: 'UI/UX Intern',
    domain: 'UI/UX',
    mode: 'Remote',
    location: 'India',
    skills: ['Figma', 'Research', 'Accessibility'],
    openings: 1
  },
  {
    id: 'INT-104',
    title: 'Data Analyst Intern',
    domain: 'Data Analytics',
    mode: 'On-site',
    location: 'Bengaluru',
    skills: ['Excel', 'SQL', 'Data visualisation'],
    openings: 2
  },
  {
    id: 'INT-105',
    title: 'Security Operations Intern',
    domain: 'Cyber Security',
    mode: 'Remote',
    location: 'India',
    skills: ['Linux', 'Logs', 'Networking'],
    openings: 1
  }
];

function runSeed() {
  console.log(`[Seed] Connecting to SQLite database at: ${getDatabasePath()}`);
  const db = getDatabase();

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO internships (id, title, domain, mode, location, skills, openings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const item of seedInternships) {
    const result = insertStmt.run(
      item.id,
      item.title,
      item.domain,
      item.mode,
      item.location,
      JSON.stringify(item.skills),
      item.openings
    );

    if (result.changes > 0) {
      insertedCount++;
      console.log(`  + Inserted: ${item.id} - ${item.title}`);
    } else {
      skippedCount++;
      console.log(`  ~ Exists:   ${item.id} - ${item.title} (skipped)`);
    }
  }

  const countRow = db.prepare('SELECT COUNT(*) AS total FROM internships').get();
  console.log(`[Seed] Completed successfully! Inserted: ${insertedCount}, Skipped: ${skippedCount}, Total in DB: ${countRow.total}`);
}

if (require.main === module) {
  try {
    runSeed();
    closeDatabase();
  } catch (err) {
    console.error('[Seed] Error running seeder:', err);
    process.exit(1);
  }
}

module.exports = { seedInternships, runSeed };
