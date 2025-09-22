export const usePwaUpdate = () => {
  const showUpdateNotification = ref(false)
  const isUpdating = ref(false)

  // Handle PWA update
  const updatePwa = async () => {
    isUpdating.value = true
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration && registration.waiting) {
          // Tell the waiting service worker to skip waiting and become active
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          
          // Listen for the controlling service worker change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Reload the page to get the latest content
            window.location.reload()
          })
        } else {
          // Force update check
          await registration?.update()
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Error updating PWA:', error)
      isUpdating.value = false
    }
  }

  // Dismiss update notification
  const dismissUpdate = () => {
    showUpdateNotification.value = false
    
    // Store dismissal in localStorage to prevent showing again for a while
    localStorage.setItem('pwa-update-dismissed', Date.now().toString())
  }

  // Check if update was recently dismissed
  const wasRecentlyDismissed = () => {
    const dismissed = localStorage.getItem('pwa-update-dismissed')
    if (!dismissed) return false
    
    const dismissedTime = parseInt(dismissed)
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    
    return (Date.now() - dismissedTime) < oneHour
  }

  // Initialize PWA update detection
  const initPwaUpdateDetection = async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      // Don't show notification if recently dismissed
      if (wasRecentlyDismissed()) return

      // Register service worker message listener
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          showUpdateNotification.value = true
        }
      })

      // Check for updates function
      const checkForUpdates = async () => {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          
          if (registration.waiting && !wasRecentlyDismissed()) {
            showUpdateNotification.value = true
          }
        }
      }

      // Initial check
      await checkForUpdates()

      // Periodic checks every 5 minutes
      setInterval(checkForUpdates, 5 * 60 * 1000)

      // Listen for new service worker installations
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && 
                  navigator.serviceWorker.controller && 
                  !wasRecentlyDismissed()) {
                showUpdateNotification.value = true
              }
            })
          }
        })
      }

      // Listen for page visibility changes to check for updates
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          checkForUpdates()
        }
      })

    } catch (error) {
      console.error('Error initializing PWA update detection:', error)
    }
  }

  // Force check for updates
  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          
          if (registration.waiting && !wasRecentlyDismissed()) {
            showUpdateNotification.value = true
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }
  }

  return {
    showUpdateNotification: readonly(showUpdateNotification),
    isUpdating: readonly(isUpdating),
    updatePwa,
    dismissUpdate,
    initPwaUpdateDetection,
    checkForUpdates
  }
}