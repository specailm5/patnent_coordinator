<template>
  <div v-cloak class="min-h-screen pb-16 md:pb-0 safe-area-bottom bg-gradient-to-br from-secondary-50/95 via-secondary-100/90 to-white/90 dark:from-secondary-900 dark:to-secondary-800 transition-colors">
    <nav class="hidden md:block sticky top-0 z-30 bg-white/70 dark:bg-secondary-900/90 backdrop-blur-md border-b border-secondary-200/50 dark:border-secondary-700 shadow-lg">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo and Title -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 dark:bg-secondary-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl sm:text-2xl font-bold">
            <span aria-label="Logo" role="img">🩺</span>
          </div>
          <NuxtLink to="/" 
            class="text-xl sm:text-2xl hover:no-underline font-heading font-bold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline"
            :class="{
              'text-blue-800 dark:text-blue-300': $route.path === '/',
              'text-zinc-800 dark:text-zinc-300': $route.path === '/patients',
              'text-rose-800 dark:text-rose-300': $route.path === '/coordinators',
              'text-emerald-800 dark:text-emerald-300': $route.path === '/staff',
              'text-indigo-800 dark:text-indigo-300': $route.path === '/tracking',
              'text-yellow-800 dark:text-yellow-300': $route.path === '/backups'
            }"
          >
            Patient Coordinator
          </NuxtLink>
        </div>
        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center space-x-1 lg:space-x-6">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.to" 
            :to="link.to"
            class="px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg font-medium text-sm lg:text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline"
            :class="[
              'px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg font-medium text-sm lg:text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline',
              link.to === '/' ? (colors.gradient + ' bg-clip-text text-blue-600') :
              link.to === '/admin/users' ? 'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-purple-50/50 hover:text-purple-600 dark:hover:bg-secondary-700 dark:hover:text-purple-300' :
              link.to === '/backups' ? 'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-yellow-50/50 hover:text-yellow-600 dark:hover:bg-secondary-700 dark:hover:text-yellow-300' :
              link.to === '/tracking' ? 'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-secondary-700 dark:hover:text-indigo-300' :
              link.to === '/staff' ? 'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:bg-secondary-700 dark:hover:text-emerald-300' :
              link.to === '/coordinators' ? 'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-secondary-700 dark:hover:text-rose-300' :
              'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-zinc-100  hover:text-zinc-600 dark:hover:bg-secondary-700 dark:hover:text-zinc-300' // Default for /patients or others
            ]"
            :active-class="
              link.to === '/' ? 'bg-blue-50/70 text-blue-600 dark:bg-secondary-800 dark:text-blue-300' :
              link.to === '/admin/users' ? 'bg-purple-50/70 text-purple-600 dark:bg-secondary-800 dark:text-purple-300' :
              link.to === '/backups' ? 'bg-yellow-50/70 text-yellow-600 dark:bg-secondary-800 dark:text-yellow-300' :
              link.to === '/tracking' ? 'bg-indigo-50/70 text-indigo-600 dark:bg-secondary-800 dark:text-indigo-300' :
              link.to === '/staff' ? 'bg-emerald-50/70 text-emerald-600 dark:bg-secondary-800 dark:text-emerald-300' :
              link.to === '/coordinators' ? 'bg-amber-50/70 text-amber-600 dark:bg-secondary-800 dark:text-amber-300' :
              'bg-zinc-100/70 text-zinc-600 dark:bg-secondary-800 dark:text-zinc-300' // Default for /patients or others
            "
          >
            {{ link.text }}
          </NuxtLink>
        </div>
        <!-- User Info, Auth Buttons, and Theme Switcher -->
        <div class="flex items-center space-x-2 lg:space-x-4">
          <ThemeSwitcher />
          <!-- Desktop Auth Status -->
          <div v-if="isAuthenticated && user" class="hidden md:flex items-center space-x-3">
            <span class="text-sm text-gray-600 dark:text-gray-300">
              Hi, {{ user.name }} <span v-if="user.role" class="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100">{{ user.role }}</span>
            </span>
            <button
              @click="handleLogout"
              class="px-3 py-1.5 rounded-lg font-medium text-sm text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Logout
            </button>
          </div>
          <NuxtLink
            v-else
            to="/login"
            class="hidden md:block px-3 py-1.5 rounded-lg font-medium text-sm text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline"
          >
            Login
          </NuxtLink>
          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100/60 dark:hover:bg-secondary-800/60 transition-colors" aria-label="Open navigation menu">
            <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <!-- Mobile Navigation Links & Auth -->
      <transition name="fade">
        <div v-if="mobileMenuOpen" class="md:hidden px-4 pb-3 pt-2 bg-white/95 dark:bg-secondary-900/95 border-t border-secondary-200/50 dark:border-secondary-700 shadow-sm">
          <div class="flex flex-col space-y-1">
            <NuxtLink 
              v-for="link in navLinks" 
              :key="link.to + '-mobile'" 
              :to="link.to"
              class="block px-3 py-2.5 rounded-lg font-medium text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline"
              :class="[
                'block px-3 py-2.5 rounded-lg font-medium text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline',
                link.to === '/' ? (colors.gradient + ' bg-clip-text text-transparent') :
                link.to === '/admin/users' ? 'text-secondary-700 dark:text-secondary-200 hover:bg-purple-50/50 hover:text-purple-600 dark:hover:bg-secondary-700 dark:hover:text-purple-300' :
                link.to === '/backups' ? 'text-secondary-700 dark:text-secondary-200 hover:bg-yellow-50/50 hover:text-yellow-600 dark:hover:bg-secondary-700 dark:hover:text-yellow-300' :
                link.to === '/tracking' ? 'text-secondary-700 dark:text-secondary-200 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-secondary-700 dark:hover:text-indigo-300' :
                link.to === '/staff' ? 'text-secondary-700 dark:text-secondary-200 hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:bg-secondary-700 dark:hover:text-emerald-300' :
                link.to === '/coordinators' ? 'text-secondary-700 dark:text-secondary-200 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-secondary-700 dark:hover:text-rose-300' :
                'text-secondary-700 dark:text-secondary-200 hover:bg-zinc-50/50 hover:text-zinc-600 dark:hover:bg-secondary-700 dark:hover:text-zinc-300' // Default for /patients or others
              ]"
              :active-class="
                link.to === '/' ? 'bg-blue-50/70 text-blue-600 dark:bg-secondary-800 dark:text-blue-300' :
                link.to === '/admin/users' ? 'bg-purple-50/70 text-purple-600 dark:bg-secondary-800 dark:text-purple-300' :
                link.to === '/backups' ? 'bg-yellow-50/70 text-yellow-600 dark:bg-secondary-800 dark:text-yellow-300' :
                link.to === '/tracking' ? 'bg-indigo-50/70 text-indigo-600 dark:bg-secondary-800 dark:text-indigo-300' :
                link.to === '/staff' ? 'bg-emerald-50/70 text-emerald-600 dark:bg-secondary-800 dark:text-emerald-300' :
                link.to === '/coordinators' ? 'bg-amber-50/70 text-amber-600 dark:bg-secondary-800 dark:text-amber-300' :
                'bg-zinc-50/70 text-zinc-600 dark:bg-secondary-800 dark:text-zinc-300' // Default for /patients or others
              "
              @click="mobileMenuOpen = false"
            >
              {{ link.text }}
            </NuxtLink>

            <!-- Auth buttons for mobile -->
            <div v-if="isAuthenticated && user" class="mt-3 pt-3 border-t border-secondary-200/70 dark:border-secondary-700/70">
              <p class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Logged in as: {{ user.name }}
                <span v-if="user.role" class="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100">{{ user.role }}</span>
              </p>
              <button
                @click="() => { handleLogout(); mobileMenuOpen = false; }"
                class="w-full text-left block px-3 py-2.5 rounded-lg font-medium text-base text-red-500 hover:bg-red-100/70 dark:text-red-400 dark:hover:bg-red-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Logout
              </button>
            </div>
            <NuxtLink
              v-else
              to="/login"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2.5 rounded-lg font-medium text-base text-blue-600 hover:bg-blue-100/70 dark:text-blue-400 dark:hover:bg-blue-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline mt-3 pt-3 border-t border-secondary-200/70 dark:border-secondary-700/70"
            >
              Login
            </NuxtLink>
          </div>
        </div>
      </transition>
    </nav>
    <main id="main-content" class="container mx-auto px-4 py-6 sm:py-10">
      <div class="bg-white/90 dark:bg-secondary-900/80 rounded-xl shadow-md p-4 sm:p-6 min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-15rem)] transition-colors">
        <slot />
      </div>
    </main>
    <!-- Mobile bottom navigation -->
    <div class="md:hidden">
      <MobileNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MobileNav from '~/components/MobileNav.vue'
