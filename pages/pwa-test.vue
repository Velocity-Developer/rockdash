<template>
  <div class="container mx-auto p-6">
    <Card class="max-w-2xl mx-auto">
      <template #header>
        <div class="px-6 py-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="lucide:smartphone" class="w-6 h-6" />
            PWA Update Test
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mt-1">
            Halaman untuk testing fitur notifikasi update PWA
          </p>
        </div>
      </template>
      
      <template #content>
        <div class="space-y-6">
          <!-- PWA Status -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Status PWA</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">Service Worker:</span>
                <span :class="swStatus.supported ? 'text-green-600' : 'text-red-600'" class="ml-2 font-medium">
                  {{ swStatus.supported ? 'Didukung' : 'Tidak Didukung' }}
                </span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Status:</span>
                <span :class="swStatus.registered ? 'text-green-600' : 'text-yellow-600'" class="ml-2 font-medium">
                  {{ swStatus.registered ? 'Terdaftar' : 'Belum Terdaftar' }}
                </span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Update Tersedia:</span>
                <span :class="swStatus.updateAvailable ? 'text-orange-600' : 'text-green-600'" class="ml-2 font-medium">
                  {{ swStatus.updateAvailable ? 'Ya' : 'Tidak' }}
                </span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Notifikasi Aktif:</span>
                <span :class="showUpdateNotification ? 'text-blue-600' : 'text-gray-600'" class="ml-2 font-medium">
                  {{ showUpdateNotification ? 'Ya' : 'Tidak' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Test Actions -->
          <div class="space-y-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Aksi Test</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                @click="simulateUpdate"
                :loading="isSimulating"
                class="w-full"
                severity="info"
              >
                <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
                Simulasi Update Tersedia
              </Button>
              
              <Button 
                @click="checkForUpdates"
                :loading="isChecking"
                class="w-full"
                severity="secondary"
              >
                <Icon name="lucide:search" class="w-4 h-4 mr-2" />
                Cek Update Manual
              </Button>
              
              <Button 
                @click="forceReload"
                class="w-full"
                severity="warning"
              >
                <Icon name="lucide:rotate-ccw" class="w-4 h-4 mr-2" />
                Force Reload
              </Button>
              
              <Button 
                @click="clearCache"
                :loading="isClearing"
                class="w-full"
                severity="danger"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>

          <!-- Logs -->
          <div class="space-y-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">Log Aktivitas</h3>
            <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
              <div v-for="(log, index) in logs" :key="index" class="mb-1">
                <span class="text-gray-500">[{{ log.time }}]</span> {{ log.message }}
              </div>
              <div v-if="logs.length === 0" class="text-gray-500">
                Belum ada aktivitas...
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Cara Testing:</h4>
            <ol class="text-blue-800 dark:text-blue-200 text-sm space-y-1 list-decimal list-inside">
              <li>Klik "Simulasi Update Tersedia" untuk memunculkan notifikasi</li>
              <li>Klik "Cek Update Manual" untuk memeriksa update secara manual</li>
              <li>Gunakan "Force Reload" untuk memuat ulang aplikasi</li>
              <li>Gunakan "Clear Cache" untuk membersihkan cache service worker</li>
            </ol>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
// Use PWA update composable
const { 
  showUpdateNotification, 
  checkForUpdates: checkUpdates,
  initPwaUpdateDetection 
} = usePwaUpdate()

// Local state
const isSimulating = ref(false)
const isChecking = ref(false)
const isClearing = ref(false)
const logs = ref<Array<{time: string, message: string}>>([])

// PWA Status
const swStatus = ref({
  supported: false,
  registered: false,
  updateAvailable: false
})

// Add log entry
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message })
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// Check PWA status
const checkPwaStatus = async () => {
  swStatus.value.supported = 'serviceWorker' in navigator
  
  if (swStatus.value.supported) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      swStatus.value.registered = !!registration
      swStatus.value.updateAvailable = !!(registration && registration.waiting)
      
      addLog(`Service Worker status: ${swStatus.value.registered ? 'Registered' : 'Not registered'}`)
      if (swStatus.value.updateAvailable) {
        addLog('Update tersedia!')
      }
    } catch (error) {
      addLog(`Error checking SW status: ${error}`)
    }
  } else {
    addLog('Service Worker tidak didukung di browser ini')
  }
}

// Simulate update available
const simulateUpdate = async () => {
  isSimulating.value = true
  addLog('Memulai simulasi update...')
  
  try {
    // Simulate showing notification directly
    // In real scenario, this would be triggered by actual SW update
    setTimeout(() => {
      // Force show notification for testing
      const event = new CustomEvent('pwa-update-available')
      window.dispatchEvent(event)
      addLog('Notifikasi update disimulasikan')
      isSimulating.value = false
    }, 1000)
    
  } catch (error) {
    addLog(`Error simulasi: ${error}`)
    isSimulating.value = false
  }
}

// Manual check for updates
const checkForUpdates = async () => {
  isChecking.value = true
  addLog('Memeriksa update manual...')
  
  try {
    await checkUpdates()
    await checkPwaStatus()
    addLog('Pemeriksaan update selesai')
  } catch (error) {
    addLog(`Error checking updates: ${error}`)
  } finally {
    isChecking.value = false
  }
}

// Force reload
const forceReload = () => {
  addLog('Force reload aplikasi...')
  window.location.reload()
}

// Clear cache
const clearCache = async () => {
  isClearing.value = true
  addLog('Membersihkan cache...')
  
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      addLog(`${cacheNames.length} cache berhasil dihapus`)
    }
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
        addLog('Service Worker unregistered')
      }
    }
    
    addLog('Cache berhasil dibersihkan')
  } catch (error) {
    addLog(`Error clearing cache: ${error}`)
  } finally {
    isClearing.value = false
  }
}

// Watch for notification changes
watch(showUpdateNotification, (newValue) => {
  if (newValue) {
    addLog('Notifikasi update ditampilkan')
  } else {
    addLog('Notifikasi update disembunyikan')
  }
})

// Initialize on mount
onMounted(async () => {
  addLog('PWA Test page loaded')
  await checkPwaStatus()
  
  // Listen for custom events
  window.addEventListener('pwa-update-available', () => {
    // Trigger the notification manually for testing
    // This simulates what would happen in real update scenario
    addLog('Custom event: PWA update available')
  })
})

// Set page meta
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})
</script>