<template>

  <div class="flex flex-col md:flex-row gap-4 md:items-end mb-8">

    <div class="md:basis-[70%]">
      
      <div class="flex flex-col md:flex-row justify-start gap-2 md:items-center">
        <Button type="button" size="small" class="capitalize">
          Tambah Transaksi {{ getBankLabel(filters.bank) }}
        </Button> 
        <DatePicker v-model="filters.bulan" showIcon view="month" placeholder="Bulan" size="small" dateFormat="mm/yy" class="w-[10rem]">
          <template #inputicon="slotProps">
            <Icon name="lucide:calendar" @click="slotProps.clickCallback" />
          </template>
        </DatePicker>
        <Button type="button" severity="contrast" class="text-white hover:text-primary bg-secondary border-secondary" size="small">
          <Icon name="lucide:file-spreadsheet"/>
          Export CSV
        </Button>
      </div>
      <div class="overflow-x-auto whitespace-nowrap pt-2">
          <SelectButton 
            v-model="filters.bank"
            size="small"
            :options="banks"
            optionValue="value"
            optionLabel="label"
          />
      </div>

    </div>

    <div class="md:flex-1 md:flex md:justify-end">
      <div v-if="dataSaldo" class="relative overflow-hidden border border-primary-300 bg-primary-50 dark:bg-primary-800 p-2 rounded md:w-[200px]">
        {{ getBankLabel(filters.bank) }}
        <div class="text-xs">
          {{ dataSaldo.bulan }}
        </div>
        <div class="text-lg text-end font-bold text-secondary-600 dark:text-secondary-200">
          {{ formatMoney(dataSaldo.nominal) }}
        </div>
      </div>
    </div>

  </div>

  <DataTable :value="data.data" size="small" class="text-sm" stripedRows scrollable>
    <Column header="#" headerStyle="width:3rem">
      <template #body="slotProps">
          {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column field="tgl" header="Tanggal" class="whitespace-nowrap"></Column>
    <Column field="jenis" header="Jenis">
      <template #body="slotProps">
        <template v-if="slotProps.data.cs_main_project">
          <span v-for="item in slotProps.data.cs_main_project">
            {{ item.webhost.nama_web }}
          </span>
        </template>
        <template v-else>
          -
        </template>
      </template>
    </Column>
    <Column field="keterangan_bank" header="Keterangan Bank"></Column>
    <Column field="masuk" header="Masuk">
      <template #body="slotProps">
        {{ formatMoney(slotProps.data.nominal) }}
      </template>
    </Column>
    <Column field="keluar" header="Keluar">
      <template #body="slotProps">
        {{ formatMoney(slotProps.data.nominal) }}
      </template>
    </Column>
    <Column field="saldo" header="Saldo">
      <template #body="slotProps">
        {{ formatMoney(slotProps.data.nominal) }}
      </template>
    </Column>
    <Column field="act" header="">
      <template #body="slotProps">
      </template>
    </Column>
  </DataTable>

  <DashLoader :loading="isLoadingDash"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Bank Transaksi',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();

const banks = ref([
  {value: 'bca', label: 'BCA'},
  {value: 'bca stok', label: 'BCA Stok'},
  {value:'mandiri', label: 'Mandiri'},
  {value: 'bni', label: 'BNI'},
  {value: 'bri', label: 'BRI'},
  {value: 'dbs', label: 'DBS'},
  {value: 'jago', label: 'Jago'},
  {value: 'gopay', label: 'Gopay'},
  {value:'resselercamp', label: 'RESELLERCAMP'},
  {value:'srsx', label: 'SRSX'},
  {value: 'jenius', label: 'Jenius'},
]);
//get label bank from value
const getBankLabel = (value: string) => {
  const bank = banks.value.find((bank) => bank.value === value);
  return bank ? bank.label : value;
}

const filters = reactive({
    bank: route.query.bank || 'bca',
    bulan: route.query.bulan || dayjs().format('YYYY-MM'),
} as any);

const { data, status, error, refresh } = await useAsyncData(
    'bank_transaksi-'+filters.bulan,
    () => client('/api/bank_transaksi',{
        params: filters
    })
)

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

//watch filters 
watch(filters, () => {
  //ubah format date dayjs
  filters.bulan = filters.bulan?dayjs(filters.bulan).format('YYYY-MM'):'';
  updateRouteParams();
  refresh();
})

//watch status
const isLoadingDash = ref(false)
watch(status, (newValue, oldValue) => {
    if(newValue == 'success') {
      isLoadingDash.value = false;
    } else {
      isLoadingDash.value = true;
    }
})

//data saldo
const dataSaldo = computed(() => {
  if(data.value) {
    return data.value.saldo;
  } else {
    return 0;
  }
})
</script>