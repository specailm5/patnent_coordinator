import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime' // Changed from /e2e to /runtime for component tests
import { defineComponent, ref } from 'vue'

// Import the component to test
import LoginPage from '~/pages/login.vue'

// --- Mocks ---
const mockSignIn = vi.fn()
const mockRouterPush = vi.fn()

// Mock Nuxt composables
// Note: Actual path for '#imports' or specific composables might vary.
// If this doesn't work, direct mocking of `useAuth` and `useRouter` from '#app' might be needed.
vi.mock('#imports', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    status: ref('unauthenticated'), // Default mock status
    data: ref(null),
    getSession: vi.fn().mockResolvedValue(null)
  }),
  useRouter: () => ({
    push: mockRouterPush,
  }),
  definePageMeta: vi.fn(), // Mock definePageMeta as it's used in setup
  useHead: vi.fn(), // Mock useHead if it's ever added to login.vue
}))

// A simple wrapper to provide a <NuxtPage /> context if needed, or just mount directly
// For this component, direct mount should be fine.
// const TestWrapper = defineComponent({
//   template: '<Suspense><login-page /></Suspense>',
//   components: { LoginPage },
// });


describe('Page: pages/login.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Default unauthenticated state for useAuth status
     vi.mocked(require('#imports').useAuth).mockReturnValue({
        signIn: mockSignIn,
        status: ref('unauthenticated'),
        data: ref(null),
        getSession: vi.fn().mockResolvedValue(null)
    });
  })

  it('renders the login form correctly', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.find('h2').text()).toBe('Login')
    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login')
  })

  it('calls signIn and router.push on successful login', async () => {
    mockSignIn.mockResolvedValue({ error: null, url: '/' }) // Simulate successful signIn

    const wrapper = await mountSuspended(LoginPage)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      username: 'testuser',
      password: 'password123',
      redirect: false,
    })
    // Wait for promises to resolve in handleLogin
    await wrapper.vm.$nextTick(); // Allow any state updates from async operations
    await wrapper.vm.$nextTick(); // Potentially another tick if there are chained promises

    expect(mockRouterPush).toHaveBeenCalledWith('/')
    expect(wrapper.find('p.text-red-600').exists()).toBe(false) // No error message
  })

  it('displays "Invalid username or password" on CredentialsSignin error', async () => {
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin', url: null })

    const wrapper = await mountSuspended(LoginPage)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#password').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick(); // Allow error ref to update

    expect(mockSignIn).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).not.toHaveBeenCalled()

    const errorParagraph = wrapper.find('p.text-red-600') // Selector for the error message
    expect(errorParagraph.exists()).toBe(true)
    expect(errorParagraph.text()).toContain('Invalid username or password. Please try again.')
  })

  it('displays a generic error message on other signIn errors', async () => {
    mockSignIn.mockResolvedValue({ error: 'SomeOtherError', url: null })

    const wrapper = await mountSuspended(LoginPage)

    await wrapper.find('input#username').setValue('testuser')
    await wrapper.find('input#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick();

    expect(mockRouterPush).not.toHaveBeenCalled()
    const errorParagraph = wrapper.find('p.text-red-600')
    expect(errorParagraph.exists()).toBe(true)
    expect(errorParagraph.text()).toContain('Login failed: SomeOtherError')
  })

  it('displays loading state on button when submitting', async () => {
    // Make signIn take a moment to resolve
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null, url: '/' }), 50)));

    const wrapper = await mountSuspended(LoginPage);

    await wrapper.find('input#username').setValue('testuser');
    await wrapper.find('input#password').setValue('password123');

    // Trigger submit but don't wait for handleLogin to fully complete yet
    wrapper.find('form').trigger('submit.prevent');

    await wrapper.vm.$nextTick(); // Allow loading state to be set

    expect(wrapper.find('button[type="submit"]').text()).toBe('Logging in...');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();

    // Allow signIn to complete
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for mockSignIn's timeout
    await wrapper.vm.$nextTick(); // Allow component to re-render

    expect(wrapper.find('button[type="submit"]').text()).toBe('Login');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });

})
