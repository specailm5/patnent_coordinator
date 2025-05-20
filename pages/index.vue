<template>
  <div>
    <!-- Dashboard Header Section -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-heading font-bold" :class="colors.gradient + ' bg-clip-text text-transparent'">
            Dashboard
          </h1>
          <p class="mt-2 text-secondary-600 dark:text-secondary-400">
            Welcome to the Patient Coordinator system
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Search Bar -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search patients, staff..."
              class="w-72 px-6 py-3 pr-10 rounded-full shadow-sm text-sm bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"  
              @keyup.enter="handleSearch"
            />
            <button 
              @click="handleSearch"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <!-- Refresh Button -->
          <button 
            class="px-5 py-3 bg-primary-600 text-white font-medium text-sm rounded-full flex items-center gap-2 shadow hover:bg-primary-700 transition-colors duration-200"
            @click="refreshData"
            :disabled="loading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
                 class="h-5 w-5 text-white" 
                 :class="{ 'animate-spin': loading }"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ loading ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Section -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <TransitionGroup name="stats">
        <div v-for="(stat, index) in quickStats" :key="index"
             class="bg-secondary-50 dark:bg-secondary-900 backdrop-blur-md rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-secondary-200 dark:ring-secondary-700">
            <div class="flex justify-between items-start">
              <div class="flex-grow">
                <p class="text-secondary-500 dark:text-secondary-400 text-sm font-medium">{{ stat.label }}</p>
                <div class="flex items-baseline gap-2">
                  <p class="mt-1 text-2xl font-bold" :class="getStatTextClass(stat.type)">{{ stat.value }}</p>
                  <span v-if="stat.previousValue && !loading" 
                        class="text-xs flex items-center" 
                        :class="getChangeClass(getChangeType(stat.value, stat.previousValue))">
                    {{ getChangePercentage(stat.value, stat.previousValue) }}%
                    <svg v-if="getChangeType(stat.value, stat.previousValue) === 'increase'" 
                         xmlns="http://www.w3.org/2000/svg" 
                         class="h-3 w-3 ml-1" 
                         fill="none" 
                         viewBox="0 0 24 24" 
                         stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <svg v-else 
                         xmlns="http://www.w3.org/2000/svg" 
                         class="h-3 w-3 ml-1" 
                         fill="none" 
                         viewBox="0 0 24 24" 
                         stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </span>
                </div>
              </div>
              <div class="p-2 rounded-lg" :class="getStatBgClass(stat.type)">
                <component :is="stat.icon" class="h-5 w-5" />
              </div>
            </div>
            <div class="mt-4" v-if="!loading">
              <div class="w-full h-1 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-1000" 
                     :class="getStatProgressClass(stat.type)"
                     :style="{ width: getProgressWidth(stat.value, stat.maxValue) + '%' }">
                </div>
              </div>
            </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Main Dashboard Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Patients -->
      <div class="bg-secondary-50/70 dark:bg-secondary-800/50 backdrop-blur-md rounded-xl p-5 border border-secondary-200 dark:border-secondary-700/50 lg:col-span-2 h-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-heading font-bold text-lg text-secondary-900 dark:text-white">Recent Patients</h2>
          <NuxtLink to="/patients" class="text-sm font-medium" :class="colors.text">
            View all
          </NuxtLink>
        </div>
        
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" :class="colors.border"></div>
        </div>
        
        <div v-else-if="recentPatients.length === 0" class="py-8 text-center">
          <div class="inline-flex items-center justify-center p-4 rounded-full bg-secondary-100 dark:bg-secondary-800 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary-500 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-secondary-500 dark:text-secondary-400">No patients found</p>
          <NuxtLink to="/patients" class="mt-2 inline-block text-sm font-medium" :class="colors.text">
            Add your first patient
          </NuxtLink>
        </div>

        <div v-else class="overflow-x-auto animate-fadeIn">
          <table class="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
            <thead class="bg-secondary-200 dark:bg-secondary-900 sticky top-0">
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Contact</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Location</th>
                <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-secondary-100 dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
              <tr v-for="patient in recentPatients" :key="patient.id" class="group transition-colors duration-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 even:bg-secondary-50 dark:even:bg-secondary-900">
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm font-medium text-secondary-900 dark:text-secondary-100">{{ patient.name }}</div>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-secondary-600 dark:text-secondary-400">{{ patient.contact }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-secondary-600 dark:text-secondary-400">{{ patient.location }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="patient.status === 'active' ? 
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                          'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300'">
                    {{ patient.status || 'active' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right">
                  <NuxtLink :to="`/patients?id=${patient.id}`" class="inline-block px-3 py-1 text-xs font-semibold rounded bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" aria-label="View patient details">
                    View
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Side Content -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="bg-secondary-50/70 dark:bg-secondary-800/50 backdrop-blur-md rounded-xl p-5 border border-secondary-200 dark:border-secondary-700/50">
          <h2 class="font-heading font-bold text-lg text-secondary-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-3">
            <NuxtLink to="/patients" class="flex flex-col items-center p-4 rounded-xl border border-secondary-200 dark:border-secondary-700/50 hover:bg-zinc-50/50 hover:text-zinc-600 dark:hover:bg-secondary-700/50 dark:hover:text-zinc-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 1 1 12 0v1H3v-1z" />
              </svg>
              <span class="text-sm font-medium">New Patient</span>
            </NuxtLink>
            
            <NuxtLink to="/coordinators" class="flex flex-col items-center p-4 rounded-xl border border-secondary-200 dark:border-secondary-700/50 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-secondary-700/50 dark:hover:text-rose-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm font-medium">New Coordinator</span>
            </NuxtLink>
            
            <NuxtLink to="/staff" class="flex flex-col items-center p-4 rounded-xl border border-secondary-200 dark:border-secondary-700/50 hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:bg-secondary-700/50 dark:hover:text-emerald-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-sm font-medium">New Staff</span>
            </NuxtLink>
            
            <NuxtLink to="/tracking" class="flex flex-col items-center p-4 rounded-xl border border-secondary-200 dark:border-secondary-700/50 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-secondary-700/50 dark:hover:text-indigo-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span class="text-sm font-medium">Patient Tracking</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Activity Section -->
        <div class="bg-secondary-50/70 dark:bg-secondary-800/50 backdrop-blur-md rounded-xl p-5 border border-secondary-200 dark:border-secondary-700/50">
          <h2 class="font-heading font-bold text-lg text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
            <svg class="h-6 w-6 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Recent Activity
          </h2>
          <ul class="space-y-3">
            <!-- Skeleton loader while loading -->
            <template v-if="activitiesLoading">
              <li v-for="n in 3" :key="'skeleton-'+n" class="flex items-start gap-3 bg-white/80 dark:bg-secondary-900/60 rounded-lg shadow-sm px-4 py-3 border border-secondary-100 dark:border-secondary-800/60 animate-pulse">
                <div class="h-8 w-8 rounded-full bg-secondary-200 dark:bg-secondary-700"></div>
                <div class="flex-1 min-w-0">
                  <div class="h-4 w-24 bg-secondary-200 dark:bg-secondary-700 rounded mb-2"></div>
                  <div class="h-3 w-40 bg-secondary-100 dark:bg-secondary-800 rounded"></div>
                </div>
              </li>
            </template>
            <template v-else>
              <li
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start gap-3 bg-white/80 dark:bg-secondary-900/60 rounded-lg shadow-sm px-4 py-3 border border-secondary-100 dark:border-secondary-800/60 hover:shadow-md transition"
                :style="{
                  borderLeftWidth: '4px',
                  borderLeftColor:
                    activity.type === 'patients' ? '#a1a1aa' :
                    activity.type === 'coordinators' ? '#fb7185' :
                    activity.type === 'staff' ? '#34d399' :
                    activity.type === 'tracking' ? '#818cf8' : '#a1a1aa',
                  backgroundColor: expandedActivityId === activity.id ? '#0000' : 'inherit'
                }"
                tabindex="0"
                :aria-label="activity.message"
                @keydown.enter.space="expandedActivityId = expandedActivityId === activity.id ? null : activity.id"
                @click="expandedActivityId = expandedActivityId === activity.id ? null : activity.id"
              >
                <div
                  class="flex-shrink-0 rounded-full p-0.5 bg-white dark:bg-secondary-800 border border-zinc-200 dark:border-zinc-700 shadow"
                  :title="getActivityContext(activity)"
                  :aria-label="getActivityContext(activity)"
                  style="outline: none;"
                >
                  <component :is="getActivityAvatar(activity)" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      :class="{
                        'bg-zinc-200 text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200': activity.type === 'patients',
                        'bg-rose-200 text-rose-700 dark:bg-rose-700/60 dark:text-rose-200': activity.type === 'coordinators',
                        'bg-emerald-200 text-emerald-700 dark:bg-emerald-700/60 dark:text-emerald-200': activity.type === 'staff',
                        'bg-indigo-200 text-indigo-700 dark:bg-indigo-700/60 dark:text-indigo-200': activity.type === 'tracking'
                      }"
                    >
                      {{ activity.type.charAt(0).toUpperCase() + activity.type.slice(1) }}
                    </span>
                    <span class="text-xs text-secondary-400" v-if="activity.action">
                      • {{ activity.action }}
                    </span>
                  </div>
                  <p
                    class="text-sm text-secondary-900 dark:text-secondary-100 leading-snug"
                    v-if="activity.link && !activity.message.toLowerCase().includes('deleted')"
                  >
                    <NuxtLink
                      :to="activity.link"
                      class="hover:underline hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <span v-html="highlightActivityMessage(activity)"></span>
                    </NuxtLink>
                  </p>
                  <p
                    class="text-sm text-secondary-900 dark:text-secondary-100 leading-snug"
                    v-else
                    v-html="highlightActivityMessage(activity)"
                  ></p>
                  <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-1 flex items-center gap-1">
                    <svg class="h-3 w-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" />
                    </svg>
                    <span :title="new Date(activity.date).toLocaleString()">
                      {{ formatRelativeTime(activity.date) }}
                    </span>
                  </p>
                  <!-- Expandable details -->
                  <transition name="fade">
                    <div v-if="expandedActivityId === activity.id" class="mt-2 text-xs text-secondary-600 dark:text-secondary-300 bg-secondary-50 dark:bg-secondary-800 rounded p-2 border border-secondary-100 dark:border-secondary-700">
                      <div v-if="getActivityContext(activity)">
                        <strong>Details:</strong> {{ getActivityContext(activity) }}
                      </div>
                      <div>
                        <strong>Date:</strong> {{ new Date(activity.date).toLocaleString() }}
                      </div>
                      <div v-if="activity.link && !activity.message.toLowerCase().includes('deleted')">
                        <NuxtLink :to="activity.link" class="text-primary-600 dark:text-primary-400 underline">Go to record</NuxtLink>
                      </div>
                    </div>
                  </transition>
                </div>
              </li>
              <li v-if="recentActivities.length === 0" class="text-secondary-500 dark:text-secondary-400 text-center py-4">
                No recent activity found.
              </li>
            </template>
          </ul>
        </div>

        <!-- System Status -->
        <div class="bg-secondary-50/70 dark:bg-secondary-800/50 backdrop-blur-md rounded-xl p-5 border border-secondary-200 dark:border-secondary-700/50">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-heading font-bold text-lg text-secondary-900 dark:text-white">System Status</h2>
            <NuxtLink to="/backups" class="text-sm font-medium" :class="colors.text">
              Manage
            </NuxtLink>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <p class="text-sm text-secondary-700 dark:text-secondary-300">Last Backup</p>
              <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ systemInfo.lastBackup }}</p>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-sm text-secondary-700 dark:text-secondary-300">Database Size</p>
              <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ systemInfo.dbSize }}</p>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-sm text-secondary-700 dark:text-secondary-300">System Version</p>
              <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ systemInfo.version }}</p>
            </div>
          </div>
        </div>

        <!-- Archive Summary -->
        <div class="bg-secondary-50/70 dark:bg-secondary-800/50 backdrop-blur-md rounded-xl p-5 border border-secondary-200 dark:border-secondary-700/50">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-heading font-bold text-lg text-secondary-900 dark:text-white">Archive</h2>
            <NuxtLink to="/archive" class="text-sm font-medium" :class="colors.text">
              Manage
            </NuxtLink>
          </div>
          <div v-if="archiveSummary.loading" class="flex justify-center items-center py-6">
            <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2" :class="colors.border"></div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex justify-between items-center">
              <p class="text-sm text-secondary-700 dark:text-secondary-300">Archived Records</p>
              <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ archiveSummary.count }}</p>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-sm text-secondary-700 dark:text-secondary-300">Last Archive</p>
              <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ archiveSummary.lastDate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, h, nextTick } from 'vue'
