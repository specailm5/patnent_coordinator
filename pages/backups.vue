<template>
  <div class="min-h-screen bg-gradient-to-br from-secondary-50/95 via-secondary-100/90 to-white/90 dark:from-secondary-900/80 dark:to-secondary-800/80 backdrop-blur-sm">
    <div class="w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-10 animate-fadeIn">
      <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-heading font-bold text-yellow-800 dark:text-yellow-300" :class="colors.gradient + ' bg-clip-text text-transparent'">Database Backups</h1>
          <p class="text-secondary-500 dark:text-secondary-400 mt-1 text-base">Manage, restore, export, and import encrypted database backups.</p>
        </div>
      </div>

      <!-- Manual Backup Button -->
      <div class="mb-8 flex flex-col sm:flex-row items-center gap-4">
        <button
          @click="confirmManualBackup"
          :disabled="isBackupInProgress || isRestoring || isExporting || isImporting"
          class="btn bg-yellow-500 dark:bg-yellow-300 dark:text-black text-white min-w-[200px]"
        >
          <svg v-if="isBackupInProgress" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span v-else>Create Manual Backup Now</span>
        </button>
      </div>

      <!-- Backup List -->
      <div class="table-container card mb-10 p-0 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm animate-fadeIn">
        <h2 class="text-xl font-heading font-semibold px-6 pt-6 pb-2 text-secondary-700 dark:text-secondary-300">Available Backup Sets (Last 10)</h2>
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
          <div class="h-10 w-10 border-4 border-secondary-200 dark:border-secondary-700 border-t-yellow-500 rounded-full animate-spin"></div>
          <p class="mt-4 text-secondary-500 dark:text-secondary-400">Loading backups...</p>
        </div>
        <div v-else-if="errorLoadingBackups" class="alert alert-error mx-6 my-4">Error loading backups: {{ errorLoadingBackups }}</div>
        <div v-else-if="backups.length === 0" class="alert alert-warning mx-6 my-4">No backup sets found.</div>
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Backup Set</th>
                <th>Date Created</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="backup in backups" :key="backup.name" class="hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                <td class="font-medium">{{ backup.name }}</td>
                <td>{{ formatDate(backup.date) }}</td>
                <td class="text-center space-x-2">
                  <button
                    @click="confirmRestore(backup.name)"
                    :disabled="isRestoring || isBackupInProgress || isExporting || isImporting || isDeleting"
                    class="btn btn-outline btn-sm"
                  >
                    Restore
                  </button>
                  <button
                    @click="confirmDelete(backup.name)"
                    :disabled="isRestoring || isBackupInProgress || isExporting || isImporting || isDeleting"
                    class="btn btn-error btn-sm"
                  >
                    Delete
                  </button>
                  <button
                    @click="executeExport(backup.name)"
                    :disabled="isRestoring || isBackupInProgress || isExporting || isImporting"
                    class="btn btn-outline bg-yellow-500 dark:bg-yellow-300 dark:text-black text-white btn-sm hover:bg-yellow-500 dark:hover:bg-yellow-400"
                  >
                    <span v-if="isExporting && exportingFile === backup.name">
                      <svg class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Exporting...
                    </span>
                    <span v-else>Export</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>      <!-- Delete Confirmation Dialog -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
          <div class="p-6 border-b border-secondary-200 dark:border-secondary-700">
            <h3 class="text-lg font-heading font-bold text-secondary-700 dark:text-secondary-300">Confirm Delete</h3>
          </div>
          <div class="p-6">
            <p class="text-secondary-600 dark:text-secondary-400">Are you sure you want to delete this backup? This action cannot be undone.</p>
            <div class="mt-6 flex justify-end gap-3">
              <button @click="showDeleteConfirm = false" class="btn btn-outline" :disabled="isDeleting">Cancel</button>
              <button @click="deleteBackup" class="btn btn-error" :disabled="isDeleting">
                <span v-if="isDeleting"><svg class="animate-spin h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Deleting...</span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Backup Section -->
      <div class="card p-8 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm border border-secondary-100 dark:border-secondary-700 mb-10">
        <h2 class="text-xl font-heading font-semibold mb-4 text-secondary-700 dark:text-secondary-300">Import Encrypted Backup</h2>
        <form @submit.prevent="confirmImport" class="space-y-4">
          <div>
            <label for="backupFile" class="input-label">Backup File</label>
            <input
              type="file"
              id="backupFile"
              @change="handleFileUpload"
              accept=".zip.enc"
              class="input bg-white dark:bg-secondary-900 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-300 focus:outline-none"
              :disabled="isImporting || isBackupInProgress || isRestoring || isExporting"
            />
          </div>
          <button
            type="submit"
            :disabled="!selectedFile || isImporting || isBackupInProgress || isRestoring || isExporting"
            class="btn bg-yellow-500 dark:bg-yellow-300 dark:text-black text-white min-w-[160px]"
          >
            <span v-if="isImporting">
              <svg class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Importing...
            </span>
            <span v-else>Import Backup</span>
          </button>
        </form>
      </div>

      <!-- Toast Notification -->
      <div v-if="showToastMsg" class="toast-footer">
        <div :class="toastType === 'success' ? 'alert alert-success shadow-lg' : 'alert alert-error shadow-lg'" role="alert">
          {{ toastMessage }}
        </div>
      </div>

      <!-- Manual Backup Confirmation Modal -->
      <transition name="fade">
        <div v-if="showManualBackupConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm">
          <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full animate-fadeIn outline-none">
            <div class="p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-400">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              <h3 class="text-lg font-heading font-bold text-secondary-900 dark:text-secondary-100">Confirm Manual Backup</h3>
            </div>
            <div class="p-6">
              <p class="text-secondary-500 dark:text-secondary-300">Are you sure you want to create a new manual backup? This will count towards your 10 most recent backups.</p>
            </div>
            <div class="flex justify-end gap-3 px-6 pb-6">
              <button @click="executeManualBackup" class="btn bg-yellow-500 dark:bg-yellow-300 dark:text-black text-white min-w-[120px]" :disabled="isBackupInProgress">
                <span v-if="isBackupInProgress"><svg class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating...</span>
                <span v-else>Create Backup</span>
              </button>
              <button @click="showManualBackupConfirm = false" class="btn btn-outline min-w-[100px]" :disabled="isBackupInProgress">Cancel</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Restore Confirmation Modal -->
      <transition name="fade">
        <div v-if="showRestoreConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm">
          <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full animate-fadeIn outline-none">
            <div class="p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              <h3 class="text-lg font-heading font-bold text-secondary-900 dark:text-secondary-100">Restore Backup Set</h3>
            </div>
            <div class="p-6">
              <p class="text-secondary-500 dark:text-secondary-300">Are you sure you want to restore from backup set '<span class="font-semibold">{{ fileToRestore }}</span>'? This action cannot be undone and will overwrite current data.</p>
            </div>
            <div class="flex justify-end gap-3 px-6 pb-6">
              <button @click="executeRestore" class="btn btn-error min-w-[120px]" :disabled="isRestoring">
                <span v-if="isRestoring"><svg class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Restoring...</span>
                <span v-else>Restore</span>
              </button>
              <button @click="showRestoreConfirm = false" class="btn btn-outline min-w-[100px]" :disabled="isRestoring">Cancel</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Import Confirmation Modal -->
      <transition name="fade">
        <div v-if="showImportConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm">
          <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full animate-fadeIn outline-none">
            <div class="p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-400">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </span>
              <h3 class="text-lg font-heading font-bold text-secondary-900 dark:text-secondary-100">Confirm Backup Import</h3>
            </div>
            <div class="p-6">
              <p class="text-secondary-500 dark:text-secondary-300">Are you sure you want to import the backup file '<span class="font-semibold">{{ selectedFile?.name }}</span>'? This will create a new backup set.</p>
            </div>
            <div class="flex justify-end gap-3 px-6 pb-6">
              <button @click="executeImport" class="btn bg-yellow-500 dark:bg-yellow-300 dark:text-black text-white min-w-[120px]" :disabled="isImporting">
                <span v-if="isImporting"><svg class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Importing...</span>
                <span v-else>Import</span>
              </button>
              <button @click="showImportConfirm = false; selectedFile = null; clearFileInput();" class="btn btn-outline min-w-[100px]" :disabled="isImporting">Cancel</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePageColors } from '~/composables/usePageColors'

