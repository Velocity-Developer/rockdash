<template>
  <header :class="['header', { 'scrolled shadow': isScrolled }]" class="shadow-sm sticky top-0 z-[5] bg-white dark:bg-zinc-900 w-full">

    <nav class="px-2 border-gray-700 rounded-none bg-transparent dark:bg-transparent py-3 sm:px-6">
      <div class="mx-auto flex flex-wrap items-center justify-between">

        <div class="flex items-center gap-1">
          <div>
            <Button variant="text" @click="useConfig.toggelOpenSidebar" class="md:!hidden">
              <Icon name="lucide:panel-left-open" />
            </Button>
            <Button variant="text" severity="secondary" @click="useConfig.toggelMiniSidebar" class="!hidden md:!inline-flex">
              <Icon v-if="useConfig.miniSidebar" name="lucide:panel-left-open" />
              <Icon v-else name="lucide:panel-left-close" />
            </Button>
          </div>
          <div v-if="$route.meta.title" class="hidden md:block">
            <h1 class="text-lg md:text-xl font-medium text-zinc-900 dark:text-primary-400 capitalize">
              {{ $route.meta.title }}
            </h1>
          </div>          
        </div>

        <div class="flex flex-row justify-end gap-2 items-center">
          <div class="flex flex-row items-center gap-2">
              <Button
                @click="visibleSearch = true"
                variant="text"
                severity="secondary"
                class="md:!rounded-full md:!py-1 md:!text-sm md:!border md:!border-zinc-300 md:dark:!border-zinc-700 md:!justify-start md:w-[10rem]"
              >
                <Icon name="lucide:search" />
                <span class="hidden md:inline">Search</span>
            </Button>
          </div>
          <DashHeaderNotif />
          <DashDarkMode />
          <Avatar 
            :image="avatarUrl" 
            @click="toggleAvatar" 
            shape="circle" 
            class="cursor-pointer !hidden md:!inline"        
            :pt="{
              image: (options) => ({
                  class: [
                      '!object-cover',
                  ]
              })
            }"
          />
          <Menu ref="menuAvatar" id="overlay_avatar_menu" :model="itemsAVatar" :popup="true" />
          <Avatar 
            :image="avatarUrl"
            @click="dialogAvatarMenu = true" 
            shape="circle" 
            class="cursor-pointer md:!hidden"        
            :pt="{
              image: (options) => ({
                  class: [
                      '!object-cover',
                  ]
              })
            }"
          />

        </div>

      </div>
    </nav>

  </header>

  <Dialog v-model:visible="visibleSearch" modal header="Pencarian" :style="{ width: '30rem' }" :breakpoints="{ '1000px': '75vw', '575px': '90vw' }">
    <HeaderSearch @openlink="visibleSearch = false"/>
  </Dialog>

  <Dialog v-model:visible="dialogAvatarMenu" modal :header="useConfig.config?.user?.name" position="top" :style="{ width: '30rem' }" :breakpoints="{ '1000px': '75vw', '575px': '90vw' }">
    <template #container="{ closeCallback }">
      <div>
        <Menu
          :model="itemsAVatar"
          :pt="{
              root: () => ({
                  class: [
                      '!border-0',
                  ]
              })
            }"
        />
        <div class="text-end">
          <Button 
          @click="dialogAvatarMenu = false" 
          severity="contrast"
          size="small"
          >Cancel</Button>
        </div>
      </div>    
  </template>
  </Dialog>

  <Dialog v-model:visible="dialogUserSetting" header="Pengaturan Profil" :style="{ width: '40rem', minHeight: '50vh' }" :breakpoints="{ '1000px': '40rem', '768px': '90vw' }" :modal="true">
    <DashUserForm :idUser="useConfig.config.user.id" :action="'edit'" @update="UserUpdate"/>
  </Dialog>
  
  <Dialog v-model:visible="dialogNotifSetting" header="Pengaturan Telegram" :style="{ width: '40rem', minHeight: '50vh' }" :breakpoints="{ '1000px': '40rem', '768px': '90vw' }" :modal="true">
    <DashUserNotifSettings/>
  </Dialog>

</template>

<script setup lang="ts">
const route = useRoute();
const useConfig = useConfigStore()
const { user, logout } = useSanctumAuth();
const isScrolled = ref(false);

// Fungsi untuk memeriksa posisi scroll
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50; // Ubah nilai 50 sesuai kebutuhan
};

// Tambahkan event listener saat komponen dimount
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

// Hapus event listener saat komponen di-unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

//menu avatar
const avatarUrl = computed(() => useConfig.config.user?.avatar_url);
const menuAvatar = ref();
const itemsAVatar = ref([
    {
        label: computed(() => useConfig.config.user.name?useConfig.config.user.name:'User Profile'),
        items: [
            // {
            //     label: 'Settings',
            //     command: () => navigateTo('/dash/users/'+useConfig.config.user.id) 
            // },
            {
                label: 'Pengaturan',
                command: () => dialogUserSetting.value = true 
            },
            {
                label: 'Telegram',
                command: () => dialogNotifSetting.value = true 
            },
            {
                label: 'Logout',
                command: () => logout()
            }
        ]
    }
]);
const toggleAvatar = (event: any) => {
  menuAvatar.value.toggle(event);
};

const visibleSearch = ref(false);
const dialogAvatarMenu = ref(false);
const dialogUserSetting = ref(false);
const dialogNotifSetting = ref(false);

//
const client = useSanctumClient();
const UserUpdate = async () => {
  dialogUserSetting.value = false;
  const getconfig = await client('/api/dash/config') as any;
  useConfig.setConfig(getconfig);
}
</script>