<script setup lang="ts">
const emit = defineEmits(['update']);
const client = useSanctumClient();

const { data } = await useAsyncData(
  'dashboard-analytic-support-jurnal_daily',
  () => client('/api/dashboard/analytic/support/jurnal_daily')
) as any

const chartData = ref();
const chartOptions = ref();


onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const setChartData = () => {
    if (!data.value) return null;

    const rawData = data.value;
    
    // Get unique dates for labels
    const labels = [...new Set(rawData.map((item: any) => item.date))].sort();
    
    // Get unique categories
    const categories = [...new Set(rawData.map((item: any) => item.category))];

    // Prepare datasets
    const datasets = categories.map((category: any, index: number) => {
        const categoryData = labels.map((date: any) => {
            const entry = rawData.find((item: any) => item.date === date && item.category === category);
            return entry ? entry.total : 0;
        });

        return {
            label: category,
            data: categoryData,
            borderWidth: 1
        };
    });

    return {
        labels: labels,
        datasets: datasets
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            tooltips: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
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
              <Icon name="lucide:chart-no-axes-column-increasing" class="w-5 h-5" />
              <h2 class="font-semibold text-sm">Statistik Journal bulan ini</h2>
          </div>
      </template>
      <template #content>
        <div class="p-2 h-[450px]">
          <Chart v-if="chartData" type="bar" :data="chartData" :options="chartOptions" class="h-full w-full" />
          <div v-else class="flex items-center justify-center h-full text-zinc-500">
              No data available
          </div>
        </div>
      </template>
  </Card>
</template>

<style scoped></style>
