<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-secondary-50/95 via-secondary-100/90 to-white/90 dark:from-secondary-900/80 dark:to-secondary-800/80 backdrop-blur-sm py-6 sm:py-8">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-10 gap-4">
        <h1 class="text-2xl sm:text-3xl font-heading font-bold text-center sm:text-left" :class="colors.gradient + ' bg-clip-text text-rose-700 dark:text-rose-300'">
          Coordinators
        </h1>
        <NuxtLink to="/" class="btn btn-outline btn-sm sm:btn-base hover:no-underline focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-rose-800 transition-all duration-150 ease-in-out w-full sm:w-auto">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Home
        </NuxtLink>
      </div>
      <div v-if="error" class="alert alert-error text-xs sm:text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414 1.414M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/></svg>
        {{ error }}
      </div>
      <div v-if="loading" class="fade-spinner-wrapper">
        <div class="fade-spinner"></div>
        <p class="text-secondary-600 dark:text-secondary-400 mt-3 text-sm">Loading coordinators...</p>
      </div>
      <transition name="fade">
        <div v-if="!loading">
          <div class="card mb-6 sm:mb-10 p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm shadow-xl hover:shadow-lg transition-shadow duration-300 ease-in-out">
            <form @submit.prevent="create" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div class="space-y-1">
                <label class="input-label text-xs sm:text-sm">First Name</label>
                <input 
                  v-model.trim="form.first_name" 
                  type="text" 
                  class="input input-sm sm:input-base bg-white dark:bg-secondary-900 shadow-sm focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out" 
                  required 
                  :disabled="loading" 
                  autocomplete="off"
                  aria-label="First Name"
                  placeholder="Enter first name"
                />
              </div>
              
              <div class="space-y-1">
                <label class="input-label text-xs sm:text-sm">Last Name</label>
                <input 
                  v-model.trim="form.last_name" 
                  type="text" 
                  class="input input-sm sm:input-base bg-white dark:bg-secondary-900 shadow-sm focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out" 
                  :disabled="loading" 
                  autocomplete="off"
                  aria-label="Last Name"
                  placeholder="Enter last name (optional)"
                />
              </div>

              <div class="flex items-end sm:col-span-2 md:col-span-1">
                <button 
                  type="submit" 
                  :class="[colors.bgSolid, 'w-full btn btn-sm sm:btn-base text-white focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out', !form.first_name ? 'opacity-60 cursor-not-allowed' : '']"
                  :disabled="loading || !form.first_name"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? 'Adding...' : 'Add Coordinator' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Edit Modal -->
          <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div class="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-md sm:max-w-2xl w-full animate-fadeIn">
              <div class="p-4 sm:p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                <h3 class="text-lg sm:text-xl font-heading font-bold text-rose-700 dark:text-rose-300">Edit Coordinator</h3>
                <button @click="closeEditModal" class="p-1 sm:p-2 text-secondary-400 hover:text-error-500 dark:hover:text-error-400 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 rounded-md">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <form @submit.prevent="handleEdit" class="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div class="space-y-1 sm:space-y-2">
                    <label class="input-label text-xs sm:text-sm">First Name</label>
                    <input v-model.trim="editForm.first_name" type="text" 
                      class="input input-sm sm:input-base bg-white dark:bg-secondary-900 w-full focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out" required :disabled="loading" aria-label="Edit First Name" />
                  </div>
                  <div class="space-y-1 sm:space-y-2">
                    <label class="input-label text-xs sm:text-sm">Last Name</label>
                    <input v-model.trim="editForm.last_name" type="text" class="input input-sm sm:input-base bg-white dark:bg-secondary-900 w-full focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out" :disabled="loading" autocomplete="off" aria-label="Edit Last Name" />
                  </div>
                </div>
                <div class="flex justify-end gap-3 sm:gap-4">
                  <button type="button" @click="closeEditModal" class="btn btn-sm sm:btn-base btn-outline focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out" :disabled="loading">Cancel</button>
                  <button type="submit" class="btn btn-sm sm:btn-base text-white bg-rose-600 dark:bg-rose-800 hover:bg-rose-700 dark:hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out" :disabled="loading">
                    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ loading ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                <thead class="bg-secondary-50 dark:bg-secondary-800">
                  <tr>
                    <th class="px-4 py-2 sm:px-6 sm:py-3 text-left text-[0.6rem] sm:text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">First Name</th>
                    <th class="px-4 py-2 sm:px-6 sm:py-3 text-left text-[0.6rem] sm:text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Last Name</th>
                    <th class="px-4 py-2 sm:px-6 sm:py-3 text-left text-[0.6rem] sm:text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-secondary-200 dark:divide-secondary-700">
                  <tr v-for="c in coordinators" :key="c.id" class="hover:bg-secondary-100/70 dark:hover:bg-secondary-700/50 transition-colors duration-150 ease-in-out text-xs sm:text-sm">
                    <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap font-medium" :class="colors.text">{{ c.first_name }}</td>
                    <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-secondary-600 dark:text-secondary-400">{{ c.last_name || '-' }}</td>
                    <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div class="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button 
                          @click="openEdit(c)" 
                          :class="[colors.bgSolid, 'btn btn-xs sm:btn-sm bg-rose-600 text-white', 'focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 focus:outline-none transition-all duration-150 ease-in-out']" 
                          :disabled="loading"
                          aria-label="Edit coordinator"
                        >
                          Edit
                        </button>
                        <button 
                          @click="confirmDelete(c.id)" 
                          class="btn btn-xs sm:btn-sm bg-slate-600 text-white focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 ring-offset-2 dark:ring-offset-secondary-800 focus:outline-none hover:bg-slate-700 transition-all duration-150 ease-in-out"
                          :disabled="loading"
                          aria-label="Delete coordinator"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!loading && !coordinators.length">
                    <td colspan="3" class="px-4 sm:px-6 py-8 sm:py-12 text-center text-xs sm:text-sm">
                      <p class="text-secondary-500 dark:text-secondary-400">No coordinators found. Add your first coordinator using the form above.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </transition>

      <!-- Delete Confirmation Dialog -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
        <div class="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-xs sm:max-w-sm w-full animate-fadeIn">
          <div class="p-4 sm:p-6 border-b border-secondary-200 dark:border-secondary-700">
            <h3 class="text-base sm:text-lg font-heading font-bold text-rose-700 dark:text-rose-300">Confirm Delete</h3>
          </div>
          <div class="p-4 sm:p-6">
            <p class="text-sm sm:text-base text-secondary-600 dark:text-secondary-300">Are you sure you want to delete this coordinator?</p>
            <div class="mt-4 sm:mt-6 flex justify-end gap-3 sm:gap-4">
              <button @click="showDeleteConfirm = false" class="btn btn-sm sm:btn-base btn-outline focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out">Cancel</button>
              <button @click="deleteConfirmed" class="btn btn-sm sm:btn-base bg-rose-600 hover:bg-rose-700 text-white focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <transition name="toast-fade">
        <div v-if="toast.show" 
             :class="[
               'fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-sm font-medium',
               toast.type === 'success' ? 'bg-rose-600 text-white' : 'bg-red-600 text-white'
             ]">
          {{ toast.message }}
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { usePageColors } from '~/composables/usePageColors'

