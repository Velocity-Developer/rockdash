<script setup lang="ts">
definePageMeta({
  title: 'Api Ongkir',
  description: 'Api Ongkir Velocity Developer',
})

const menus = [
  {
    title: 'Shipping Logs',
    icon: 'lucide:scroll-text',
    link: '/dash/ongkir/shipping-logs',
    desc: 'Log request shipping',
  },
  {
    title: 'Kurir',
    icon: 'lucide:truck',
    link: '/dash/ongkir/couriers',
    desc: 'Daftar kurir yang tersedia',
  },
  {
    title: 'KodePos tidak ditemukan',
    icon: 'lucide:map-pin-x',
    link: '/dash/ongkir/kodepos-logs',
    desc: 'Daftar request kodepos yang tidak ditemukan',
  }
];
</script>

<template>

  <Card class="md:max-w-4xl mx-auto overflow-hidden">
    <template #header>
      <div class="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-4">
        <h3 class="text-lg font-bold">Api Ongkir</h3>
        <p class="text-sm">ongkir.velocitydeveloper.id</p>
      </div>
    </template>
    <template #content>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          v-for="menu in menus" 
          :key="menu.title"
          as="a"
          :href="menu.link"
          severity="contrast" variant="outlined"
          class="w-full"
        >
          <div class="flex items-center gap-5 w-full">
            <Icon :name="menu.icon" size="3rem" class="text-teal-600 dark:text-teal-300"/>
            <div class="flex flex-col">
              {{ menu.title }}
              <span class="text-sm opacity-50">{{ menu.desc }}</span>
            </div>
          </div>
        </Button>
      </div>

    </template>
  </Card>

</template>

<style scoped></style>
