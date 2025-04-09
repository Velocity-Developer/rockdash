<template>

  <div class="flex flex-col min-h-screen justify-between bg-white text-zinc-900">
    
    <div class="grow bg-gradient-to-r from-teal-100 to-sky-200 flex flex-col justify-center">
      <div class="flex flex-col justify-center p-2">
        <slot />
      </div>
    </div>
    
  </div>

</template>

<script setup lang="ts">
const useConfig = useConfigStore()
const client = useSanctumClient();

onMounted( async () => {
    const getconfig = await client('/api/config');
    useConfig.setConfig(getconfig);
});
</script>