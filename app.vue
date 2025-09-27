<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
  <ConfirmDialog/>
  <PwaUpdateNotification 
    :show="showUpdateNotification" 
    @update="updatePwa"
    @dismiss="dismissUpdate"
  />
</template>

<script setup lang="ts">
// Use PWA update composable
const { 
  showUpdateNotification, 
  updatePwa, 
  dismissUpdate, 
  initPwaUpdateDetection 
} = usePwaUpdate()

// Initialize dark mode globally
const initDarkMode = () => {
  if (process.client) {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'true') {
      document.documentElement.classList.add('dark');
    } else if (darkModePreference === 'false') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default: check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      }
    }
  }
}

// Initialize on mount
onMounted(() => {
  initPwaUpdateDetection()
  initDarkMode()
})

// Initialize immediately for SSR
if (process.client) {
  initDarkMode()
}
</script>