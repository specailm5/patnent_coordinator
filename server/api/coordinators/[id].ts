import { defineEventHandler, readBody } from 'h3';
import db from '../../database/schema';
import { CoordinatorSchema } from '../../database/validation';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};
  const method = event.node.req.method;

  if (method === 'GET') {
    const coord = db.prepare('SELECT * FROM coordinators WHERE id = ?').get(id);
    return coord;
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    const data = CoordinatorSchema.parse(body);
    db.prepare(
      'UPDATE coordinators SET first_name = ?, last_name = ? WHERE id = ?'
    ).run(data.first_name, data.last_name, id);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('coordinators', 'edit', id, `Edited coordinator: ${data.first_name} ${data.last_name || ''}`.trim(), new Date().toISOString());
    return { success: true };
  }

  if (method === 'DELETE') {
    db.prepare('DELETE FROM coordinators WHERE id = ?').run(id);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('coordinators', 'delete', id, `Deleted coordinator with ID: ${id}`, new Date().toISOString());
    return { success: true };
  }

  return { statusCode: 405, message: 'Method Not Allowed' };
});