interface BackupSet {
  name: string
  date: string
}

const backups = ref<BackupSet[]>([])
const isLoading = ref(true)
const errorLoadingBackups = ref<string | null>(null)

const isBackupInProgress = ref(false)
const manualBackupStatus = ref<string | null>(null)
const manualBackupSuccess = ref(false)
const showManualBackupConfirm = ref(false)

const showRestoreConfirm = ref(false)
const fileToRestore = ref<string | null>(null)
const isRestoring = ref(false)
const restoringFile = ref<string | null>(null)
const restoreStatus = ref<string | null>(null)
const restoreSuccess = ref(false)

const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const backupToDelete = ref<string | null>(null)
const deleteStatus = ref<string | null>(null)
const deleteSuccess = ref(false)

const isExporting = ref(false)
const exportingFile = ref<string | null>(null)
const exportStatus = ref<string | null>(null)
const exportSuccess = ref(false)

const selectedFile = ref<File | null>(null)
const isImporting = ref(false)
const importStatus = ref<string | null>(null)
const importSuccess = ref(false)
const showImportConfirm = ref(false)

// Toast notification state
const showToastMsg = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message;
  toastType.value = type;
  showToastMsg.value = true;
  setTimeout(() => {
    showToastMsg.value = false;
  }, 3000);
}

