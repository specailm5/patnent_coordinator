import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  // any custom Vitest config you require
  test: {
    globals: true,
    environment: 'nuxt', // Use Nuxt-specific environment
    setupFiles: ['./tests/setup/db-setup.ts'], // Setup file for DB mocking
    deps: {
      inline: [/@nuxt\/test-utils/] // Ensure nuxt test utils are processed correctly
    },
    // reporters: ['verbose'], // Optional: for more detailed output
  },
})
