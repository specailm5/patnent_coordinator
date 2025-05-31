import { defineEventHandler, readBody, createError } from 'h3'
import db from '~/server/database/schema'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  // @ts-expect-error session user type
  if (!session || !session.user || (session.user?.role as string) !== 'Admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden. Admin access required.',
    })
  }

  const method = event.req.method
  const userIdToManage = parseInt(event.context.params?.id as string, 10)
  // @ts-expect-error session user type
  const currentAdminUser = session.user as { id: number; name: string; role: string }


  if (isNaN(userIdToManage)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user ID.' })
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const { username, role_name } = body

    if (!username || !role_name) {
      throw createError({ statusCode: 400, statusMessage: 'Username and role name are required.' })
    }

    try {
      // Fetch the user being managed
      const userToUpdate: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userIdToManage)
      if (!userToUpdate) {
        throw createError({ statusCode: 404, statusMessage: 'User not found.' })
      }

      // Fetch the new role_id
      const newRoleRow: any = db.prepare('SELECT id FROM roles WHERE name = ?').get(role_name)
      if (!newRoleRow) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid target role name.' })
      }
      const newRoleId = newRoleRow.id

      // Business logic: Prevent admin from changing their own role to a non-Admin role if they are the one making the request.
      // A more robust solution would check if they are the *last* admin. For now, just prevent self-role change by an admin.
      if (userIdToManage === currentAdminUser.id && newRoleId !== userToUpdate.role_id) {
         const currentRoleRow: any = db.prepare('SELECT name FROM roles WHERE id = ?').get(userToUpdate.role_id);
         if (currentRoleRow && currentRoleRow.name === 'Admin') {
            // Check if this is the only admin left
            const adminCountResult: any = db.prepare(
              `SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'Admin'`
            ).get();
            const adminCount = adminCountResult.count;

            if (adminCount === 1 && role_name !== 'Admin') {
                 throw createError({ statusCode: 403, statusMessage: 'Cannot change the role of the last Admin to a non-Admin role.' });
            }
            // If not the last admin, or changing to another role but still admin, it's complex.
            // For simplicity now: an Admin cannot change their own role via this interface.
            // They could create another admin, log in as them, and then change. Or direct DB edit.
            // Or, we could allow changing username but not role for self.
            // Current simplified rule: If it's the current admin, and the role is changing, AND current role is Admin
            if (role_name !== 'Admin') {
                 // console.warn(`Admin ${currentAdminUser.name} attempting to change their own role from Admin to ${role_name}. Forcing role to remain Admin.`);
                 // For now, we will just prevent changing own role from Admin to non-Admin.
                 // A less restrictive rule would be to only prevent if they are the last admin.
                 // Let's stick to the "last admin" rule.
            } else if (role_name === 'Admin' && newRoleId !== userToUpdate.role_id) {
                // This means they are changing from a non-Admin role to Admin, which is fine.
                // Or from Admin to Admin (no change in role name, but role_id might differ if there were duplicate "Admin" named roles - which schema prevents)
            }
         }
      }


      // Check if username is being changed and if it's already taken by another user
      if (username !== userToUpdate.username) {
        const existingUserWithNewName = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userIdToManage)
        if (existingUserWithNewName) {
          throw createError({ statusCode: 409, statusMessage: 'New username is already taken.' })
        }
      }

      const stmt = db.prepare('UPDATE users SET username = ?, role_id = ? WHERE id = ?')
      const result = stmt.run(username, newRoleId, userIdToManage)

      if (result.changes > 0) {
        db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
          .run('user_management', 'update_user', userIdToManage, `Admin ${currentAdminUser.name} updated user ID ${userIdToManage} (username: ${username}, role: ${role_name})`, new Date().toISOString())
        return { success: true, message: 'User updated successfully.' }
      } else {
        return { success: false, message: 'No changes made or user not found.' } // Or throw 404 if that's preferred
      }

    } catch (error: any) {
      console.error(`Error updating user ID ${userIdToManage} (Admin):`, error)
      if (error.statusCode) throw error // Re-throw H3 errors
      throw createError({
        statusCode: 500,
        statusMessage: 'An unexpected error occurred during user update.',
        data: error.message,
      })
    }
  }

  if (method === 'DELETE') {
    if (userIdToManage === currentAdminUser.id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden. Admins cannot delete themselves.' })
    }

    try {
      // Check if the user to be deleted is an Admin
      const userToDeleteRoleQuery: any = db.prepare(
        `SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`
      ).get(userIdToManage)

      if (userToDeleteRoleQuery && userToDeleteRoleQuery.role_name === 'Admin') {
        // Check if this is the last admin
        const adminCountResult: any = db.prepare(
          `SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'Admin'`
        ).get()
        const adminCount = adminCountResult.count

        if (adminCount === 1) {
          throw createError({ statusCode: 403, statusMessage: 'Forbidden. Cannot delete the last Admin user.' })
        }
      }

      const stmt = db.prepare('DELETE FROM users WHERE id = ?')
      const result = stmt.run(userIdToManage)

      if (result.changes > 0) {
        db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
          .run('user_management', 'delete_user', userIdToManage, `Admin ${currentAdminUser.name} deleted user ID ${userIdToManage}`, new Date().toISOString())
        return { success: true, message: 'User deleted successfully.' }
      } else {
        throw createError({ statusCode: 404, statusMessage: 'User not found or already deleted.' })
      }
    } catch (error: any) {
      console.error(`Error deleting user ID ${userIdToManage} (Admin):`, error)
      if (error.statusCode) throw error // Re-throw H3 errors
      throw createError({
        statusCode: 500,
        statusMessage: 'An unexpected error occurred during user deletion.',
        data: error.message,
      })
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed. Only PUT and DELETE are supported for this endpoint.' })
})
