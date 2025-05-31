import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import db from '~/server/database/schema' // Mocked DB
import bcrypt from 'bcrypt'

// Mock getServerSession
// The actual path to '#auth' might need adjustment if it's aliased differently in test context
// or consider mocking the specific composable if $fetch doesn't trigger full module resolution for it.
// For server routes, it's often `import { getServerSession } from '#auth'`
// Let's assume direct path or that Nuxt test utils handle the alias.
vi.mock('#auth', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual, // Spread actual exports
    getServerSession: vi.fn(), // Mock getServerSession
  }
})
// After mocking, cast it to use vi.MockedFunction type for type safety in tests
const mockedGetServerSession = vi.mocked(require('#auth').getServerSession)


describe('API /api/admin/users (index routes)', () => {
  let adminRoleId: number | bigint, managerRoleId: number | bigint, coordinatorRoleId: number | bigint;
  let adminUser: any, managerUser: any, coordinatorUser: any;

  beforeAll(async () => {
    const rolesToInsert = ['Admin', 'Manager', 'Coordinator'];
    const stmtRoles = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
    rolesToInsert.forEach(role => stmtRoles.run(role));

    const adminRoleRow: any = db.prepare("SELECT id FROM roles WHERE name = 'Admin'").get();
    adminRoleId = adminRoleRow.id;
    const managerRoleRow: any = db.prepare("SELECT id FROM roles WHERE name = 'Manager'").get();
    managerRoleId = managerRoleRow.id;
    const coordRoleRow: any = db.prepare("SELECT id FROM roles WHERE name = 'Coordinator'").get();
    coordinatorRoleId = coordRoleRow.id;

    if (!adminRoleId || !managerRoleId || !coordinatorRoleId) {
      throw new Error('Failed to retrieve role IDs in beforeAll');
    }
  });

  beforeEach(async () => {
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM activities').run();
    mockedGetServerSession.mockReset(); // Reset call counts and mock implementations

    // Create standard users for testing
    const adminPassword = bcrypt.hashSync('adminpass', 10);
    const managerPassword = bcrypt.hashSync('managerpass', 10);
    const coordinatorPassword = bcrypt.hashSync('coordpass', 10);

    const adminRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      .run('admin', adminPassword, adminRoleId);
    adminUser = { id: adminRes.lastInsertRowid, username: 'admin', role: 'Admin', name: 'Admin User' };

    const managerRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      .run('manager', managerPassword, managerRoleId);
    managerUser = { id: managerRes.lastInsertRowid, username: 'manager', role: 'Manager', name: 'Manager User' };

    const coordRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      .run('coordinator', coordinatorPassword, coordinatorRoleId);
    coordinatorUser = { id: coordRes.lastInsertRowid, username: 'coordinator', role: 'Coordinator', name: 'Coord User' };
  });

  // --- GET /api/admin/users ---
  describe('GET /api/admin/users', () => {
    it('should return all users for an Admin', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      const users = await $fetch<any[]>('/api/admin/users');
      expect(users.length).toBe(3); // admin, manager, coordinator
      expect(users.find(u => u.username === 'admin')?.role_name).toBe('Admin');
      expect(users[0].password_hash).toBeUndefined(); // Ensure no sensitive data
    });

    it('should deny access for a Manager', async () => {
      mockedGetServerSession.mockResolvedValue({ user: managerUser });
      try {
        await $fetch('/api/admin/users');
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
      }
    });

    it('should deny access for a Coordinator', async () => {
      mockedGetServerSession.mockResolvedValue({ user: coordinatorUser });
      try {
        await $fetch('/api/admin/users');
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
      }
    });

    it('should deny access if not authenticated', async () => {
      mockedGetServerSession.mockResolvedValue(null);
      try {
        await $fetch('/api/admin/users');
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(403); // Endpoint itself throws 403 if !session.user.role === 'Admin'
                                        // If check was just !session, it might be 401.
                                        // Our current implementation of users index checks role directly.
      }
    });
  });

  // --- POST /api/admin/users ---
  describe('POST /api/admin/users', () => {
    const newUserPayload = { username: 'newbie', password: 'newpassword', role_name: 'Coordinator' };

    it('should allow Admin to create a new user', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      const response = await $fetch<any>('/api/admin/users', {
        method: 'POST',
        body: newUserPayload,
      });
      expect(response.id).toBeTypeOf('number');
      expect(response.username).toBe(newUserPayload.username);
      expect(response.role_name).toBe(newUserPayload.role_name);

      const dbUser = db.prepare('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = ?').get(newUserPayload.username);
      expect(dbUser).toBeDefined();
      // @ts-expect-error dbUser might be undefined
      expect(dbUser.role_name).toBe(newUserPayload.role_name);
      // @ts-expect-error dbUser might be undefined
      expect(bcrypt.compareSync(newUserPayload.password, dbUser.password_hash)).toBe(true);
    });

    it('should deny Manager from creating a user', async () => {
      mockedGetServerSession.mockResolvedValue({ user: managerUser });
      try {
        await $fetch('/api/admin/users', { method: 'POST', body: newUserPayload });
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
      }
    });

    it('should fail for Admin if username is missing', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      try {
        await $fetch('/api/admin/users', { method: 'POST', body: { ...newUserPayload, username: undefined } });
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
        expect(e.data.statusMessage).toContain('Username, password, and role name are required');
      }
    });

    it('should fail for Admin if username already exists', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      try {
        await $fetch('/api/admin/users', { method: 'POST', body: { ...newUserPayload, username: 'admin' } }); // 'admin' user already exists
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(409); // Conflict
        expect(e.data.statusMessage).toContain('Username already exists');
      }
    });

    it('should fail for Admin if role_name is invalid', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      try {
        await $fetch('/api/admin/users', { method: 'POST', body: { ...newUserPayload, role_name: 'NonExistentRole' } });
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
        expect(e.data.statusMessage).toContain('Invalid role name provided');
      }
    });
  });
});