import ThemeSwitcher from '~/components/ThemeSwitcher.vue' // Added import for ThemeSwitcher
import { useRoute } from 'vue-router'
import { usePageColors } from '~/composables/usePageColors'
import { useAuth } from '#imports' // Explicitly import useAuth if auto-import is not reliable

const { status, data: session, signOut } = useAuth()
const route = useRoute()
const { colors } = usePageColors()

const isAuthenticated = computed(() => status.value === 'authenticated')
const user = computed(() => {
  if (session.value && session.value.user) {
    // Assuming user object might have name or username, and role
    return {
      name: (session.value.user as any).name || (session.value.user as any).username,
      email: (session.value.user as any).email,
      role: (session.value.user as any).role
    }
  }
  return null
})

// Define the base navigation links
const baseNavLinks = [
  { to: '/', text: 'Dashboard', requiredRole: null },
  { to: '/patients', text: 'Patients', requiredRole: null },
  { to: '/coordinators', text: 'Coordinators', requiredRole: null },
  { to: '/staff', text: 'Staff', requiredRole: ['Admin', 'Manager'] },
  { to: '/tracking', text: 'Tracking', requiredRole: null },
  { to: '/backups', text: 'Backups', requiredRole: 'Admin' },
  { to: '/admin/users', text: 'User Management', requiredRole: 'Admin', iconClass: 'text-purple-800 dark:text-purple-300', activeClassSuffix: 'purple' } // New admin link
]

