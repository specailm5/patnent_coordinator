import { resolve } from 'path';
import Database from 'better-sqlite3';
import fs from 'fs'; 


const dbPath = resolve(process.cwd(), 'server', 'data');
const dbFile = resolve(dbPath, 'data.db');


if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const db = new Database(dbFile);


db.prepare(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    person TEXT NOT NULL,
    contact TEXT NOT NULL,
    location TEXT,
    isBaby INTEGER DEFAULT 0
  )
`).run();


db.prepare(`
  CREATE TABLE IF NOT EXISTS coordinators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT
  )
`).run();


db.prepare(`
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    occupation TEXT NOT NULL
  )
`).run();


db.prepare(`
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
  )
`).run();


db.prepare(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- patients, coordinators, staff, tracking
    action TEXT NOT NULL, -- add, edit, delete
    entity_id INTEGER,
    message TEXT NOT NULL,
    date TEXT NOT NULL
  )
`).run();

export default db;