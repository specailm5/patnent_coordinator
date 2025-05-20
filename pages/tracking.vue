<template>  <div class="pt-16 md:pt-0 min-h-screen bg-gradient-to-br from-secondary-50/95 via-secondary-100/90 to-white/90 dark:from-secondary-900/80 dark:to-secondary-800/80 backdrop-blur-sm">
    <!-- Mobile Header -->
    <header v-if="layout === 'mobile'" class="fixed top-0 inset-x-0 z-30 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700 shadow-sm flex items-center justify-between px-4 py-2 md:hidden">
      <h1 class="text-lg font-bold">Patient Tracking</h1>
      <div class="flex items-center gap-2">

        <button @click="filtersOpen = !filtersOpen" class="p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg" aria-label="Toggle filters" title="Toggle filters">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 7h16a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zm1 8a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
          </svg>
        </button>
        <button @click="showModal = true" :class="[colors.bgSolid, 'flex items-center px-3 py-1 text-white rounded-lg shadow-sm']" aria-label="Add new tracking entry" title="Add new tracking entry">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    </header>
    <!--  Header Section -->
    <header v-if="layout !== 'mobile'" class="sticky top-0 z-30 w-full py-6 px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700 shadow-sm">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Title -->
          <div class="flex-1">
            <h1 class="text-3xl font-heading font-extrabold " :class="colors.gradient + ' bg-clip-text text-indigo-700 dark:text-indigo-300'">
              Patient Tracking
            </h1>
          </div>

          <!-- Controls -->
          <div class="flex flex-wrap items-center gap-3">
            <button @click="showModal = true"
              :class="[colors.bgSolid, 'flex items-center px-3 py-1.5 text-sm text-white rounded-lg shadow-sm transition-all hover:opacity-90']"
              aria-label="Add new tracking entry" title="Add new tracking entry">
              <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              <span>New Entry</span>
            </button>
            <button @click="archiveAll"
              :class="[colors.bgLight, colors.text, colors.border, 'flex items-center px-3 py-1.5 text-sm rounded-lg shadow-sm transition-all border dark:bg-secondary-700 hover:opacity-90']"
              :disabled="loading"
              aria-label="Archive all tracking records" title="Archive all tracking records">
              <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
              </svg>
              <span>Archive All</span>
            </button>
            <NuxtLink to="/"
              class="btn btn-outline flex items-center px-3 py-1.5 text-sm hover:no-underline focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ring-offset-2 dark:ring-offset-secondary-800 transition-all duration-150 ease-in-out">
              <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Back to Home</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Filters Section (Accordion) -->
    <div v-if="layout !== 'mobile' || filtersOpen" class="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="rounded-2xl shadow-md border border-secondary-200 dark:border-secondary-700 bg-white/90 dark:bg-secondary-900/90">
          <!-- Accordion Header -->
          <button
            @click="filtersOpen = !filtersOpen"
            class="w-full flex items-center justify-between px-6 py-4 text-lg font-semibold text-secondary-700 dark:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-t-2xl transition-all bg-white/90 dark:bg-secondary-900/90 hover:bg-secondary-100 dark:hover:bg-secondary-800"
            :aria-expanded="filtersOpen"
            aria-controls="filters-panel"
          >
            <span class="flex items-center gap-2">
              <svg :class="['w-5 h-5 transition-transform', filtersOpen ? 'rotate-90' : '']" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Filters And Settings
            </span>
            <span class="text-xs text-secondary-400">{{ filtersOpen ? 'Hide' : 'Show' }}</span>
          </button>
          <!-- Accordion Panel -->
          <transition name="fade">
            <div v-show="filtersOpen" id="filters-panel" class="px-6 pb-6 pt-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <!-- Search -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-secondary-600 dark:text-secondary-400">Search:</label>
                  <div class="relative w-full">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <input
                      v-model="search"
                      type="text"
                      placeholder="Search by patient, contact, location..."
                      class="block w-full pl-10 pr-12 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white/80 dark:bg-secondary-800/80 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 dark:placeholder-secondary-500 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                      aria-label="Search tracking records"
                    />
                    <button v-if="search" @click="search = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 focus:outline-none" aria-label="Clear search" title="Clear search">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- Status filter -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-secondary-600 dark:text-secondary-400">Status:</label>
                  <select v-model="statusFilter" class="w-full py-2 px-3 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white/80 dark:bg-secondary-800/80 text-secondary-900 dark:text-secondary-100 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm">
                    <option value="all">All</option>
                    <option value="New">New</option>
                    <option value="renewal">Renewal</option>
                  </select>
                </div>
                <!-- Contacting status filter -->                <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-secondary-600 dark:text-secondary-400">Contract Status:</label>
                  <select v-model="contractStatusFilter" class="w-full py-2 px-3 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white/80 dark:bg-secondary-800/80 text-secondary-900 dark:text-secondary-100 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm">
                    <option value="all">All</option>
                    <option value="Children's Contract">Children's Contract</option>
                    <option value="Contract Valid">Contract Valid</option>
                    <option value="Contract Suspended">Contract Suspended</option>
                    <option value="Contract Expired">Contract Expired</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <!-- Patient type filter -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-secondary-600 dark:text-secondary-400">Patient Type:</label>
                  <select v-model="babyFilter" class="w-full py-2 px-3 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white/80 dark:bg-secondary-800/80 text-secondary-900 dark:text-secondary-100 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm">
                    <option value="all">All</option>
                    <option value="baby">Baby</option>
                    <option value="adult">Adult</option>
                  </select>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {{ error }}
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-12">          <div class="h-10 w-10 border-4 border-secondary-200 dark:border-secondary-700 border-t-indigo-500 rounded-full animate-spin"></div>
          <p class="mt-4 text-secondary-600 dark:text-secondary-400">Loading tracking records...</p>
        </div>
      </div>
    </div>    <!-- Tracking Card Grid View -->
    <div v-if="!loading" class="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div class="max-w-7xl mx-auto">
        <div v-if="filteredTrackings && filteredTrackings.length > 0" class="animate-fadeIn">
          <!-- Grid Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            <div v-for="tracking in filteredTrackings" :key="tracking.id"
                 class="relative group bg-white/80 dark:bg-secondary-900/90 rounded-xl shadow-md hover:shadow-xl border border-secondary-200/50 dark:border-secondary-700/50 overflow-hidden transition-all duration-300 hover:translate-y-[-5px]"
                 :class="[tracking.contract_status ? `ring-1 ring-offset-2 ring-offset-secondary-50 dark:ring-offset-secondary-900 ${getContractStatusRingClass(tracking.contract_status)}` : '']">

              <!-- Status badge corner ribbon -->
              <div class="absolute top-0 right-0">
                <div class="relative w-32 h-32 overflow-hidden">
                  <div class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-32 text-center py-1.5 shadow-md"
                       :class="tracking.contract_status ? getContractStatusClass(tracking.contract_status) : getStatusClass(tracking.status)">
                    <span class="text-xs font-bold tracking-wide">{{ tracking.contract_status || tracking.status }}</span>
                  </div>
                </div>
              </div>
              <!-- Card Header (Accordion Header) -->
              <div class="relative px-5 pt-5 pb-3 border-b border-secondary-200/70 dark:border-secondary-700/70 cursor-pointer"
                  @click="toggleAccordionItem(tracking.id)"
                  :class="{'bg-secondary-50/30 dark:bg-secondary-800/30': tracking.isExpanded}">
                <div class="flex items-center gap-3">
                  
                  <div class="flex-1 min-w-0">
                    <h3
                      class="text-base font-bold text-secondary-900 dark:text-secondary-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                      style="overflow-wrap: anywhere; word-break: break-word; white-space: normal;"
                    >
                      {{ tracking.patient_name }}
                    </h3>
                    <p class="mt-1">
                      <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(tracking.status)]">
                        {{ tracking.status === 'renewal' ? 'Renewal' : tracking.status }}
                      </span>
                    </p>
                    <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5 flex items-center gap-1.5 truncate">
                      <svg class="w-4 h-4 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      <span class="truncate">{{ tracking.contact_person }}</span>
                    </p>
                    <p v-if="tracking.location" class="text-sm text-secondary-500 dark:text-secondary-400 mt-1 flex items-center gap-1.5 truncate">
                      <svg class="w-4 h-4 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span class="truncate">{{ tracking.location }}</span>
                    </p>
                  </div>
                  <!-- Patient Type Badge -->
                  <div class="flex-shrink-0">
                    <span class="px-2.5 py-1 inline-flex items-center rounded-full text-xs font-medium bg-opacity-10"
                          :class="getPatientInfo(tracking.patient_id)?.isBaby ? 'bg-pink-500 text-pink-700 dark:text-pink-300' : 'bg-indigo-500 text-indigo-700 dark:text-indigo-300'">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              :d="getPatientInfo(tracking.patient_id)?.isBaby ? 'M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414 1.414M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707' : 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'"
                              :class="getPatientInfo(tracking.patient_id)?.isBaby ? 'text-pink-500' : 'text-indigo-500'"
                              stroke="currentColor">
                        </path>
                      </svg>
                      {{ getPatientInfo(tracking.patient_id)?.isBaby ? 'Baby' : 'Adult' }}
                    </span>
                  </div>
                  <!-- Expand/Collapse Indicator -->                  <div class="flex-shrink-0 ml-2">
                    <svg class="w-5 h-5 text-indigo-400 transition-transform duration-200"
                         :class="[tracking.isExpanded ? 'rotate-180' : '']"
                         fill="none"
                         stroke="currentColor"
                         stroke-width="2"
                         viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
                <!-- Card Content (Accordion Panel) -->
              <transition name="accordion">
                <div v-show="tracking.isExpanded" class="accordion-content">
                  <!-- Main Card Sections -->
                  <div class="px-5 py-4 space-y-4">
                    <!-- Section: Duration & Schedule -->
                    <div class="bg-secondary-50/50 dark:bg-secondary-800/30 rounded-xl p-4 border border-secondary-100 dark:border-secondary-700/50">
                      <h3 class="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule & Duration
                      </h3>
                      <div class="space-y-3">
                        <div class="flex items-center gap-3">
                          <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100/80 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p class="text-xs text-secondary-500 dark:text-secondary-400">Duration</p>
                            <p class="text-sm font-medium text-secondary-900 dark:text-white">
                              {{ formatDate(tracking.from_date) }} - {{ formatDate(tracking.to_date) }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100/80 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p class="text-xs text-secondary-500 dark:text-secondary-400">Timing</p>
                            <P class="text-sm font-medium text-secondary-900 dark:text-white">
                              {{ tracking.timing }} </P> <P>{{ tracking.hours_per_day }} 
                              <span class="text-sm font-medium text-secondary-900 dark:text-white">hours/day</span>
                              <span class="text-sm font-medium text-secondary-900 dark:text-white"> x {{ tracking.days_per_week }} days/week</span>

                            </p>                           
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Section: Payment Details -->
                    <div class="bg-secondary-50/50 dark:bg-secondary-800/30 rounded-xl p-4 border border-secondary-100 dark:border-secondary-700/50">
                      <h3 class="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Payment Details
                      </h3>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 17a2 2 0 100-4 2 2 0 000 4zm-3-9a2 2 0 104 0h-4zm0 0h4m-6 0a2 2 0 110-4h8a2 2 0 110 4"/>
                              </svg>
                            </div>
                            <div>
                              <p class="text-xs text-secondary-500 dark:text-secondary-400">Total Amount</p>
                              <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {{ tracking.total }} BHD
                              </p>
                            </div>
                          </div>
                          <span class="px-2.5 py-1 text-xs font-medium rounded-full" :class="getPaidStatusClass(tracking.paid)">
                            {{ tracking.paid ? 'Paid' : 'Unpaid' }}
                          </span>
                        </div>
                        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-secondary-100 dark:border-secondary-700/50">
                          <div class="text-center">
                            <p class="text-xs text-secondary-500 dark:text-secondary-400">Base Rate</p>
                            <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ tracking.amount }} BHD</p>
                          </div>
                          <div class="text-center">
                            <p class="text-xs text-secondary-500 dark:text-secondary-400">Holiday</p>
                            <p class="text-sm font-medium text-secondary-900 dark:text-white">{{ tracking.holiday_amount }} BHD</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Section: Contract Information -->
                    <div class="bg-secondary-50/50 dark:bg-secondary-800/30 rounded-xl p-4 border border-secondary-100 dark:border-secondary-700/50">
                      <h3 class="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Contract Status
                      </h3>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                              </svg>
                            </div>
                            <div>
                              <p class="text-xs text-secondary-500 dark:text-secondary-400">Status</p>
                              <p v-if="tracking.contract_status" class="text-sm font-medium">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="getContractStatusClass(tracking.contract_status)">
                                  {{ tracking.contract_status }}
                                </span>
                              </p>
                              <p v-else class="text-sm text-secondary-500 dark:text-secondary-400 italic">
                                No contract status
                              </p>
                            </div>
                          </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-secondary-100 dark:border-secondary-700/50">
                          <div class="flex items-center justify-center gap-2 p-2 rounded-lg" :class="getContractSentStatusClass(tracking.contract_sent).bg">
                            <svg class="w-4 h-4 flex-shrink-0" :class="getContractSentStatusClass(tracking.contract_sent).text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" :d="tracking.contract_sent ? 'M5 13l4 4L19 7' : 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h6'" />
                            </svg>
                            <span class="text-xs font-medium" :class="getContractSentStatusClass(tracking.contract_sent).text">
                              {{ tracking.contract_sent === true ? 'Sent' : 'Not Sent' }}
                            </span>
                          </div>
                          <div class="flex items-center justify-center gap-2 p-2 rounded-lg" :class="getContractSignedStatusClass(tracking.contract_signed).bg">
                            <svg class="w-4 h-4 flex-shrink-0" :class="getContractSignedStatusClass(tracking.contract_signed).text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" :d="tracking.contract_signed ? 'M5 13l4 4L19 7' : 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'" />
                            </svg>
                            <span class="text-xs font-medium" :class="getContractSignedStatusClass(tracking.contract_signed).text">
                              {{ tracking.contract_signed ? 'Signed' : 'Not Signed' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Coordinator Info (if present) -->
                    <div v-if="tracking.coordinator_id" class="flex items-start gap-4">
                      <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200/30 dark:border-purple-700/30">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-xs font-medium uppercase text-secondary-500 dark:text-secondary-400">Coordinator</h4>
                        <p class="text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors mt-1">
                          {{ getCoordinatorName(tracking.coordinator_id) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Information Section -->
                  <div class="px-5 py-4 border-t border-secondary-200/70 dark:border-secondary-700/70">
                    <!-- Staff Members -->
                    <div class="flex items-start gap-4">
                      <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-800/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm border border-teal-200/30 dark:border-teal-700/30">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-xs font-medium uppercase text-secondary-500 dark:text-secondary-400">Assigned Staff</h4>
                        <div v-if="!tracking.staff_ids || !tracking.staff_ids.length" class="text-sm text-secondary-500 dark:text-secondary-400 mt-1 italic">
                          No staff assigned
                        </div>
                        <div v-else class="flex flex-wrap gap-2 mt-2">
                          <span v-for="staffId in tracking.staff_ids" :key="staffId"
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors">
                            {{ staffList.find(s => s.id === staffId)?.full_name || 'Unknown Staff' }}
                            <span class="ml-1 text-xs text-emerald-900 dark:text-emerald-200">
                              {{ staffList.find(s => s.id === staffId)?.occupation || '' }}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                    <!-- Card Actions -->
                  <div class="px-5 py-3 bg-secondary-50/80 dark:bg-secondary-800/80 border-t border-secondary-200/70 dark:border-secondary-700/70 flex items-center justify-end gap-2">
                    <button @click.stop="openEdit(tracking)"
                            class="transition-colors inline-flex items-center px-3 py-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button @click.stop="remove(tracking.id)"
                            class="transition-colors inline-flex items-center px-3 py-1.5 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Empty state remains the same -->
        <div v-if="!loading && (!filteredTrackings || !filteredTrackings.length)" class="p-12 bg-white dark:bg-secondary-900 rounded-xl shadow-md border border-secondary-200/50 dark:border-secondary-700/50 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div class="bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-5 mb-4">
              <svg class="w-24 h-24 text-indigo-500 dark:text-indigo-400 animate-bounce-subtle" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6M9 11h6M9 15h3" />
              </svg>
            </div>
          <h3 class="text-xl font-semibold text-secondary-700 dark:text-secondary-200 mb-2">No tracking records found</h3>
          <p class="text-secondary-500 dark:text-secondary-400 max-w-md mb-6">Create your first tracking record to start managing patient services and appointments.</p>
          <button @click="showModal = true"
            :class="[colors.bgSolid, 'flex items-center px-4 py-2 text-white rounded-lg shadow-sm transition-all hover:opacity-90']"
            aria-label="Add new tracking entry" title="Add new tracking entry">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Your First Tracking Record
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-secondary-50 dark:bg-secondary-800 w-full h-screen flex flex-col animate-fadeIn" role="dialog" aria-modal="true" :aria-label="isEditing ? 'Edit Tracking' : 'Add Tracking'">
      <!-- Header -->
      <div class="sticky top-0 left-0 right-0 z-10 bg-white dark:bg-secondary-800 px-6 py-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between shadow-sm">
      <h2 class="text-2xl font-heading font-bold flex items-center gap-2" :class="colors.gradient + ' text-indigo-700 dark:text-indigo-300'">
        <svg class="w-7 h-7 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m0 0H6"/>
        </svg>
        {{ isEditing ? 'Edit Tracking' : 'Add Tracking' }}
      </h2>
      <button
        @click="closeModal"
        class="p-2 text-secondary-400 hover:text-error-500 dark:hover:text-error-400 transition-all hover:rotate-90"
        aria-label="Close modal"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="isEditing ? handleEdit() : handleCreate()" class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto p-6 space-y-8">
        <!-- Patient Info Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-2">
        <label class="input-label required">Patient</label>
        <select
        v-model.number="form.patient_id"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        >
        <option value="">Select patient</option>
        <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        </div>
        <div class="space-y-2">
        <label class="input-label">Contact Person / Phone</label>
        <input
        v-model="form.contact_person"
        class="input bg-secondary-50 dark:bg-secondary-800 ring-1 ring-indigo-500/20 dark:ring-indigo-400/20"
        readonly
        />
        </div>
        <div class="space-y-2">
        <label class="input-label">Location</label>
        <input
        v-model="form.location"
        class="input bg-secondary-50 dark:bg-secondary-800 ring-1 ring-indigo-500/20 dark:ring-indigo-400/20"
        readonly
        />
        </div>
        </div>

        <!-- Dates & Hours Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-2">
        <label class="input-label required">From Date</label>
        <input
        type="date"
        v-model="form.from_date"
        class="input bg-white dark:bg-secondary-900 dark:text-white dark:[color-scheme:dark] w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        />
        </div>
        <div class="space-y-2">
        <label class="input-label required">To Date</label>
        <input
        type="date"
        v-model="form.to_date"
        class="input bg-white dark:bg-secondary-900 dark:text-white dark:[color-scheme:dark] w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        :min="form.from_date"
        />
        </div>
        <div class="space-y-2">
        <label class="input-label required">Hours/Day</label>
        <input
        type="number"
        min="0"
        max="24"
        v-model.number="form.hours_per_day"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        title="Hours per day must be between 0 and 24"
        />
        <p v-if="form.hours_per_day > 24" class="text-xs text-error-500 mt-1">
        Hours per day cannot exceed 24
        </p>
        </div>
        <div class="space-y-2">
        <label class="input-label required">Days/Week</label>
        <input
        type="number"
        min="0"
        max="7"
        v-model.number="form.days_per_week"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        title="Days per week must be between 0 and 7"
        />
        </div>
        </div>

        <!-- Duration & Timing Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-2">
        <label class="input-label required">Duration (days)</label>
        <input
        type="number"
        min="0"
        v-model.number="form.duration_days"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        />
        </div>
        <div class="space-y-2">
        <label class="input-label required">Timing</label>
        <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-secondary-500 dark:text-secondary-400 mb-1 block">Start Time</label>
          <input
          type="time"
          v-model="form.start_time"
          class="input bg-white dark:bg-secondary-900 dark:text-white dark:[color-scheme:dark] w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
          required
          :disabled="loading"
          />
        </div>
        <div>
          <label class="text-xs text-secondary-500 dark:text-secondary-400 mb-1 block">End Time</label>
          <input
          type="time"
          v-model="form.end_time"
          class="input bg-white dark:bg-secondary-900 dark:text-white dark:[color-scheme:dark] w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
          required
          :disabled="loading"
          />
        </div>
        </div>
        </div>
        <div class="space-y-2">
        <label class="input-label required">Amount (BHD)</label>
        <input
        type="number"
        min="0"
        step="0.001"
        v-model.number="form.amount"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        />
        </div>
        </div>

        <!-- Amount Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-2">
        <label class="input-label required">Holiday Amount (BHD)</label>
        <input
        type="number"
        min="0"
        step="0.001"
        v-model.number="form.holiday_amount"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        />
        </div>
        <div class="space-y-2">
        <label class="input-label required">Total (BHD)</label>
        <input
        type="number"
        min="0"
        step="0.001"
        v-model.number="form.total"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        required
        :disabled="loading"
        />
        </div>
        </div>

        <!-- Status Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-2">
        <label class="input-label required">Paid</label>
        <select
        v-model="form.paid"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        :disabled="loading"
        >
        <option :value="true">Yes</option>
        <option :value="false">No</option>
        </select>
        </div>
        <div class="space-y-2">
        <label class="input-label">Contract Sent</label>
        <select
        v-model="form.contract_sent"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        :disabled="loading"
        >
        <option :value="null">Status Unknown</option>
        <option :value="true">Sent</option>
        <option :value="false">Confirmed Not Sent</option>
        </select>
        </div>
        <div class="space-y-2">
        <label class="input-label required">Contract Signed</label>
        <select
        v-model="form.contract_signed"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        :disabled="loading"
        >
        <option :value="true">Yes</option>
        <option :value="false">No</option>
        </select>
        </div>
        </div>

        <!-- Additional Info Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-2">
        <label class="input-label required">Status</label>
        <select
        v-model="form.status"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        :disabled="loading"
        >
        <option value="New">New</option>
        <option value="renewal">Renewal</option>
        </select>
        </div>
        <div class="space-y-2">
        <label class="input-label">Coordinator</label>
        <select
        v-model="form.coordinator_id" 
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        :disabled="loading"
        >
        <option value="">Select coordinator</option>
        <option v-for="c in coordinators" :key="c.id" :value="c.id">
          {{ c.first_name }} <span v-if="c.last_name">{{ c.last_name }}</span>
        </option>
        </select>
        </div>        <div class="space-y-2">
        <label class="input-label">Contract Status</label>
        <select
        v-model="form.contract_status"
        class="input bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        :disabled="loading"
        >
        <option value="">Select status</option>
        <option value="Children's Contract">Children's Contract</option>
        <option value="Contract Valid">Contract Valid</option>
        <option value="Contract Suspended">Contract Suspended</option>
        <option value="Contract Expired">Contract Expired</option>
        </select>
        </div>
        </div>

        <!-- Staff Selection -->
        <div>
        <label class="input-label mb-2 block">Assigned Staff</label>
        <select
        v-model="form.staff_ids"
        multiple
        class="input min-h-[120px] bg-white dark:bg-secondary-900 w-full transition-all ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 dark:focus:ring-indigo-400"
        :disabled="loading"
        >
        <option v-for="s in staffList" :key="s.id" :value="s.id">
        {{ s.full_name }} ({{ s.occupation }})
        </option>
        </select>
        <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
        Hold Ctrl/Cmd to select multiple staff members
        </p>
        </div>
      </div>
            <!-- Footer -->
            <div class="sticky bottom-0 left-0 right-0 z-10 bg-white dark:bg-secondary-800 py-4 px-6 border-t border-secondary-200 dark:border-secondary-700">
              <div class="max-w-7xl mx-auto flex justify-end gap-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="btn btn-outline px-6"
                  :disabled="loading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn bg-indigo-500 dark:bg-indigo-400 min-w-[120px] flex items-center justify-center"
                  :disabled="loading || !form.patient_id || !form.from_date || !form.to_date || !form.amount || !form.total"
                  aria-label="Submit tracking form" title="Submit tracking form"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {{ loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, customRef, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { usePageColors } from '~/composables/usePageColors';

const { colors } = usePageColors();

const filtersOpen = ref(false);

watch(filtersOpen, (newVal) => {
  if (process.client) localStorage.setItem('trackingFiltersOpen', String(newVal));
});

// Restore preferences on mount
onMounted(() => {
  if (process.client) {
    const savedFilters = localStorage.getItem('trackingFiltersOpen');
    if (savedFilters !== null) filtersOpen.value = savedFilters === 'true';
  }
});

function useDebouncedRef<T>(sourceRef: Ref<T>, delay: number = 300): Ref<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return customRef<T>((track, trigger) => {
    return {
      get() {
        track();
        return sourceRef.value;
      },
      set(value: T) {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          sourceRef.value = value;
          trigger();
        }, delay);
      }
    };
  });
}

const search = ref("");
const debouncedSearch = useDebouncedRef(search, 300);
// Filters for tracking entries
const statusFilter = ref<'all' | 'New' | 'renewal'>('all');
const contractStatusFilter = ref<'all' | "Children's Contract" | 'Contract Valid' | 'Contract Suspended' | 'Contract Expired' | 'none'>('all');
const babyFilter = ref<'all' | 'baby' | 'adult'>('all');

interface Patient {
  id: number;
  name: string;
  person: string;
  contact: string;
  location: string;
  isBaby?: boolean;
}

interface Staff {
  id: number;
  full_name: string;
  occupation: string;
}

interface Tracking {
  id: number;
  patient_id: number;
  patient_name: string;
  contact_person: string;
  location: string;
  from_date: string;
  to_date: string;
  staff_ids: number[];
  hours_per_day: number;
  days_per_week: number;
  duration_days: number;
  timing: string;
  amount: number;
  holiday_amount: number;
  total: number;
  paid: boolean;
  contract_sent: boolean | null;
  contract_signed: boolean;
  status: 'renewal' | 'New';
  coordinator_id?: number;
  contract_status?: "Children's Contract" | "Contract Valid" | "Contract Suspended" | "Contract Expired";
  isExpanded?: boolean; // Added for accordion functionality
}

function getCoordinatorName(coordinatorId?: number): string {
  if (!coordinatorId) return '';
  const coordinator = coordinators.value.find(c => c.id === coordinatorId);
  if (!coordinator) return '';
  return coordinator.last_name ? `${coordinator.first_name} ${coordinator.last_name}` : coordinator.first_name;
}

function getPatientInfo(patientId: number): Patient | undefined {
  return patients.value.find(p => p.id === patientId);
}

interface TrackingFormData {
  id?: number;
  patient_id: number; // 0 if not selected, then validated by button :disabled
  contact_person: string;
  location: string;
  from_date: string;
  to_date: string;
  staff_ids: number[];
  hours_per_day: number;
  days_per_week: number;
  duration_days: number;
  start_time: string;
  end_time: string;
  amount: number;
  holiday_amount: number;
  total: number;
  paid: boolean;
  contract_sent: boolean | null;
  contract_signed: boolean;
  status: 'renewal' | 'New';
  coordinator_id?: number | string; // Allow string from form, will be parsed or removed
  contract_status?: "Children's Contract" | "Contract Valid" | "Contract Suspended" | "Contract Expired" | ""; // Allow "" from form
}

const isEditing = ref(false);
const trackings = ref<Tracking[] | null>(null);
const patients = ref<Patient[]>([]);
const staffList = ref<Staff[]>([]);
const coordinators = ref<{ id: number; first_name: string; last_name?: string }[]>([]);
const loading = ref(false);
const error = ref('');
const showModal = ref(false);


// Function to confirm actions
const confirm = (message: string): Promise<boolean> => {
  return new Promise(resolve => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(message);
    resolve(confirmed);
  });
};

const filteredTrackings = computed(() => {
  let filtered = trackings.value || [];
  // Text search
  if (debouncedSearch.value.trim()) {
    const q = debouncedSearch.value.trim().toLowerCase();
    filtered = filtered.filter(t => (
      t.patient_name?.toLowerCase().includes(q) ||
      t.contact_person?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q) ||
      t.timing?.toLowerCase().includes(q) ||
      t.amount?.toString().includes(q) ||
      t.holiday_amount?.toString().includes(q) ||
      t.total?.toString().includes(q) ||
      t.paid?.toString().includes(q) ||
      t.contract_sent?.toString().includes(q) ||
      t.contract_signed?.toString().includes(q) ||
      (t.staff_ids && t.staff_ids.some(staffId => getStaffInfo(staffId).toLowerCase().includes(q))) ||
      (t.coordinator_id && getCoordinatorName(t.coordinator_id).toLowerCase().includes(q))
    ));
  }
  // Filter by tracking status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter.value);
  }  // Filter by contract status
  if (contractStatusFilter.value !== 'all') {
    if (contractStatusFilter.value === 'none') {
      filtered = filtered.filter(t => !t.contract_status);
    } else {
      filtered = filtered.filter(t => t.contract_status === contractStatusFilter.value);
    }
  }
  // Filter by patient type (baby or adult)
  if (babyFilter.value === 'baby') {
    filtered = filtered.filter(t => getPatientInfo(t.patient_id)?.isBaby);
  } else if (babyFilter.value === 'adult') {
    filtered = filtered.filter(t => !getPatientInfo(t.patient_id)?.isBaby);
  }
  return filtered;
});

