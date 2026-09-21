-- Seed data for REST Internship API
-- Uses INSERT OR IGNORE to allow safe repeated execution without duplicates

INSERT OR IGNORE INTO internships (id, title, domain, mode, location, skills, openings)
VALUES
  ('INT-101', 'Frontend Intern', 'Full Stack Development', 'Remote', 'India', '["HTML","CSS","JavaScript"]', 3),
  ('INT-102', 'API Engineering Intern', 'Full Stack Development', 'Hybrid', 'Pune', '["Node.js","SQL","Testing"]', 2),
  ('INT-103', 'UI/UX Intern', 'UI/UX', 'Remote', 'India', '["Figma","Research","Accessibility"]', 1),
  ('INT-104', 'Data Analyst Intern', 'Data Analytics', 'On-site', 'Bengaluru', '["Excel","SQL","Data visualisation"]', 2),
  ('INT-105', 'Security Operations Intern', 'Cyber Security', 'Remote', 'India', '["Linux","Logs","Networking"]', 1);
