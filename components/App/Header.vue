<template>
  <header :class="['header', { 'scrolled shadow': isScrolled }]" class="sticky top-0 z-[5] bg-white fixed w-full">

    <nav class="px-2 border-gray-700 rounded-none bg-transparent dark:bg-transparent py-4 sm:px-6">
      <div class="mx-auto flex flex-wrap items-center justify-between">

        <div>
          <Button variant="text" @click="emit('toggle')" class="md:hidden">
            <Icon name="lucide:menu" />
          </Button>
          <Button variant="text" @click="useConfig.toggelMiniSidebar" class="hidden md:block">
            <Icon name="lucide:menu" />
          </Button>
        </div>
        <div class="text-end">
          <Button @click="logout">
            <Icon name="lucide:log-out" />
          </Button>
        </div>

      </div>
    </nav>

  </header>
</template>

<script setup lang="ts">
const useConfig = useConfigStore()

const emit = defineEmits(['toggle','toggleMini']);
const { user, logout } = useSanctumAuth() as { user: Ref<User | null>, logout: () => void };
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
</script>