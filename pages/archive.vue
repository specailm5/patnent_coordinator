<template>
  <div class="min-h-screen py-6 flex flex-col bg-gradient-to-br from-secondary-50/95 via-secondary-100/90 to-white/90 dark:from-secondary-900/80 dark:to-secondary-800/80 backdrop-blur-sm">
    <!-- Header -->
    <div class="px-4 sm:px-6 lg:px-8 mb-6">
      <div class="flex w-full max-w-4xl mx-auto items-center justify-between">
        <h1 class="text-3xl font-heading font-bold" :class="colors.gradient + ' bg-clip-text text-transparent'">
          Archived Trackings
        </h1>
      </div>
    </div>

    <!-- Calendar/Selector UI -->
    <div class="px-4 sm:px-6 lg:px-8 mb-6 max-w-4xl mx-auto w-full flex flex-col gap-4">
      <div class="toolbar p-4 bg-white/70 dark:bg-secondary-800/50 backdrop-blur-md rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700/50">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="space-y-1">
            <label for="archive-year" class="block text-xs font-medium text-secondary-600 dark:text-secondary-300">Year</label>
            <select 
              id="archive-year" 
              v-model="selectedYear" 
              @change="fetchMonthsForYear" 
              class="block w-full pl-3 pr-10 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option disabled value="">Select Year</option>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label for="archive-month" class="block text-xs font-medium text-secondary-600 dark:text-secondary-300">Month</label>
            <select 
              id="archive-month" 
              v-model="selectedMonth" 
              :disabled="!selectedYear || availableMonths.length === 0" 
              @change="fetchArchivedTrackings" 
              class="block w-full pl-3 pr-10 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              :aria-disabled="!selectedYear || availableMonths.length === 0"
            >
              <option disabled value="">Select Month</option>
              <option v-for="month in availableMonths" :key="month.value" :value="month.value">{{ month.name }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label for="search-query" class="block text-xs font-medium text-secondary-600 dark:text-secondary-300">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                id="search-query" 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search patient name..." 
                autocomplete="off"
                class="block w-full pl-10 pr-10 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500" 
                aria-label="Search patient name"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300 focus:outline-none transition-colors" aria-label="Clear search">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label class="text-xs font-medium text-secondary-600 dark:text-secondary-300">Cards per row:</label>
            <div class="flex items-center rounded-lg border border-secondary-300 dark:border-secondary-600 overflow-hidden">
              <button 
                v-for="n in [2,3,4,5,6]" 
                :key="n" 
                @click="setCardSize(n)" 
                :class="[
                  'px-3 py-1.5 text-xs font-medium focus:outline-none transition-colors',
                  cardSize === n ? colors.bgSolid + ' text-white' : 'bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-600'
                ]"
                :aria-pressed="cardSize === n"
              >
                {{ n }}
              </button>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              @click="clearFilters"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-secondary-700 dark:text-secondary-200 bg-white dark:bg-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-600 border border-secondary-300 dark:border-secondary-600 text-xs font-medium shadow-sm transition-all hover:shadow focus:outline-none focus:ring-1 focus:ring-primary-500"
              aria-label="Clear all filters"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L19 12M3 12l6.414-6.414a2 2 0 012.828 0L19 12"/>
              </svg>
              Clear Filters
            </button>
            <button 
              @click="exportToCSV" 
              :class="[colors.bgSolid, 'text-white', 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all hover:shadow focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-secondary-800']"
              aria-label="Export to CSV"
              title="Download visible records as CSV"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="error" class="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full mt-4" aria-live="assertive">
      <div class="alert bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center gap-3 shadow-md">
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm">{{ error }}</span>
      </div>
    </div>

    <div v-if="loading" class="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full fade-spinner-wrapper mt-8" aria-live="polite">
      <div class="fade-spinner"></div>
      <p class="text-secondary-600 dark:text-secondary-400 mt-4 text-center text-sm">Loading archived records...</p>
    </div>

    <!-- Archived Trackings Display -->
    <div v-if="!loading && filteredTrackings.length > 0" class="flex-1 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid gap-5 transition-all duration-300"
        :class="{
          'grid-cols-1 md:grid-cols-2': cardSize === 2,
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3': cardSize === 3,
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4': cardSize === 4,
          'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5': cardSize === 5,
          'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6': cardSize === 6,
        }">
        <div 
          v-for="tracking in filteredTrackings" 
          :key="tracking.archive_id" 
          class="card card-hover group relative transition-all duration-300 bg-white dark:bg-secondary-800/70 shadow-lg dark:shadow-secondary-900/50 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700/50 hover:shadow-xl dark:hover:shadow-secondary-900/70"
          :class="getContractStatusRingClass(tracking.contract_status)"
        >
          <!-- Card Content -->
          <!-- Card Header -->          <div class="p-4 border-b border-secondary-200 dark:border-secondary-700/60">
            <div class="flex justify-between items-start mb-2.5">
              <h3 class="text-md font-bold text-secondary-800 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center">
                {{ tracking.patient_name }}
                <span v-if="tracking.isBaby" class="ml-1.5 flex items-center">
                  <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 110 12.728 9 9 0 010-12.728M13.5 10.5l-3 3-1.5-1.5"></path>
                  </svg>
                  <span class="text-[0.6rem] text-blue-500 ml-1">Baby</span>
                </span>
              </h3>
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-secondary-50/70 dark:bg-secondary-700/40 border border-secondary-200/70 dark:border-secondary-700/30">
                <svg class="w-3.5 h-3.5 text-primary-500 dark:text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="text-xs font-medium text-secondary-700 dark:text-secondary-200">{{ tracking.contact_person }}</span>
              </div>
              <div v-if="tracking.location" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-secondary-50/70 dark:bg-secondary-700/40 border border-secondary-200/70 dark:border-secondary-700/30">
                <svg class="w-3.5 h-3.5 text-primary-500 dark:text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-xs font-medium text-secondary-700 dark:text-secondary-200">{{ tracking.location }}</span>
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-4 space-y-3">
            <!-- Dates -->
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">From</p>
                <p class="text-xs font-semibold text-secondary-700 dark:text-secondary-200">{{ formatDate(tracking.from_date) }}</p>
              </div>
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">To</p>
                <p class="text-xs font-semibold text-secondary-700 dark:text-secondary-200">{{ formatDate(tracking.to_date) }}</p>
              </div>
            </div>

            <!-- Schedule -->
            <div class="grid grid-cols-3 gap-2">
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md text-center">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Hours/Day</p>
                <p class="text-sm font-semibold text-secondary-700 dark:text-secondary-200">{{ tracking.hours_per_day }}</p>
              </div>
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md text-center">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Days/Week</p>
                <p class="text-sm font-semibold text-secondary-700 dark:text-secondary-200">{{ tracking.days_per_week }}</p>
              </div>
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md text-center">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Duration</p>
                <p class="text-sm font-semibold text-secondary-700 dark:text-secondary-200">{{ tracking.duration_days }}d</p>
              </div>
            </div>

            <!-- Timing -->
            <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2.5 rounded-md">
              <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-0.5">Timing</p>
              <p class="text-sm font-medium text-secondary-700 dark:text-secondary-200">{{ tracking.timing }}</p>
            </div>

            <!-- Financial -->
            <div class="grid grid-cols-3 gap-2">
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Amount</p>
                <p class="text-xs font-semibold text-secondary-700 dark:text-secondary-200">{{ tracking.amount?.toFixed(3) }} <span class="text-[9px] text-secondary-500">BHD</span></p>
              </div>
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Holiday</p>
                <p class="text-xs font-semibold text-secondary-700 dark:text-secondary-200">{{ tracking.holiday_amount?.toFixed(3) }} <span class="text-[9px] text-secondary-500">BHD</span></p>
              </div>
              <div class="bg-secondary-100/50 dark:bg-secondary-700/50 p-2 rounded-md">
                <p class="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Total</p>
                <p class="text-xs font-semibold text-secondary-700 dark:text-secondary-200">{{ tracking.total?.toFixed(3) }} <span class="text-[9px] text-secondary-500">BHD</span></p>
              </div>
            </div>

            <!-- Status Tags -->
            <div class="flex flex-wrap gap-1.5 mt-3">
              <span :class="[ 
                'px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 border', 
                tracking.paid ? 
                  'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' : 
                  'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' 
              ]">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m0-4a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {{ tracking.paid ? 'Paid' : 'Unpaid' }}
              </span>
              <span :class="[ 
                'px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 border', 
                tracking.contract_sent ? 
                  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' : 
                  'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30' 
              ]">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19h18M9 19v-4a2 2 0 012-2h2a2 2 0 012 2v4"/>
                </svg>
                {{ tracking.contract_sent ? 'Contract Sent' : 'Contract Not Sent' }}
              </span>
              <span :class="[ 
                'px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 border', 
                tracking.contract_signed ? 
                  'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' : 
                  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' 
              ]">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                {{ tracking.contract_signed ? 'Contract Signed' : 'Contract Not Signed' }}
              </span>
              <span :class="[ 
                'px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 border', 
                tracking.status === 'New' ? 
                  'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30' : 
                tracking.status === 'Ongoing' ?
                  'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' :
                  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' 
              ]">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ tracking.status }}
              </span>
            </div>

            <!-- Staff and Coordinator -->
            <div class="space-y-2 text-xs mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700/50">
              <div v-if="tracking.coordinator_id" class="flex items-center gap-1.5">
                <span class="text-[10px] font-medium text-secondary-500 dark:text-secondary-400">Coordinator:</span>
                <span class="font-semibold text-secondary-700 dark:text-secondary-200">{{ getCoordinatorName(tracking.coordinator_id) }}</span>
              </div>
              <div v-if="tracking.staff_ids?.length" class="flex flex-col gap-1">
                <span class="text-[10px] font-medium text-secondary-500 dark:text-secondary-400">Staff:</span>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="staffId in tracking.staff_ids" 
                    :key="staffId" 
                    class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-secondary-100 dark:bg-secondary-700/70 border border-secondary-200 dark:border-secondary-600/70 text-secondary-700 dark:text-secondary-300"
                  >
                    {{ getStaffInfo(staffId) }}
                  </span>
                </div>
              </div>
              <div v-if="tracking.contract_status" class="flex items-center gap-1.5">
                <span class="text-[10px] font-medium text-secondary-500 dark:text-secondary-400">Contract Status:</span>
                <span class="font-semibold text-secondary-700 dark:text-secondary-200">{{ tracking.contract_status }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-medium text-secondary-500 dark:text-secondary-400">Archived:</span>
                <span class="font-semibold text-secondary-700 dark:text-secondary-200">{{ formatDate(tracking.archived_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty States -->
    <div v-else-if="!loading && (selectedMonth || searchQuery) && filteredTrackings.length === 0" class="flex flex-col items-center justify-center py-16 max-w-lg mx-auto w-full px-4 text-center">
      <svg class="w-16 h-16 text-primary-400 dark:text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h.008v.008h-.008V10.5zm-3 0h.008v.008h-.008V10.5zm-3 0h.008v.008h-.008V10.5z" />
      </svg>
      <h3 class="mt-2 text-xl font-semibold text-secondary-800 dark:text-secondary-100">No Records Found</h3>
      <p class="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
        No archived records match your current filters ({{ monthNames[Number(selectedMonth) - 1] || 'Any Month' }} {{ selectedYear || 'Any Year' }}, "{{ searchQuery || 'No Search Query' }}").
        <br>Try adjusting your search or selecting a different period.
      </p>
      <button 
        @click="clearFilters"
        :class="['mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-800', colors.bgSolid]"
      >
        Clear All Filters
      </button>
    </div>

    <!-- No Archives Available (Initial State) -->
    <div v-if="!loading && !error && !selectedYear && availableYears && availableYears.length === 0" class="flex flex-col items-center justify-center py-16 max-w-lg mx-auto w-full px-4 text-center">
      <svg class="w-16 h-16 text-secondary-400 dark:text-secondary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
      <h3 class="mt-2 text-xl font-semibold text-secondary-800 dark:text-secondary-100">No Archives Available</h3>
      <p class="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
        It looks like there are no records archived yet. <br>You can archive records from the main tracking page.
      </p>
      <!-- Optional: Add a link/button to the tracking page -->
       <NuxtLink :to="'/'" :class="['mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-800', colors.bgSolid]">
        Go to Tracking Page
      </NuxtLink>
    </div>

    <!-- Please Select Period (Initial State if years are available but no month selected) -->
    <div v-else-if="!loading && !error && !selectedMonth && availableYears.length > 0 && !yearJustSelected && filteredTrackings.length === 0" class="flex flex-col items-center justify-center py-16 max-w-lg mx-auto w-full px-4 text-center">
      <svg class="w-16 h-16 text-secondary-400 dark:text-secondary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-2 text-xl font-semibold text-secondary-800 dark:text-secondary-100">Select a Period</h3>
      <p class="mt-2 text-sm text-secondary-600 dark:text-secondary-400">Please select a year and month to view archived records.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
// @ts-ignore: no types for lodash-es debounce
import { debounce } from 'lodash-es'

const { colors } = usePageColors()

// Define interfaces
interface ArchivedTracking {
  archive_id: number; 
  original_tracking_id: number;   patient_id: number;
  patient_name?: string; 
  contact_person: string;
  location?: string;
  isBaby?: number; 
  from_date: string;
  to_date: string;
  staff_ids: number[];
  staff_titles?: string; 
  hours_per_day: number;
  days_per_week: number;
  duration_days: number;
  timing: string;
  amount: number;
  holiday_amount: number;
  total: number;
  paid: number; // Stored as 0 or 1 in DB
  contract_sent: number | null; // Stored as 0, 1 or null
  contract_signed: number; // Stored as 0 or 1
  status: string; 
  coordinator_id?: number;
  contract_status?: string; 
  archived_at: string; 
}

interface Staff {
  id: number;
  full_name: string;
  occupation: string;
}

interface Coordinator {
  id: number;
  first_name: string;
  last_name?: string;
}

interface Month {
  name: string;
  value: number;
}

const loading = ref(false)
const error = ref('')
const yearJustSelected = ref(false);

const cardSize = ref(process.client ? (Number(localStorage.getItem('cardSize')) || 4) : 4)

// SSR-safe: Initialize localStorage value on client side only
onMounted(() => {
  if (process.client) {
    const savedSize = localStorage.getItem('cardSize')
    if (savedSize) {
      cardSize.value = Number(savedSize)
    }
  }
})

// Watch for changes and save to localStorage on client side only
watch(cardSize, (newValue) => {
  if (process.client) {
    localStorage.setItem('cardSize', newValue.toString())
  }
})

// Debounced search for better performance
const searchQuery = ref('')
const debouncedSearch = ref('')
watch(searchQuery, debounce((val: string) => {
  debouncedSearch.value = val
}, 250))

const selectedYear = ref<number | string>('')
const selectedMonth = ref<number | string>('')
const availableYears = ref<number[]>([])
const availableMonths = ref<Month[]>([])

const archivedTrackings = ref<ArchivedTracking[]>([])
const staffList = ref<Staff[]>([]) // For getStaffInfo
const coordinators = ref<Coordinator[]>([]) // For getCoordinatorName

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const filteredTrackings = computed(() => {
  if (!debouncedSearch.value) return archivedTrackings.value
  return archivedTrackings.value.filter(t =>
    t.patient_name?.toLowerCase().includes(debouncedSearch.value.toLowerCase())
  )
})

async function fetchAvailableArchiveDates() {
  loading.value = true;
  error.value = '';
  try {
    const data = await $fetch<{ years: number[] }>('/api/archive/available-dates');
    if (data && Array.isArray(data.years)) {
      availableYears.value = data.years.sort((a: number, b: number) => b - a); // Sort descending
    } else {
      availableYears.value = [];
      console.warn("API response for available-dates did not contain a 'years' array:", data);
    }
  } catch (e: any) {
    console.error('Failed to fetch available archive dates:', e);
    error.value = 'Failed to load archive period options. ' + (e.data?.message || e.message || '');
    availableYears.value = []; // Ensure it's empty on error
  } finally {
    loading.value = false;
  }
}

async function fetchMonthsForYear() {
  if (!selectedYear.value) {
    availableMonths.value = [];
    selectedMonth.value = '';
    archivedTrackings.value = [];
    return;
  }
  loading.value = true;
  error.value = '';
  yearJustSelected.value = true;
  selectedMonth.value = ''; // Reset month when year changes
  archivedTrackings.value = []; // Clear previous results

  try {
    const data = await $fetch<{ months: number[] }>(`/api/archive/available-dates?year=${selectedYear.value}`);
    if (data && Array.isArray(data.months)) {
      availableMonths.value = data.months
        .sort((a: number, b: number) => a - b) // Sort ascending
        .map((monthNum: number) => ({ name: monthNames[monthNum - 1], value: monthNum }));
    } else {
      availableMonths.value = [];
      console.warn(`API response for available-dates?year=${selectedYear.value} did not contain a 'months' array:`, data);
    }
  } catch (e: any) {
    console.error(`Failed to fetch months for year ${selectedYear.value}:`, e);
    error.value = `Failed to load months for ${selectedYear.value}. ` + (e.data?.message || e.message || '');
    availableMonths.value = [];
  } finally {
    loading.value = false;
    yearJustSelected.value = false;
  }
}

async function fetchArchivedTrackings() {
  if (!selectedYear.value || !selectedMonth.value) {
    archivedTrackings.value = [];
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    if (staffList.value.length === 0) {
      const staffData = await $fetch<Staff[]>('/api/staff');
      staffList.value = staffData || [];
    }
    if (coordinators.value.length === 0) {
      const coordinatorsData = await $fetch<Coordinator[]>('/api/coordinators');
      coordinators.value = coordinatorsData || [];
    }

    const data = await $fetch<ArchivedTracking[]>(`/api/archive/entries/${selectedYear.value}/${selectedMonth.value}`);
    archivedTrackings.value = data || [];
  } catch (e: any) {
    console.error(`Failed to fetch archived trackings for ${selectedMonth.value}/${selectedYear.value}:`, e);
    error.value = `Failed to load archived records. ` + (e.data?.message || e.message || '');
    archivedTrackings.value = [];
  } finally {
    loading.value = false;
  }
}

function getStaffInfo(staffId: number): string {
  const staff = staffList.value.find(s => s.id === staffId);
  return staff ? `${staff.full_name} (${staff.occupation})` : staffId.toString();
}

function getCoordinatorName(coordinatorId?: number): string {
  if (!coordinatorId) return 'N/A';
  const coordinator = coordinators.value.find(c => c.id === coordinatorId);
  return coordinator ? (coordinator.last_name ? `${coordinator.first_name} ${coordinator.last_name}` : coordinator.first_name) : coordinatorId.toString();
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr; // fallback to original string if date is invalid
  }
}

function exportToCSV() {
  const rows = [
    [
      'Patient Name', 'Contact Person', 'Location', 'From', 'To', 'Hours/Day', 'Days/Week', 'Duration', 'Timing', 'Amount (BHD)', 'Holiday (BHD)', 'Total (BHD)', 'Paid', 'Contract Sent', 'Contract Signed', 'Status', 'Coordinator', 'Contract Status', 'Archived At'
    ],
    ...filteredTrackings.value.map(t => [
      t.patient_name,
      t.contact_person,
      t.location,
      formatDate(t.from_date),
      formatDate(t.to_date),
      t.hours_per_day,
      t.days_per_week,
      t.duration_days,
      t.timing,
      t.amount,
      t.holiday_amount,
      t.total,
      t.paid ? 'Paid' : 'Unpaid',
      t.contract_sent === null ? 'N/A' : t.contract_sent ? 'Sent' : 'Not Sent',
      t.contract_signed ? 'Signed' : 'Not Signed',
      t.status,
      getCoordinatorName(t.coordinator_id),
      t.contract_status,
      formatDate(t.archived_at)
    ])
  ]
  const csvContent = rows.map(e => e.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `archived_trackings_${selectedYear.value}_${selectedMonth.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Add ring-class helper to archive for contract_status
function getContractStatusRingClass(status?: string): string {
  switch (status) {
    case "Children's Contract":
      return 'ring-2 ring-pink-400 dark:ring-fuchsia-500/60';
    case 'Contract Valid':
      return 'ring-2 ring-green-400 dark:ring-green-500/60';
    case 'Contract Suspended':
      return 'ring-2 ring-yellow-400 dark:ring-yellow-500/60';
    case 'Contract Expired':
      return 'ring-2 ring-red-400 dark:ring-red-500/60';
    default:
      return 'ring-1 ring-secondary-300 dark:ring-secondary-600';
  }
}

const setCardSize = (size: number) => {
  cardSize.value = size;
  if (process.client) {
    localStorage.setItem('cardSize', String(size));
  }
};

const clearFilters = () => {
  selectedYear.value = '';
  selectedMonth.value = '';
  searchQuery.value = '';
  availableMonths.value = []; // Clear months as year is cleared
  archivedTrackings.value = []; // Clear current trackings
  error.value = ''; // Clear any errors
};

onMounted(() => {
  fetchAvailableArchiveDates();
});

</script>

<style scoped>
.fade-spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fade-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.floating-icon {
  animation: float 3s ease-in-out infinite;
  transform-origin: center;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
