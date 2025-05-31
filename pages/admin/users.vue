<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-900 dark:to-black p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
          User Management
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Administer users and their roles.
        </p>
      </header>

      <!-- Main Content Area -->
      <div class="space-y-8">
        <!-- Add User Form -->
        <section class="card p-6 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New User</h2>
          <form @submit.prevent="handleAddUser" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label for="newUsername" class="input-label">Username</label>
              <input type="text" id="newUsername" v_model="newUser.username" class="input" required />
            </div>
            <div>
              <label for="newPassword" class="input-label">Password</label>
              <input type="password" id="newPassword" v_model="newUser.password" class="input" required />
            </div>
            <div>
              <label for="newRole" class="input-label">Role</label>
              <select id="newRole" v_model="newUser.role_name" class="input" required>
                <option disabled value="">Select role</option>
                <option v-for="role in availableRoles" :key="role.id" :value="role.name">{{ role.name }}</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary h-10" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add User' }}
            </button>
          </form>
          <p v-if="formError" class="text-red-500 text-sm mt-2">{{ formError }}</p>
          <p v-if="formSuccess" class="text-green-500 text-sm mt-2">{{ formSuccess }}</p>
        </section>

        <!-- Users Table -->
        <section class="card p-0 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div class="px-6 py-4 border-b dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Current Users</h2>
          </div>
          <div v-if="isLoading" class="p-6 text-center">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
            <p class="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
          <div v-else-if="fetchError" class="p-6 text-center text-red-500">
            Error loading users: {{ fetchError }}
          </div>
          <div v-else-if="users.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
            No users found.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ user.username }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ user.role_name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button @click="openEditModal(user)" class="btn btn-sm btn-outline-primary" :disabled="isSubmitting">Edit</button>
                    <button @click="confirmDeleteUser(user)" class="btn btn-sm btn-outline-danger" :disabled="isSubmitting || session?.user?.id === user.id">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Edit User Modal -->
      <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
          <form @submit.prevent="handleEditUser">
            <div class="p-6 border-b dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Edit User</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label for="editUsername" class="input-label">Username</label>
                <input type="text" id="editUsername" v_model="editingUser.username" class="input" required />
              </div>
              <div>
                <label for="editRole" class="input-label">Role</label>
                <select id="editRole" v_model="editingUser.role_name" class="input" required>
                  <option disabled value="">Select role</option>
                  <option v-for="role in availableRoles" :key="role.id" :value="role.name">{{ role.name }}</option>
                </select>
              </div>
              <p v-if="editError" class="text-red-500 text-sm">{{ editError }}</p>
            </div>
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
              <button type="button" @click="closeEditModal" class="btn btn-outline" :disabled="isSubmitting">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Confirm Delete</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete user <span class="font-medium">{{ userToDelete?.username }}</span>? This action cannot be undone.
            </p>
          </div>
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
            <button @click="closeDeleteConfirm" class="btn btn-outline" :disabled="isSubmitting">Cancel</button>
            <button @click="executeDeleteUser" class="btn btn-danger" :disabled="isSubmitting">
              {{ isSubmitting ? 'Deleting...' : 'Delete User' }}
            </button>
          </div>
           <p v-if="deleteError" class="text-red-500 text-sm p-4">{{ deleteError }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useAuth } from '#imports';

definePageMeta({
  requiredRole: 'Admin',
});

useHead({
  title: 'User Management - Admin',
});

interface User {
  id: number;
  username: string;
  role_name: string;
}

interface Role {
  id: number;
  name: string;
}

const { data: session } = useAuth();
const users = ref<User[]>([]);
const availableRoles = ref<Role[]>([]);
const isLoading = ref(true);
const fetchError = ref<string | null>(null);
const isSubmitting = ref(false); // For add, edit, delete operations

// Add User Form
const newUser = reactive({
  username: '',
  password: '',
  role_name: '',
});
const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);

// Edit User Modal
const showEditModal = ref(false);
const editingUser = reactive<Partial<User>>({ id: undefined, username: '', role_name: '' });
const editError = ref<string | null>(null);

// Delete User Confirmation
const showDeleteConfirm = ref(false);
const userToDelete = ref<User | null>(null);
const deleteError = ref<string | null>(null);


