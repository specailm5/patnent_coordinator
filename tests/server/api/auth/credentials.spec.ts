import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'
import db from '~/server/database/schema' // Mocked DB
import bcrypt from 'bcrypt'

// Helper function to get a CSRF token (often needed for POST requests with next-auth)
// This might be simplified if CSRF protection is handled differently or not strictly enforced in test environment
async function getCsrfToken() {
  try {
    const data = await $fetch<{ csrfToken: string }>('/api/auth/csrf');
    return data.csrfToken;
  } catch (e) {
    // console.warn("Could not fetch CSRF token, proceeding without. This might be okay for credentials provider direct test.");
    return 'test-csrf-token-if-not-found'; // Fallback or handle as needed
  }
}


describe('Credentials Authentication in /api/auth/[...].ts', () => {
  const testUserPassword = 'password123';
  let testUserHashedPassword = '';
  let testUserId: number | bigint;
  let coordinatorRoleId: number | bigint;

  beforeAll(async () => {
    // Ensure roles exist
    const rolesToInsert = ['Admin', 'Coordinator'];
    const stmtRoles = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');
    rolesToInsert.forEach(role => stmtRoles.run(role));

    // Get Coordinator role ID
    const roleRow: any = db.prepare("SELECT id FROM roles WHERE name = 'Coordinator'").get();
    if (!roleRow) throw new Error('Coordinator role not found in test setup');
    coordinatorRoleId = roleRow.id;

    // Hash password
    testUserHashedPassword = bcrypt.hashSync(testUserPassword, 10);
  });

  beforeEach(async () => {
    // Clear users table
    db.prepare('DELETE FROM users').run();
    // Create a test user before each test that needs one for login attempts
    const result = db.prepare('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)')
      .run('loginuser', testUserHashedPassword, coordinatorRoleId);
    testUserId = result.lastInsertRowid;
  });

  afterEach(() => {
    // vi.restoreAllMocks(); // Restore any mocks if used within tests
  });

  it('should successfully log in with correct credentials and establish a session', async () => {
    const csrfToken = await getCsrfToken();

    // Attempt to sign in.
    // Note: Directly calling /api/auth/callback/credentials is an internal next-auth flow.
    // It expects specific form data (username, password, csrfToken, json=true typically).
    // The response might be a redirect or a JSON object depending on how NuxtAuth/NextAuth handles it.
    // For testing, we care that the authorize function works and a session can be established.

    let signInResponse;
    try {
      signInResponse = await $fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // next-auth expects this for form posts
        body: new URLSearchParams({
          username: 'loginuser',
          password: testUserPassword,
          csrfToken: csrfToken,
          json: 'true', // often used to get a JSON response
        }),
        redirect: 'manual', // Prevent actual redirect to inspect response
      });
    } catch (e: any) {
      // If $fetch throws on non-2xx, this might be an error response
      signInResponse = e.response?._data || e.data; // Nuxt test utils might wrap error responses
       if (e.response?.status !== 200 && !signInResponse?.url?.includes('/api/auth/error')) { // Allow error URL as a valid "failure"
        // console.error("Sign-in error response:", signInResponse, "Status:", e.response?.status);
       }
    }

    // A successful credentials callback might redirect or return user data.
    // If it redirects, the URL might be the app's base URL.
    // If it returns JSON (often with json: 'true'), it might contain user details.
    // The most reliable way to check is to then try fetching the session.

    // Fetch the session to confirm login
    const session = await $fetch<any>('/api/auth/session');

    expect(session).toBeDefined();
    expect(session.user).toBeDefined();
    expect(session.user.id).toBe(testUserId);
    expect(session.user.name).toBe('loginuser'); // next-auth maps username to name by default if no name field
    expect(session.user.role).toBe('Coordinator');
  });

  it('should fail to log in with incorrect password', async () => {
    const csrfToken = await getCsrfToken();
    let errorResponseData;

    try {
      await $fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'loginuser',
          password: 'wrongpassword',
          csrfToken: csrfToken,
          json: 'true',
        }),
        // By default, $fetch throws an error for non-2xx responses.
      });
      throw new Error('Login should have failed but did not.');
    } catch (error: any) {
      // next-auth typically redirects to an error page or returns an error object for json=true.
      // The authorize function returns null, which should lead to a credentials error.
      // The actual status code might be 200 with an error URL in the body, or a 401/403 if configured.
      // Or it might be a redirect status code (302).
      errorResponseData = error.data || error.response?._data; // $fetch error structure
      // console.log("Incorrect password error response:", errorResponseData, "Status:", error.status || error.response?.status);

      // Check if the response indicates a sign-in error.
      // This URL might be specific to your next-auth pages.error configuration or default.
      expect(errorResponseData?.url || error.response?.url || error.url).toContain('error=CredentialsSignin');
    }

    // Also, verify session is not established
    const session = await $fetch<any>('/api/auth/session');
    expect(session.user).toBeUndefined(); // Or however your unauthenticated session looks
  });

  it('should fail to log in with a non-existent username', async () => {
    const csrfToken = await getCsrfToken();
    let errorResponseData;
    try {
      await $fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: 'nonexistentuser',
          password: 'anypassword',
          csrfToken: csrfToken,
          json: 'true',
        }),
      });
       throw new Error('Login should have failed but did not.');
    } catch (error: any) {
      errorResponseData = error.data || error.response?._data;
      // console.log("Non-existent user error response:", errorResponseData, "Status:", error.status || error.response?.status);
      expect(errorResponseData?.url || error.response?.url || error.url).toContain('error=CredentialsSignin');
    }
     // Also, verify session is not established
    const session = await $fetch<any>('/api/auth/session');
    expect(session.user).toBeUndefined();
  });
});