import { usePageColors } from '~/composables/usePageColors'
import { useAsyncData } from '#app'

const { colors } = usePageColors()

// Define the change type
interface StatChange {
  type: 'increase' | 'decrease';
  value: number;
}

interface StatData {
  label: string;
  value: string;
  type: string;
  icon: any;
  change: StatChange | null;
  previousValue?: string;
  maxValue?: number;
}

// Loading state
const loading = ref(true)
const searchQuery = ref('')

// Quick Stats with updated interface
const quickStats = ref<StatData[]>([
  {
    label: 'Total Patients',
    value: '0',
    previousValue: '0',
    maxValue: 100,
    type: 'patients',
    icon: h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      fill: 'none', 
      viewBox: '0 0 24 24', 
      stroke: 'currentColor', 
      'stroke-width': '2',
      class: 'h-5 w-5'
    }, [
      h('path', { 
        'stroke-linecap': 'round', 
        'stroke-linejoin': 'round', 
        'd': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
      })
    ]),
    change: null
  },
  {
    label: 'Active Coordinators',
    value: '0',
    previousValue: '0',
    maxValue: 50,
    type: 'coordinators',
    icon: h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      fill: 'none', 
      viewBox: '0 0 24 24', 
      stroke: 'currentColor', 
      'stroke-width': '2',
      class: 'h-5 w-5'
    }, [
      h('path', { 
        'stroke-linecap':'round',
        'stroke-linejoin':'round',
        'stroke-width':'2',
        'd':'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      })
    ]),
    change: null
  },
  {
    label: 'Staff Members',
    value: '0',
    previousValue: '0',
    maxValue: 75,
    type: 'staff',
    icon: h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      fill: 'none', 
      viewBox: '0 0 24 24', 
      stroke: 'currentColor', 
      'stroke-width': '2',
      class: 'h-5 w-5'
    }, [
      h('path', { 
        'stroke-linecap':'round',
        'stroke-linejoin':'round',
        'stroke-width':'2',
        'd':'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
      })
    ]),
    change: null
  },
  {
    label: 'Active Trackings',
    value: '0',
    previousValue: '0',
    maxValue: 30,
    type: 'tracking',
    icon: h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      fill: 'none', 
      viewBox: '0 0 24 24', 
      stroke: 'currentColor', 
      'stroke-width': '2',
      class: 'h-5 w-5'
    }, [
      h('path', { 
        'stroke-linecap':'round',
        'stroke-linejoin':'round',
        'stroke-width':'2',
        'd':'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
      })
    ]),
    change: null
  }
])

