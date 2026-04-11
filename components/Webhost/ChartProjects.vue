<template>
    <div class="card">
        <Chart v-if="chartData" type="line" :data="chartData" :options="chartOptions" class="h-[30rem]" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    data: {
        type: Array,
        default: () => []
    }
})

const palette = [
    '#2563eb',
    '#16a34a',
    '#dc2626',
    '#ca8a04',
    '#7c3aed',
    '#0891b2',
    '#ea580c',
    '#db2777'
]

const normalizedData = computed(() => {
    return Array.isArray(props.data) ? props.data : []
})

const chartData = computed(() => {
    const sorted = [...normalizedData.value].sort((a: any, b: any) => {
        return String(a?.tgl_masuk || '').localeCompare(String(b?.tgl_masuk || ''))
    })

    const labels = [...new Set(sorted.map((item: any) => item?.tgl_masuk).filter(Boolean))]

    const jenisGroups = sorted.reduce((acc: any, curr: any) => {
        const jenis = curr?.jenis || 'Lainnya'
        if (!acc[jenis]) {
            acc[jenis] = []
        }
        acc[jenis].push(curr)
        return acc
    }, {})

    const datasets = Object.keys(jenisGroups).map((jenis: string, index: number) => {
        const color = palette[index % palette.length]
        const dataByDate = jenisGroups[jenis].reduce((acc: Record<string, number>, item: any) => {
            const date = item?.tgl_masuk
            if (!date) {
                return acc
            }

            acc[date] = (acc[date] || 0) + (Number(item?.biaya) || 0)
            return acc
        }, {})

        return {
            label: jenis,
            data: labels.map((label: string) => dataByDate[label] || 0),
            fill: false,
            tension: 0.35,
            borderColor: color,
            backgroundColor: color
        }
    })

    return {
        labels,
        datasets
    }
})

const chartOptions = computed(() => {
    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
})
</script>
