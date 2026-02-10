<template>

  <div class="flex justify-end mb-2">
    <SelectButton v-model="typeChart" :options="['doughnut', 'bar']" size="small" class="uppercase" />
  </div>

  <Chart
    v-if="typeChart=='doughnut'"
    type="doughnut"
    :data="chartData"
    :options="chartOptions"
  />

  <Chart
    v-if="typeChart=='bar'"
    type="bar"
    :data="chartDataBar"
    :options="chartOptionsBar"
  />

</template>

<script setup lang="ts">
const props = defineProps({
  datachart: {
    type: Array,
    required: true,
    default: () => [] as any
  } as any
});

const typeChart = ref('doughnut');
const chartData = ref({} as any);
const chartOptions = ref({} as any);
const chartDataBar = ref({} as any);
const chartOptionsBar = ref({} as any);

const setChartData = () => {
  const labels = props.datachart?.map((item: { name?: string }) => item.name?.trim()) ?? ['(kosong)'];
  const datas = props.datachart?.map((item: { total_bobot: number }) => item.total_bobot) ?? [100];

  return {
    labels,
    datasets: [
      {
        data: datas,
        // backgroundColor: [
        //   '#42A5F5',
        //   '#66BB6A',
        //   '#FFA726',
        //   '#AB47BC',
        //   '#EC407A',
        //   '#FF7043'
        // ]
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
    if (typeChart.value == 'bar') {
      chartDataBar.value = setChartDataBar();
      chartOptionsBar.value = setChartOptionsBar();
    } else {      
      chartData.value = setChartData();
      chartOptions.value = setChartOptions();
    }
  },
  { deep: true }
);

const setChartDataBar = () => {
    return {
        labels: props.datachart?.map((item: { name?: string }) => item.name?.trim()) ?? ['(kosong)'],
        datasets: [
            {
                label: 'Poin',
                data: props.datachart?.map((item: { total_bobot: number }) => item.total_bobot) ?? [100],
                backgroundColor: ['#42A5F5','#66BB6A', '#FFA726','#AB47BC','#EC407A', '#FF7043'],
                // borderColor: ['rgb(249, 115, 22)', 'rgb(6, 182, 212)', 'rgb(107, 114, 128)', 'rgb(139, 92, 246)'],
                // borderWidth: 1
            }
        ]
    };
};

const setChartOptionsBar = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                beginAtZero: true,
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

watch(
  () => typeChart.value,
  () => {
    if (typeChart.value == 'bar') {
      chartDataBar.value = setChartDataBar();
      chartOptionsBar.value = setChartOptionsBar();
    }
  }
);
</script>
