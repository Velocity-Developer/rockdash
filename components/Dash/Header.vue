<template>
  <header :class="['header', { 'scrolled shadow': isScrolled }]" class="sticky top-0 z-[5] bg-white dark:bg-zinc-900 fixed w-full">

    <nav class="px-2 border-gray-700 rounded-none bg-transparent dark:bg-transparent py-3 sm:px-6">
      <div class="mx-auto flex flex-wrap items-center justify-between">

        <div class="flex items-center gap-1">
          <div>
            <Button variant="text" @click="useConfig.toggelOpenSidebar" class="md:!hidden">
              <Icon name="lucide:menu" />
            </Button>
            <Button variant="text" severity="secondary" @click="useConfig.toggelMiniSidebar" class="hidden md:inline-flex">
              <Icon v-if="useConfig.miniSidebar" name="lucide:panel-left-open" />
              <Icon v-else name="lucide:panel-left-close" />
            </Button>
          </div>
          <div class="flex flex-row items-center gap-2">
              <Button
                @click="visibleSearch = true"
                variant="text"
                severity="secondary"
                class="md:!rounded-full md:!py-1 md:!text-sm md:!border md:!border-zinc-300 md:dark:!border-zinc-700 md:justify-start md:w-[10rem]"
              >
                <Icon name="lucide:search" />
                <span class="hidden md:inline">Search</span>
            </Button>
          </div>
        </div>

        <div class="flex flex-row justify-end gap-2 items-center">

          <DashHeaderNotif />
          <DashDarkMode />
          <Avatar 
            :image="avatarUrl" 
            @click="toggleAvatar" 
            shape="circle" 
            class="cursor-pointer"        
            :pt="{
              image: (options) => ({
                  class: [
                      '!object-cover',
                  ]
              })
            }"
          />
          <Menu ref="menuAvatar" id="overlay_avatar_menu" :model="itemsAVatar" :popup="true" />

        </div>

      </div>
    </nav>

  </header>

  <Dialog v-model:visible="visibleSearch" modal header="Pencarian" :style="{ width: '30rem' }" :breakpoints="{ '1000px': '75vw', '575px': '90vw' }">
    <HeaderSearch @openlink="visibleSearch = false"/>
  </Dialog>

</template>

<script setup lang="ts">
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
        label: computed(() => useConfig.config.user.name?useConfig.config.user.name+' Profile':'User Profile'),
        items: [
            {
                label: 'Settings',
                command: () => navigateTo('/dash/users/'+useConfig.config.user.id) 
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
</script>