import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import db from '~/server/database/schema' // Mocked DB

vi.mock('#auth', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return { ...actual, getServerSession: vi.fn() }
})
const mockedGetServerSession = vi.mocked(require('#auth').getServerSession)

describe('API /api/roles (index routes)', () => {
  // Dummy user objects for mocking sessions
  const adminUser = { id: 1, username: 'admin', role: 'Admin', name: 'Admin User' };
  const managerUser = { id: 2, username: 'manager', role: 'Manager', name: 'Manager User' };
  const coordinatorUser = { id: 3, username: 'coordinator', role: 'Coordinator', name: 'Coordinator User' };
  const expectedRoles = ['Admin', 'Manager', 'Coordinator', 'Intern'];

  beforeAll(() => {
    // Ensure roles are in the DB (db-setup.ts should handle this, but reaffirm for clarity)
    const stmt = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
    expectedRoles.forEach(role => stmt.run(role));
  });

  beforeEach(() => {
    mockedGetServerSession.mockReset();
  });

  it('should return all roles for an Admin user', async () => {
    mockedGetServerSession.mockResolvedValue({ user: adminUser });
    const roles = await $fetch<any[]>('/api/roles');

    expect(roles).toBeInstanceOf(Array);
    expect(roles.length).toBe(expectedRoles.length);
    expectedRoles.forEach(roleName => {
      expect(roles.some(r => r.name === roleName)).toBe(true);
    });
    expect(roles[0]).toHaveProperty('id');
    expect(roles[0]).toHaveProperty('name');
  });

  it('should return all roles for a Manager user', async () => {
    mockedGetServerSession.mockResolvedValue({ user: managerUser });
    const roles = await $fetch<any[]>('/api/roles');

    expect(roles).toBeInstanceOf(Array);
    expect(roles.length).toBe(expectedRoles.length);
    expectedRoles.forEach(roleName => {
      expect(roles.some(r => r.name === roleName)).toBe(true);
    });
  });

  it('should deny access for a Coordinator user', async () => {
    mockedGetServerSession.mockResolvedValue({ user: coordinatorUser });
    try {
      await $fetch('/api/roles');
      throw new Error('Request should have failed for Coordinator');
    } catch (error: any) {
      expect(error.statusCode).toBe(403);
      expect(error.data?.statusMessage).toContain('Forbidden');
    }
  });

  it('should deny access if not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null); // Simulate no session
    try {
      await $fetch('/api/roles');
      throw new Error('Request should have failed for unauthenticated user');
    } catch (error: any) {
      expect(error.statusCode).toBe(403); // Current implementation returns 403 if session or role check fails
      expect(error.data?.statusMessage).toContain('Forbidden');
    }
  });
});
