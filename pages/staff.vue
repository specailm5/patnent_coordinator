<template>
  <div class="min-h-screen bg-gradient-to-br from-secondary-50/95 via-secondary-100/90 to-white/90 dark:from-secondary-900/80 dark:to-secondary-800/80 backdrop-blur-sm">
    <div class="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Header Section - Mobile First -->
      <div class="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-8 pb-6 animate-fadeIn">
        <div>
          <h1 class="text-2xl sm:text-3xl font-heading font-bold text-center sm:text-left" :class="colors.gradient + ' bg-clip-text text-emerald-700 dark:text-emerald-300'">Staff</h1>
          <p class="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 mt-1 text-center sm:text-left">Manage your clinic's staff members here.</p>
        </div>
        <NuxtLink to="/" class="btn btn-outline text-sm sm:text-base w-full sm:w-auto hover:no-underline focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 ring-offset-2 dark:ring-offset-indigo-800 transition-all duration-150 ease-in-out">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Home
        </NuxtLink>
      </div>

      <!-- Alerts -->
      <transition name="fade">
        <div v-if="success" class="alert alert-success text-sm mb-4 flex items-center gap-2 animate-fadeIn">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          <span>{{ success }}</span>
        </div>
      </transition>
      <div v-if="error" class="alert alert-error text-sm mb-4 animate-fadeIn">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414 1.414M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/></svg>
        <span>{{ error }}</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="fade-spinner-wrapper py-8">
        <div class="fade-spinner"></div>
        <p class="text-sm sm:text-base text-secondary-600 dark:text-secondary-400 mt-4">Loading staff members...</p>
      </div>

      <!-- Main Content -->
      <transition name="fade">
        <div v-if="!loading" class="space-y-6">
          <!-- Add Staff Form -->
          <div v-if="canManageStaff" class="card p-4 sm:p-6 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm animate-fadeIn shadow-lg hover:shadow-xl transition-all duration-300">
            <form @submit.prevent="create" class="space-y-4 sm:space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div class="space-y-1">
                  <label class="input-label text-sm" for="full_name">Full Name</label>
                  <input
                    v-model="form.full_name"
                    id="full_name"
                    type="text"
                    class="input text-sm sm:text-base bg-white dark:bg-secondary-900 shadow-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out"
                    required
                    :disabled="loading"
                    aria-label="Full Name"
                    placeholder="Enter staff member's name"
                  />
                </div>
                <div class="space-y-1">
                  <label class="input-label text-sm" for="occupation">Occupation</label>
                  <input
                    v-model="form.occupation"
                    id="occupation"
                    type="text"
                    class="input text-sm sm:text-base bg-white dark:bg-secondary-900 shadow-sm focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out"
                    required
                    :disabled="loading"
                    aria-label="Occupation"
                    placeholder="Enter staff role"
                  />
                </div>
                <div class="flex items-end">
                  <button type="submit" :class="[colors.bgSolid, 'btn w-full text-sm sm:text-base text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out']" :disabled="loading">
                    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ loading ? 'Adding...' : 'Add Staff Member' }}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Staff List -->
          <div class="overflow-hidden">
            <div class="table-container bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-lg shadow-lg animate-fadeIn">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                  <thead class="bg-secondary-50 dark:bg-secondary-800">
                    <tr>
                      <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Full Name</th>
                      <th class="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Occupation</th>
                      <th v-if="canManageStaff" class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-secondary-900 divide-y divide-secondary-200 dark:divide-secondary-700">
                    <tr v-for="s in staffMembers" :key="s.id" class="hover:bg-secondary-50/70 dark:hover:bg-secondary-800/40 transition-colors duration-150 ease-in-out focus-within:bg-emerald-100 dark:focus-within:bg-emerald-700/50">
                      <td class="px-4 sm:px-6 py-4">
                        <div class="flex flex-col sm:flex-row sm:items-center">
                          <span :class="colors.text" class="font-medium">{{ s.full_name }}</span>
                          <span class="text-xs text-secondary-600 dark:text-secondary-400 mt-1 sm:mt-0 sm:ml-2 sm:hidden">{{ s.occupation }}</span>
                        </div>
                      </td>
                      <td class="hidden sm:table-cell px-4 sm:px-6 py-4 text-secondary-600 dark:text-secondary-400">{{ s.occupation }}</td>
                      <td v-if="canManageStaff" class="px-4 sm:px-6 py-4">
                        <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <button @click="openEdit(s)" :class="[colors.bgSolid, 'btn btn-sm text-white w-full sm:w-auto focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 ring-offset-2 dark:ring-offset-secondary-900 transition-all duration-150 ease-in-out']" :disabled="loading">
                            Edit
                          </button>
                          <button @click="remove(s.id)" class="btn btn-error btn-sm w-full sm:w-auto focus:ring-2 focus:ring-error-500 dark:focus:ring-error-400 ring-offset-2 dark:ring-offset-secondary-900 transition-all duration-150 ease-in-out" :disabled="loading">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="!loading && !staffMembers.length">
                      <td :colspan="canManageStaff ? 3 : 2" class="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div class="flex flex-col items-center gap-2">
                          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-secondary-300 dark:text-secondary-600 mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm6 0c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3z"/></svg>
                          <p class="text-sm sm:text-base text-secondary-500 dark:text-secondary-400 text-center">No staff members found.<br>
                            <span v-if="canManageStaff">Add your first staff member using the form above.</span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Edit Modal - Mobile First -->
      <div v-if="showEditModal && canManageStaff" class="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
        <div class="min-h-screen px-4 text-center flex items-center justify-center">
          <div class="card w-full max-w-lg p-4 sm:p-6 m-4 animate-fadeIn">
            <div class="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-secondary-200 dark:border-secondary-700">
              <h3 class="text-lg sm:text-xl font-heading font-bold text-secondary-700 dark:text-secondary-300">Edit Staff Member</h3>
              <button @click="closeEditModal" class="p-1 text-secondary-400 hover:text-error-500 dark:hover:text-error-400 transition-colors">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleEdit" class="space-y-4 sm:space-y-6">
              <div class="space-y-4">
                <div class="space-y-1">
                  <label class="input-label text-sm" for="edit_full_name">Full Name</label>
                  <input v-model="editForm.full_name" id="edit_full_name" type="text" class="input text-sm sm:text-base bg-white dark:bg-secondary-900 w-full" required :disabled="loading" />
                </div>
                <div class="space-y-1">
                  <label class="input-label text-sm" for="edit_occupation">Occupation</label>
                  <input v-model="editForm.occupation" id="edit_occupation" type="text" class="input text-sm sm:text-base bg-white dark:bg-secondary-900 w-full" required :disabled="loading" />
                </div>
              </div>
              <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button type="button" @click="closeEditModal" class="btn btn-outline w-full sm:w-auto order-1 sm:order-none" :disabled="loading">Cancel</button>
                <button type="submit" :class="[colors.bgSolid, 'btn w-full sm:w-auto text-white']" :disabled="loading">
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue' // Added computed
import { usePageColors } from '~/composables/usePageColors'
import { useAuth } from '#imports' // Added for useAuth

