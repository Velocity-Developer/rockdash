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
            <DatePicker v-model="filters.tgl_masuk_start" placeholder="dari" size="small" class="w-[130px]"/>
            <DatePicker v-model="filters.tgl_masuk_end" placeholder="sampai" size="small" class="w-[130px]"/>
          </div>
      </div>
      <div>
        <Button type="submit" size="small">
          Go
        </Button>
      </div>
    </form>
  </div>

  <DataTable :value="data.data" size="small" class="text-sm" selectionMode="single" stripedRows scrollable>
    <Column header="#" headerStyle="width:3rem">
        <template #body="slotProps">
            {{ slotProps.index + 1 }}
        </template>
    </Column>
    <Column field="tgl" header="Tanggal"></Column>
    <Column field="jenis" header="Jenis"></Column>
    <Column field="nama_web" header="Nama Web"></Column>
    <Column field="deskripsi" header="Deskripsi"></Column>
    <Column field="transfer" header="Trf"></Column>
    <Column field="nominal" header="Nominal">
      <template #body="slotProps">
      </template>
    </Column>
    <Column field="tgl_deadline" header="Deadline"></Column>
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
    <DashLoader :loading="isLoadingDash"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Jenis Belum Terpilih',
    description: 'Daftar Transaksi Keluar Jenis Belum Terpilih',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();
const page = ref(route.query.page ? Number(route.query.page) : 1);

const filters = reactive({
    per_page: route.query.per_page || 200,
    page: computed(() => page.value),
    tgl_masuk_start: route.query.tgl_masuk_start || dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    tgl_masuk_end: route.query.tgl_masuk_end || dayjs().format('YYYY-MM-DD'),
    order_by: 'tgl_masuk',
    order: 'desc',
} as any);

//watch filters tgl_masuk_start dan tgl_masuk_end
watch(filters, () => {
    if(filters.tgl_masuk_start) {
        filters.tgl_masuk_start = dayjs(filters.tgl_masuk_start).format('YYYY-MM-DD');
        console.log(filters.tgl_masuk_start)
    }
    if(filters.tgl_masuk_end) {
        filters.tgl_masuk_end = dayjs(filters.tgl_masuk_end).format('YYYY-MM-DD');
        console.log(filters.tgl_masuk_end)
    }
})


// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data, status, error, refresh } = await useAsyncData(
    'jenis_blm_terpilih-page-'+page.value,
    () => client('/api/jenis_blm_terpilih',{
        params: filters
    })
)
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

//watch status
const isLoadingDash = ref(false)
watch(status, (newValue, oldValue) => {
    if(newValue == 'success') {
      isLoadingDash.value = false;
    } else {
      isLoadingDash.value = true;
    }
})

</script>