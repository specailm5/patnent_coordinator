import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineNuxtRouteMiddleware, navigateTo, useAuth } from '#app' // Actual imports used by middleware
import authMiddleware from '~/middleware/auth.global' // Import the middleware

// --- Mocks ---
// Mock #app utilities
vi.mock('#app', async (importOriginal: () => Promise<Record<string, any>>) => {
  const actual = await importOriginal()
  return {
    ...actual,
    navigateTo: vi.fn((to, options) => {
      // console.log(`Mock navigateTo called with: ${typeof to === 'string' ? to : to.path}`, options);
      // For testing, we often don't want actual navigation but to check its call.
      // Returning a resolved promise to simulate navigation completion.
      return Promise.resolve(typeof to === 'string' ? to : to.path)
    }),
    useAuth: vi.fn(), // This will be configured per test case
  }
})

// --- Test Suite ---
describe('Middleware: auth.global.ts', () => {
  // Cast mocks for type safety in tests
  const mockNavigateTo = vi.mocked(navigateTo)
  const mockUseAuth = vi.mocked(useAuth)

  // Helper to create mock route objects
  const createMockRoute = (path: string, meta: any = {}) => ({
    path,
    fullPath: path, // simplified for these tests
    meta: { ...meta, auth: meta.auth }, // Ensure auth meta structure
    query: {},
    hash: '',
    params: {},
    name: undefined,
    matched: [],
    redirectedFrom: undefined,
  })

  beforeEach(() => {
    vi.resetAllMocks() // Reset mocks before each test
    // Default unauthenticated state unless overridden
    mockUseAuth.mockReturnValue({
      status: ref('unauthenticated'),
      data: ref(null),
      // @ts-expect-error - signIn, signOut, etc. not needed for this middleware's direct logic
      getSession: vi.fn().mockResolvedValue(null),
    })
  })

  // Simulate client-side environment as middleware checks for process.client
  // This should ideally be part of a Vitest environment setup, but can be forced if needed.
  // For now, assuming the 'nuxt' environment in vitest.config.ts handles client context.
  // If not, tests might need `vi.stubGlobal('process', { client: true, server: false });`

  it('should allow access to non-protected routes for unauthenticated users', async () => {
    const to = createMockRoute('/public-page')
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('should redirect unauthenticated users to /login for protected routes (default protection)', async () => {
    // A route is protected by default if it's not /login, /unauthorized, and not unauthenticatedOnly
    const to = createMockRoute('/protected-route-no-meta')
    const from = createMockRoute('/')

    await authMiddleware(to, from)
    expect(mockNavigateTo).toHaveBeenCalledWith(expect.stringContaining('/login?callbackUrl='), expect.anything())
  })

  it('should redirect unauthenticated users to /login for routes requiring a specific role', async () => {
    const to = createMockRoute('/admin', { requiredRole: 'Admin' })
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).toHaveBeenCalledWith(expect.stringContaining('/login?callbackUrl=%2Fadmin'), expect.anything())
  })

  it('should allow authenticated users with the correct role to access role-protected routes', async () => {
    mockUseAuth.mockReturnValue({
      status: ref('authenticated'),
      // @ts-expect-error - session structure
      data: ref({ user: { id: 1, name: 'Admin User', role: 'Admin' } }),
      getSession: vi.fn().mockResolvedValue({ user: { id: 1, name: 'Admin User', role: 'Admin' } }),
    })
    const to = createMockRoute('/admin', { requiredRole: 'Admin' })
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('should allow authenticated users with one of the correct roles (array) to access role-protected routes', async () => {
    mockUseAuth.mockReturnValue({
      status: ref('authenticated'),
      // @ts-expect-error - session structure
      data: ref({ user: { id: 2, name: 'Manager User', role: 'Manager' } }),
      getSession: vi.fn().mockResolvedValue({ user: { id: 2, name: 'Manager User', role: 'Manager' } }),
    })
    const to = createMockRoute('/staff', { requiredRole: ['Admin', 'Manager'] })
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })


  it('should redirect authenticated users without the correct role to /unauthorized', async () => {
    mockUseAuth.mockReturnValue({
      status: ref('authenticated'),
      // @ts-expect-error - session structure
      data: ref({ user: { id: 2, name: 'Coordinator User', role: 'Coordinator' } }),
      getSession: vi.fn().mockResolvedValue({ user: { id: 2, name: 'Coordinator User', role: 'Coordinator' } }),
    })
    const to = createMockRoute('/admin', { requiredRole: 'Admin' })
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).toHaveBeenCalledWith('/unauthorized', expect.anything())
  })

  it('should allow unauthenticated users to access unauthenticatedOnly routes (e.g., /login)', async () => {
    // Middleware logic: if unauthenticatedOnly is true, and user is authenticated, then redirect.
    // If user is NOT authenticated, it should allow access (return without navigateTo).
    const to = createMockRoute('/login', { auth: { unauthenticatedOnly: true } })
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('should redirect authenticated users from unauthenticatedOnly routes', async () => {
    mockUseAuth.mockReturnValue({
      status: ref('authenticated'),
      // @ts-expect-error - session structure
      data: ref({ user: { id: 1, name: 'Test User', role: 'User' } }),
      getSession: vi.fn().mockResolvedValue({ user: { id: 1, name: 'Test User', role: 'User' } }),
    })
    // The meta for login page is typically: { auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' } }
    const to = createMockRoute('/login', { auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/dashboard' } })
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard', expect.anything())
  })

  it('should use default navigateAuthenticatedTo path if not specified', async () => {
    mockUseAuth.mockReturnValue({
      status: ref('authenticated'),
      // @ts-expect-error - session structure
      data: ref({ user: { id: 1, name: 'Test User', role: 'User' } }),
      getSession: vi.fn().mockResolvedValue({ user: { id: 1, name: 'Test User', role: 'User' } }),
    })
    const to = createMockRoute('/login', { auth: { unauthenticatedOnly: true } }) // navigateAuthenticatedTo is not set
    const from = createMockRoute('/')
    await authMiddleware(to, from)
    expect(mockNavigateTo).toHaveBeenCalledWith('/', expect.anything()) // Default redirect
  })

  afterEach(() => {
    // Ensure globals are restored if they were stubbed.
    // vi.unstubAllGlobals();
  })
})
