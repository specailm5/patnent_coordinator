import { defineEventHandler, readBody } from 'h3'
import db from '~/server/database/schema'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password, role_name } = body;

    // Basic validation
    if (!username || !password || !role_name) {
      event.res.statusCode = 400;
      return { error: 'Username, password, and role name are required.' };
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      event.res.statusCode = 409; // Conflict
      return { error: 'Username already exists.' };
    }

    // Fetch role_id from roles table
    const role: any = db.prepare('SELECT id FROM roles WHERE name = ?').get(role_name);
    if (!role) {
      event.res.statusCode = 400;
      return { error: 'Invalid role name provided.' };
    }
    const role_id = role.id;

    // Hash the password
    const password_hash = bcrypt.hashSync(password, SALT_ROUNDS);

    // Insert the new user
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)');
    const result = stmt.run(username, password_hash, role_id);

    if (result.lastInsertRowid) {
      event.res.statusCode = 201; // Created
      return {
        id: result.lastInsertRowid,
        username,
        role_name
      };
    } else {
      event.res.statusCode = 500;
      return { error: 'Failed to register user.' };
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    event.res.statusCode = 500;
    // Check for unique constraint error specifically
    if (error.message && error.message.includes('UNIQUE constraint failed: users.username')) {
        event.res.statusCode = 409; // Conflict
        return { error: 'Username already exists.' };
    }
    return { error: 'An unexpected error occurred during registration.', details: error.message };
  }
});
