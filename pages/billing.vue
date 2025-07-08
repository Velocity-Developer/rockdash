<template>
        
      <div class="w-full flex flex-col md:flex-row gap-2 md:justify-between items-end text-xs mb-5">
        <form @submit.prevent="refresh();updateRouteParams()" class="flex items-end gap-2">
          <div>
            <div class="mb-1">Per Page : </div>            
            <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px]" />
          </div>
          <div class="hidden md:block">
              <div>Tgl Masuk</div>
              <div class="flex items-center justify-end gap-2 mt-1">
                <DatePicker v-model="filters.tgl_masuk_start" dateFormat="dd/mm/yy" placeholder="dari" size="small" class="w-[130px]"/>
                <DatePicker v-model="filters.tgl_masuk_end" dateFormat="dd/mm/yy" placeholder="sampai" size="small" class="w-[130px]"/>
              </div>
          </div>
          <div>
            <Button type="submit" size="small">
              Go
            </Button>
          </div>
        </form>

        <div class="flex justify-end items-center gap-2">
          <Button @click="openDialog('add')" size="small">
            <Icon name="lucide:plus-circle" /> Tambah
          </Button>
          <Button @click="visibleDrawerFilter = true" size="small">
            <Icon name="lucide:filter" /> Filter
            <span
            class="w-2 h-2 bg-yellow-300 rounded-full inline-block absolute top-0 right-0 m-1"
            v-if="filters.nama_web || filters.paket || filters.jenis || filters.deskripsi || filters.trf || filters.hp || filters.telegram || filters.hpads || filters.wa || filters.email"
            ></span>
          </Button>
        </div>
      </div>

      <div class="bg-primary-50 dark:bg-zinc-700 border border-primary-200 dark:border-primary-600 text-xs w-auto inline-block p-4 rounded-lg mb-3">
        Pembuatan Bulan Ini: <span class="font-bold">{{ prediksi.total }}</span>
        <br>
        Prediksi Pembuatan Bulan ini: <span class="font-bold">{{ prediksi.prediksi }}</span>
      </div>

      <DataTable @sort="handleSortTable" :value="data.data" size="small" class="text-xs" v-model:selection="selectedRows" stripedRows scrollHeight="70vh" scrollable>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column header="#" headerStyle="width:3rem">
          <template #body="slotProps">
              {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="webhost.nama_web" header="Nama Web">
          <template #body="slotProps">
            <div class="group relative py-1">
              <NuxtLink :to="'/webhost/'+slotProps.data.id_webhost" class="hover:underline block">
                {{ slotProps.data.webhost.nama_web }}
              </NuxtLink>
              <div class="invisible group-hover:visible absolute bottom-[-1rem] inset-x-0 flex item-center">
                <Button @click="openDialog('edit',slotProps.data)" class="!text-xs !px-1 !py-0" variant="text" severity="info" size="small">
                  <Icon name="lucide:pencil" /> Edit
                </Button>
                <Button @click="confirmDelete(slotProps.data.id)" class="!text-xs !px-1 !py-0" variant="text" severity="danger" size="small">
                  <Icon name="lucide:trash-2" /> Hapus
                </Button>
               </div>
            </div>
          </template>
        </Column>
        <Column field="jenis" header="Jenis"></Column>
        <Column field="webhost.paket.paket" header="Paket"></Column>
        <Column field="deskripsi" header="Deskripsi">
          <template #body="slotProps">
            <div class="max-w-[200px] whitespace-normal">
              {{ slotProps.data.deskripsi }}
            </div>
          </template>
        </Column>
        <Column field="trf" header="Trf">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.trf) }}
          </template>
        </Column>
        <Column field="tgl_masuk" sortable header="Masuk Tgl">        
          <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_masuk) }}
          </template>
        </Column>
        <Column field="tgl_deadline" sortable header="Deadline Tgl">       
          <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_deadline) }}
          </template>
        </Column>
        <Column field="biaya" header="Total Biaya">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.biaya) }}
          </template>
        </Column>
        <Column field="dibayar" header="Dibayar">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.dibayar) }}
          </template>
        </Column>
        <Column field="lunas" sortable header="Kurang">
          <template #body="slotProps">
              {{ slotProps.data.lunas }}
          </template>
        </Column>
        <Column field="saldo" header="Saldo"></Column>
        <Column field="webhost.hp" header="HP">
          <template #body="slotProps">
            <div class="whitespace-normal">
              {{ split_comma(slotProps.data.webhost.hp) }}
            </div>
          </template>
        </Column>
        <Column field="webhost.telegram" header="Telegram"></Column>
        <Column field="webhost.hpads" sortable header="HP Ads"></Column>
        <Column field="webhost.wa" header="WA">
          <template #body="slotProps">
            <div class="whitespace-normal">
              {{ split_comma(slotProps.data.webhost.wa) }}
            </div>
          </template>
        </Column>
        <Column field="webhost.email" header="Email">
          <template #body="slotProps">
            <div class="whitespace-normal">
              {{ split_comma(slotProps.data.webhost.email) }}
            </div>
          </template>
        </Column>
        <Column field="dikerjakan_oleh" header="Dikerjakan">
          <template #body="slotProps">
            <template v-for="item in slotProps.data.karyawans">
              <span>{{ item.nama }} ({{ item.pivot.porsi }}%)</span>,
            </template>
          </template>
        </Column>
        <Column field="act" header="">
          <template #body="slotProps">
            <div class="flex item-center gap-1 justify-end">
              <Button @click="openDialog('edit',slotProps.data)" severity="info" size="small">
                <Icon name="lucide:pencil" />
              </Button>
              <Button @click="confirmDelete(slotProps.data.id)" severity="danger" size="small">
                <Icon name="lucide:trash-2" />
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-between items-center text-xs mt-3">
        <div>
          {{ data.from }} - {{ data.to }} dari {{ data.total }}
        </div>

        <Paginator
            :rows="data.per_page"
            :totalRecords="data.total"
            @page="onPaginate"
            :pt="{
                root: (event: any) => {
                    const itemForPage =  data.per_page;
                    const currentPage =  page - 1;
                    event.state.d_first = itemForPage * currentPage;
                },
            }"
        >
        </Paginator>
      </div>

      <div class="mt-3">
        <Button v-if="selectedRowsNamaWeb" @click="copyToClipboard()" size="small">
          <Icon name="lucide:copy" /> Copy Nama Web
        </Button>
      </div>
    

  <Drawer v-model:visible="visibleDrawerFilter" header="Filters" position="right">
    <form @submit.prevent="filterSubmit">

      <ScrollPanel style="width: 100%; height: 69vh">
        <div v-for="item in fieldsFilter" class="mb-3 md:mb-4">
          <label class="mb-1 block text-sm" :for="item.key">
            {{ item.label }}
          </label>

          <DatePicker
            v-if="item.key == 'tgl_masuk_start' || item.key == 'tgl_masuk_end'"
            v-model="filters[item.key]"
            class="w-full mb-1" 
            size="small"
            :placeholder="item.label" 
          />

          <InputText 
            v-else
            v-model="filters[item.key]"
            :id="item.key" 
            class="w-full" 
            :placeholder="item.label" 
            size="small"
          />
        </div>
      </ScrollPanel>
      
      <div>
        <Button type="submit" class="w-full">
          <Icon name="lucide:filter" /> Filter
        </Button>
        <Button @click="resetFilters()" severity="contrast" class="w-full mt-3">
          <Icon name="lucide:x" /> Reset
        </Button>
      </div>
    </form>
  </Drawer>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah':'Edit'" :style="{ width: '40rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <CsMainProjectForm :action="actionDialog" :data="dataDialog" @update="refresh()" />
  </Dialog>

  <DashLoader :loading="isLoadingDash"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Billing',
    description: 'Daftar Project',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();

