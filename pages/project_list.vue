<template>

  <div class="mb-3">
    <SelectButton 
    v-model="filters.jenis_project" 
    :options="[{label:'Semua',value:0},{label:'Biasa',value:10},{label:'Custom',value:12},{label:'Lainnya',value:23}]"
    optionLabel="label" optionValue="value"
    />
  </div>

  <DataTable :value="data.data" size="small" class="text-sm" stripedRows scrollHeight="75vh" scrollable>
      <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
      <Column header="No" headerStyle="width:3rem">
        <template #body="slotProps">
            {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column field="webhost.nama_web" header="Nama Web"></Column>
      <Column field="jenis" header="Jenis"></Column>
      <Column field="webhost.paket.paket" header="Paket"></Column>
      <Column field="deskripsi" header="Deskripsi">
        <template #body="slotProps">
          <div class="max-w-[200px] whitespace-normal">
            {{ slotProps.data.deskripsi }}
          </div>
        </template>
      </Column>
      <Column field="tgl_deadline" sortable header="Deadline">       
        <template #body="slotProps">
            {{ formatTanggal(slotProps.data.tgl_deadline) }}
        </template>
      </Column>
      <Column field="act" header="">       
        <template #body="slotProps">
          <Button size="small" class="text-xs" v-tooltip="'Ambil Project'">
            Ambil
          </Button>
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
                    const currentPage =  filters.page - 1;
                    event.state.d_first = itemForPage * currentPage;
                },
            }"
        >
        </Paginator>
      </div>

  <DashLoader :loading="loading"/>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Daftar Project',
    description: 'Daftar Project yang dikerjakan',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();

const route = useRoute();
const filters = ref({
  page: Number(route.query.page) || 1,
  jenis_project: Number(route.query.jenis_project) || 12,
})

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters.value },
  });
}

const data = ref([] as any) ;
const loading = ref(false);
const getData = async () => {
  loading.value = true;
  try {
    const response = await client('/api/project_list',{
      params: filters.value,
    });
    data.value = response;
  } catch (error) {
    const er = useSanctumError(error);
  }
  loading.value = false;
}
const onPaginate = (event: { page: number }) => {
    filters.value.page = event.page + 1;
    updateRouteParams()
    getData()
};

onMounted(() => {
  getData();
})

//watch filters.jenis_project
watch(filters.value, () => {
  updateRouteParams()
  getData()
})

</script>
