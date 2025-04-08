<template>
  <header class="sticky top-0 z-[5] bg-white dark:bg-dark shadow fixed w-full">

    <nav class="px-2 border-gray-700 rounded-none bg-transparent dark:bg-transparent py-4 sm:px-6">
      <div class="mx-auto flex flex-wrap items-center justify-between">

        <div>
          <nuxt-link to="/">
            <img src="~/public/vd.webp" class="w-[8rem]"/>
          </nuxt-link>
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