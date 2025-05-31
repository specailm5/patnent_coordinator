<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 py-10">
      <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-6">
          <label for="username" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            id="username"
            v_model="username"
            class="bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="yourusername"
            required
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            id="password"
            v_model="password"
            class="bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true, // Redirect to home if already authenticated
    navigateAuthenticatedTo: '/',
  }
})

const { signIn } = useAuth()
const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = null
  try {
    // Note: `signIn` typically expects an object with `username` and `password`
    // that matches the `credentials` configuration in your `NuxtAuthHandler`.
    // The first argument can be the provider name if you have multiple (e.g., 'credentials').
    // If you only have one or it's the default, you might not need to specify it.
    // The `redirect: false` option allows handling the redirect manually or showing errors.
    const result = await signIn('credentials', {
      username: username.value,
      password: password.value,
      redirect: false // Important to handle errors and manual redirect
    })

    if (result?.error) {
      // Handle errors returned by `signIn`
      // `result.error` might be a code like "CredentialsSignin"
      // You might want to map these to user-friendly messages
      console.error('Login error from signIn:', result.error)
      if (result.error === 'CredentialsSignin') {
        error.value = 'Invalid username or password. Please try again.';
      } else {
        error.value = `Login failed: ${result.error}`;
      }
    } else if (result?.url) {
      // Successful login, NuxtAuth will usually handle the redirect if `redirect: true` (default)
      // With `redirect: false`, `result.url` might be null or the intended redirect URL.
      // We can manually redirect here.
      await router.push('/')
    } else {
      // This case might occur if there's no error but also no URL (should be rare with credentials)
      error.value = 'Login process did not complete as expected.';
    }
  } catch (e: any) {
    console.error('Login failed:', e)
    error.value = e.data?.message || e.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Scoped styles if needed, Tailwind is used primarily */
</style>