// Computed property for navLinks, filters based on authentication and role
const navLinks = computed(() => {
  if (!isAuthenticated.value) {
    return []; // No links for unauthenticated users in the main nav areas handled by this
  }
  return baseNavLinks.filter(link => {
    if (!link.requiredRole) return true; // Visible to all authenticated users

    const userRoleValue = user.value?.role;
    if (!userRoleValue) return false; // Should not happen if authenticated, but good check

    if (Array.isArray(link.requiredRole)) {
      return link.requiredRole.includes(userRoleValue);
    }
    return userRoleValue === link.requiredRole;
  });
})

// Mobile menu state
const mobileMenuOpen = ref(false)

const handleLogout = async () => {
  await signOut({ callbackUrl: '/login' }) // Redirect to login after logout
}
</script>

<style scoped>
/* Hide until Vue is ready to avoid flicker */
[v-cloak] { display: none; }
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Improved focus visibility for mobile */
.focus-visible\:ring-blue-400:focus-visible {
  box-shadow: 0 0 0 2px theme('colors.blue.400');
}

/* Safe area support for mobile bottom nav */
@supports(padding:calc(env(safe-area-inset-bottom))) {
  .safe-area-bottom {
    padding-bottom: calc(env(safe-area-inset-bottom));
  }
}
</style>