async function fetchUsers() {
  isLoading.value = true;
  fetchError.value = null;
  try {
    const fetchedUsers = await $fetch<User[]>('/api/admin/users');
    users.value = fetchedUsers;
  } catch (e: any) {
    console.error('Failed to fetch users:', e);
    fetchError.value = e.data?.message || e.message || 'Could not load users.';
  } finally {
    isLoading.value = false;
  }
}

async function fetchRoles() {
  try {
    const fetchedRoles = await $fetch<Role[]>('/api/roles');
    availableRoles.value = fetchedRoles;
    if (fetchedRoles.length > 0 && !newUser.role_name) {
      // newUser.role_name = fetchedRoles[0].name; // Default to first role if needed
    }
  } catch (e: any) {
    console.error('Failed to fetch roles:', e);
    formError.value = 'Could not load roles for assignment.'; // Show error in add form context
  }
}

async function handleAddUser() {
  isSubmitting.value = true;
  formError.value = null;
  formSuccess.value = null;
  try {
    const result = await $fetch<User>('/api/admin/users', {
      method: 'POST',
      body: newUser,
    });
    formSuccess.value = `User "${result.username}" created successfully!`;
    newUser.username = '';
    newUser.password = '';
    newUser.role_name = availableRoles.value.length > 0 ? availableRoles.value[0].name : '';
    await fetchUsers(); // Refresh user list
  } catch (e: any) {
    console.error('Failed to add user:', e);
    formError.value = e.data?.message || e.message || 'Failed to add user.';
  } finally {
    isSubmitting.value = false;
  }
}

function openEditModal(user: User) {
  editingUser.id = user.id;
  editingUser.username = user.username;
  editingUser.role_name = user.role_name;
  editError.value = null;
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}

async function handleEditUser() {
  if (!editingUser.id) return;
  isSubmitting.value = true;
  editError.value = null;
  try {
    await $fetch(`/api/admin/users/${editingUser.id}`, {
      method: 'PUT',
      body: {
        username: editingUser.username,
        role_name: editingUser.role_name,
      },
    });
    closeEditModal();
    await fetchUsers(); // Refresh user list
    // Optionally show a global success toast/message here
  } catch (e: any) {
    console.error('Failed to edit user:', e);
    editError.value = e.data?.message || e.message || 'Failed to edit user.';
  } finally {
    isSubmitting.value = false;
  }
}

function confirmDeleteUser(user: User) {
  userToDelete.value = user;
  deleteError.value = null;
  showDeleteConfirm.value = true;
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false;
  userToDelete.value = null;
}

async function executeDeleteUser() {
  if (!userToDelete.value?.id) return;
  isSubmitting.value = true;
  deleteError.value = null;
  try {
    await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE',
    });
    closeDeleteConfirm();
    await fetchUsers(); // Refresh user list
     // Optionally show a global success toast/message here
  } catch (e: any) {
    console.error('Failed to delete user:', e);
    deleteError.value = e.data?.message || e.message || 'Failed to delete user.';
    // Keep delete confirm modal open if error to show message
    if (!deleteError.value) closeDeleteConfirm(); // Close only if no message to show, or handle differently
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  fetchUsers();
  fetchRoles();
});
</script>

<style scoped>
.card {
 /* Tailwind classes are used primarily */
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.input-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}
.input {
  @apply block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
        focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
        sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white;
}
.btn {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent
        text-sm font-medium rounded-md shadow-sm focus:outline-none
        focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors;
}
.btn-primary {
  @apply text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500;
}
.btn-outline {
  @apply text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-indigo-500;
}
.btn-outline-primary {
   @apply text-indigo-600 dark:text-indigo-400 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-700/20 focus:ring-indigo-500;
}
.btn-outline-danger{
   @apply text-red-600 dark:text-red-400 border-red-500 hover:bg-red-50 dark:hover:bg-red-700/20 focus:ring-red-500;
}
.btn-danger {
  @apply text-white bg-red-600 hover:bg-red-700 focus:ring-red-500;
}
.btn-sm {
  @apply px-3 py-1.5 text-xs;
}

</style>
