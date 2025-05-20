<template>
  <button
    @click="toggleTheme"
    class="rounded-lg p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Sun icon -->
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-secondary-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    <!-- Moon icon -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-secondary-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
const isDark = ref(false)

// Initialize theme from localStorage or system preference
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
    applyTheme()
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    applyTheme()
  }
})

function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}
</script>
