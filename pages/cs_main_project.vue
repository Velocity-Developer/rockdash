<script setup lang="ts">
definePageMeta({
    title: 'CS Main Projects',
    description: 'Data semua project',
})
const client = useSanctumClient();
const route = useRoute();
const router = useRouter();

const filters = reactive({
  page: route.query.page ? Number(route.query.page) : 1,
  per_page: 50,
  order_by: 'id',
  order: 'desc',
}) as any

const data = ref([] as any)
const loading = ref(false)
const getData = async () => {
  loading.value = true
  try {
    const res = await client('api/cs_main_project',{
      params: filters,
    });
    data.value = res;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}

const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    getData()
};

function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

onMounted(() => {
  getData()
})

// Dialog states
const visiblePreviewDialog = ref(false);
const previewId = ref(null as any);
const openPreviewDialog = (item: any) => {
  previewId.value = item.id;
  visiblePreviewDialog.value = true;
}

const visibleFormDialog = ref(false);
const selectedItem = ref({} as any);
const openFormDialog = (item: any) => {
  selectedItem.value = item;
  visibleFormDialog.value = true;
}
</script>

<template>

   <div class="flex justify-between items-center gap-1 mb-4">
      <form @submit.prevent="getData();updateRouteParams()" class="hidden text-xs md:flex items-end gap-2">
        <div>
          <div class="mb-1 opacity-50">Per Page : </div>            
          <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px] shadow rounded" />
        </div>
        <div class="hidden md:block">
            <div class="mb-1 opacity-50">Tgl Masuk</div>
            <div class="flex items-center justify-end gap-2 mt-1">
              <DatePicker v-model="filters.tgl_masuk_start" dateFormat="dd/mm/yy" placeholder="dari" size="small" class="w-[130px] shadow rounded"/>
              <DatePicker v-model="filters.tgl_masuk_end" dateFormat="dd/mm/yy" placeholder="sampai" size="small" class="w-[130px] shadow rounded"/>
            </div>
        </div>
        <div>
          <Button type="submit" size="small" severity="info" class="shadow-md">
            Go
          </Button>
        </div>
      </form>
      <Button size="small" @click="getData" :loading="loading">
        <Icon name="lucide:refresh-ccw" :class="loading?'animate-spin':''"/> Refresh
      </Button>
  </div>

  <Card>
    <template #content>
      
      <DataTable v-if="data.data" :value="data.data" size="small" class="text-sm" stripedRows scrollHeight="75vh" scrollable>
        <Column header="#" headerStyle="width:3rem">
          <template #body="slotProps">
              {{ slotProps.index + data.from }}
          </template>
        </Column>
          <Column field="webhost.nama_web" header="web">
            <template #body="slotProps">
              <NuxtLink class="hover:underline" :to="'/webhost/'+slotProps.data?.id_webhost">{{ slotProps.data?.webhost?.nama_web }}</NuxtLink>
            </template>
          </Column>          
          <Column field="jenis" header="Jenis">
            <template #body="slotProps">
              <div>
                {{ slotProps.data.jenis }}
              </div>
              <div v-if="slotProps.data.webhost?.paket?.paket" class="text-xs text-emerald-500 mt-1 xl:hidden">
                {{ slotProps.data.webhost?.paket?.paket }}
              </div>
            </template>
          </Column>
          <Column field="webhost.paket.paket" header="Paket" class="hidden xl:table-cell"></Column>
          <Column field="trf" header="Trf">
            <template #body="slotProps">
                {{ formatMoney(slotProps.data.trf) }}
            </template>
          </Column>
          <Column field="tgl_masuk" header="Masuk Tgl">        
            <template #body="slotProps">
                {{ slotProps.data.tgl_masuk }}
            </template>
          </Column>
          <Column field="cs_main_project_info.created_at" header="Tanggal">
            <template #body="slotProps">
                <template v-if="slotProps.data.cs_main_project_info?.created_at">
                  {{ formatDate(slotProps.data.cs_main_project_info.created_at,'YYYY-MM-DD HH:mm:ss') }}           
                </template>
            </template>
          </Column>
          <Column field="cs_main_project_info.author.name" header="Creator">
            <template #body="slotProps">
              <div class="truncate w-10" v-tooltip="slotProps.data?.cs_main_project_info?.author?.name">
                {{ slotProps.data?.cs_main_project_info?.author?.name }}
              </div>
            </template>
          </Column>
          <Column header="Aksi" headerStyle="width:7rem" bodyStyle="width:7rem">
            <template #body="slotProps">
              <div class="flex items-center gap-2 justify-end">
                <Button size="small" severity="contrast" @click="openPreviewDialog(slotProps.data)" v-tooltip.top="'Preview'">
                  <Icon name="lucide:eye" />
                </Button>
                <Button size="small" severity="secondary" @click="openFormDialog(slotProps.data)" v-tooltip.top="'Edit'">
                  <Icon name="lucide:pen" />
                </Button>
              </div>
            </template>
          </Column>
      </DataTable>
      
      <div v-if="data.total > 0" class="flex flex-col md:flex-row justify-center md:justify-between md:items-center text-xs mt-4">
        <div>
          {{ data.from }} - {{ data.to }} dari {{ data.total }}
        </div>

        <Paginator
          :rows="data.per_page"
          :totalRecords="data.total"
          @page="onPaginate"
          :pt="{
            root: (event: any) => {
              const itemForPage = data.per_page;
              const currentPage = filters.page - 1;
              event.state.d_first = itemForPage * currentPage;
            },
          }"
        >
        </Paginator>
      </div>

    </template>
  </Card>

  <Dialog v-model:visible="visibleFormDialog" modal header="Edit Project" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '768px': '90vw' }">
    <CsMainProjectForm :action="'edit'" :data="selectedItem" @update="getData()" />
  </Dialog>

  <Dialog v-model:visible="visiblePreviewDialog" modal header="Preview Project" :style="{ width: '40rem' }" :breakpoints="{ '1199px': '75vw', '768px': '90vw' }">
    <CsMainProjectPreview :id="previewId" />
  </Dialog>

  <DashLoader :loading="loading"/>
</template>

<style scoped></style>
