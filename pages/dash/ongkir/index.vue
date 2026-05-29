<script setup lang="ts">
definePageMeta({
  title: 'Api Ongkir',
  description: 'Api Ongkir Velocity Developer',
})
const client = useSanctumClient()

const { data: analyticsData} = await useAsyncData(
  'ongkir-vd-analytics', async () => await client('api/ongkir-vd/analytics'),
) as any

const { data: shippingLogChartData } = await useAsyncData(
  'ongkir-vd-analytic-shipping-log-chart', async () => await client('api/ongkir-vd/analytic-shipping-log-chart'),
) as any

const menus = [
  {
    title: 'Shipping Logs Hari ini',
    icon: 'lucide:scroll-text',
    link: '/dash/ongkir/shipping-logs',
    desc: 'Log request shipping',
    data: 'shipping_logs_today',
  },
  {
    title: 'KodePos tidak ditemukan',
    icon: 'lucide:map-pin-x',
    link: '/dash/ongkir/kodepos-logs',
    desc: 'Daftar request kodepos yang tidak ditemukan',
    data: 'kodepos_inactive',
  },
  {
    title: 'Kurir',
    icon: 'lucide:truck',
    link: '/dash/ongkir/couriers',
    desc: 'Daftar kurir yang tersedia',
    data: 'count_courier',
  },
  {
    title: 'Layanan Pengiriman',
    icon: 'lucide:package',
    link: '/dash/ongkir/couriers',
    desc: 'Daftar layanan pengiriman yang tersedia',
    data: 'count_courier_services',
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

      <div v-if="shippingLogChartData" class="border-b mb-5 pb-5">
        {{ shippingLogChartData }}
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NuxtLink
          v-for="menu in menus" 
          :key="menu.title"
          :to="menu.link"
          class="border border-gray-300 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900 rounded-md px-4 py-2"
        >        
          <div class="flex items-center gap-5 w-full">
            <Icon :name="menu.icon" size="3rem" class="text-teal-600 dark:text-teal-300"/>
            <div class="flex flex-col">
              <div>
                <span class="font-bold mr-1">{{ analyticsData?.[menu.data] }}</span>
                <span>{{ menu.title }}</span>
              </div>
              <span class="text-sm opacity-50">{{ menu.desc }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>

    </template>
  </Card>

</template>

<style scoped></style>
