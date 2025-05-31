import { defineNuxtRouteMiddleware, navigateTo, useAuth } from '#app'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware for server routes or if not running on client
  if (process.server || !process.client) {
    return
  }

  const { status, data: session } = useAuth()
  const isAuthenticated = status.value === 'authenticated'
  // @ts-expect-error custom user type
  const userRole = session.value?.user?.role as string | undefined

  // Log for debugging
  // console.log(`Auth middleware: Navigating to ${to.path}, status: ${status.value}, role: ${userRole}`)
  // console.log('Route meta:', to.meta)


  // Handle pages that should only be accessed by unauthenticated users (e.g., login page)
  // nuxt-auth already provides `unauthenticatedOnly` through its own global middleware
  // that runs at priority -2. This one runs at priority 0 (default).
  // So, if we are here, nuxt-auth's own middleware for unauthenticatedOnly has passed.
  // However, if `auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' }` is set on login.vue
  // this check might be redundant or could be more specific if needed.

  const authMeta = to.meta.auth as any | undefined // nuxt-auth adds this
  const pageRequiredRole = to.meta.requiredRole as string | undefined // Our custom meta field

  // If the page is meant for unauthenticated users only (e.g. login page)
  if (authMeta && authMeta.unauthenticatedOnly) {
    if (isAuthenticated) {
      // console.log(`Auth middleware: User is authenticated, redirecting from unauth-only page ${to.path} to /`);
      const navigateToPath = authMeta.navigateAuthenticatedTo || '/'
      return navigateTo(navigateToPath, { replace: true })
    }
    return // Allow unauthenticated users to access
  }

  // If the page requires authentication (either by specific role or just being logged in)
  if (pageRequiredRole || (to.path !== '/login' && to.path !== '/unauthorized')) { // Protect most routes by default
    if (!isAuthenticated) {
      // console.log(`Auth middleware: User not authenticated, redirecting to login from ${to.path}`);
      return navigateTo(`/login?callbackUrl=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }

    // If a specific role is required and user does not have it
    if (pageRequiredRole && userRole !== pageRequiredRole) {
      // console.log(`Auth middleware: User role ${userRole} does not meet required role ${pageRequiredRole} for ${to.path}. Redirecting to /unauthorized.`);
      // Potentially show a notification here before redirecting
      return navigateTo('/unauthorized', { replace: true })
    }
  }

  // console.log(`Auth middleware: Access granted to ${to.path}`);
  // No specific conditions met that prevent access, so allow navigation
})
