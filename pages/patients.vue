<template>
  <div class="min-h-screen bg-gradient-to-br from-zinc-50/95 via-zinc-100/90 to-white/90 dark:from-zinc-900/80 dark:to-zinc-800/80 backdrop-blur-sm py-6 sm:py-8">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-10 gap-4">
        <h1 class="text-2xl sm:text-3xl font-heading font-bold bg-clip-text text-zinc-700 dark:text-zinc-300 text-center sm:text-left" :class="colors.gradient">
          Patients
        </h1>
        <NuxtLink to="/" class="btn btn-outline btn-sm sm:btn-base hover:no-underline focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out w-full sm:w-auto">
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
        <p class="text-zinc-600 dark:text-zinc-400 mt-3 text-sm">Loading patients...</p>
      </div>
      <transition name="fade">
        <div v-if="!loading">
          <div class="card mb-6 sm:mb-10 p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out rounded-lg">
            <form @submit.prevent="create" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div class="space-y-1">
                <label class="input-label text-xs sm:text-sm">Name</label>
                <input v-model="form.name" type="text" class="input input-sm sm:input-base bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" required :disabled="loading" placeholder="Patient name" autofocus aria-label="Patient Name" />
              </div>
              <div class="space-y-1">
                <label class="input-label text-xs sm:text-sm">Contact Person</label>
                <input v-model="form.person" type="text" class="input input-sm sm:input-base bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" required :disabled="loading" placeholder="Contact person" aria-label="Contact Person" />
              </div>
              <div class="space-y-1">
                <label class="input-label text-xs sm:text-sm">Phone</label>
                <div class="relative">
                  <input 
                    v-model="form.contact" 
                    type="tel" 
                    @input="validateContact('form')"
                    :class="[
                      'input input-sm sm:input-base w-full bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 ring-offset-2 transition-all duration-150 ease-in-out',
                      contactError ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-400 ring-offset-red-100 dark:ring-offset-red-900' : 'focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-zinc-100 dark:ring-offset-zinc-800',
                    ]" 
                    :disabled="loading" 
                    placeholder="e.g. 12345678 or +97312345678" 
                    aria-label="Phone"
                  />
                  <span v-if="contactError" class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <p v-if="contactError" class="text-red-500 text-xs mt-1">Please enter a valid phone number (e.g., 12345678 or +97312345678)</p>
              </div>
              <div class="space-y-1">
                <label class="input-label text-xs sm:text-sm">Location</label>
                <select v-model="form.location" class="input input-sm sm:input-base bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" :disabled="loading" aria-label="Location">
                  <option value="">Select location</option>
                  <option v-for="loc in locations" :key="loc">{{ loc }}</option>
                </select>
              </div>
              <div class="col-span-full sm:col-span-2 md:col-span-1 flex items-center">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input v-model="form.isBaby" type="checkbox" class="form-checkbox rounded text-zinc-600 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800" :disabled="loading" />
                  <span class="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">Baby</span>
                </label>
              </div>
              <div class="col-span-full sm:col-span-2 md:col-span-1 flex items-end">
                <button type="submit" :class="[colors.bgSolid, 'w-full btn btn-sm sm:btn-base text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out']" :disabled="loading || !form.name || !form.person || !form.contact">
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? 'Adding Patient...' : 'Add Patient' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Search Bar -->
          <div class="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
            <input v-model="searchQuery" type="text" class="input input-sm sm:input-base w-full sm:w-auto md:w-1/3 bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" placeholder="Search patients..." aria-label="Search Patients" />
          </div>

          <!-- Edit Modal -->
          <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md sm:max-w-2xl w-full animate-fadeIn">
              <div class="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <h3 class="text-lg sm:text-xl font-heading font-bold text-zinc-700 dark:text-zinc-300">Edit Patient</h3>
                <button @click="closeEditModal" class="p-1 sm:p-2 text-secondary-400 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 rounded-md">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <form @submit.prevent="handleEdit" class="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div class="space-y-1 sm:space-y-2">
                    <label class="input-label text-xs sm:text-sm">Name</label>
                    <input v-model="editForm.name" type="text" class="input input-sm sm:input-base bg-white dark:bg-zinc-900 w-full focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" required :disabled="loading" />
                  </div>
                  <div class="space-y-1 sm:space-y-2">
                    <label class="input-label text-xs sm:text-sm">Contact Person</label>
                    <input v-model="editForm.person" type="text" class="input input-sm sm:input-base bg-white dark:bg-zinc-900 w-full focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" required :disabled="loading" />
                  </div>
                  <div class="space-y-1 sm:space-y-2">
                    <label class="input-label text-xs sm:text-sm">Phone</label>
                    <div class="relative">
                      <input 
                        v-model="editForm.contact" 
                        type="tel" 
                        @input="validateContact('editForm')"
                        :class="[
                          'input input-sm sm:input-base w-full bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 ring-offset-2 transition-all duration-150 ease-in-out',
                          contactError ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-400 ring-offset-red-100 dark:ring-offset-red-900' : 'focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-zinc-100 dark:ring-offset-zinc-800',
                        ]" 
                        :disabled="loading" 
                        placeholder="e.g. 12345678 or +97312345678"
                        required
                      />
                      <span v-if="contactError" class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <p v-if="contactError" class="text-red-500 text-xs mt-1">Please enter a valid phone number (e.g., 12345678 or +97312345678)</p>
                  </div>
                  <div class="space-y-1 sm:space-y-2">
                    <label class="input-label text-xs sm:text-sm">Location</label>
                    <select v-model="editForm.location" class="input input-sm sm:input-base bg-white dark:bg-zinc-900 w-full focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" :disabled="loading">
                      <option value="">Select location</option>
                      <option v-for="loc in locations" :key="loc">{{ loc }}</option>
                    </select>
                  </div>
                  <div class="sm:col-span-2 flex items-center">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input v-model="editForm.isBaby" type="checkbox" class="form-checkbox rounded text-zinc-600 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800" :disabled="loading" />
                      <span class="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">Baby</span>
                    </label>
                  </div>
                </div>
                <div class="flex justify-end gap-3 sm:gap-4">
                  <button type="button" @click="closeEditModal" class="btn btn-sm sm:btn-base border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" :disabled="loading">Cancel</button>
                  <button type="submit" class="btn btn-sm sm:btn-base bg-zinc-600 hover:bg-zinc-700 text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" :disabled="loading">
                    {{ loading ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="table-container mt-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg shadow-lg">
            <table class="table w-full">
              <thead>
                <tr>
                  <th class="text-xs sm:text-sm">Name</th>
                  <th class="hidden md:table-cell text-xs sm:text-sm">Contact Person</th>
                  <th class="hidden sm:table-cell text-xs sm:text-sm">Phone</th>
                  <th class="hidden lg:table-cell text-xs sm:text-sm">Location</th>
                  <th class="text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredPatients" :key="p.id" class="hover:bg-zinc-100/70 dark:hover:bg-zinc-700/50 transition-colors duration-150 ease-in-out text-xs sm:text-sm">
                  <td class="py-3 px-2 sm:px-4">
                    <div class="flex items-center">
                      <span>{{ p.name }}</span>                      <span v-if="p.isBaby" class="ml-2 inline-flex">
                        <span class="px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 bg-pink-100 text-pink-800 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800/30 flex items-center gap-1">
                          <svg class="w-3 h-3" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="32" cy="32" r="30" stroke="currentColor" fill="none"/>
                            <circle cx="22" cy="26" r="3" fill="currentColor" />
                            <circle cx="42" cy="26" r="3" fill="currentColor" />
                            <path d="M32 12 C30 8, 36 8, 34 14" fill="currentColor" stroke="currentColor" stroke-linecap="round"/>
                            <path d="M24 40 C28 45, 36 45, 40 40" fill="currentColor" stroke="currentColor" stroke-linecap="round"/>
                            <circle cx="10" cy="32" r="3" fill="currentColor" stroke="currentColor"/>
                            <circle cx="54" cy="32" r="3" fill="currentColor" stroke="currentColor"/>
                          </svg>
                          Baby
                        </span>
                      </span>
                    </div>
                  </td>
                  <td class="hidden md:table-cell py-3 px-2 sm:px-4">{{ p.person }}</td>
                  <td class="hidden sm:table-cell py-3 px-2 sm:px-4">{{ p.contact }}</td>
                  <td class="hidden lg:table-cell py-3 px-2 sm:px-4">
                    <span v-if="p.location" class="badge bg-green-100 text-green-800 border border-green-200 dark:bg-green-700/30 dark:text-green-200 dark:border-green-600/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[0.6rem] sm:text-xs font-medium">{{ p.location }}</span>
                    <span v-else class="text-sm text-zinc-500 dark:text-zinc-400">-</span>
                  </td>
                  <td class="py-3 px-2 sm:px-4">
                    <div class="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <button @click="openEdit(p)" class="btn btn-xs sm:btn-sm bg-zinc-600 hover:bg-zinc-700 text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" :disabled="loading">
                        Edit
                      </button>
                      <button @click="confirmDelete(p.id)" class="btn btn-xs sm:btn-sm btn-error focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out" :disabled="loading">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && !filteredPatients.length">
                  <td colspan="5" class="px-4 sm:px-6 py-8 sm:py-12 text-center text-xs sm:text-sm">
                    <p class="text-zinc-500 dark:text-zinc-400">No patients found. Add your first patient using the form above.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Delete Confirmation Dialog -->
          <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-xs sm:max-w-sm w-full animate-fadeIn">
              <div class="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <h3 class="text-base sm:text-lg font-heading font-bold text-zinc-700 dark:text-zinc-300">Confirm Delete</h3>
              </div>
              <div class="p-4 sm:p-6">
                <p class="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">Are you sure you want to delete this patient?</p>
                <div class="flex justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <button type="button" @click="showDeleteConfirm = false" class="btn btn-sm sm:btn-base btn-outline focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out">Cancel</button>
                  <button type="button" @click="deleteConfirmed" class="btn btn-sm sm:btn-base btn-error focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ring-offset-2 dark:ring-offset-zinc-800 transition-all duration-150 ease-in-out">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Toast Notification -->
          <transition name="fade">
            <div v-if="showToast" :class="['fixed top-4 sm:top-6 right-4 sm:right-6 z-50 px-4 py-2 sm:px-6 sm:py-3 rounded shadow-lg text-xs sm:text-sm', toastType === 'success' ? 'bg-zinc-600 text-white' : 'bg-zinc-700 text-white']">
              {{ toastMsg }}
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePageColors } from '~/composables/usePageColors'
import { z } from 'zod' // Import zod for validation

const { colors } = usePageColors()

interface Patient {
  id: string
  name: string
  person: string
  contact: string
  location: string
  isBaby: boolean
}

interface PatientFormData {
  name: string
  person: string
  contact: string
  location: string
  isBaby: boolean
}

const patients = ref<Patient[]>([])
const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value
  const q = searchQuery.value.toLowerCase()
  return patients.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.person.toLowerCase().includes(q) ||
    p.contact.toLowerCase().includes(q) ||
    (p.location && p.location.toLowerCase().includes(q))
  )
})
const searchQuery = ref('')
const contactError = ref(false)
const loading = ref(false)
const error = ref('')
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const deleteId = ref<string | null>(null)
const locations = ['Manama',
    'Muharraq',
    'Hamad Town',
    'Riffa',
    "A'ali",
    'Sitra',
    'Jidhafs',
    'Isa Town',
    'Budaiya',
    'Diraz',
    'Jid Ali',
    'Sanabis',
    'Tubli',
    'Durrat Al Bahrain',
    'Gudaibiya',
    'Salmabad',
    'Jurdab',
    'Diyar Al Muharraq',
    'Amwaj Islands',
    'Al Hidd',
    'Arad',
    'Busaiteen',
    'Samaheej',
    'Al Dair',
    'Zinj',
    'Other towns',
]