// Data references
interface Patient { id: number; name: string; person: string; contact: string; location: string; isBaby?: boolean; status?: string; updated_at?: string; created_at?: string; }
interface Coordinator { id: number; first_name: string; last_name?: string; updated_at?: string; created_at?: string; }
interface Staff { id: number; full_name: string; occupation: string; updated_at?: string; created_at?: string; }
interface Tracking { id: number; patient_id: number; patient_name: string; contact_person: string; location: string; from_date: string; to_date: string; staff_ids: number[]; hours_per_day: number; days_per_week: number; duration_days: number; timing: string; amount: number; holiday_amount: number; total: number; paid: boolean; contract_sent: boolean | null; contract_signed: boolean; status: string; coordinator_id?: number; contract_status?: string; updated_at?: string; created_at?: string; }
interface Backup { name: string; date: string; }

const recentPatients = ref<Patient[]>([])

// System information
const systemInfo = ref({
  lastBackup: 'Loading...',
  dbSize: 'Loading...',
  version: 'v1.0.0'
})

// Archive summary
const archiveSummary = ref({
  loading: true,
  count: 0,
  lastDate: 'Loading...'
})

// Define a minimal Activity type
interface Activity {
  id: number
  type: 'patients' | 'coordinators' | 'staff' | 'tracking'
  message: string
  date: string
  icon: any
  action?: string
  link?: string
}

