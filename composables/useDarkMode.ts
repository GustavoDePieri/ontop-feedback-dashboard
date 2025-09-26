export const useDarkMode = () => {
  // Reactive state for dark mode
  const isDarkMode = ref(false)

  // Initialize dark mode from localStorage or system preference
  const initializeDarkMode = () => {
    if (process.client) {
      // Check localStorage first
      const stored = localStorage.getItem('ontop-dark-mode')
      if (stored !== null) {
        isDarkMode.value = stored === 'true'
      } else {
        // Fall back to system preference
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      
      // Apply the initial theme
      applyTheme()
    }
  }

  // Apply theme to document
  const applyTheme = () => {
    if (process.client) {
      const html = document.documentElement
      if (isDarkMode.value) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    
    if (process.client) {
      // Save to localStorage
      localStorage.setItem('ontop-dark-mode', isDarkMode.value.toString())
      
      // Apply theme
      applyTheme()
    }
  }

  // Watch for changes and apply theme
  watch(isDarkMode, () => {
    applyTheme()
  })

  // Listen for system theme changes
  const watchSystemTheme = () => {
    if (process.client) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't manually set a preference
        const stored = localStorage.getItem('ontop-dark-mode')
        if (stored === null) {
          isDarkMode.value = e.matches
        }
      })
    }
  }

  return {
    isDarkMode: readonly(isDarkMode),
    toggleDarkMode,
    initializeDarkMode,
    watchSystemTheme
  }
}