const { colors } = usePageColors()

interface Coordinator {
  id: number
  first_name: string
  last_name?: string
}

interface CoordinatorFormData {
  first_name: string
  last_name?: string
}

const coordinators = ref<Coordinator[]>([])
const loading = ref(false)
const error = ref('')
const showEditModal = ref(false)
const form = ref<CoordinatorFormData>({ first_name: '', last_name: '' })
const editForm = ref<Coordinator>({ id: 0, first_name: '', last_name: '' })
const showDeleteConfirm = ref(false)
let coordinatorToDeleteId: number | null = null

// Toast state
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 2500)
}

async function fetchList() {
  try {
    loading.value = true
    error.value = ''
    const data = await $fetch<Coordinator[]>('/api/coordinators')
    coordinators.value = data
  } catch (e) {
    error.value = 'Failed to load coordinators. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function create() {
  try {
    loading.value = true
    error.value = ''
    await $fetch<{ id: number }>('/api/coordinators', { 
      method: 'POST', 
      body: form.value 
    })
    form.value = { first_name: '', last_name: '' }
    await fetchList()
    showToast('Coordinator added successfully.', 'success')
  } catch (e) {
    error.value = 'Failed to add coordinator. Please try again.'
    showToast('Failed to add coordinator.', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openEdit(coordinator: Coordinator) {
  editForm.value = { ...coordinator }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editForm.value = { id: 0, first_name: '', last_name: '' }
}

async function handleEdit() {
  try {
    loading.value = true
    error.value = ''
    await $fetch<{ success: boolean }>(`/api/coordinators/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        first_name: editForm.value.first_name,
        last_name: editForm.value.last_name
      }
    })
    await fetchList()
    closeEditModal()
    showToast('Coordinator updated successfully.', 'success')
  } catch (e) {
    error.value = 'Failed to update coordinator. Please try again.'
    showToast('Failed to update coordinator.', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}

function confirmDelete(id: number) {
  coordinatorToDeleteId = id
  showDeleteConfirm.value = true
}

async function deleteConfirmed() {
  if (coordinatorToDeleteId !== null) {
    await remove(coordinatorToDeleteId)
  }
  showDeleteConfirm.value = false
  coordinatorToDeleteId = null
}

async function remove(id: number) {
  try {
    loading.value = true
    error.value = ''
    await $fetch<{ success: boolean }>(`/api/coordinators/${id}`, { method: 'DELETE' })
    await fetchList()
    showToast('Coordinator deleted successfully.', 'success')
  } catch (e) {
    error.value = 'Failed to delete coordinator. Please try again.'
    showToast('Failed to delete coordinator.', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.fade-spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}
.fade-spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #e11d48;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@media (min-width: 640px) {
  .fade-spinner {
    width: 40px;
    height: 40px;
    border-width: 4px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>