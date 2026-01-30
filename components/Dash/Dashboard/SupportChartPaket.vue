<script setup lang="ts">
const emit = defineEmits(['update']);
const client = useSanctumClient();

const { data } = await useAsyncData(
  'dashboard-analytic-support-paket',
  () => client('/api/dashboard/analytic/support/paket')
) as any

const chartData = ref();
const chartOptions = ref();

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const setChartData = () => {
    if (!data.value) return null;

    const labels = data.value.map((item: any) => item.paket);
    const totals = data.value.map((item: any) => item.total);

    // Generate random colors or use a palette
    const backgroundColors = [
        '#FFB0B0', '#FFD09B', '#FFECC8', '#FFF7D1', '#A594F9',
        '#CDC1FF', '#F5EFFF', '#295F98', '#D2DCB6', '#F1F3E0'
    ];

    return {
        labels: labels,
        datasets: [
            {
                label: 'Jumlah Paket',
                data: totals,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 1
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        }
    };
}
</script>

<template>
  <Card class="dark:bg-zinc-800 h-full">
    <template #header>
        <div class="px-4 py-4 flex items-center gap-2 border-b dark:border-zinc-700">
            <Icon name="lucide:pie-chart" class="w-5 h-5" />
            <h2 class="font-semibold text-sm">Statistik Paket 'Projek Update' bulan ini</h2>
        </div>
    </template>
    <template #content>
      <div class="p-2 h-[450px]">
        <Chart v-if="chartData" type="doughnut" :data="chartData" :options="chartOptions" class="h-full w-full" />
        <div v-else class="flex items-center justify-center h-full text-zinc-500">
            No data available
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
