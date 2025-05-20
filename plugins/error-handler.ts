import { defineNuxtPlugin, useRouter } from '#imports'

export default defineNuxtPlugin(nuxtApp => {
  // Add a global error handler for Vue router
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Global error:', error)
    console.log('Error info:', info)
  }

  // Add router error handler
  const router = useRouter()
  router.onError((error) => {
    console.error('Router error:', error)
  })
})
