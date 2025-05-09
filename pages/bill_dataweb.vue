<template>
  
  <div class="w-full flex justify-between items-end text-xs mb-5">
    <form @submit.prevent="refresh();updateRouteParams()" class="flex items-end gap-2">
      <div>
        <div class="mb-1">Per Page : </div>            
        <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px]" />
      </div>
      <div class="hidden md:block">
          <div>Tgl Masuk</div>
          <div class="flex items-center justify-end gap-2 mt-1">
            <DatePicker v-model="filters.tgl_mulai_start" dateFormat="dd/mm/yy" placeholder="dari" size="small" class="w-[130px]"/>
            <DatePicker v-model="filters.tgl_mulai_end" dateFormat="dd/mm/yy" placeholder="sampai" size="small" class="w-[130px]"/>
          </div>
      </div>
      <div>
        <Button type="submit" size="small">
          Go
        </Button>
      </div>
    </form>

    <div class="flex justify-end items-center">
      <Button @click="visibleDrawerFilter = true" size="small">
        <Icon name="lucide:filter" /> Filter
        <span
        class="w-2 h-2 bg-yellow-300 rounded-full inline-block absolute top-0 right-0 m-1"
        v-if="filters.nama_web || filters.paket || filters.jenis || filters.deskripsi || filters.trf || filters.hp || filters.telegram || filters.hpads || filters.wa || filters.email"
        ></span>
      </Button>
    </div>
  </div>

  <DataTable @sort="handleSortTable" :value="data.data" size="small" class="text-xs" v-model:selection="selectedRows" selectionMode="single" stripedRows scrollHeight="70vh" scrollable>
    <Column header="#" headerStyle="width:3rem">
        <template #body="slotProps">
            {{ slotProps.index + 1 }}
        </template>
    </Column>
    <Column field="nama_web" header="Nama Web" frozen>
      <template #body="slotProps">
        <NuxtLink :to="'/webhost/'+slotProps.data.id_webhost" class="hover:underline">
          {{ slotProps.data.nama_web }}
        </NuxtLink>
      </template>
    </Column>
    <Column field="paket" header="Paket">
      <template #body="slotProps">
        {{ slotProps.data.paket?.paket }}
      </template>
    </Column>
    <Column field="tgl_mulai" header="Masuk Tanggal" sortable></Column>
    <Column field="saldo" header="Saldo"></Column>
    <Column field="hp" header="HP"></Column>
    <Column field="telegram" header="Telegram"></Column>
    <Column field="hpads" header="HP Ads"></Column>
    <Column field="wa" header="WA"></Column>
    <Column field="email" header="Email"></Column>
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


  <Drawer v-model:visible="visibleDrawerFilter" header="Filters" position="right">
    <form @submit.prevent="filterSubmit">

      <ScrollPanel style="width: 100%; height: 69vh">
        <div v-for="item in fieldsFilter" class="mb-3 md:mb-4">
          <label class="mb-1 block text-sm" :for="item.key">
            {{ item.label }}
          </label>

          <DatePicker
            v-if="item.key == 'tgl_mulai_start' || item.key == 'tgl_mulai_end'"
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
  <DashLoader :loading="isLoadingDash"/>

</template>

<script setup lang="ts">

definePageMeta({
    title: 'Database Web',
    description: 'Database Web Klien',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();

const page = ref(route.query.page ? Number(route.query.page) : 1);


const filters = reactive({
    per_page: route.query.per_page || 50,
    page: computed(() => page.value),
    tgl_mulai_start: route.query.tgl_mulai_start || '',
    tgl_mulai_end: route.query.tgl_mulai_end || '',
    nama_web: '',
    paket: '',
    hp: '',
    telegram: '',
    hpads: '',
    wa: '',
    email: '',
    order_by: 'tgl_mulai',
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
    'bill_dataweb-page-'+page.value,
    () => client('/api/bill_dataweb',{
        params: filters
    })
)
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

//watch filters.tgl_mulai_start dan filters.tgl_mulai_end
watch(filters, () => {
    //ubah format date dayjs
    filters.tgl_mulai_start = filters.tgl_mulai_start?dayjs(filters.tgl_mulai_start).format('YYYY-MM-DD'):'';
    filters.tgl_mulai_end = filters.tgl_mulai_end?dayjs(filters.tgl_mulai_end).format('YYYY-MM-DD'):'';
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

const selectedRows = ref();

const visibleDrawerFilter = ref(false);
const filterSubmit = async () => {
    refresh()
    visibleDrawerFilter.value = false;
    updateRouteParams()
}

const fieldsFilter = [
  { key: 'tgl_mulai_start', label: 'Tanggal Masuk', type: 'date' },
  { key: 'tgl_mulai_end', label: 'Tanggal Masuk', type: 'date' },
  { key: 'nama_web', label: 'Nama Web', type: 'text' },
  { key: 'paket', label: 'Paket', type: 'text' },
  { key: 'hp', label: 'HP', type: 'text' },
  { key: 'telegram', label: 'Telegram', type: 'text' },
  { key: 'hpads', label: 'HP Ads', type: 'text' },
  { key: 'wa', label: 'WA', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
]


//reset filters
function resetFilters() {
  filters.per_page = 150;
  filters.tgl_mulai_start = '';
  filters.tgl_mulai_end = '';
  filters.nama_web = '';
  filters.paket = '';
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

</script>
