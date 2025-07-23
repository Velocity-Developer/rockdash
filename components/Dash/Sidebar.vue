<template>
  <nav class="group h-full fixed top-0 start-0 bg-white dark:bg-zinc-800 z-[999] border-r border-border dark:border-zinc-900 px-2 transition-all duration-500 ease-in-out" :class="{ 'md:w-[5rem] w-[14rem] hover:shadow': useConfig.miniSidebar, 'w-[14rem]': !useConfig.miniSidebar }">
    
    <div class="py-2 px-2 text-center">
      <nuxtLink to="/">
        <img v-if="useConfig.config.app_logo" :src="useConfig.config.app_logo" class="max-h-[40px] w-auto mx-auto" :class="{ 'md:hidden block': useConfig.miniSidebar, 'block': !useConfig.miniSidebar }"/>
        <img v-else src="~/public/vd.webp" class="max-h-[40px] w-auto mx-auto" :class="{ 'md:hidden block': useConfig.miniSidebar, 'block': !useConfig.miniSidebar }"/>
        
        <img v-if="useConfig.config.app_logo_small" :src="useConfig.config.app_logo_small" class="w-[2rem] mx-auto hidden" :class="{ 'md:block': useConfig.miniSidebar}"/>
        <img v-else src="~/public/vdi.webp" class="w-[2rem] mx-auto hidden" :class="{ 'md:block': useConfig.miniSidebar}"/>
      </nuxtLink>
    </div>
    
    <ScrollPanel style="width: 100%; height: calc(94vh - 70px)" class="px-2">
        
        <div v-if="AppMenus.length > 0">
            <PanelMenu
                :model="AppMenus"
                :pt="{
                    panel: (options) => ({
                        class: [
                            '!border-none',
                            '!bg-transparent',
                            '!pb-0',
                        ]
                    }),
                    rootList: (options) => ({
                        class: [
                            '!ps-0 bg-gray-100 dark:bg-zinc-700 rounded-lg overflow-hidden',
                        ]
                    })
                }"
            class="w-full border-none rounded-none !gap-0">
                <template #item="{ item }">
                    
                <button v-if="item.items" v-ripple v-tooltip="useConfig.miniSidebar ? item.label : ''" :class="[classLink,{'bg-primary-700 text-white dark:text-gray-100' : isActive(item.route),'md:!justify-center': useConfig.miniSidebar}]">
                    <span class="flex justify-start items-center">
                        <Icon v-if="item.icon" :name="item.icon" size="1.15rem" :ssr="true"/>
                        <span class="ms-2 text-sm text-left" :class="{ 'md:hidden': useConfig.miniSidebar}">{{ item.label }}</span>
                    </span>
                    <Icon v-if="item.items" name="lucide:chevron-down" />
                </button>
                <NuxtLink v-else :to="item.route" v-tooltip="useConfig.miniSidebar ? item.label : ''" :class="[classLink,{'bg-primary-700 text-white dark:text-gray-100' : isActive(item.route),'md:!justify-center': useConfig.miniSidebar}]" @click="useConfig.openSidebar = false">
                    <span class="flex justify-start items-center">
                        <Icon v-if="item.icon" :name="item.icon" size="1.15rem" :ssr="true"/>
                        <Icon v-else name="lucide:circle-small" size="small" class="opacity-50" :ssr="true"/>
                        <span class="ms-2 text-sm text-left" :class="{ 'md:hidden': useConfig.miniSidebar}">{{ item.label }}</span>
                    </span>
                </NuxtLink>

                </template>
            </PanelMenu>     
        </div>
        <ul v-else>
            <li v-for="index in 20" :key="index" class="mb-2">
                <Skeleton class="h-[40px]"></Skeleton>
            </li>
        </ul>

    </ScrollPanel>

    <div class="p-2">
        <Badge v-if="useConfig.config.role" class="truncate text-center bg-secondary !block pt-1 font-normal pb-1" v-tooltip="useConfig.config.role">
            {{ useConfig.config.role }}
        </Badge>
    </div>

  </nav>
</template>

<script setup lang="ts">
//route, cek halaman aktif
const route = useRoute()
const useConfig = useConfigStore()
const client = useSanctumClient();
const AppMenus = computed(() => useConfig.app_menus || [])

onMounted( async () => {
    const getconfig = await client('/api/dash/config') as any;
    useConfig.setConfig(getconfig);
});

const isActive = (path : string) => {
  return route.path === path
}

const classLink = 'w-full mb-0 md:mb-1 flex items-center justify-between px-4 py-2 cursor-pointer rounded hover:bg-primary-200 dark:hover:bg-primary-900 hover:text-primary-900 dark:hover:text-primary-100';

</script>