const { colors } = usePageColors()

async function fetchBackups() {
  isLoading.value = true
  errorLoadingBackups.value = null
  manualBackupStatus.value = null
  restoreStatus.value = null
  exportStatus.value = null
  importStatus.value = null
  try {
    const response = await $fetch<{ success: boolean; backups?: BackupSet[]; message?: string; error?: string }>('/api/backups')
    if (response.success && response.backups) {
      backups.value = response.backups
    } else {
      throw new Error(response.message || response.error || 'Failed to fetch backups')
    }
  } catch (err: any) {
    console.error('Error fetching backups:', err)
    errorLoadingBackups.value = err.data?.message || err.message || 'An unknown error occurred.'
    backups.value = []
  } finally {
    isLoading.value = false
  }
}

function confirmManualBackup() {
  manualBackupStatus.value = null
  showManualBackupConfirm.value = true
}

async function executeManualBackup() {
  showManualBackupConfirm.value = false;
  isBackupInProgress.value = true;

  try {
    const response = await $fetch<{ success: boolean; message: string; backupDirName?: string; error?: string }>('/api/backups', {
      method: 'POST',
    });
    if (response.success) {
      showToast(response.message, 'success');
      await fetchBackups();
    } else {
      throw new Error(response.message || response.error || 'Failed to create manual backup set');
    }
  } catch (err: any) {
    console.error('Error creating manual backup set:', err);
    showToast(err.data?.message || err.message || 'An unknown error occurred while creating backup set.', 'error');
  } finally {
    isBackupInProgress.value = false;
  }
}

function confirmRestore(backupDirName: string) {
  fileToRestore.value = backupDirName
  showRestoreConfirm.value = true
  restoreStatus.value = null
  exportStatus.value = null
  importStatus.value = null
}

async function executeRestore() {
  if (!fileToRestore.value) return;
  
  let hasError = false;
  isRestoring.value = true;
  showRestoreConfirm.value = false;

  try {
    showToast(`Restoring from backup set ${fileToRestore.value}...`, 'success');
    const response = await $fetch<{ success: boolean; message: string; error?: string }>('/api/backups/restore', {
      method: 'POST',
      body: { fileName: fileToRestore.value },
    });
    
    if (response.success) {
      await fetchBackups();
    } else {
      hasError = true;
      throw new Error(response.message || response.error || 'Failed to restore backup set');
    }
  } catch (error: any) {
    hasError = true;
    console.error('Error restoring backup set:', error);
    showToast(error.data?.message || error.message || 'An unknown error occurred during restore.', 'error');
  } finally {
    isRestoring.value = false;
    fileToRestore.value = null;
    
    if (!hasError) {
      setTimeout(() => {
        showToast('Backup restored successfully.', 'success');
      }, 300);
    }
  }
}

