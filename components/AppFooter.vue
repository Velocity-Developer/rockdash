<template>

  <footer class="p-4 md:px-8 text-xs flex justify-end items-center gap-2 opacity-75">
    <span class="flex justify-end gap-2">
      <Icon name="lucide:rocket" />
      <span>Built: {{ formatBuildDate(buildInfo.buildDate) }}</span>
    </span>
    <Badge v-if="isInPWA()" size="small" severity="success" class="animate-pulse">
      <Icon name="lucide:monitor-smartphone" class="mr-1"/> PWA
    </Badge>
  </footer>

</template>

<script setup lang="ts">
// Get app config
const appConfig = useAppConfig()

// Local state
const showBuildDetails = ref(false)
const currentYear = new Date().getFullYear()
const userAgent = ref('')

// Build info from app config
const buildInfo = computed(() => ({
  version: appConfig.version || '1.0.0',
  buildDate: appConfig.buildDate || new Date().toISOString(),
  buildNumber: appConfig.buildNumber || 'unknown',
  environment: appConfig.environment || 'development',
  buildHash: appConfig.buildHash || 'unknown'
}))

// Format build date
const formatBuildDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

// Get user agent on client side
onMounted(() => {
  if (process.client) {
    userAgent.value = navigator.userAgent
  }
})
</script>

<style scoped>
</style>