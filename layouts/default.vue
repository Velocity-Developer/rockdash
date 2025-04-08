<template>

  <div class="flex w-full min-h-screen">

    <div class="page-wrapper flex w-full md:ps-[14rem]">
      <div class="xl:block" :class="{ 'block z-[7]': openMenu, 'hidden md:block': !openMenu }">
        <div class="flex">
          <AppSidebar/>
        </div>
      </div>
      <div class="body-wrapper w-full bg-white">
        <AppHeader @toggle="toggleMenu"/>
        <div class="container mx-auto p-6">
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
  const openMenu = ref(false);
  function toggleMenu() {
    openMenu.value = !openMenu.value
  }
</script>
