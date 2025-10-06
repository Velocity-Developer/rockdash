export const usePwaUpdate = () => {
  const showUpdateNotification = ref(false)
  const isUpdating = ref(false)
  const updateCompleted = ref(false)
  
  // Track last update check to prevent excessive requests
  let lastUpdateCheck = 0
  let checkInterval = 30 * 60 * 1000 // Start with 30 minutes
  const maxCheckInterval = 4 * 60 * 60 * 1000 // Max 4 hours
  const minCheckInterval = 15 * 60 * 1000 // Min 15 minutes
  let visibilityCheckThrottle = false

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

  // Automatically apply update when available
  const autoUpdatePwa = async () => {
    isUpdating.value = true
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration && registration.waiting) {
          // Tell the waiting service worker to skip waiting and become active
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          
          // Set flag that update is completed
          updateCompleted.value = true
          
          // Listen for the controlling service worker change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Show notification that update has been applied
            showUpdateNotification.value = true
            
            // Reload the page to get the latest content after a short delay
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          })
        } else {
          // Force update check
          await registration?.update()
          updateCompleted.value = true
          showUpdateNotification.value = true
          
          // Reload the page to get the latest content after a short delay
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error auto-updating PWA:', error)
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
      // Register service worker message listener
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          // Auto update when new version is available
          autoUpdatePwa()
        }
      })

      // Check for updates function with throttling and exponential backoff
      const checkForUpdates = async (forceCheck = false) => {
        const now = Date.now()
        
        // Throttle checks to prevent excessive requests
        if (!forceCheck && (now - lastUpdateCheck) < minCheckInterval) {
          console.log('Update check throttled - too soon since last check')
          return
        }
        
        lastUpdateCheck = now
        
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            await registration.update()
            
            if (registration.waiting) {
              // Auto update when new version is available
              autoUpdatePwa()
              // Reset interval on successful update
              checkInterval = 30 * 60 * 1000
            } else {
              // Implement exponential backoff if no update found
              checkInterval = Math.min(checkInterval * 1.5, maxCheckInterval)
              console.log(`No update found, next check in ${Math.round(checkInterval / 60000)} minutes`)
            }
          }
        } catch (error) {
          console.error('Error during update check:', error)
          // Increase interval on error
          checkInterval = Math.min(checkInterval * 2, maxCheckInterval)
        }
      }

      // Initial check
      await checkForUpdates(true)

      // Periodic checks with dynamic interval
      const scheduleNextCheck = () => {
        setTimeout(async () => {
          await checkForUpdates()
          scheduleNextCheck()
        }, checkInterval)
      }
      scheduleNextCheck()

      // Listen for new service worker installations
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Auto update when new version is available
                autoUpdatePwa()
              }
            })
          }
        })
      }

      // Listen for page visibility changes to check for updates (with throttling)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !visibilityCheckThrottle) {
          visibilityCheckThrottle = true
          checkForUpdates()
          
          // Reset throttle after 5 minutes
          setTimeout(() => {
            visibilityCheckThrottle = false
          }, 5 * 60 * 1000)
        }
      })

    } catch (error) {
      console.error('Error initializing PWA update detection:', error)
    }
  }

  // Force check for updates (bypasses throttling)
  const forceCheckForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          
          if (registration.waiting) {
            // Auto update when new version is available
            autoUpdatePwa()
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
    updateCompleted: readonly(updateCompleted),
    updatePwa,
    autoUpdatePwa,
    dismissUpdate,
    initPwaUpdateDetection,
    checkForUpdates: forceCheckForUpdates
  }
}