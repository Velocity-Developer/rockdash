<template>
  
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
  <div class="overflow-x-auto whitespace-nowrap pt-2 mb-5">
      <SelectButton 
        v-model="filters.bank"
        size="small"
        :options="banks"
        optionValue="value"
        optionLabel="label"
        allowEmpty
      />
  </div>

  <div class="overflow-x-auto mb-5">
    <div class="flex gap-4">

      <div class="w-[200px] py-2 px-3 bg-primary-50 dark:bg-primary-800 border border-primary rounded">
        <div class="text-xs mb-2 flex items-center gap-1">
          <Icon name="lucide:wallet"/>
          Saldo : {{ dataSaldo.bulan }}
        </div>
        <Skeleton v-if="status == 'pending'" class="w-full mt-2 h-20" />
        <div v-else class="font-bold text-end">
          {{ formatMoney(dataSaldo.nominal) }}
        </div>
      </div>
      <div class="w-[200px] py-2 px-3 bg-green-100 dark:bg-green-800 border border-green-500 rounded">
        <div class="text-xs mb-2 flex items-center gap-1">
          <Icon name="lucide:hard-drive-download"/>
          Total Masuk
        </div>
        <Skeleton v-if="status == 'pending'" class="w-full mt-2 h-20" />
        <div v-else class="font-bold text-end">
          {{ formatMoney(data?.total_masuk) }}
        </div>
      </div>
      <div class="w-[200px] py-2 px-3 bg-red-50 dark:bg-red-900 border border-red-600 rounded">
        <div class="text-xs mb-2 flex items-center gap-1">
          <Icon name="lucide:hard-drive-upload"/>
          Total Keluar
        </div>
        <Skeleton v-if="status == 'pending'" class="w-full mt-2 h-20" />
        <div v-else class="font-bold text-end">
          {{ formatMoney(data?.total_keluar) }}
        </div>
      </div>

    </div>
  </div>

  <DataTable :value="data.data" size="small" class="text-sm" sortField="nomor" :sortOrder="-1" paginator :rows="25" :rowsPerPageOptions="[25, 50, 100, 500]" selectionMode="multiple" stripedRows scrollable>
    <Column header="#" headerStyle="width:3rem" class="align-top">
      <template #body="slotProps">
          {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column field="nomor" header="Tanggal" :sortable="true" class="whitespace-nowrap !align-top">
      <template #body="slotProps">
        {{ slotProps.data.tgl }}
        <span class="hidden">
          {{ slotProps.data.nomor }}
        </span>
      </template>
    </Column>
    <Column field="jenis" header="Jenis" class="align-top">
      <template #body="slotProps">

        <ul v-if="slotProps.data.cs_main_project ||slotProps.data.transaksi_keluar " class="list-decimal ps-4">
          <li v-for="item in slotProps.data.cs_main_project" class="text-xs">
            <div class="font-bold">
              {{ item.tgl_masuk }}
            </div>
            <div>
              {{ item.jenis }}
            </div>
            <div class="text-primary font-bold">
              {{ item.webhost.nama_web }}
            </div>
            <div class="font-bold">
              {{ formatMoney(item.dibayar) }}
            </div>
            <div v-if="item.deskripsi" class="italic">
              "{{ item.deskripsi }}"
            </div>
          </li>  

          <li v-for="item in slotProps.data.transaksi_keluar" class="text-xs">
            <div class="font-bold">
              {{ item.tgl }}
            </div>
            <div v-if="item.jenis" class="italic">
              "{{ item.jenis }}"
            </div>
            <div class="font-bold">
              {{ formatMoney(item.jml) }}
            </div>
          </li> 
        </ul>

      </template>
    </Column>
    <Column field="jenis" header="Jenis Transaksi" class="align-top">
      <template #body="slotProps">

        <ul v-if="slotProps.data.cs_main_project || slotProps.data.transaksi_keluar" class="list-decimal ps-4">
          <li v-for="item in slotProps.data.cs_main_project" class="text-xs">
            <div v-if="item.bank" v-for="itembank in item.bank" class="mt-1">
              <div v-if="itembank.jenis_transaksi == 'masuk'" class="bg-sky-500 text-white rounded p-1">
                {{ itembank.bank }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
              <div v-if="itembank.jenis_transaksi == 'keluar'" class="bg-red-500 text-white rounded p-1">
                {{ itembank.bank }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
            </div>
          </li>
          <li v-for="item in slotProps.data.transaksi_keluar" class="text-xs">
            <div v-if="item.bank" v-for="itembank in item.bank" class="mt-1">
              <div v-if="itembank.jenis_transaksi == 'masuk'" class="bg-sky-500 text-white rounded p-1">
                {{ itembank.bank }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
              <div v-if="itembank.jenis_transaksi == 'keluar'" class="bg-red-500 text-white rounded p-1">
                {{ itembank.bank }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
            </div>
          </li>

        </ul>
      </template>
    </Column>
    <Column field="keterangan_bank" header="Keterangan Bank" class="align-top"></Column>
    <Column field="masuk" header="Masuk" class="whitespace-nowrap text-sky-500 dark:text-sky-600">
      <template #body="slotProps">
        <template v-if="slotProps.data.jenis_transaksi == 'masuk'">
          {{ formatMoney(slotProps.data.nominal,slotProps.data.bank) }}
        </template>
      </template>
    </Column>
    <Column field="keluar" header="Keluar" class="whitespace-nowrap text-red-500 dark:text-red-600">
      <template #body="slotProps">
        <template v-if="slotProps.data.jenis_transaksi == 'keluar'">
          {{ formatMoney(slotProps.data.nominal,slotProps.data.bank) }}
        </template>
      </template>
    </Column>
    <Column field="saldo" header="Saldo" class="whitespace-nowrap">
      <template #body="slotProps">
        {{ formatMoney(slotProps.data.saldo,slotProps.data.bank) }}
      </template>
    </Column>
    <Column field="act" header="">
      <template #body="slotProps">
        <div class="flex items-center justify-end gap-1">
          <Button severity="secondary" size="small" v-tooltip="'Edit'">
            <Icon name="lucide:pen"/>
          </Button>
          <Button severity="danger" size="small" v-tooltip="'Hapus'">
            <Icon name="lucide:trash"/>
          </Button>
        </div>
      </template>
    </Column>
  </DataTable>

  <DashLoader :loading="isLoadingDash"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Bank Transaksi',
    description: 'Catatan riwayat transaksi bank',
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
  {value:'resellercamp', label: 'RESELLERCAMP'},
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