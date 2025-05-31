import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e' // Using $fetch for integration-style testing
import db from '~/server/database/schema' // This will be the mocked DB

describe('POST /api/auth/register', () => {
  // Pre-insert roles as they are static and expected by the registration endpoint
  beforeAll(() => {
    const rolesToInsert = ['Admin', 'Manager', 'Coordinator', 'Intern'];
    const stmt = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
    rolesToInsert.forEach(role => stmt.run(role));
  });

  beforeEach(async () => {
    // Clear users table before each test
    db.prepare('DELETE FROM users').run();
    // Clear activities table if it's affected by registration logs
    db.prepare('DELETE FROM activities').run();
  });

  it('should register a user successfully with valid data', async () => {
    const newUser = {
      username: 'testuser',
      password: 'password123',
      role_name: 'Coordinator',
    };

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: newUser,
    });

    expect(response).toBeDefined();
    expect(response.id).toBeTypeOf('number');
    expect(response.username).toBe('testuser');
    expect(response.role_name).toBe('Coordinator');

    // Verify user in DB (optional, but good for confidence)
    const dbUser = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
    expect(dbUser).toBeDefined();
    // @ts-expect-error dbUser might be undefined
    expect(dbUser.username).toBe('testuser');
  });

  it('should fail if username is missing', async () => {
    const newUser = { password: 'password123', role_name: 'Coordinator' };
    try {
      await $fetch('/api/auth/register', { method: 'POST', body: newUser });
      throw new Error('Request should have failed');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.data?.error).toContain('Username, password, and role name are required');
    }
  });

  it('should fail if password is missing', async () => {
    const newUser = { username: 'testuser2', role_name: 'Coordinator' };
     try {
      await $fetch('/api/auth/register', { method: 'POST', body: newUser });
      throw new Error('Request should have failed');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.data?.error).toContain('Username, password, and role name are required');
    }
  });

  it('should fail if role_name is missing', async () => {
    const newUser = { username: 'testuser3', password: 'password123' };
    try {
      await $fetch('/api/auth/register', { method: 'POST', body: newUser });
      throw new Error('Request should have failed');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.data?.error).toContain('Username, password, and role name are required');
    }
  });

  it('should fail if role_name is invalid', async () => {
    const newUser = {
      username: 'testuser4',
      password: 'password123',
      role_name: 'InvalidRoleName',
    };
    try {
      await $fetch('/api/auth/register', { method: 'POST', body: newUser });
      throw new Error('Request should have failed');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.data?.error).toContain('Invalid role name provided');
    }
  });

  it('should fail if username already exists', async () => {
    // First, create a user
    const initialUser = { username: 'existinguser', password: 'password123', role_name: 'Coordinator' };
    await $fetch('/api/auth/register', { method: 'POST', body: initialUser });

    // Attempt to create another user with the same username
    const duplicateUser = { username: 'existinguser', password: 'anotherpassword', role_name: 'Manager' };
    try {
      await $fetch('/api/auth/register', { method: 'POST', body: duplicateUser });
      throw new Error('Request should have failed');
    } catch (error: any) {
      expect(error.statusCode).toBe(409); // Conflict
      expect(error.data?.error).toContain('Username already exists');
    }
  });

  afterAll(() => {
    // Clean up the mock database instance if necessary, or close connection
    // For in-memory, it might not be strictly needed if vitest sandboxes environments well
    // but good practice if it were a file-based mock db.
    // mockDb.close(); // If mockDb was exposed from setup
  });
});
