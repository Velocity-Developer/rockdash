<template>
  <Card class="shadow-sm">
    <template #header>
      <div class="px-4 py-2">Grafik Project 1 Tahun terakhir</div>
    </template>
    <template #content>
      
      <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]"/>
      
    </template>
  </Card>
</template>

<script setup lang="ts">
const client = useSanctumClient();

const { data } = await useAsyncData(
  'dashboard-chart_project_tahun_terakhir_webdeveloper',
  () => client('/api/dashboard/chart_project_tahun_terakhir_webdeveloper')
) as any

const chartData = ref();
const chartOptions = ref();

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

const setChartData = () => {
  if (data.value?.datasets) {
    return {
      labels: data.value.labels,
      datasets: data.value.datasets
    }
  }

  return {
    labels: data.value?.labels,
    datasets: [
      {
        label: 'Project',
        data: data.value?.data,
        backgroundColor: [
          '#3B82F6',
          '#22C55E',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#A3E635',
          '#F472B6',
          '#10B981',
          '#F97316'
        ],
        hoverOffset: 6
      }
    ]
  }
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.20,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      },
      tooltip: {
        enabled: true
      },
      colors: {
        enabled: true
      }
    }
  }
}
</script>
