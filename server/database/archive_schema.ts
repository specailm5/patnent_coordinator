import { resolve } from 'path';
import Database from 'better-sqlite3';
import fs from 'fs'; // Added import for fs


const archiveDbPath = resolve(process.cwd(), 'server', 'data');
const archiveDbFile = resolve(archiveDbPath, 'archive_data.db');


if (!fs.existsSync(archiveDbPath)) {
  fs.mkdirSync(archiveDbPath, { recursive: true });
}

const archiveDb = new Database(archiveDbFile);


archiveDb.prepare(`  CREATE TABLE IF NOT EXISTS archive_tracking (
    archive_id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_tracking_id INTEGER NOT NULL, -- ID from the original tracking table
    patient_id INTEGER NOT NULL,
    patient_name TEXT, -- Denormalized: As in the Tracking interface from tracking.vue
    contact_person TEXT NOT NULL,
    location TEXT,
    isBaby INTEGER DEFAULT 0, -- Store whether the patient is a baby
    from_date TEXT NOT NULL, -- Store dates as ISO8601 strings (YYYY-MM-DD)
    to_date TEXT NOT NULL,   -- Store dates as ISO8601 strings (YYYY-MM-DD)
    staff_ids TEXT, -- JSON string of numbers, e.g., '[1, 2, 3]'
    staff_titles TEXT, -- From original schema, potentially useful
    hours_per_day REAL NOT NULL,
    days_per_week INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    timing TEXT NOT NULL,
    amount REAL NOT NULL,
    holiday_amount REAL NOT NULL,
    total REAL NOT NULL,
    paid INTEGER NOT NULL, -- 0 for false, 1 for true
    contract_sent INTEGER, -- 0 for false, 1 for true, NULL if not applicable/sent
    contract_signed INTEGER NOT NULL, -- 0 for false, 1 for true
    status TEXT NOT NULL, -- e.g., 'renewal', 'New'
    coordinator_id INTEGER, -- Foreign key to coordinators (optional)
    contract_status TEXT, -- e.g., "Children's Contract", "Contract Valid", "Contract Suspended", "Contract Expired", or NULL
    archived_at TEXT NOT NULL -- ISO 8601 date string (e.g., YYYY-MM-DDTHH:MM:SS.SSSZ)
  )
`).run();

export default archiveDb;