// State for recent activities
const recentActivities = ref<Activity[]>([])

// Add for skeleton loading
const activitiesLoading = ref(true)

// For expanded activity details
const expandedActivityId = ref<number | null>(null)

// Timer for auto-updating relative times
let relativeTimeTimer: ReturnType<typeof setInterval> | null = null

// Helper: get avatar/initials or fallback icon
function getActivityAvatar(activity: Activity) {
  if ((activity as any).avatarUrl) {
    return h('img', {
      src: (activity as any).avatarUrl,
      alt: 'Avatar',
      class: 'h-8 w-8 rounded-full object-cover'
    })
  }
  if ((activity as any).initials) {
    return h('span', {
      class: 'h-8 w-8 rounded-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center font-bold text-secondary-700 dark:text-secondary-200'
    }, (activity as any).initials)
  }
  return h('span', { class: 'h-8 w-8 flex items-center justify-center' }, [activity.icon])
}

// Helper: get extra context for tooltip
function getActivityContext(activity: Activity): string | undefined {
  if (activity.type === 'patients' && (activity as any).age) {
    return `Age: ${(activity as any).age}`
  }
  if (activity.type === 'staff' && (activity as any).occupation) {
    return `Role: ${(activity as any).occupation}`
  }
  if (activity.type === 'coordinators' && (activity as any).region) {
    return `Region: ${(activity as any).region}`
  }
  return undefined
}

