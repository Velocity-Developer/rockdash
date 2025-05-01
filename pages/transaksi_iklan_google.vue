<template>
  
  <Card>
    <template #content>
      
      <div class="w-full flex justify-between items-end text-xs mb-5">
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

        <div class="flex justify-end items-center gap-1">
          <div v-if="status == 'pending'" class=" flex items-center justify-end gap-2 mr-3">
            <Icon name="lucide:loader-circle" mode="svg" class="animate-spin"/>
            Memuat...
          </div>
          <Button @click="exportCSV()" severity="warn" size="small">
            <Icon name="lucide:file-spreadsheet" /> Export CSV
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

      <DataTable @sort="handleSortTable" :value="data.data" size="small" class="text-sm" ref="dt" v-model:selection="selectedRows" selectionMode="single" stripedRows scrollable>
        <Column header="#" headerStyle="width:3rem">
          <template #body="slotProps">
              {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="jenis" header="Jenis"></Column>
        <Column field="nama_web" header="Nama Web">
          <template #body="slotProps">
            <NuxtLink :to="'/webhost/'+slotProps.data.id_webhost" class="hover:underline block break-all w-[160px]">
              {{ slotProps.data.nama_web }}
            </NuxtLink>
          </template>
        </Column>
        <Column field="deskripsi" header="Deskripsi">
          <template #body="slotProps">
            <div class="max-w-[200px] whitespace-normal">
              {{ slotProps.data.deskripsi }}
            </div>
          </template>
        </Column>
        <Column field="trf" header="Transfer" class="font-bold text-primary-500 dark:text-primary-400">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.trf) }}
          </template>
        </Column>
        <Column field="dibayar" header="Dibayar">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.dibayar) }}
          </template>
        </Column>
        <Column field="tgl_masuk" header="Tgl Masuk" class="whitespace-nowrap">        
          <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_masuk) }}
          </template>
        </Column>
        <Column field="tgl_deadline" header="Deadline Tgl" class="whitespace-nowrap ">       
          <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_deadline) }}
          </template>
        </Column>
        <Column field="wa" header="WA">
          <template #body="slotProps">
            <div class="whitespace-normal">
              {{ split_comma(slotProps.data.wa) }}
            </div>
          </template>
        </Column>
        <Column field="email" header="Email">
          <template #body="slotProps">
            <div class="whitespace-normal">
              {{ split_comma(slotProps.data.email) }}
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-between items-center text-xs mt-3">
        <div>
          {{ data.from }} - {{ data.to }} dari {{ data.total }}
          
          <div v-if="status == 'pending'" class=" flex items-center justify-end gap-2">
            <Icon name="lucide:loader-circle" mode="svg" class="animate-spin"/>
            Memuat...
          </div>
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

    
    </template>    
  </Card>

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

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Transaksi Iklan Google',
    description: 'Daftar Transaksi Project Iklan Google',
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
    'transaksi_iklan_google-page-'+page.value,
    () => client('/api/transaksi_iklan_google',{
        params: filters
    })
)
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
  { key: 'deskripsi', label: 'Deskripsi', type: 'text' },
  { key: 'trf', label: 'Trf', type: 'text' },
  { key: 'wa', label: 'WA', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]

function split_comma(text: string) {
  return text.split(',').join('\n');
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


const selectedRows = ref();
const selectedRowsNamaWeb = ref('');
//watch
watch(selectedRows, (newValue, oldValue) => {
  if(newValue.length > 0) {
    //set selectedRowsNamaWeb array, join dengan enter
    selectedRowsNamaWeb.value = newValue.map((item: any) => item.nama_web).join(', ');
  }
})

//copy selectedRowsNamaWeb ke clipboard
function copyToClipboard() {
  navigator.clipboard.writeText(selectedRowsNamaWeb.value);
  alert('Nama Web berhasil di copy ke clipboard');
}

const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};
</script>
