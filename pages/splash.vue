<template>
  <div class="h-screen w-full flex items-center justify-center bg-gradient-to-tr from-blue-100 to-teal-100 dark:from-black dark:to-gray-950">
    
    <img src="/vd.webp" class="w-auto mx-auto animate-pulse" alt="VD">

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
const router = useRouter()

onMounted(() => {
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