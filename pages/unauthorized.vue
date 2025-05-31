<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 py-10">
      <h1 class="text-4xl font-bold text-red-600 dark:text-red-500 mb-4">
        Access Denied
      </h1>
      <p class="text-lg text-gray-700 dark:text-gray-300 mb-6">
        You do not have the necessary permissions to access this page.
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
        If you believe this is an error, please contact your administrator.
      </p>
      <NuxtLink
        to="/"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Go to Homepage
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  // This page does not require authentication to view,
  // as users might be redirected here even if logged out but tried to access a protected URL directly.
  // Or, if they are logged in but have the wrong role.
  auth: false // No specific auth rules for this page itself.
})

useHead({
  title: 'Unauthorized Access - Patient Coordinator',
  meta: [
    { name: 'description', content: 'Page indicating unauthorized access.' }
  ]
})
</script>

<style scoped>
/* Scoped styles if needed */
</style>