const emptyForm: TrackingFormData = {
  patient_id: 0, // Represents "not selected"
  contact_person: '',
  location: '',
  from_date: '',
  to_date: '',
  staff_ids: [],
  hours_per_day: 0,
  days_per_week: 0,
  duration_days: 0,
  start_time: '',
  end_time: '',
  amount: 0,
  holiday_amount: 0,
  total: 0,
  paid: false,
  contract_sent: null,
  contract_signed: false,
  status: 'New',
  coordinator_id: '', // Default to empty string for "Select" option
  contract_status: '' // Default to empty string for "Select" option
};

const form = ref<TrackingFormData>({ ...emptyForm });

// Watch for patient selection changes
watch(() => form.value.patient_id, (newId: number) => {
  if (newId === 0) {
    form.value.contact_person = '';
    form.value.location = '';
    return;
  }

  const patient = patients.value.find((p) => p.id === newId);
  if (patient) {
    form.value.contact_person = `${patient.person} / ${patient.contact}`;
    form.value.location = patient.location;
  }
});

// Watch for hours per day changes to ensure it doesn't exceed 24
watch(() => form.value.hours_per_day, (newValue) => {
  if (newValue > 24) {
    form.value.hours_per_day = 24;
  } else if (newValue < 0) {
    form.value.hours_per_day = 0;
  }
});

