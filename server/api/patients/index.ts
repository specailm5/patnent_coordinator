import { defineEventHandler } from 'h3';
import { readBody } from 'h3';
import db from '../../database/schema';
import { PatientSchema } from '../../database/validation';

export default defineEventHandler(async (event) => {
  const method = event.req.method;

  if (method === 'GET') {
    const patients = db.prepare('SELECT * FROM patients').all();
    return patients;
  }
  if (method === 'POST') {
    const body = await readBody(event);
    const data = PatientSchema.parse(body);
    const stmt = db.prepare(
      'INSERT INTO patients (name, person, contact, location, isBaby) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(data.name, data.person, data.contact, data.location, data.isBaby ? 1 : 0);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('patients', 'add', info.lastInsertRowid, `Added patient: ${data.name}`, new Date().toISOString());
    return { id: info.lastInsertRowid };
  }

  return { statusCode: 405, message: 'Method Not Allowed' };
});
