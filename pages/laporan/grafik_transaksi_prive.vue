<template>

  <div class="flex justify-end items-center gap-1 mb-2">
    <InputNumber v-model="filter.tahun" label="Tahun" size="small" class="max-w-[100px]" showButtons :useGrouping="false" fluid/>
    <Button @click="getData" :loading="loading" size="small">
      <Icon name="lucide:refresh-ccw" :class="{loading:'animate-spin'}"/> Refresh
    </Button>
  </div>

  <div v-if="loading">
    <div class="flex items-center justify-center">
      <ProgressSpinner strokeWidth="4" aria-label="Loading"/>
    </div>
  </div>

  <div v-else class="space-y-4">

    <Card>
      <template #content>
        <Chart v-if="!loading" type="bar" :data="chartData" :options="chartOptions" />      
      </template>
    </Card>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <Card v-if="data.hasil" class="md:col-span-2">
        <template #content>
          <DataTable :value="data.hasil" class="text-xs" stripedRows>
            <Column field="bulan" header="Bulan" />
            <Column field="masuk" header="Masuk">
            <template #body="slotProps">
                {{ slotProps.data.masuk?formatMoney(slotProps.data.masuk):0 }}
            </template>
            </Column>
            <Column field="keluar" header="Keluar">
              <template #body="slotProps">
                {{ slotProps.data.keluar?formatMoney(slotProps.data.keluar):0 }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Card v-if="data.hasil" class="md:col-span-1">
        <template #content>
          <ul class="list-disc pl-4 space-y-4">
            <li>
              <div class="font-bold">Total Masuk:</div>
              {{ formatMoney(data.hasil.reduce((acc: any, cur: { masuk: any; }) => acc + (cur.masuk || 0), 0)) }}
            </li>
            <li>
              <div class="font-bold">Total Keluar:</div>
              {{ formatMoney(data.hasil.reduce((acc: any, cur: { keluar: any; }) => acc + (cur.keluar || 0), 0)) }}
            </li>
          </ul>
        </template>
      </Card>

    </div>

  </div>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Grafik Transaksi Prive',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const filter = ref({
  tahun: dayjs().year(),
  bank: route.query.bank,
})

const chartData = ref({
    labels: [],
    datasets: [],
}) as any
const chartOptions = ref();

const data = ref({} as any);
const loading = ref(false);
const getData = async () => {
  loading.value = false;
  try {
    loading.value = true;
    const res = await client("api/bank_transaksi_grafik_transaksi_prive", {
      params: {
        tahun: filter.value.tahun,
        bank: filter.value.bank,
      }
    }) as any
    data.value = res;
    chartData.value.labels = res.label;
    chartData.value.datasets = [
      {
        label: 'Keluar',
        data: res.data.keluar,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Masuk',
        data: res.data.masuk,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ];

  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
}


//onMounted
onMounted(() => {
  getData();
})
</script>
