<template>

  <div class="flex w-full min-h-screen">

    <div class="page-wrapper flex w-full transition duration-300 ease-in-out" :class="{'md:ps-[5rem]': useConfig.miniSidebar,'md:ps-[14rem]': !useConfig.miniSidebar }">
      <div class="xl:block" :class="{ 'block z-[7]': openMenu, 'hidden md:block': !openMenu }">
        <div class="flex">
          <AppSidebar :toggleMini="minim"/>
        </div>
      </div>
      <div class="body-wrapper w-full bg-white">
        <AppHeader @toggle="toggleMenu" @toggleMini="toggleMini"/>
        <div class="container mx-auto p-6">

          <h1 v-if="$route.meta.title" class="text-lg md:text-2xl font-medium text-slate-900 mb-3 md:mb-5">
              {{ $route.meta.title }}
          </h1>

          <slot />

        </div>
      </div>

      <div 
      @click="openMenu = false" 
      class="fixed top-0 end-0 start-0 bottom-0 bg-black opacity-50 z-[6] md:hidden" 
      :class="{ 'hidden': !openMenu }"></div>

    </div>

  </div>

</template>

<script setup lang="ts">
  const useConfig = useConfigStore()
  const openMenu = ref(false);
  function toggleMenu() {
    openMenu.value = !openMenu.value
  }

  const minim = ref(false)
  function toggleMini() {
    minim.value = !minim.value
  }

</script>
