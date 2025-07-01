<template>
  
  <div class="flex flex-col md:flex-row justify-start gap-2 md:items-center">
    <Button type="button" @click="openDialog('add',{tgl:filters.bulan,bank:filters.bank})" size="small" class="capitalize">
      Tambah Transaksi {{ getBankLabel(filters.bank) }}
    </Button> 
    <DatePicker v-model="filters.bulan" showIcon view="month" placeholder="Bulan" size="small" dateFormat="mm/yy" class="w-[10rem]">
      <template #inputicon="slotProps">
        <Icon name="lucide:calendar" @click="slotProps.clickCallback" />
      </template>
    </DatePicker>
    <Button @click="exportExcel()" type="button" severity="contrast" class="text-white hover:text-primary bg-secondary border-secondary" size="small">
      <Icon name="lucide:file-spreadsheet"/>
      Export Excel
    </Button>
        <Button @click="dialogFormSaldo = true" severity="warn" size="small">
          <Icon name="lucide:square-pen"/> Saldo {{ filters.bulan }}
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

  <div class="overflow-x-auto mb-5 pb-2">
    <div class="flex gap-4">

      <div @click="dialogFormSaldo = true" class="min-w-[200px] group relative cursor-pointer py-2 px-3 bg-primary-50 dark:bg-primary-800 border border-primary rounded">
        <div class="text-xs mb-2 flex items-center gap-1">
          <Icon name="lucide:wallet"/>
          Saldo Bawaan : {{ dataSaldo.bulan }}
        </div>
        <Skeleton v-if="status == 'pending'" class="w-full mt-2 h-20" />
        <div v-else class="font-bold text-end">
          {{ formatMoney(dataSaldo.nominal,filters.bank) }}
        </div>
        <div class="absolute w-full text-sm group-hover:block hidden bottom-0 end-0 bg-amber-100 dark:bg-amber-700 px-4 py-1 shadow-lg rounded border">
          <Icon name="lucide:square-pen"/>
          Atur Saldo Bawaan
        </div>
      </div>
      <div class="min-w-[200px] py-2 px-3 bg-sky-100 dark:bg-sky-800 border border-sky-500 rounded">
        <div class="text-xs mb-2 flex items-center gap-1">
          <Icon name="lucide:hard-drive-download"/>
          Total Masuk
        </div>
        <Skeleton v-if="status == 'pending'" class="w-full mt-2 h-20" />
        <div v-else class="font-bold text-end">
          {{ formatMoney(data?.total_masuk,filters.bank) }}
        </div>
      </div>
      <div class="min-w-[200px] py-2 px-3 bg-red-50 dark:bg-red-900 border border-red-600 rounded">
        <div class="text-xs mb-2 flex items-center gap-1">
          <Icon name="lucide:hard-drive-upload"/>
          Total Keluar
        </div>
        <Skeleton v-if="status == 'pending'" class="w-full mt-2 h-20" />
        <div v-else class="font-bold text-end">
          {{ formatMoney(data?.total_keluar,filters.bank) }}
        </div>
      </div>

    </div>
  </div>

  <DataTable :value="data.data" size="small" class="text-sm" sortField="nomor" :sortOrder="-1" paginator :rows="25" :rowsPerPageOptions="[25, 50, 100, 500]" selectionMode="multiple" stripedRows scrollHeight="70vh" scrollable>
    <Column header="#" headerStyle="width:3rem" class="align-top">
      <template #body="slotProps">
          {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column field="nomor" header="Tanggal" :sortable="true" class="!align-top">
      <template #body="slotProps">
        <div @click="openDialog('edit',slotProps.data)" class="whitespace-nowrap text-xs">
          {{ slotProps.data.tgl }}
          <span class="hidden">
            {{ slotProps.data.nomor }}
          </span>
        </div>
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
              <div v-if="itembank.jenis_transaksi == 'masuk'" v-tooltip="'Masuk'" class="bg-sky-100 text-sky-600 border-l-4 border-sky-600 rounded p-1 hover:shadow">
                {{ getBankLabel(itembank.bank) }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
              <div v-if="itembank.jenis_transaksi == 'keluar'" v-tooltip="'Keluar'" class="bg-red-100 text-red-600 border-l-4 border-red-600 rounded p-1 hover:shadow">
                {{ getBankLabel(itembank.bank) }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
            </div>
          </li>
          <li v-for="item in slotProps.data.transaksi_keluar" class="text-xs">
            <div v-if="item.bank" v-for="itembank in item.bank" class="mt-1">
              <div v-if="itembank.jenis_transaksi == 'masuk'" v-tooltip="'Masuk'" class="bg-sky-100 text-sky-600 border-l-4 border-sky-600 rounded p-1 hover:shadow">
                {{ getBankLabel(itembank.bank) }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
              <div v-if="itembank.jenis_transaksi == 'keluar'" v-tooltip="'Keluar'" class="bg-red-100 text-red-600 border-l-4 border-red-600 rounded p-1 hover:shadow">
                {{ getBankLabel(itembank.bank) }} <div class="font-bold whitespace-nowrap"> {{ formatMoney(itembank.nominal,itembank.bank) }} </div>
              </div>
            </div>
          </li>

        </ul>
      </template>
    </Column>
    <Column field="keterangan_bank" header="Keterangan Bank" class="align-top">
      <template #body="slotProps">
        <div class="max-w-[100px] text-xs break-all" v-tooltip="slotProps.data.keterangan_bank">
          {{ slotProps.data.keterangan_bank }}
        </div>
      </template>
    </Column>
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
          <Button @click="openDialog('edit',slotProps.data)" severity="info" size="small" v-tooltip="'Edit'">
            <Icon name="lucide:pen"/>
          </Button>
          <Button @click="confirmDelete(slotProps.data.id)" severity="danger" size="small" v-tooltip="'Hapus'">
            <Icon name="lucide:trash"/>
          </Button>
        </div>
      </template>
    </Column>
  </DataTable>

  <Dialog v-model:visible="visibleDialogForm" modal :header="actionDialog=='add'?'Tambah Transaksi':'Edit Transaksi'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <BankTransaksiForm :action="actionDialog" :data="selectedData" :bank="filters.bank" @update="refresh()"/>
  </Dialog>
  
  <Dialog v-model:visible="dialogFormSaldo" modal :header="'Atur Saldo '+filters.bank" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <BankTransaksiFormSaldo :bulan="filters.bulan" :bank="filters.bank" @update="refresh()"/>
  </Dialog>

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
const kategori = route.params.kategori;

//get opsi bank
const { data: banks,status: statusDataBank} = await useAsyncData(
    'data_opsi-bank',
    () => client('/api/data_opsi/bank',{
        params: {
            kategori: kategori
        }
    })
) as any

//get label bank from value
const getBankLabel = (value: string) => {
  const bank = banks.value.find((bank: { value: string; }) => bank.value === value);
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
) as any

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
    return data.value?.saldo;
  } else {
    return 0;
  }
})

const visibleDialogForm = ref(false);
const actionDialog = ref('add');
const selectedData = ref({});

const openDialog = (action: string , data: Object) => {
  actionDialog.value = action;
  visibleDialogForm.value = true;
  selectedData.value = data;
}

//delete
const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {
    confirm.require({
        message: 'Anda yakin untuk hapus transaksi ini ?',
        header: 'Hapus Transaksi',
        accept: () => {
            client(`/api/bank_transaksi/${id}`, {
                method: 'DELETE',
            }).then(() => {
                refresh();
                toast.add({
                  severity: 'success',
                  summary: 'Berhasil!',
                  detail: 'Transaksi berhasil dihapus',
                  life: 3000
                });
            });
        },
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Hapus',
            severity: 'danger',
            outlined: false
        },
        reject: () => {
            //callback to execute when user rejects to delete
        }
    });
}

//export gunakan xlsx
import * as XLSX from "xlsx";
const dt = ref();
const exportExcel = async () => {
  //request ke api
  try {
    const response = await client('/api/bank_transaksi_export',{
      params: filters
    }) as any
    
    //Convert JSON ke worksheet
    const worksheet = XLSX.utils.json_to_sheet(response)

    //Buat workbook dan tambahkan worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    //Generate file Excel dan download
    XLSX.writeFile(workbook, `Transaksi Bank ${filters.bank} ${filters.bulan}.xlsx`)
  } catch (error) {
    const er = useSanctumError(error);
  }
}

//atur saldo
const dialogFormSaldo = ref(false);
</script>