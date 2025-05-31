import Database from 'better-sqlite3';
import { vi } from 'vitest';

// Create an in-memory SQLite database for testing
const mockDb = new Database(':memory:');

// Apply schema definitions
mockDb.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    person TEXT NOT NULL,
    contact TEXT NOT NULL,
    location TEXT,
    isBaby INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER,
    FOREIGN KEY(role_id) REFERENCES roles(id)
  );

  CREATE TABLE IF NOT EXISTS coordinators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    occupation TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    contact_person TEXT NOT NULL,
    location TEXT,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    staff_ids TEXT,
    staff_titles TEXT,
    hours_per_day REAL NOT NULL,
    days_per_week INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    timing TEXT NOT NULL,
    amount REAL NOT NULL,
    holiday_amount REAL NOT NULL,
    total REAL NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    contract_sent INTEGER DEFAULT NULL,
    contract_signed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    coordinator_id INTEGER,
    contract_status TEXT,
    updated_at TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(coordinator_id) REFERENCES coordinators(id)
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- patients, coordinators, staff, tracking, user_management
    action TEXT NOT NULL, -- add, edit, delete, login, logout, register
    entity_id INTEGER,
    message TEXT NOT NULL,
    date TEXT NOT NULL
  );
`);

// Insert predefined roles
const roles = ['Admin', 'Manager', 'Coordinator', 'Intern'];
const insertRoleStmt = mockDb.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
roles.forEach(role => {
  insertRoleStmt.run(role);
});

// Mock the actual database module to use this in-memory database
// Note: Adjust the path '~/server/database/schema' if your project's alias resolution
// or relative pathing differs in the test environment.
// Vitest's `vi.mock` hoists, so this will run before imports in test files.
vi.mock('~/server/database/schema', () => ({
  default: mockDb,
}));

// Optional: Define a cleanup function or use Vitest's lifecycle hooks if needed
// e.g., afterEach(() => { /* cleanup data from tables */ })

console.log('Mock DB setup complete with in-memory SQLite.');
