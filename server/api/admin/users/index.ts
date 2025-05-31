import { defineEventHandler, createError } from 'h3'
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
  // @ts-expect-error session user type
  const adminUser = session.user as { name: string, role: string }


  if (method === 'GET') {
    try {
      const users = db.prepare(`
        SELECT u.id, u.username, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
      `).all()
      return users
    } catch (error: any) {
      console.error('Error fetching users (Admin):', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch users.',
        data: error.message,
      })
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const { username, password, role_name } = body

    if (!username || !password || !role_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username, password, and role name are required.',
      })
    }

    try {
      // Check if user already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
      if (existingUser) {
        throw createError({
          statusCode: 409, // Conflict
          statusMessage: 'Username already exists.',
        })
      }

      // Fetch role_id from roles table
      const roleRow: any = db.prepare('SELECT id FROM roles WHERE name = ?').get(role_name)
      if (!roleRow) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid role name provided.',
        })
      }
      const role_id = roleRow.id

      // Hash the password
      const bcrypt = require('bcrypt') // Dynamically require bcrypt if not globally available or use import
      const SALT_ROUNDS = 10
      const password_hash = bcrypt.hashSync(password, SALT_ROUNDS)

      // Insert the new user
      const stmt = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      const result = stmt.run(username, password_hash, role_id)

      if (result.lastInsertRowid) {
        // Log activity
        db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
          .run('user_management', 'create_user', result.lastInsertRowid, `Admin ${adminUser.name} created user ${username} with role ${role_name}`, new Date().toISOString())

        return {
          id: result.lastInsertRowid,
          username,
          role_name,
        }
      } else {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create user.',
        })
      }
    } catch (error: any) {
      console.error('Error creating user (Admin):', error)
      if (error.statusCode) throw error // Re-throw H3 errors
      throw createError({
        statusCode: 500,
        statusMessage: 'An unexpected error occurred during user creation.',
        data: error.message,
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
  })
})