const form = ref<PatientFormData>({ name: '', person: '', contact: '', location: '', isBaby: false })
const editForm = ref<Patient>({ id: '', name: '', person: '', contact: '', location: '', isBaby: false })

// Phone number validation function
const validateContact = (formType: 'form' | 'editForm') => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,8}$/
  const minMaxCheck = (val: string) => val.length >= 3 && val.length <= 20
  // dont allow empty contact or characters
  const isEmptyOrCharacters = (val: string) => !val || !/^[0-9]+$/.test(val)
  if (formType === 'form') {
    contactError.value = isEmptyOrCharacters(form.value.contact) || !(phoneRegex.test(form.value.contact) || minMaxCheck(form.value.contact))
    return !contactError.value
  } else {
    contactError.value = isEmptyOrCharacters(editForm.value.contact) || !(phoneRegex.test(editForm.value.contact) || minMaxCheck(editForm.value.contact))
    return !contactError.value
  }
}

// Toast notification logic
const toastMsg = ref('')
const toastType = ref<'success' | 'error'>('success')
const showToast = ref(false)
function showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

async function fetchList() {
  try {
    loading.value = true
    error.value = ''
    const data = await $fetch<Patient[]>('/api/patients')
    patients.value = data
  } catch (e) {
    error.value = 'Failed to load patients. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function create() {
  try {
    if (!validateContact('form')) {
      showToastMsg('Please enter a valid phone number', 'error')
      return
    }
    
    loading.value = true
    error.value = ''
    await $fetch<{ id: string }>('/api/patients', { 
      method: 'POST', 
      body: form.value 
    })
    form.value = { name: '', person: '', contact: '', location: '', isBaby: false }
    await fetchList()
    showToastMsg('Patient added successfully!', 'success')
  } catch (e) {
    error.value = 'Failed to add patient. Please try again.'
    showToastMsg('Failed to add patient.', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openEdit(patient: Patient) {
  editForm.value = { ...patient }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editForm.value = { id: '', name: '', person: '', contact: '', location: '', isBaby: false }
}

async function handleEdit() {
  try {
    if (!validateContact('editForm')) {
      showToastMsg('Please enter a valid phone number', 'error')
      return
    }
    
    loading.value = true
    error.value = ''
    await $fetch<{ success: boolean }>(`/api/patients/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        name: editForm.value.name,
        person: editForm.value.person,
        contact: editForm.value.contact,
        location: editForm.value.location,
        isBaby: editForm.value.isBaby,
      }
    })
    await fetchList()
    closeEditModal()
    showToastMsg('Patient updated successfully!', 'success')
  } catch (e) {
    error.value = 'Failed to update patient. Please try again.'
    showToastMsg('Failed to update patient.', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}

function confirmDelete(id: string) {
  deleteId.value = id
  showDeleteConfirm.value = true
}

async function deleteConfirmed() {
  if (!deleteId.value) return
  await remove(deleteId.value)
  showDeleteConfirm.value = false
  deleteId.value = null
}

async function remove(id: string) {
  try {
    loading.value = true
    error.value = ''
    const res = await $fetch<{ success: boolean, error?: string }>(`/api/patients/${id}`, { method: 'DELETE' })
    if (res && res.success === false && res.error) {
      // Show the specific error if patient has tracking records
      showToastMsg(res.error, 'error')
      error.value = res.error
      return
    }
    await fetchList()
    showToastMsg('Patient deleted.', 'success')
  } catch (e) {
    error.value = 'Failed to delete patient. Please try again.'
    showToastMsg('Failed to delete patient.', 'error')
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.fade-spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.fade-spinner {
  border: 3px solid #e4e4e7; /* zinc-200 */
  border-top: 3px solid #71717a; /* zinc-500 */
  border-radius: 50%;
  width: 30px; /* Mobile size */
  height: 30px;
  animation: spin 1s linear infinite;
}

@media (min-width: 640px) { /* sm breakpoint */
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
</style>
