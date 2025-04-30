<template>
    <div class="card">
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-[30rem]" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps(['data'])
const dataTable = props.data

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();
        
const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    // Ambil array tgl_masuk dari dataTable sebagai labels
    const setlabels = [...new Set(dataTable.map((item: any) => item.tgl_masuk))];

    // Buat datasets berdasarkan jenis
    const jenisGroups = dataTable.reduce((acc: any, curr: any) => {
        if (!acc[curr.jenis]) {
            acc[curr.jenis] = [];
        }
        acc[curr.jenis].push(curr);
        return acc;
    }, {});

    const datasets = Object.keys(jenisGroups).map((jenis: any) => {
        const setdatas = setlabels.map((label: any) => {
            const item = jenisGroups[jenis].find((data: any) => data.tgl_masuk === label);
            return item ? item.biaya : 0; // Jika tidak ada data untuk label tertentu, isi dengan 0
        });

        return {
            label: jenis,
            data: setdatas,
            fill: false,
            tension: 0.4
        };
    });

    return {
        labels: setlabels,
        datasets: datasets
    };
};

const setChartOptions = () => {
    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6
    };
}
</script>
