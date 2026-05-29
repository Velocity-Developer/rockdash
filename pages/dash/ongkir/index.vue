<script setup lang="ts">
definePageMeta({
  title: 'Api Ongkir',
  description: 'Api Ongkir Velocity Developer',
})
const client = useSanctumClient()

const { data: analyticsData} = await useAsyncData(
  'ongkir-vd-analytics', async () => await client('api/ongkir-vd/analytics'),
) as any

const selectedPeriod = ref()

const { data: shippingLogChartData, pending: shippingLogChartPending, refresh: refreshShippingLogChartData } = await useAsyncData(
  'ongkir-vd-analytic-shipping-log-chart',
  async () => await client('api/ongkir-vd/analytic-shipping-log-chart', {
    method: 'GET',
    params: selectedPeriod.value
      ? { period: selectedPeriod.value }
      : {},
  }),
) as any

const shippingLogChart = computed(() => {
  const items = Array.isArray(shippingLogChartData.value?.items)
    ? shippingLogChartData.value.items
    : []

  return {
    labels: items.map((item: any) => item.label),
    datasets: [
      {
        label: 'Shipping Logs',
        data: items.map((item: any) => Number(item.total || 0)),
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.18)',
        pointBackgroundColor: '#0d9488',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.35,
      },
    ],
  }
})

const periodOptions = computed(() => {
  return Array.isArray(shippingLogChartData.value?.period_options)
    ? shippingLogChartData.value.period_options
    : []
})

const shippingLogChartOptions = ref()

watch(
  shippingLogChartData,
  (value: any) => {
    if (!selectedPeriod.value && value?.period) {
      selectedPeriod.value = value.period
    }
  },
  { immediate: true },
)

const updateShippingLogChartPeriod = async () => {
  await refreshShippingLogChartData()
}

onMounted(() => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

  shippingLogChartOptions.value = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          color: textColor,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Total: ${context.parsed.y || 0}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColorSecondary,
          precision: 0,
        },
        grid: {
          color: surfaceBorder,
        },
      },
    },
  }
})

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

      <div v-if="shippingLogChartData" class="border-b border-gray-200 dark:border-gray-700 mb-5 pb-5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div>
            <h4 class="font-bold">Grafik Shipping Logs</h4>
            <p class="text-sm opacity-60">
              {{ shippingLogChartData.start_date }} - {{ shippingLogChartData.end_date }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Select
              v-model="selectedPeriod"
              :options="periodOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full md:w-64"
              size="small"
              placeholder="Pilih periode"
              :loading="shippingLogChartPending"
              @change="updateShippingLogChartPeriod"
            />
          </div>
        </div>

        <div class="h-[18rem] md:h-[24rem]">
          <Chart
            v-if="shippingLogChartData.items?.length"
            type="line"
            :data="shippingLogChart"
            :options="shippingLogChartOptions"
            class="h-full w-full"
          />
          <div v-else class="h-full flex items-center justify-center text-sm opacity-60">
            Tidak ada data chart
          </div>
        </div>
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
