import { defineEventHandler, readBody, createError } from 'h3';
import db from '../../database/schema';
import { StaffSchema } from '../../database/validation';
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const method = event.req.method;
  const session = await getServerSession(event);

  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' });
  }

  // @ts-expect-error session user type
  const userRole = session.user?.role as string;
  const allowedRolesForPost = ['Admin', 'Manager'];

  if (method === 'GET') {
    // All authenticated users can currently fetch staff list.
    // Add role check here if needed in future e.g. if (!['Admin', 'Manager', 'Coordinator'].includes(userRole)) { ... }
    const allStaff = db.prepare('SELECT * FROM staff').all();
    return allStaff;
  }

  if (method === 'POST') {
    if (!allowedRolesForPost.includes(userRole)) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: Insufficient permissions to add staff.' });
    }
    const body = await readBody(event);
    const data = StaffSchema.parse(body);
    const stmt = db.prepare(
      'INSERT INTO staff (full_name, occupation) VALUES (?, ?)'
    );
    const info = stmt.run(data.full_name, data.occupation);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('staff', 'add', info.lastInsertRowid, `Added staff: ${data.full_name} by ${session.user.name} (${userRole})`, new Date().toISOString());
    return { id: info.lastInsertRowid };
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});