// Watch for days per week changes to ensure it doesn't exceed 7
watch(() => form.value.days_per_week, (newValue) => {
  if (newValue > 7) {
    form.value.days_per_week = 7;
  } else if (newValue < 0) {
    form.value.days_per_week = 0;
  }
});

// Watch for date changes to ensure to_date is not before from_date
watch([() => form.value.from_date, () => form.value.to_date], ([fromDate, toDate]) => {
  if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
    form.value.to_date = form.value.from_date;
  }
});

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

async function fetchLists() {
  try {
    loading.value = true;
    error.value = '';
    trackings.value = []; // Initialize with empty array while loading

    const [patientsData, staffData, trackingsData, coordinatorsData] = await Promise.all([
      $fetch<Patient[]>('/api/patients'),
      $fetch<Staff[]>('/api/staff'),
      $fetch<Tracking[]>('/api/tracking'),
      $fetch<{ id: number; first_name: string; last_name?: string }[]>('/api/coordinators')
    ]);
    patients.value = patientsData;
    staffList.value = staffData;
    // Initialize tracking data
    trackings.value = trackingsData || [];
    

    coordinators.value = coordinatorsData;
  } catch (e) {
    error.value = 'Failed to load data. Please try again.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function openEdit(tracking: Tracking) {
  isEditing.value = true;
  const [startTimeStr, endTimeStr] = tracking.timing.split('-').map(t => t.trim());
  
  const parseTimeTo24Hour = (timeStr12Hour: string) => {
    if (!timeStr12Hour) return '';
    const [time, ampm] = timeStr12Hour.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm && ampm.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (ampm && ampm.toLowerCase() === 'am' && hours === 12) hours = 0; // Midnight case
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  form.value = {
    id: tracking.id,
    patient_id: tracking.patient_id,
    contact_person: tracking.contact_person,
    location: tracking.location,
    from_date: tracking.from_date,
    to_date: tracking.to_date,
    staff_ids: tracking.staff_ids || [],
    hours_per_day: tracking.hours_per_day,
    days_per_week: tracking.days_per_week,
    duration_days: tracking.duration_days,
    start_time: parseTimeTo24Hour(startTimeStr),
    end_time: parseTimeTo24Hour(endTimeStr),
    amount: tracking.amount,
    holiday_amount: tracking.holiday_amount,
    total: tracking.total,
    paid: tracking.paid,
    contract_sent: tracking.contract_sent,
    contract_signed: tracking.contract_signed,
    status: tracking.status,
    coordinator_id: tracking.coordinator_id || '', // Ensure empty string if undefined for form
    contract_status: tracking.contract_status || '' // Ensure empty string if undefined for form
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  isEditing.value = false;
  form.value = { ...emptyForm };
}

function formatTimeTo12Hour(time24: string): string {
  if (!time24) return ''; // Handle empty time string
  const [hoursStr, minutesStr] = time24.split(':');
  const h = parseInt(hoursStr, 10);
  const m = parseInt(minutesStr, 10); // Keep minutes as number for formatting
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12; // Convert 0 or 12 to 12 for 12 AM/PM
  
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function prepareTrackingPayload(formData: TrackingFormData): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { start_time, end_time, id: formId, ...rest } = formData;
  
  const payload: any = {
    ...rest,
    timing: `${formatTimeTo12Hour(formData.start_time)}-${formatTimeTo12Hour(formData.end_time)}`,
    paid: Boolean(rest.paid),
    contract_sent: rest.contract_sent === null ? null : Boolean(rest.contract_sent),
    contract_signed: Boolean(rest.contract_signed),
  };

  // Include id only if editing (formId is defined and non-zero)
  if (isEditing.value && formId) {
    payload.id = formId;
  } else {
    delete payload.id; // Ensure id is not sent for new records
  }

  // Handle optional coordinator_id
  if (rest.coordinator_id && typeof rest.coordinator_id === 'string' && rest.coordinator_id !== '') {
    const parsedCoordId = parseInt(rest.coordinator_id, 10);
    if (!isNaN(parsedCoordId) && parsedCoordId > 0) {
      payload.coordinator_id = parsedCoordId;
    } else {
      delete payload.coordinator_id;
    }
  } else if (typeof rest.coordinator_id === 'number' && rest.coordinator_id > 0) {
    payload.coordinator_id = rest.coordinator_id;
  } else {
    delete payload.coordinator_id;
  }
  
  // Handle optional contract_status
  if (!rest.contract_status) {
    delete payload.contract_status;
  } else {
    payload.contract_status = rest.contract_status;
  }

  return payload;
}


async function handleCreate() {
  try {
    loading.value = true;
    error.value = '';
    const payload = prepareTrackingPayload(form.value);

    await $fetch('/api/tracking', {
      method: 'POST',
      body: payload,
    });
    await fetchLists();
    closeModal();
  } catch (e) {
    error.value = 'Failed to create tracking record. Please try again.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function handleEdit() {
  try {
    loading.value = true;
    error.value = '';

    if (!form.value.id) {
      throw new Error('Invalid tracking ID for editing');
    }
    const payload = prepareTrackingPayload(form.value);

    await $fetch(`/api/tracking/${form.value.id}`, {
      method: 'PUT',
      body: payload,
    });
    await fetchLists();
    closeModal();
  } catch (e) {
    error.value = 'Failed to update tracking record. Please try again.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function remove(id: number) {
  if (loading.value) return;

  const confirmed = await confirm('Are you sure you want to delete this tracking record? This action cannot be undone.');
  if (!confirmed) return;

  loading.value = true;
  try {
    await $fetch(`/api/tracking/${id}`, { method: 'DELETE' });
    await fetchLists();
  } catch (err) {
    error.value = 'Failed to delete record';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function archiveAll() {
  if (loading.value) return;

  const confirmed = await confirm('Are you sure you want to archive all tracking records? This action cannot be undone.');
  if (!confirmed) return;

  loading.value = true;
  try {
    const result = await $fetch<{ archived: number }>('/api/archive', { method: 'POST' });
    console.log('Archive result:', result);
    await fetchLists();
    // eslint-disable-next-line no-alert
    alert(`Archived ${result.archived || 0} records.`);
  } catch (err) {
    error.value = 'Failed to archive records';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function getStaffInfo(staffId: number): string {
  const staff = staffList.value.find(s => s.id === staffId);
  return staff ? `${staff.full_name} (${staff.occupation})` : staffId.toString();
}

// Add a function to return the ring class based on contract status
function getContractStatusRingClass(status?: string): string {
  switch (status) {
    case "Children's Contract":
      return 'ring-2 ring-pink-400 dark:ring-pink-500/60';
    case 'Contract Valid':
      return 'ring-2 ring-green-400 dark:ring-green-500/60';
    case 'Contract Suspended':
      return 'ring-2 ring-yellow-400 dark:ring-yellow-500/60';
    case 'Contract Expired':
      return 'ring-2 ring-red-400 dark:ring-red-500/60';
    default:
      return 'ring-2 ring-gray-400 dark:ring-gray-500/60';
  }
}

// Add function to return status badge classes
function getStatusClass(status?: string): string {
  switch (status) {
    case 'New':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 ring-1 ring-sky-400/30';
    case 'renewal':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 ring-1 ring-amber-400/30';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 ring-1 ring-slate-400/30';
  }
}

// Modal ESC close
function handleKeydown(e: KeyboardEvent) {
  if (showModal.value && e.key === 'Escape') {
    closeModal();
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Fetch data when component is created
fetchLists();

// Define a layout based on screen size
const layout = ref<'default' | 'mobile'>('default'); // Default layout

const updateLayout = () => {
  if (window.innerWidth < 768) { // Example breakpoint for mobile
    layout.value = 'mobile';
  } else {
    layout.value = 'default';
  }
};

onMounted(() => {
  updateLayout();
  window.addEventListener('resize', updateLayout);
});


onUnmounted(() => {
  window.removeEventListener('resize', updateLayout);
});

// Track which card is currently expanded
const expandedTrackingId = ref<number | null>(null);

// Function to toggle accordion items
function toggleAccordionItem(itemId: number) {
  if (expandedTrackingId.value === itemId) {
    expandedTrackingId.value = null; // Collapse if it's already open
  } else {
    expandedTrackingId.value = itemId; // Expand the new item
  }

  // Update isExpanded property for all tracking items
  if (trackings.value) {
    trackings.value.forEach(t => {
      t.isExpanded = (t.id === expandedTrackingId.value);
    });
  }
}

// Add function to return contract status badge classes
function getContractStatusClass(status?: string): string {
  switch (status) {
    case "Children's Contract":
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 ring-1 ring-pink-400/30';
    case 'Contract Valid':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-1 ring-green-400/30';
    case 'Contract Suspended':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ring-1 ring-yellow-400/30';
    case 'Contract Expired':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-red-400/30';
    default: // For 'none' or undefined contract status
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 ring-1 ring-gray-400/30';
  }
}

function getPaidStatusClass(paid: boolean): string {
  if (paid) {
    return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
  }
  return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
}

function getContractSentStatusClass(sent: boolean | null): { bg: string; text: string } {
  if (sent === true) {
    return {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      text: 'text-cyan-700 dark:text-cyan-300'
    };
  }
  // Covers false and null
  return {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300'
  };
}

function getContractSignedStatusClass(signed: boolean): { bg: string; text: string } {
  if (signed) {
    return {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      text: 'text-violet-700 dark:text-violet-300'
    };
  }
  return {
    bg: 'bg-stone-50 dark:bg-stone-800/50',
    text: 'text-stone-600 dark:text-stone-400'
  };
}

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Accordion animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease;
  max-height: 1000px; /* Adjust as needed, should be larger than any possible content height */
  overflow: hidden;
  opacity: 1;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-content {
  overflow: hidden; /* Important for max-height transition to work */
  transition: all 0.3s ease-out; /* General transition for other properties if needed */
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(-3%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}
</style>