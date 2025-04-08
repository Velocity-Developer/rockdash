<template>
  <nav class="h-full fixed top-0 start-0 bg-white z-[6] border-r border-border px-4 transition duration-300 ease-in-out" :class="{ 'md:w-[5rem] w-[14rem]': useConfig.miniSidebar, 'w-[14rem]': !useConfig.miniSidebar }">
    
    <div class="py-4 text-center">
      <nuxtLink to="/">
        <img src="~/public/vd.webp" class="w-[9rem] mx-auto" :class="{ 'md:hidden block': useConfig.miniSidebar, 'block': !useConfig.miniSidebar }"/>
        <img src="~/public/vdi.webp" class="w-[2rem] mx-auto hidden" :class="{ 'md:block': useConfig.miniSidebar}"/>
      </nuxtLink>
    </div>
    
    <ScrollPanel style="width: 100%; height: calc(100vh - 70px)">
      <PanelMenu
            :model="items"
            class="w-full border-none rounded-none !gap-0"
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
                        '!ps-0',
                    ]
                })
            }"
        >
          <template #item="{ item }">

              <button v-if="item.items" v-ripple :class="[classLink,{'bg-sky-700 text-white' : isActive(item.href)}]">
                  <span class="flex justify-start items-center">
                      <Icon v-if="item.icon" :name="item.icon" mode="svg" :ssr="true"/>
                      <span class="ms-2" :class="{ 'md:hidden': useConfig.miniSidebar}">{{ item.label }}</span>
                  </span>
                  <Icon v-if="item.items" name="lucide:chevron-down" />
              </button>
              <NuxtLink v-else :to="item.href" :class="[classLink,{'bg-sky-700 text-white' : isActive(item.href),'!justify-center': useConfig.miniSidebar}]">
                  <span class="flex justify-start items-center">
                      <Icon v-if="item.icon" :name="item.icon" mode="svg" :ssr="true"/>
                      <span class="ms-2" :class="{ 'md:hidden': useConfig.miniSidebar}">{{ item.label }}</span>
                  </span>
              </NuxtLink>

          </template>
      </PanelMenu>
    </ScrollPanel>

  </nav>
</template>

<script setup lang="ts">

//route, cek halaman aktif
const route = useRoute()
const isActive = (path : string) => {
  return route.path === path
}

const isChild = (key : any) => {
  return key.includes('_')? true : false
}

//daftar menu
const items = ref([
  {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'lucide:layout-grid',
      href:'/',
  },
  {
      key: 'billing',
      label: 'Billing',
      icon: 'lucide:briefcase-business',
      href:'/billing',
  },
  {
      key: 'users',
      label: 'Users',
      icon: 'lucide:users',
      href:'/users',
  },
]);

const classLink = 'w-full mb-0 flex items-center justify-between px-4 py-2 cursor-pointer rounded hover:bg-sky-200 hover:text-sky-900';

const useConfig = useConfigStore()
</script>