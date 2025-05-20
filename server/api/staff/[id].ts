import { defineEventHandler, readBody, createError, H3Error } from 'h3';
import db from '../../database/schema';
import { StaffSchema } from '../../database/validation';
import { ZodError } from 'zod';

export default defineEventHandler(async (event) => {
  const method = event.req.method;
  const idParam = event.context.params?.id;
  if (!idParam) {
    throw createError({ statusCode: 400, message: 'Missing staff ID' });
  }
  const staffId = parseInt(idParam);

  if (isNaN(staffId)) {
    throw createError({ statusCode: 400, message: 'Invalid staff ID' });
  }

  try {
    if (method === 'GET') {
      const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId);
      if (!staff) {
        throw createError({ statusCode: 404, message: 'Staff member not found' });
      }
      return staff;
    }

    if (method === 'PUT') {
      const body = await readBody(event);
      const data = StaffSchema.parse(body);
      const result = db.prepare(
        'UPDATE staff SET full_name = ?, occupation = ? WHERE id = ?'
      ).run(data.full_name, data.occupation, staffId);

      if (result.changes === 0) {
        throw createError({ statusCode: 404, message: 'Staff member not found' });
      }
      // Log activity
      db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
        .run('staff', 'edit', staffId, `Edited staff: ${data.full_name}`, new Date().toISOString());
      return { success: true };
    }

    if (method === 'DELETE') {
      const result = db.prepare('DELETE FROM staff WHERE id = ?').run(staffId);
      if (result.changes === 0) {
        throw createError({ statusCode: 404, message: 'Staff member not found' });
      }
      // Log activity
      db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
        .run('staff', 'delete', staffId, `Deleted staff with ID: ${staffId}`, new Date().toISOString());
      return { success: true };
    }

    throw createError({ statusCode: 405, message: 'Method Not Allowed' });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input data',
        data: error.errors
      });
    }
    // Re-throw H3Errors
    if ((error as H3Error).statusCode) {
      throw error;
    }
    // Log unexpected errors and return generic 500 error
    console.error('Unexpected error in staff/[id].ts:', error);
    throw createError({ statusCode: 500, message: 'Internal Server Error' });
  }
});