async function executeExport(backupName: string) {
  isExporting.value = true;
  exportingFile.value = backupName;
  exportStatus.value = `Exporting backup set ${backupName}...`;
  exportSuccess.value = false;
  manualBackupStatus.value = null;
  restoreStatus.value = null;
  importStatus.value = null;

  try {
    const response = await fetch(`/api/backups/export/${backupName}`);

    if (response.ok) {
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${backupName}.zip.enc`; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast(`Backup set '${backupName}' exported successfully. Check your browser downloads.`, 'success');
      exportSuccess.value = true;
    } else {
      let errorMsg = `Failed to export ${backupName}. Server responded with status: ${response.status}`;
      try {
        
        const errorText = await response.text();
        if (errorText) {
            try {
                const errorData = JSON.parse(errorText);
                if (errorData && errorData.message) {
                    errorMsg = `Error exporting ${backupName}: ${errorData.message}`;
                } else {
                    errorMsg = `Error exporting ${backupName}: ${errorText}`;
                }
            } catch (jsonError) {
                 // If not JSON, use the text directly if it's not too long or generic HTML error page
                if (errorText.length < 200 && !errorText.toLowerCase().includes('<html>')) {
                    errorMsg = `Error exporting ${backupName}: ${errorText}`;
                } // else keep the generic status code message
            }
        }
      } catch (e) {
        console.warn('Could not parse error response body for export:', e);
      }
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error('Error exporting backup:', error);
    showToast(error.message || `Error exporting ${backupName}: Unknown error.`, 'error');
    exportSuccess.value = false;
  } finally {
    isExporting.value = false;
    exportingFile.value = null;
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    if (target.files[0].name.endsWith('.zip.enc')) {
      selectedFile.value = target.files[0]
      importStatus.value = null
    } else {
      selectedFile.value = null
      showToast('Invalid file type. Please select a .zip.enc file.', 'error');
      importSuccess.value = false
      clearFileInput()
    }
  } else {
    selectedFile.value = null
  }
}

function confirmImport() {
  if (!selectedFile.value) {
    showToast('Please select a backup file (.zip.enc) to import.', 'error');
    importSuccess.value = false
    return
  }
  importStatus.value = null
  showImportConfirm.value = true
}

async function executeImport() {
  if (!selectedFile.value) return;

  let hasError = false;
  showImportConfirm.value = false;
  isImporting.value = true;
  showToast(`Importing backup file ${selectedFile.value.name}...`, 'success');

  const formData = new FormData();
  formData.append('backupFile', selectedFile.value);

  try {
    const response = await $fetch<{ success: boolean; message: string; backupDirName?: string; error?: string }>('/api/backups/import', {
      method: 'POST',
      body: formData,
    });

    if (response.success) {
      await fetchBackups();
    } else {
      hasError = true;
      throw new Error(response.message || response.error || 'Failed to import backup.');
    }
  } catch (error: any) {
    hasError = true;
    console.error('Error importing backup:', error);
    const errorMessage = error.data?.details || error.data?.message || error.message || 'An unknown error occurred during import.';
    showToast(`Import failed: ${errorMessage}`, 'error');
  } finally {
    isImporting.value = false;
    selectedFile.value = null;
    clearFileInput();
    
    if (!hasError) {
      setTimeout(() => {
        showToast('Backup imported successfully.', 'success');
      }, 300);
    }
  }
}

function clearFileInput() {
  const fileInput = document.getElementById('backupFile') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

async function confirmDelete(backupName: string) {
  backupToDelete.value = backupName;
  showDeleteConfirm.value = true;
}

async function deleteBackup() {
  if (!backupToDelete.value) return;
  
  let hasError = false;
  try {
    isDeleting.value = true;
    const response = await $fetch<{ success: boolean; message: string }>(`/api/backups/${backupToDelete.value}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      await fetchBackups();
    } else {
      hasError = true;
      throw new Error(response.message || 'Failed to delete backup');
    }
  } catch (error: any) {
    hasError = true;
    console.error('Error deleting backup:', error);
    showToast(error.data?.message || error.message || 'Failed to delete backup.', 'error');
  } finally {
    isDeleting.value = false;
    showDeleteConfirm.value = false;
    backupToDelete.value = null;
    
    // Show success message after modal closes if there was no error
    if (!hasError) {
      setTimeout(() => {
        showToast('Backup deleted successfully.', 'success');
      }, 300);
    }
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }
    return new Intl.DateTimeFormat(undefined, options).format(new Date(dateString))
  } catch (e) {
    return dateString
  }
}

onMounted(() => {
  fetchBackups()
})

definePageMeta({
  layout: 'default',
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Fixed positioning styles for modals */
.fixed {
  position: fixed !important;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.fixed > div {
  margin: auto;
  max-height: 90vh;
  overflow-y: auto;
}

/* Toast Notification - Centered at the very bottom as a footer bar */
.toast-footer {
  position: fixed !important;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.toast-footer > div {
  pointer-events: auto;
  min-width: 320px;
  max-width: 90vw;
  margin: 0.5rem auto;
}
</style>
