import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import db from '~/server/database/schema' // Mocked DB
import bcrypt from 'bcrypt'

vi.mock('#auth', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return { ...actual, getServerSession: vi.fn() }
})
const mockedGetServerSession = vi.mocked(require('#auth').getServerSession)

describe('API /api/admin/users/[id]', () => {
  let adminRoleId: number | bigint, managerRoleId: number | bigint, coordinatorRoleId: number | bigint;
  let adminUser: any, managerUser: any, coordinatorUserToEdit: any; // User specifically for editing/deleting

  beforeAll(async () => {
    const rolesToInsert = ['Admin', 'Manager', 'Coordinator'];
    const stmtRoles = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
    rolesToInsert.forEach(role => stmtRoles.run(role));

    adminRoleId = (db.prepare("SELECT id FROM roles WHERE name = 'Admin'").get() as any).id;
    managerRoleId = (db.prepare("SELECT id FROM roles WHERE name = 'Manager'").get() as any).id;
    coordinatorRoleId = (db.prepare("SELECT id FROM roles WHERE name = 'Coordinator'").get() as any).id;
  });

  beforeEach(async () => {
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM activities').run();
    mockedGetServerSession.mockReset();

    const adminPassword = bcrypt.hashSync('adminpass', 10);
    const managerPassword = bcrypt.hashSync('managerpass', 10);
    const coordPassword = bcrypt.hashSync('coordpass', 10);

    const adminRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      .run('admin', adminPassword, adminRoleId);
    adminUser = { id: adminRes.lastInsertRowid, username: 'admin', role: 'Admin', name: 'Admin User' };

    const managerRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      .run('manager', managerPassword, managerRoleId);
    managerUser = { id: managerRes.lastInsertRowid, username: 'manager', role: 'Manager', name: 'Manager User' };

    const coordRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      .run('coordtoedit', coordPassword, coordinatorRoleId);
    coordinatorUserToEdit = { id: coordRes.lastInsertRowid, username: 'coordtoedit', role: 'Coordinator', name: 'Coord To Edit' };
  });

  // --- PUT /api/admin/users/[id] ---
  describe('PUT /api/admin/users/[id]', () => {
    const updatePayload = { username: 'coordupdated', role_name: 'Manager' };

    it('should allow Admin to update a user', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      const response = await $fetch<any>(`/api/admin/users/${coordinatorUserToEdit.id}`, {
        method: 'PUT',
        body: updatePayload,
      });
      expect(response.success).toBe(true);
      const dbUser = db.prepare('SELECT u.username, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?').get(coordinatorUserToEdit.id) as any;
      expect(dbUser.username).toBe(updatePayload.username);
      expect(dbUser.role_name).toBe(updatePayload.role_name);
    });

    it('should allow Admin to update their own username (but not role via this simple test)', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      const selfUpdatePayload = { username: 'admin_renamed', role_name: 'Admin' }; // Role is the same
      const response = await $fetch<any>(`/api/admin/users/${adminUser.id}`, {
        method: 'PUT',
        body: selfUpdatePayload,
      });
      expect(response.success).toBe(true);
      const dbUser = db.prepare('SELECT username FROM users WHERE id = ?').get(adminUser.id) as any;
      expect(dbUser.username).toBe(selfUpdatePayload.username);
    });

    it('should prevent Admin from changing the last Admin\'s role to non-Admin', async () => {
        mockedGetServerSession.mockResolvedValue({ user: adminUser });
        // Ensure only one admin exists for this test
        db.prepare('DELETE FROM users WHERE username != ? AND role_id = ?').run(adminUser.username, adminRoleId);
        const nonAdminPayload = { username: 'admin', role_name: 'Coordinator' };
        try {
            await $fetch(`/api/admin/users/${adminUser.id}`, { method: 'PUT', body: nonAdminPayload });
            throw new Error('Should have failed');
        } catch (e: any) {
            expect(e.statusCode).toBe(403);
            expect(e.data.statusMessage).toContain('Cannot change the role of the last Admin to a non-Admin role');
        }
    });


    it('should deny Manager from updating a user', async () => {
      mockedGetServerSession.mockResolvedValue({ user: managerUser });
      try {
        await $fetch(`/api/admin/users/${coordinatorUserToEdit.id}`, { method: 'PUT', body: updatePayload });
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
      }
    });

    it('should return 404 if Admin tries to update non-existent user', async () => {
        mockedGetServerSession.mockResolvedValue({ user: adminUser });
        try {
            await $fetch('/api/admin/users/99999', { method: 'PUT', body: updatePayload });
            throw new Error('Should have failed');
        } catch (e: any) {
            expect(e.statusCode).toBe(404); // Or based on actual error from API
            expect(e.data.statusMessage).toContain('User not found');
        }
    });
  });

  // --- DELETE /api/admin/users/[id] ---
  describe('DELETE /api/admin/users/[id]', () => {
    it('should allow Admin to delete a user', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      const response = await $fetch<any>(`/api/admin/users/${coordinatorUserToEdit.id}`, {
        method: 'DELETE',
      });
      expect(response.success).toBe(true);
      const dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(coordinatorUserToEdit.id);
      expect(dbUser).toBeUndefined();
    });

    it('should prevent Admin from deleting themselves', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser });
      try {
        await $fetch(`/api/admin/users/${adminUser.id}`, { method: 'DELETE' });
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
        expect(e.data.statusMessage).toContain('Admins cannot delete themselves');
      }
    });

    it('should prevent Admin from deleting the last Admin user', async () => {
      mockedGetServerSession.mockResolvedValue({ user: adminUser }); // Current session is adminUser
      // Create another admin to delete, then delete the original adminUser
      const anotherAdminPassword = bcrypt.hashSync('anotheradminpass', 10);
      const anotherAdminRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
        .run('anotheradmin', anotherAdminPassword, adminRoleId);
      const anotherAdminId = anotherAdminRes.lastInsertRowid;

      // Now delete 'anotheradmin' (this should succeed)
      await $fetch(`/api/admin/users/${anotherAdminId}`, { method: 'DELETE' });

      // Now, adminUser is the last admin. Attempting to delete adminUser should fail.
      // This test setup is a bit complex. A simpler way: delete all other admins first.
      db.prepare('DELETE FROM users WHERE username != ? AND role_id = ?').run(adminUser.username, adminRoleId);
      // Now adminUser is guaranteed to be the only admin left in the DB for this test scope.
      // We are trying to delete adminUser (which is the current user and last admin)
      // The "cannot delete self" check should take precedence.
       try {
        await $fetch(`/api/admin/users/${adminUser.id}`, { method: 'DELETE' });
        throw new Error('Should have failed due to self-deletion');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
         expect(e.data.statusMessage).toContain('Admins cannot delete themselves');
      }

      // Test deleting another admin when current admin is the last one.
      // This requires setting up a scenario where adminUser is the only admin, and it tries to delete another (non-existent at this point) admin
      // The logic for "last admin" is tied to the user being deleted.
      // Let's create one more admin, then delete our main 'adminUser' by 'anotherAdmin'
      // This is getting complicated to set up correctly. The API logic is:
      // 1. Cannot delete self.
      // 2. If target is Admin AND target is last Admin in DB -> fail.
      // So, if admin1 tries to delete admin2 (who is the last admin), it should fail.
      // Setup: admin1 (session), admin2 (target for deletion, and is the only admin in DB)
      db.prepare('DELETE FROM users WHERE role_id = ?').run(adminRoleId); // Delete all admins
      const onlyAdminRes = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
        .run('onlyadmin', bcrypt.hashSync('pass',10), adminRoleId);
      const onlyAdminId = onlyAdminRes.lastInsertRowid;
      // Current session user (adminUser) is NOT 'onlyadmin' for this specific sub-test
      // Let's assume current session user is some other admin not being deleted.
      mockedGetServerSession.mockResolvedValue({ user: { ...adminUser, id: adminUser.id + 100 } }); // Simulate a different admin making the request

      try {
        await $fetch(`/api/admin/users/${onlyAdminId}`, { method: 'DELETE' });
        throw new Error('Should have failed due to deleting last admin');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
        expect(e.data.statusMessage).toContain('Cannot delete the last Admin user');
      }
    });

    it('should deny Manager from deleting a user', async () => {
      mockedGetServerSession.mockResolvedValue({ user: managerUser });
      try {
        await $fetch(`/api/admin/users/${coordinatorUserToEdit.id}`, { method: 'DELETE' });
        throw new Error('Should have failed');
      } catch (e: any) {
        expect(e.statusCode).toBe(403);
      }
    });
  });
});
