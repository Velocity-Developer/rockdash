<template>
  <Chart
    type="doughnut"
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  datachart: {
    type: Array,
    required: true,
    default: () => []
  }
});

const chartData = ref({});
const chartOptions = ref({});

const setChartData = () => {
  const labels = props.datachart?.map(item => item.name?.trim()) ?? ['(kosong)'];
  const datas = props.datachart?.map(item => item.total) ?? [100];

  return {
    labels,
    datasets: [
      {
        data: datas,
        backgroundColor: [
          '#42A5F5',
          '#66BB6A',
          '#FFA726',
          '#AB47BC',
          '#EC407A',
          '#FF7043'
        ]
      }
    ]
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');

  return {
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: textColor
        }
      }
    }
  };
};

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

watch(
  () => props.datachart,
  () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
  },
  { deep: true }
);
</script>
