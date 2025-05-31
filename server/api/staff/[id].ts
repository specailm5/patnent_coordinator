import { defineEventHandler, readBody, createError, H3Error } from 'h3';
import db from '../../database/schema';
import { StaffSchema } from '../../database/validation';
import { ZodError } from 'zod';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const method = event.req.method;
  const session = await getServerSession(event);

  if (!session || !session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' });
  }

  // @ts-expect-error session user type
  const userRole = session.user?.role as string;
  const allowedWriteRoles = ['Admin', 'Manager']; // Roles allowed for PUT and DELETE

  const idParam = event.context.params?.id;
  if (!idParam) {
    throw createError({ statusCode: 400, statusMessage: 'Missing staff ID' });
  }
  const staffId = parseInt(idParam);

  if (isNaN(staffId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid staff ID' });
  }

  try {
    if (method === 'GET') {
      // All authenticated users can currently fetch individual staff.
      // Add role check here if needed: if (!['Admin', 'Manager', 'Coordinator'].includes(userRole)) { ... }
      const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId);
      if (!staff) {
        throw createError({ statusCode: 404, statusMessage: 'Staff member not found' });
      }
      return staff;
    }

    if (method === 'PUT') {
      if (!allowedWriteRoles.includes(userRole)) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Insufficient permissions to update staff.' });
      }
      const body = await readBody(event);
      const data = StaffSchema.parse(body);
      const result = db.prepare(
        'UPDATE staff SET full_name = ?, occupation = ? WHERE id = ?'
      ).run(data.full_name, data.occupation, staffId);

      if (result.changes === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Staff member not found or no changes made' });
      }
      // Log activity
      db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
        .run('staff', 'edit', staffId, `Edited staff: ${data.full_name} by ${session.user.name} (${userRole})`, new Date().toISOString());
      return { success: true };
    }

    if (method === 'DELETE') {
      if (!allowedWriteRoles.includes(userRole)) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Insufficient permissions to delete staff.' });
      }
      const result = db.prepare('DELETE FROM staff WHERE id = ?').run(staffId);
      if (result.changes === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Staff member not found' });
      }
      // Log activity
      db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
        .run('staff', 'delete', staffId, `Deleted staff with ID: ${staffId} by ${session.user.name} (${userRole})`, new Date().toISOString());
      return { success: true };
    }

    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
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
