<template>

  <div class="flex w-full min-h-screen">
    <div class="body-wrapper w-full bg-white">
      <AppHeader />
      <div class="container mx-auto p-6">
        <slot />
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
</script>