definePageMeta({
  // middleware: 'auth', // The global middleware will handle this
  requiredRole: ['Admin', 'Manager'] // Custom meta field for our global auth middleware
})

const { colors } = usePageColors()
const { data: session } = useAuth() // Get session data

const userRole = computed(() => (session.value?.user as any)?.role)

// Define which roles can perform write actions on this page
const canManageStaff = computed(() => {
  if (!userRole.value) return false
  return ['Admin', 'Manager'].includes(userRole.value)
})

interface Staff {
  id: number
  full_name: string
  occupation: string
}

interface StaffFormData {
  full_name: string
  occupation: string
}

const staffMembers = ref<Staff[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const showEditModal = ref(false)
const form = ref<StaffFormData>({ full_name: '', occupation: '' })
const editForm = ref<Staff>({ id: 0, full_name: '', occupation: '' })

async function fetchList() {
  try {
    loading.value = true
    error.value = ''
    const data = await $fetch<Staff[]>('/api/staff')
    staffMembers.value = data
  } catch (e) {
    error.value = 'Failed to load staff members. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function create() {
  try {
    loading.value = true
    error.value = ''
    await $fetch<{ id: number }>('/api/staff', { 
      method: 'POST', 
      body: form.value 
    })
    form.value = { full_name: '', occupation: '' }
    await fetchList()
    success.value = 'Staff member added successfully.'
  } catch (e) {
    error.value = 'Failed to add staff member. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openEdit(staff: Staff) {
  editForm.value = { ...staff }
  showEditModal.value = true
  setTimeout(() => {
    const modal = document.querySelector('[tabindex="0"]') as HTMLElement
    if (modal) modal.focus()
  }, 50)
}

function closeEditModal() {
  showEditModal.value = false
  editForm.value = { id: 0, full_name: '', occupation: '' }
}

async function handleEdit() {
  try {
    loading.value = true
    error.value = ''
    await $fetch<{ success: boolean }>(`/api/staff/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        full_name: editForm.value.full_name,
        occupation: editForm.value.occupation
      }
    })
    await fetchList()
    closeEditModal()
    success.value = 'Staff member updated successfully.'
  } finally {
    loading.value = false
  }
}

async function remove(id: number) {
  try {
    loading.value = true
    error.value = ''
    await $fetch<{ success: boolean }>(`/api/staff/${id}`, { method: 'DELETE' })
    await fetchList()
    success.value = 'Staff member deleted.'
  } catch (e) {
    error.value = 'Failed to delete staff member. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(success, (val) => {
  if (val) setTimeout(() => success.value = '', 2500)
})

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.fade-spinner {
  border: 4px solid #e5e7eb;
  border-top: 4px solid #059669;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .fade-spinner {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }
  
  .input, .btn {
    min-height: 42px;
  }
}
</style>
