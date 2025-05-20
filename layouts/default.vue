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
            :class="{
              [colors.gradient + ' bg-clip-text text-blue-600']: link.to === '/',
              'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-zinc-100  hover:text-zinc-600 dark:hover:bg-secondary-700 dark:hover:text-zinc-300': link.to === '/patients',
              'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-secondary-700 dark:hover:text-rose-300': link.to === '/coordinators',
              'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:bg-secondary-700 dark:hover:text-emerald-300': link.to === '/staff',
              'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-secondary-700 dark:hover:text-indigo-300': link.to === '/tracking',
              'text-secondary-600 hover:no-underline dark:text-secondary-200 hover:bg-yellow-50/50 hover:text-yellow-600 dark:hover:bg-secondary-700 dark:hover:text-yellow-300': link.to === '/backups'
            }"
            :active-class="
              link.to === '/' ? 'bg-blue-50/70 text-blue-600 dark:bg-secondary-800 dark:text-blue-300' :
              link.to === '/patients' ? 'bg-zinc-100/70 text-zinc-600 dark:bg-secondary-800 dark:text-zinc-300' :
              link.to === '/coordinators' ? 'bg-amber-50/70 text-amber-600 dark:bg-secondary-800 dark:text-amber-300' :
              link.to === '/staff' ? 'bg-emerald-50/70 text-emerald-600 dark:bg-secondary-800 dark:text-emerald-300' :
              link.to === '/tracking' ? 'bg-indigo-50/70 text-indigo-600 dark:bg-secondary-800 dark:text-indigo-300' :
              'bg-yellow-50/70 text-yellow-600 dark:bg-secondary-800 dark:text-yellow-300'
            "
          >
            {{ link.text }}
          </NuxtLink>
        </div>
        <!-- Mobile Menu Button and Theme Switcher -->
        <div class="flex items-center space-x-2">
          <ThemeSwitcher />
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100/60 dark:hover:bg-secondary-800/60 transition-colors" aria-label="Open navigation menu">
            <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <!-- Mobile Navigation Links -->
      <transition name="fade">
        <div v-if="mobileMenuOpen" class="md:hidden px-4 pb-3 pt-2 bg-white/95 dark:bg-secondary-900/95 border-t border-secondary-200/50 dark:border-secondary-700 shadow-sm">
          <div class="flex flex-col space-y-1">
            <NuxtLink 
              v-for="link in navLinks" 
              :key="link.to + '-mobile'" 
              :to="link.to"
              class="block px-3 py-2.5 rounded-lg font-medium text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline"
              :class="{
                [colors.gradient + ' bg-clip-text text-transparent']: link.to === '/',
                'text-secondary-700 dark:text-secondary-200 hover:bg-zinc-50/50 hover:text-zinc-600 dark:hover:bg-secondary-700 dark:hover:text-zinc-300': link.to === '/patients',
                'text-secondary-700 dark:text-secondary-200 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-secondary-700 dark:hover:text-rose-300': link.to === '/coordinators',
                'text-secondary-700 dark:text-secondary-200 hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:bg-secondary-700 dark:hover:text-emerald-300': link.to === '/staff',
                'text-secondary-700 dark:text-secondary-200 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-secondary-700 dark:hover:text-indigo-300': link.to === '/tracking',
                'text-secondary-700 dark:text-secondary-200 hover:bg-yellow-50/50 hover:text-yellow-600 dark:hover:bg-secondary-700 dark:hover:text-yellow-300': link.to === '/backups'
              }"
              :active-class="
                link.to === '/' ? 'bg-blue-50/70 text-blue-600 dark:bg-secondary-800 dark:text-blue-300' :
                link.to === '/patients' ? 'bg-rose-50/70 text-rose-600 dark:bg-secondary-800 dark:text-rose-300' :
                link.to === '/coordinators' ? 'bg-amber-50/70 text-amber-600 dark:bg-secondary-800 dark:text-amber-300' :
                link.to === '/staff' ? 'bg-emerald-50/70 text-emerald-600 dark:bg-secondary-800 dark:text-emerald-300' :
                link.to === '/tracking' ? 'bg-indigo-50/70 text-indigo-600 dark:bg-secondary-800 dark:text-indigo-300' :
                'bg-yellow-50/70 text-yellow-600 dark:bg-secondary-800 dark:text-yellow-300'
              "
              @click="mobileMenuOpen = false"
            >
              {{ link.text }}
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
import { ref } from 'vue'
import MobileNav from '~/components/MobileNav.vue'
import { useRoute } from 'vue-router'
import { usePageColors } from '~/composables/usePageColors'

const route = useRoute()
const { colors } = usePageColors()

// Define the navigation links as a reactive reference
const navLinks = ref([
  { to: '/', text: 'Dashboard' },
  { to: '/patients', text: 'Patients' },
  { to: '/coordinators', text: 'Coordinators' },
  { to: '/staff', text: 'Staff' },
  { to: '/tracking', text: 'Tracking' },
  { to: '/backups', text: 'Backups' }
])

// Mobile menu state
const mobileMenuOpen = ref(false)
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
