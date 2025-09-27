<template>
  <div class="relative h-screen w-full flex items-center justify-center bg-gradient-to-tr from-green-100 to-teal-100 dark:from-black dark:to-gray-950">
    
    <img src="/vd.webp" class="w-auto mx-auto max-w-[200px] animate-pulse relative z-2" alt="VD">

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

  const getconfig = await client('/api/dash/config') as any
  useConfig.setConfig(getconfig);

  //jika ada query test, tidak perlu redirect
  if (test.value) {
    return
  }
 
  if (isInPWA()) {
    // kasih delay biar splash terlihat
    setTimeout(() => {
      router.replace('/') // halaman utama homepage
    }, 2000)
  } else {
    // kalau bukan PWA, langsung ke homepage biasa
    router.replace('/')
  }
})
</script>