import { defineEventHandler, readBody } from 'h3';
import db from '../../database/schema';
import { StaffSchema } from '../../database/validation';

export default defineEventHandler(async (event) => {
  const method = event.req.method;

  if (method === 'GET') {
    const allStaff = db.prepare('SELECT * FROM staff').all();
    return allStaff;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = StaffSchema.parse(body);
    const stmt = db.prepare(
      'INSERT INTO staff (full_name, occupation) VALUES (?, ?)'
    );
    const info = stmt.run(data.full_name, data.occupation);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('staff', 'add', info.lastInsertRowid, `Added staff: ${data.full_name}`, new Date().toISOString());
    return { id: info.lastInsertRowid };
  }

  return { statusCode: 405, message: 'Method Not Allowed' };
});
