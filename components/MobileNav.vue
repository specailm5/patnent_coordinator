<template>
  <nav class="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 dark:bg-secondary-900/90 border-t border-secondary-200/50 dark:border-secondary-700 shadow-lg safe-area-bottom">
    <div class="flex justify-around py-2">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center py-3"
        :class="route.path === link.to ? activeClass : defaultClass"
      >
        <div class="h-6 w-6">
          <template v-if="link.to === '/'">
            <!-- Home Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7m-9 2v7m-4 0h8" />
            </svg>
          </template>
          <template v-else-if="link.to === '/patients'">
            <!-- Patients Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.648 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
          <template v-else-if="link.to === '/coordinators'">
            <!-- Coordinators Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 01-8 0m8 0v2a4 4 0 01-8 0V7m8 10h.01M12 17h.01M8 21h8" />
            </svg>
          </template>
          <template v-else-if="link.to === '/staff'">
            <!-- Staff Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422A12.042 12.042 0 0112 21.5a12.042 12.042 0 01-6.16-10.922L12 14z" />
            </svg>
          </template>
          <template v-else-if="link.to === '/tracking'">
            <!-- Tracking Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z" />
            </svg>
          </template>
          <template v-else>
            <!-- Backups Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </template>
        </div>
        <span class="text-xs mt-1">{{ link.text }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuth } from '#imports' // Ensure useAuth is imported

const route = useRoute()
const { status, signOut } = useAuth()

const { status, signOut, data: session } = useAuth() // Added session

const isAuthenticated = computed(() => status.value === 'authenticated')
// @ts-expect-error session user type
const userRole = computed(() => (session.value?.user as { role?: string })?.role)


const allPossibleNavLinks = [
  { to: '/', text: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7m-9 2v7m-4 0h8', requiredRole: null },
  { to: '/patients', text: 'Patients', icon: 'M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.648 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z', requiredRole: null },
  { to: '/coordinators', text: 'Coordinators', icon: 'M16 7a4 4 0 01-8 0m8 0v2a4 4 0 01-8 0V7m8 10h.01M12 17h.01M8 21h8', requiredRole: null },
  { to: '/staff', text: 'Staff', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422A12.042 12.042 0 0112 21.5a12.042 12.042 0 01-6.16-10.922L12 14z', requiredRole: ['Admin', 'Manager'] },
  { to: '/tracking', text: 'Tracking', icon: 'M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z', requiredRole: null },
  { to: '/admin/users', text: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', requiredRole: 'Admin' },
  // { to: '/backups', text: 'Backups', icon: 'M19 9l-7 7-7-7', requiredRole: 'Admin' }, // Example if backups were here
];

const navLinks = computed(() => {
  if (!isAuthenticated.value) return []; // No nav links if not authenticated

  const visibleLinks = allPossibleNavLinks.filter(link => {
    if (!link.requiredRole) return true;
    if (!userRole.value) return false;
    if (Array.isArray(link.requiredRole)) {
      return link.requiredRole.includes(userRole.value);
    }
    return userRole.value === link.requiredRole;
  });
  // Ensure we don't show too many items, prioritize first items if list is too long.
  // Mobile bottom nav usually has 3-5 items.
  return visibleLinks.slice(0, 4); // Show up to 4 most relevant links + 1 auth action
});


const defaultClass = 'text-secondary-600 hover:text-secondary-800 dark:text-secondary-300 dark:hover:text-white'
const activeClass = 'text-blue-600 dark:text-blue-300'

const handleLogout = async () => {
  await signOut({ callbackUrl: '/login' });
}
</script>
