<template>

  <div class="w-full flex flex-col md:flex-row gap-2 md:justify-between items-end text-xs mb-5">
    <form @submit.prevent="getData()" class="hidden md:flex items-end gap-2">
      <div>
        <div class="mb-1 opacity-50">Per Page : </div>            
        <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px] shadow rounded" />
      </div>
      <div class="hidden md:block">
          <div class="mb-1 opacity-50">Tgl</div>
          <div class="flex items-center justify-end gap-2 mt-1">
            <DatePicker v-model="filters.tgl_start" dateFormat="dd/mm/yy" placeholder="dari" size="small" class="w-[130px] shadow rounded"/>
            <DatePicker v-model="filters.tgl_end" dateFormat="dd/mm/yy" placeholder="sampai" size="small" class="w-[130px] shadow rounded"/>
          </div>
      </div>
      <div>
        <Button type="submit" size="small" severity="info" class="shadow-md">
          Go
        </Button>
      </div>
    </form>

    <div class="flex justify-end items-center gap-2">
      <!-- <Button @click="openDialog('add',{})" size="small" class="shadow-md">
        <Icon name="lucide:plus-circle" /> <span class="hidden md:inline-block">Tambah</span>
      </Button>
      <Button @click="visibleDrawerFilter = true" size="small" severity="info" class="shadow-md">
        <Icon name="lucide:filter" /> <span class="hidden md:inline-block">Filter</span>
        <span
        class="w-2 h-2 bg-yellow-300 rounded-full inline-block absolute top-0 right-0 m-1"
        v-if="filters.nama_web || filters.paket || filters.jenis || filters.deskripsi || filters.trf || filters.hp || filters.telegram || filters.hpads || filters.wa || filters.email"
        ></span>
      </Button> -->
    </div>
  </div>

  <Card v-if="dataClientSupport && dataClientSupport.length > 0">
    <template #content>
      <DataTable :value="dataClientSupport" size="small" class="text-xs">
        <Column field="tanggal" header="Tanggal" />        
        <Column field="revisi_1" header="Revisi 1">
          <template #body="slotProps">
            {{ slotProps.data?.revisi_1 }}
          </template>
        </Column>   
        <Column field="perbaikan_revisi_1" header="Perbaikan Revisi 1">
          <template #body="slotProps">
            {{ slotProps.data?.perbaikan_revisi_1 }}
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <div v-if="!dataClientSupport || dataClientSupport.length === 0">
    <div class="text-center text-sm text-slate-500">
      Tidak ada data
    </div>
  </div>

  <DashLoader :loading="loading" />

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Client Support',
    description: 'Daftar Client Support',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();
const page = ref(route.query.page ? Number(route.query.page) : 1);
const tglStartQuery = route.query.tgl_start as string | undefined
const tglEndQuery = route.query.tgl_end as string | undefined

const filters = reactive({
  per_page: route.query.per_page || 50,
  page: computed(() => page.value),
  tgl_start: route.query.tgl_start
    ? dayjs(tglStartQuery, 'YYYY-MM-DD').toDate()
    : dayjs().toDate(),
  tgl_end: tglEndQuery
    ? dayjs(tglEndQuery, 'YYYY-MM-DD').toDate()
    : null,
  nama_web: '',
  jenis: '',
} as any);

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  
  // ubah format tgl_start dan tgl_end menjadi YYYY-MM-DD
  if (filters.tgl_start) {
      filters.tgl_start = dayjs(filters.tgl_start).format('YYYY-MM-DD');
  }
  if (filters.tgl_end) {
      filters.tgl_end = dayjs(filters.tgl_end).format('YYYY-MM-DD');
  }
  
  router.push({
    query: { ...filters },
  });
}

const loading = ref(false)
const dataClientSupport = ref<any>({})
const getData = async () => {
    loading.value = true
    updateRouteParams()

    try {
      const res = await client('/api/client_support',{
        params: filters
      })
      dataClientSupport.value = res
    } catch (error) {
        console.log(error)
        loading.value = false
    } finally {
        loading.value = false
    }
}

//onMounted
onMounted(() => {
    getData()
})
</script>
