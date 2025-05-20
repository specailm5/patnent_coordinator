import { defineEventHandler, readBody } from 'h3';
import db from '../../database/schema';
import { CoordinatorSchema } from '../../database/validation';

export default defineEventHandler(async (event) => {
  const method = event.req.method;

  if (method === 'GET') {
    return db.prepare('SELECT * FROM coordinators').all();
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = CoordinatorSchema.parse(body);
    const stmt = db.prepare(
      'INSERT INTO coordinators (first_name, last_name) VALUES (?, ?)'
    );
    const info = stmt.run(data.first_name, data.last_name);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('coordinators', 'add', info.lastInsertRowid, `Added coordinator: ${data.first_name} ${data.last_name || ''}`.trim(), new Date().toISOString());
    return { id: info.lastInsertRowid };
  }

  return { statusCode: 405, message: 'Method Not Allowed' };
});
