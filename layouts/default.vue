<template>

  <div class="flex w-full min-h-screen">

    <div class="page-wrapper flex w-full transition duration-300 ease-in-out" :class="{'md:ps-[5rem]': useConfig.miniSidebar,'md:ps-[14rem]': !useConfig.miniSidebar }">
      <div class="xl:block" :class="{ 'block z-[90]': useConfig.openSidebar, 'hidden md:block': !useConfig.openSidebar }">
        <div class="flex">
          <DashSidebar/>
        </div>
      </div>
      <div class="body-wrapper w-full bg-gradient-to-tr from-blue-50 to-teal-50 dark:from-black dark:to-gray-950">
        <DashHeader />
        <div class="md:max-w-[1600px] mx-auto px-4 py-4 relative">
          
            <div v-if="$route.meta.title" class="md:hidden mb-5">
              <h1 class="text-lg md:text-xl font-medium text-zinc-900 dark:text-primary-400 capitalize">
                {{ $route.meta.title }}
              </h1>
            </div> 

            <div class="md:absolute z-[100] md:end-2 md:top-2 mb-3 text-right">
              <Message v-if="$route.meta.development" severity="warn" closable>
                <Icon name="lucide:alert-triangle"/>
                Halaman masih dalam pengerjaan
              </Message>
            </div>

          <slot />

        </div>
      </div>

      <div 
      @click="useConfig.openSidebar = false" 
      class="fixed top-0 end-0 start-0 bottom-0 bg-black opacity-50 z-[80] md:hidden" 
      :class="{ 'hidden': !useConfig.openSidebar }"></div>

    </div>

  </div>

</template>

<script setup lang="ts">
  const useConfig = useConfigStore()

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
