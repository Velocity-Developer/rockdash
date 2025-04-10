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


const route = useRoute();
const pageTitle = computed(() => route.meta.title?route.meta.title+' | '+useConfig.config.app_name : useConfig.config.app_name);
const pageDescription = computed(() =>(typeof route.meta.description === 'string') ? route.meta.description : useConfig.config.app_description);
const appFavicon = computed(() => useConfig.config.app_favicon || '');

useHead({
    title: pageTitle,
    meta: [
      {
        name: 'description',
        content: pageDescription
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: appFavicon
      }
    ]
  });
</script>