<template>

  <div>
    <DataTable :value="data.data" size="small" class="text-sm" stripedRows scrollHeight="70vh" scrollable>
       <Column header="#" headerStyle="width:3rem">
        <template #body="slotProps">
            {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column field="jenis" header="Jenis">
        <template #body="slotProps">
          <div>{{ slotProps.data.jenis }}</div>
          <div class="text-xs text-primary">{{ slotProps.data.webhost?.paket?.paket }}</div>
        </template>
      </Column>
      <Column field="webhost.nama_web" header="Web"></Column>
      <Column field="tgl_masuk" header="Masuk Tgl">        
        <template #body="slotProps">
            {{ formatTanggal(slotProps.data.tgl_masuk) }}
        </template>
      </Column>
      <Column field="tgl_deadline" header="Deadline Tgl">       
        <template #body="slotProps">
            {{ formatTanggal(slotProps.data.tgl_deadline) }}
        </template>
      </Column>
      <Column field="webmaster" header="Webmaster">       
        <template #body="slotProps">
            {{ slotProps.data.wm_project?.user?.name }}
        </template>
      </Column>
      <Column field="pm_project.konfirm_revisi_1" header="KF 1"></Column>
      <Column field="pm_project.fr1" header="KF 1"></Column>
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
  </div>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Project Selesai',
    description: 'Daftar Project yang sudah dikerjakan',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute()
const client = useSanctumClient()


const filters = ref({
    per_page: route.query.per_page || 50,
    page: route.query.page ? Number(route.query.page) : 1,
} as any);

const data = ref([] as any) ;
const loading = ref(false);
const getData = async () => {
  loading.value = true;
  try {
    const response = await client('/api/project_manager',{
      params: filters.value,
    });
    data.value = response;
    loading.value = false;
  } catch (error) {
    const er = useSanctumError(error);
    loading.value = false;
  }
  loading.value = false;
}
const onPaginate = (event: { page: number }) => {
    filters.value.page = event.page + 1;
    // updateRouteParams()
    getData()
};
onMounted(() => {
  getData();
})
</script>
