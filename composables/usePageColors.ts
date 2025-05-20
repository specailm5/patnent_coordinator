import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const usePageColors = () => {
  const route = useRoute()

  const colors = computed(() => {
    switch (route.path) {
      case '/':
        return {
          base: 'blue',
          text: 'text-blue-600 dark:text-blue-300',
          bgLight: 'bg-blue-50/50',
          bgSolid: 'bg-blue-600',
          bgDark: 'dark:bg-blue-900/30',
          border: 'border-blue-200 dark:border-blue-800/30',
          hover: 'hover:bg-blue-50/50 hover:text-blue-600 dark:hover:text-blue-300',
          gradient: 'from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300'
        }
      case '/patients':
        return {
          base: 'zinc',
          text: 'text-zinc-600 dark:text-zinc-300',
          bgLight: 'bg-zinc-50/50',
          bgSolid: 'bg-zinc-600',
          bgDark: 'dark:bg-zinc-900/30',
          border: 'border-zinc-200 dark:border-zinc-800/30',
          hover: 'hover:bg-zinc-50/50 hover:text-zinc-600 dark:hover:text-zinc-300',
          gradient: 'from-zinc-600 to-zinc-400 dark:from-zinc-400 dark:to-zinc-300'
        }
      case '/coordinators':
        return {
          base: 'rose',
          text: 'text-rose-600 dark:text-rose-300',
          bgLight: 'bg-rose-50/50',
          bgSolid: 'bg-rose-600',
          bgDark: 'dark:bg-rose-900/30',
          border: 'border-rose-200 dark:border-rose-800/30',
          hover: 'hover:bg-rose-50/50 hover:text-rose-600 dark:hover:text-rose-300',
          gradient: 'from-rose-600 to-rose-400 dark:from-rose-400 dark:to-rose-300'
        }
      case '/staff':
        return {
          base: 'emerald',
          text: 'text-emerald-600 dark:text-emerald-300',
          bgLight: 'bg-emerald-50/50',
          bgSolid: 'bg-emerald-600',
          bgDark: 'dark:bg-emerald-900/30',
          border: 'border-emerald-200 dark:border-emerald-800/30',
          hover: 'hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:text-emerald-300',
          gradient: 'from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300'
        }
      case '/tracking':
        return {
          base: 'indigo',
          text: 'text-indigo-600 dark:text-indigo-100',
          bgLight: 'bg-indigo-50/50',
          bgSolid: 'bg-indigo-600',
          bgDark: 'dark:bg-indigo-900/30',
          border: 'border-indigo-200 dark:border-indigo-800/30',
          hover: 'hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:text-indigo-300',
          gradient: 'from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300'
        }
      default:
        return {
          base: 'blue',
          text: 'text-blue-600 dark:text-blue-300',
          bgLight: 'bg-blue-50/50',
          bgSolid: 'bg-blue-600',
          bgDark: 'dark:bg-blue-900/30',
          border: 'border-blue-200 dark:border-blue-800/30',
          hover: 'hover:bg-blue-50/50 hover:text-blue-600 dark:hover:text-blue-300',
          gradient: 'from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300'
        }
    }
  })

  return {
    colors
  }
}
