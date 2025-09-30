<template>
  <div class="relative h-screen w-full flex items-center justify-center bg-gradient-to-tr from-green-100 to-teal-100 dark:from-emerald-950 dark:to-blue-950">
    
    <div class="mx-auto max-w-[80vw]">
      <img src="/vd.webp" class="w-auto mx-auto max-w-[200px] animate-pulse relative z-2" alt="VD">
      <ProgressBar mode="indeterminate" class="mt-4" style="height: 6px"></ProgressBar>
    </div>
  
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank',
  sanctum: {
      excluded: true,
  }
})
const router = useRouter()
const route = useRoute()
const test = computed(() => {
  return route.query.test || ''
})

const useConfig = useConfigStore()
const client = useSanctumClient();

onMounted( async () => {
  //jika ada query test, tidak perlu redirect
  if (test.value) {
    return
  }
 
  if (isInPWA()) {
    // Untuk PWA: tunggu getconfig dulu, baru redirect dengan delay
    const getconfig = await client('/api/dash/config') as any
    useConfig.setConfig(getconfig);
    
    // kasih delay biar splash terlihat
    setTimeout(() => {
      router.replace('/') // halaman utama homepage
    }, 100)
  } else {
    // Untuk non-PWA: redirect langsung tanpa tunggu getconfig
    router.replace('/')
    
    // Load config di background untuk halaman selanjutnya
    client('/api/dash/config').then((getconfig: any) => {
      useConfig.setConfig(getconfig);
    }).catch(() => {
      // Handle error jika diperlukan
    })
  }
})
</script>