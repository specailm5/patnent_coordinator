import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'

// Import the component to test
import AdminUsersPage from '~/pages/admin/users.vue'

// --- Mocks ---
const mockUsers = ref([
  { id: 1, username: 'adminuser', role_name: 'Admin' },
  { id: 2, username: 'testcoord', role_name: 'Coordinator' },
]);
const mockRoles = ref([
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Manager' },
  { id: 3, name: 'Coordinator' },
  { id: 4, name: 'Intern' },
]);

const mock$Fetch = vi.fn();

vi.mock('#imports', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual, // Preserve other exports from #imports
    useAuth: () => ({ // Mock useAuth
      status: ref('authenticated'),
      data: ref({ user: { id: 1, name: 'Admin User', username: 'adminuser', role: 'Admin' } }),
      getSession: vi.fn().mockResolvedValue({ user: { id: 1, name: 'Admin User', username: 'adminuser', role: 'Admin' } })
    }),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
    // Mock $fetch used within the component if it's auto-imported via #imports
    // If $fetch is globally available (like from Nuxt test utils), this specific mock might not be needed
    // or might need to be structured differently depending on how Nuxt handles $fetch in tests.
    // For component tests, explicit mocking of $fetch calls is often cleaner.
  }
})

// Global mock for $fetch, if not handled by the #imports mock above for component's internal usage
// This is a common way to mock $fetch in Nuxt component tests.
globalThis.$fetch = mock$Fetch;


describe('Page: pages/admin/users.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementations for $fetch
    mock$Fetch.mockImplementation(async (url: string, options?: any) => {
      if (url === '/api/admin/users' && (!options || options.method === 'GET' || options.method === undefined) ) {
        return Promise.resolve(JSON.parse(JSON.stringify(mockUsers.value))); // Deep clone
      }
      if (url === '/api/roles') {
        return Promise.resolve(JSON.parse(JSON.stringify(mockRoles.value))); // Deep clone
      }
      if (url === '/api/admin/users' && options && options.method === 'POST') {
        const newUser = options.body;
        const createdUser = { id: Date.now(), ...newUser };
        // Simulate adding to mockUsers for refresh logic test
        // mockUsers.value.push(createdUser); // This would modify global state, better to just return success
        return Promise.resolve(createdUser);
      }
      // Add more specific mocks for PUT/DELETE if those interactions are tested deeply
      return Promise.resolve({}); // Default empty response
    });

    // Ensure useAuth is consistently mocked for Admin
     vi.mocked(require('#imports').useAuth).mockReturnValue({
        status: ref('authenticated'),
        data: ref({ user: { id: 1, name: 'Admin User', username: 'adminuser', role: 'Admin' } }),
        getSession: vi.fn().mockResolvedValue({ user: { id: 1, name: 'Admin User', username: 'adminuser', role: 'Admin' } })
    });
  });

  it('renders correctly and shows loading state initially', async () => {
    // Override $fetch for this specific test to delay response and show loading
    mock$Fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockUsers.value))), 100)))
              .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(mockRoles.value))), 100)));

    const wrapper = await mountSuspended(AdminUsersPage);

    expect(wrapper.find('h1').text()).toBe('User Management');
    // Check for loading state (assuming your component sets isLoading true initially)
    // This depends on how quickly data loads vs. how fast Vitest+JSDOM render.
    // If loading is too fast, this might be tricky. The component's isLoading ref is true initially.
    expect(wrapper.html()).toContain('Loading users...'); // Or find the spinner element
  });

  it('fetches and displays users and roles after loading', async () => {
    const wrapper = await mountSuspended(AdminUsersPage);

    // Wait for onMounted hooks and subsequent $fetch calls to resolve & component to update
    await new Promise(resolve => setTimeout(resolve, 0)); // Allow microtasks to flush
    await wrapper.vm.$nextTick(); // Allow Vue to re-render based on new data
    await wrapper.vm.$nextTick(); // Another tick might be needed for all updates

    expect(mock$Fetch).toHaveBeenCalledWith('/api/admin/users');
    expect(mock$Fetch).toHaveBeenCalledWith('/api/roles');

    // Check if users are rendered (example: check for first user's username)
    expect(wrapper.html()).toContain(mockUsers.value[0].username);
    expect(wrapper.html()).toContain(mockUsers.value[1].username);

    // Check if roles dropdown is populated (example: check for first role name)
    const roleOptions = wrapper.findAll('#newRole option');
    // First option is "Select role", then the roles
    expect(roleOptions.some(opt => opt.text() === mockRoles.value[0].name)).toBe(true);
  });

  it('submits the Add User form and calls $fetch POST, then refreshes user list', async () => {
    const wrapper = await mountSuspended(AdminUsersPage);
    await new Promise(resolve => setTimeout(resolve, 0)); // Ensure initial fetches complete
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // Reset call counts for $fetch before the action we are testing
    mock$Fetch.mockClear();
    // Re-apply default mocks because mockClear removes them
    mock$Fetch.mockImplementation(async (url: string, options?: any) => {
      if (url === '/api/admin/users' && (!options || options.method === 'GET')) {
        return Promise.resolve(JSON.parse(JSON.stringify(mockUsers.value)));
      }
      if (url === '/api/roles') { return Promise.resolve(JSON.parse(JSON.stringify(mockRoles.value))); }
      if (url === '/api/admin/users' && options && options.method === 'POST') {
        return Promise.resolve({ id: 3, username: options.body.username, role_name: options.body.role_name });
      }
      return Promise.resolve({});
    });


    const newUserData = { username: 'charlie', password: 'password789', role_name: 'Manager' };
    await wrapper.find('input#newUsername').setValue(newUserData.username);
    await wrapper.find('input#newPassword').setValue(newUserData.password);
    await wrapper.find('select#newRole').setValue(newUserData.role_name);

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick(); // for isSubmitting and initial response
    await wrapper.vm.$nextTick(); // for fetchUsers call after success

    expect(mock$Fetch).toHaveBeenCalledWith('/api/admin/users', expect.objectContaining({
      method: 'POST',
      body: newUserData,
    }));

    // Check if fetchUsers was called again (signified by a GET request to /api/admin/users after the POST)
    // The first call in this assertion is the POST, the second is the GET for refresh.
    expect(mock$Fetch).toHaveBeenNthCalledWith(2, '/api/admin/users');
    // Check for success message (optional, based on component's behavior)
    expect(wrapper.html()).toContain(`User "${newUserData.username}" created successfully!`);
  });

  // More tests could be added for edit/delete modal interactions,
  // but that would require more complex mocking of DOM interactions for modals
  // or abstracting modal logic into separate, more easily testable composables/components.
});