// Helper functions for styling
function getStatBorderClass(type: string) {
  switch(type) {
    case 'patients': return 'border-zinc-200 dark:border-zinc-700/50'
    case 'coordinators': return 'border-rose-200 dark:border-rose-700/50'
    case 'staff': return 'border-emerald-200 dark:border-emerald-700/50'
    case 'tracking': return 'border-indigo-200 dark:border-indigo-700/50'
    default: return 'border-secondary-200 dark:border-secondary-700/50'
  }
}

function getStatTextClass(type: string) {
  switch(type) {
    case 'patients': return 'text-zinc-700 dark:text-zinc-300'
    case 'coordinators': return 'text-rose-700 dark:text-rose-300'
    case 'staff': return 'text-emerald-700 dark:text-emerald-300'
    case 'tracking': return 'text-indigo-700 dark:text-indigo-300'
    default: return 'text-secondary-900 dark:text-white'
  }
}

function getStatBgClass(type: string) {
  switch(type) {
    case 'patients': return 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
    case 'coordinators': return 'bg-rose-100 dark:bg-rose-800/50 text-rose-600 dark:text-rose-400'
    case 'staff': return 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400'
    case 'tracking': return 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400'
    default: return 'bg-secondary-100 dark:bg-secondary-800/50 text-secondary-600 dark:text-secondary-400'
  }
}

function getChangeClass(type: 'increase' | 'decrease' | 'none') {
  if (type === 'none') return 'text-secondary-600 dark:text-secondary-400'
  return type === 'increase' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
}

function getChangeType(current: string, previous: string): 'increase' | 'decrease' | 'none' {
  const currentNum = parseInt(current)
  const previousNum = parseInt(previous)
  if (currentNum > previousNum) return 'increase'
  if (currentNum < previousNum) return 'decrease'
  return 'none'
}

function getChangePercentage(current: string, previous: string): number {
  const currentNum = parseInt(current)
  const previousNum = parseInt(previous)
  if (previousNum === 0) return 0
  return Math.round(((currentNum - previousNum) / previousNum) * 100)
}

function getProgressWidth(value: string, maxValue: number = 100): number {
  const numValue = parseInt(value)
  return Math.min((numValue / maxValue) * 100, 100)
}