const page = ref(route.query.page ? Number(route.query.page) : 1);

const filters = reactive({
    per_page: route.query.per_page || 50,
    page: computed(() => page.value),
    tgl_masuk_start: route.query.tgl_masuk_start || '',
    tgl_masuk_end: route.query.tgl_masuk_end || '',
    nama_web: '',
    paket: '',
    jenis: '',
    deskripsi: '',
    trf: '',
    hp: '',
    telegram: '',
    hpads: '',
    wa: '',
    email: '',
    order_by: 'tgl_masuk',
    order: 'desc',
} as any);

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data, status, error, refresh } = await useAsyncData(
    'billing-page-'+page.value,
    () => client('/api/billing',{
        params: filters
    })
) as any
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

//watch filters.tgl_masuk_start dan filters.tgl_masuk_end
watch(filters, () => {
    //ubah format date dayjs
    filters.tgl_masuk_start = filters.tgl_masuk_start?dayjs(filters.tgl_masuk_start).format('YYYY-MM-DD'):'';
    filters.tgl_masuk_end = filters.tgl_masuk_end?dayjs(filters.tgl_masuk_end).format('YYYY-MM-DD'):'';
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

const visibleDrawerFilter = ref(false);
const filterSubmit = async () => {
    refresh()
    visibleDrawerFilter.value = false;
    updateRouteParams()
}
const fieldsFilter = [
  { key: 'tgl_masuk_start', label: 'Tanggal Masuk', type: 'date' },
  { key: 'tgl_masuk_end', label: 'Tanggal Masuk', type: 'date' },
  { key: 'nama_web', label: 'Nama Web', type: 'text' },
  { key: 'paket', label: 'Paket', type: 'text' },
  { key: 'jenis', label: 'Jenis', type: 'text' },
  { key: 'deskripsi', label: 'Deskripsi', type: 'text' },
  { key: 'trf', label: 'Trf', type: 'text' },
  { key: 'hp', label: 'HP', type: 'text' },
  { key: 'telegram', label: 'Telegram', type: 'text' },
  { key: 'hpads', label: 'HP Ads', type: 'text' },
  { key: 'wa', label: 'WA', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]

function split_comma(text: string) {
  return text?text.split(',').join('\n'):'';
}

//reset filters
function resetFilters() {
  filters.per_page = 150;
  filters.tgl_masuk_start = '';
  filters.tgl_masuk_end = '';
  filters.nama_web = '';
  filters.paket = '';
  filters.jenis = '';
  filters.deskripsi = '';
  filters.trf = '';
  filters.hp = '';
  filters.telegram = '';
  filters.hpads = '';
  filters.wa = '';
  filters.email = '';
  updateRouteParams()
  refresh()
  visibleDrawerFilter.value = false;
}

//handeSortTable
function handleSortTable(event: any) {
  const sortField = event.sortField;
  const sortOrder = event.sortOrder;
  filters.order_by = sortField;
  filters.order = sortOrder==1?'asc':'desc';
  updateRouteParams()
  refresh()
}

const prediksi = ref({
  total: 0,
  prediksi: 0,
} as any);

//onmounted, tunggu 3 detik.
onMounted(() => {
  setTimeout(() => {
      
    //fetch dapatkan data prediksi dari api
    try {
      const res = client('/api/billing_prediksi_bulanini') as any
      prediksi.value.total = res.total;
      prediksi.value.prediksi = res.prediksi;
    } catch (error) {
      console.log(error);
    }
    
  }, 3000);
})


const selectedRows = ref();
const selectedRowsNamaWeb = ref('');
//watch
watch(selectedRows, (newValue, oldValue) => {
  if(newValue.length > 0) {
    //set selectedRowsNamaWeb array, join dengan enter
    selectedRowsNamaWeb.value = newValue.map((item: any) => item.webhost.nama_web).join(', ');
  }
})

//copy selectedRowsNamaWeb ke clipboard
function copyToClipboard() {
  navigator.clipboard.writeText(selectedRowsNamaWeb.value);
  alert('Nama Web berhasil di copy ke clipboard');
}

const visibleDialog = ref(false);
const actionDialog = ref('add');
const dataDialog = ref({});
const openDialog = async (action: string, data = {}) => {
  visibleDialog.value = true;
  actionDialog.value = action;
  dataDialog.value = data;
}

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus data ini?',
        header: 'Hapus Data',
        accept: async () => {
            try {              
              const re = await client(`/api/cs_main_project/${id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              refresh()
            } catch (error) {
                const er = useSanctumError(error)                 
                toast.add({
                    severity: 'error',
                    summary: 'Gagal!',
                    detail: er.msg ? er.msg : 'Terjadi kesalahan saat menghapus data',
                    life: 3000
                });
            }
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
</script>