function getStatProgressClass(type: string): string {
  switch(type) {
    case 'patients': return 'bg-zinc-500 dark:bg-zinc-400'
    case 'coordinators': return 'bg-rose-500 dark:bg-rose-400'
    case 'staff': return 'bg-emerald-500 dark:bg-emerald-400'
    case 'tracking': return 'bg-indigo-500 dark:bg-indigo-400'
    default: return 'bg-primary-500 dark:bg-primary-400'
  }
}

// Format date function (auto-updates via timer)
const now = ref(new Date())
function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'sometime ago';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'invalid date';

  const diffMs = now.value.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`;
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Add this function to highlight keywords in activity messages
function highlightActivityMessage(activity: Activity): string {
  let msg = activity.message;
  const highlightColor =
    activity.type === 'patients' ? '#a1a1aa' :
    activity.type === 'coordinators' ? '#fb7185' :
    activity.type === 'staff' ? '#34d399' :
    activity.type === 'tracking' ? '#818cf8' : '#a1a1aa';

  msg = msg.replace(/(["'`])([^"'`]+)\1/g, `<span style="color:${highlightColor};font-weight:600;">$2</span>`);
  msg = msg.replace(/\b(for|by|to|of|on)\s+([A-Z][a-zA-Z0-9 _-]+)/g, (m, p1, p2) =>
    `${p1} <span style="color:${highlightColor};font-weight:600;">${p2}</span>`
  );
  return msg;
}

// Fetch data function
async function fetchDashboardData() {
  loading.value = true;
  activitiesLoading.value = true;
  try {
    // Fetch patients
    const patientsData = await $fetch<Patient[]>('/api/patients');
    if (Array.isArray(patientsData)) {
      quickStats.value[0].value = patientsData.length.toString();
      recentPatients.value = patientsData
        .slice()
        .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
        .slice(0, 5)
        .map(p => ({ ...p, status: p.status || 'active' }));
    }

    // Fetch coordinators
    const coordinatorsData = await $fetch<Coordinator[]>('/api/coordinators');
    if (Array.isArray(coordinatorsData)) {
      quickStats.value[1].value = coordinatorsData.length.toString();
    }

    // Fetch staff
    const staffData = await $fetch<Staff[]>('/api/staff');
    if (Array.isArray(staffData)) {
      quickStats.value[2].value = staffData.length.toString();
    }

    // Fetch tracking
    const trackingData = await $fetch<Tracking[]>('/api/tracking');
    if (Array.isArray(trackingData)) {
      quickStats.value[3].value = trackingData.length.toString();
    }

    // Fetch backups
    const backupsData = await $fetch<{ success: boolean; backups?: Backup[] }>('/api/backups');
    if (backupsData && backupsData.success && Array.isArray(backupsData.backups) && backupsData.backups.length > 0) {
      const latestBackup = backupsData.backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      systemInfo.value.lastBackup = formatRelativeTime(latestBackup.date);
    } else {
      systemInfo.value.lastBackup = 'Never';
    }

    // Calculate DB Size
    const totalPatients = Array.isArray(patientsData) ? patientsData.length : 0;
    const totalCoordinators = Array.isArray(coordinatorsData) ? coordinatorsData.length : 0;
    const totalStaff = Array.isArray(staffData) ? staffData.length : 0;
    const totalTrackings = Array.isArray(trackingData) ? trackingData.length : 0;
    const estimatedSizeKB = (totalPatients * 2) + (totalCoordinators * 1) + (totalStaff * 1.5) + (totalTrackings * 3) + 100; // Base size for other tables/overhead
    systemInfo.value.dbSize = estimatedSizeKB < 1024 ? `${estimatedSizeKB.toFixed(1)} KB` : `${(estimatedSizeKB / 1024).toFixed(1)} MB`;
    systemInfo.value.version = 'v1.0.0'; // This could be dynamic if needed

    // Fetch archive summary
    archiveSummary.value.loading = true;
    try {
      const archiveData = await $fetch<{ count: number; lastDate: string }>('/api/archive');
      if (archiveData && typeof archiveData.count === 'number') {
        archiveSummary.value.count = archiveData.count;
        archiveSummary.value.lastDate = formatRelativeTime(archiveData.lastDate);
      } else {
        archiveSummary.value.count = 0;
        archiveSummary.value.lastDate = 'Never';
      }
    } catch (e) {
      console.error('Error fetching archive summary:', e);
      archiveSummary.value.count = 0;
      archiveSummary.value.lastDate = 'Never';
    } finally {
      archiveSummary.value.loading = false;
    }

    // Fetch recent activities (limit to 5)
    try {
      const acts = await $fetch<Activity[]>('/api/activities?limit=5');
      if (Array.isArray(acts)) {
        recentActivities.value = acts.map(a => ({
          ...a,
          action: a.action || (a.message.match(/(added|updated|deleted|archived|restored)/i)?.[0] || ''),
          message: a.message.replace(
            /Deleted (patient|coordinator|staff|tracking) with ID: (\d+)/i,
            `Deleted $1: ${(a as any).recordName || 'Unknown'}`
          ),
          link:
            a.type === 'patients' ? `/patients?id=${a.id}` :
            a.type === 'coordinators' ? `/coordinators?id=${a.id}` :
            a.type === 'staff' ? `/staff?id=${a.id}` :
            a.type === 'tracking' ? `/tracking?id=${a.id}` :
            undefined,
          initials: (a as any).initials,
          avatarUrl: (a as any).avatarUrl,
          age: (a as any).age,
          occupation: (a as any).occupation,
          region: (a as any).region,
          icon: (() => {
            switch (a.type) {
              case 'patients':
                return h('svg', {
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor',
                  class: 'h-5 w-5'
                }, [
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    d: 'M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z'
                  }),
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                  })
                ]);
              case 'coordinators':
                return h('svg',{ xmlns:'http://www.w3.org/2000/svg',fill:'none',viewBox:'0 0 24 24',stroke:'currentColor',class:'h-5 w-5' }, [
                  h('path',{ 'stroke-linecap':'round','stroke-linejoin':'round','stroke-width':'2','d':'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' })
                ]);
              case 'staff':
                return h('svg',{ xmlns:'http://www.w3.org/2000/svg',fill:'none',viewBox:'0 0 24 24',stroke:'currentColor',class:'h-5 w-5' }, [
                  h('path',{ 'stroke-linecap':'round','stroke-linejoin':'round','stroke-width':'2','d':'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
                ]);
              case 'tracking':
                return h('svg',{ xmlns:'http://www.w3.org/2000/svg',fill:'none',viewBox:'0 0 24 24',stroke:'currentColor',class:'h-5 w-5' }, [
                  h('path',{ 'stroke-linecap':'round','stroke-linejoin':'round','stroke-width':'2','d':'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })
                ]);
              default:
                return h('svg',{ xmlns:'http://www.w3.org/2000/svg',fill:'none',viewBox:'0 0 24 24',stroke:'currentColor',class:'h-5 w-5' }, [
                  h('circle',{ cx:'12',cy:'12',r:'10',stroke:'currentColor','stroke-width':'2',fill:'none' })
                ]);
            }
          })()
        }));
      }
    } catch (e) {
      console.error('Error fetching activities:', e);
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    loading.value = false;
    activitiesLoading.value = false;
  }
}

// Refresh data function
function refreshData() {
  fetchDashboardData();
}

// Search functionality
async function handleSearch() {
  if (!searchQuery.value.trim()) return
  
  try {
    const [patients, staff] = await Promise.all([
      $fetch<Patient[]>(`/api/patients?search=${encodeURIComponent(searchQuery.value)}`),
      $fetch<Staff[]>(`/api/staff?search=${encodeURIComponent(searchQuery.value)}`)
    ])
  } catch (error) {
    console.error('Search error:', error)
  }
}

// Setup and cleanup polling
onMounted(() => {
  fetchDashboardData();
  relativeTimeTimer = setInterval(() => {
    now.value = new Date();
  }, 60000);
});

onUnmounted(() => {
  if (relativeTimeTimer) clearInterval(relativeTimeTimer);
});

// Add page meta for the layout
definePageMeta({
  layout: 'default',
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>