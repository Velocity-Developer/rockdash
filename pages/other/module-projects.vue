<template>
  <div class="md:max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">

    <div class="md:col-span-3">
      <div class="flex justify-end md:justify-between md:items-center mb-2">
        <div class="flex items-center gap-2">
          <Select 
            v-model="filters.type" 
            size="small"
            @change="getData()"
            optionLabel="label"
            optionValue="value"
            :options="[
              { label: 'Semua', value: ' ' },
              { label: 'Plugin', value: 'plugin' },
              { label: 'Theme', value: 'theme' },
              { label: 'Child Theme', value: 'child_theme' }
            ]"
          />
          <InputText 
            v-model="filters.q" 
            size="small" 
            placeholder="Cari.."
            @change="getData()"
          />
          <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
        </div>
        <Button @click="openDialog('add','')" size="small">
          <Icon name="lucide:plus-circle" /> Tambah
        </Button>
      </div>
      
      <div v-if="data?.data" class="space-y-3">
        
        <Card>
          <template #content>
            <DataTable :value="data.data" size="small" class="text-xs" stripedRows scrollHeight="70vh" scrollable>
              <Column field="name" header="Name" />
              <Column field="version" header="Version" />
              <Column field="type" header="Type" />
              <Column field="action" header="">
                <template #body="slotProps">
                  <div class="flex justify-end items-center gap-1">
                    <Button size="small" severity="success" as="a" :href="slotProps.data.download_url" target="_blank">
                        <Icon name="lucide:download" />
                    </Button>
                    <Button size="small" severity="contrast" as="a" :href="slotProps.data.github_url" target="_blank">
                        <Icon name="lucide:github" />
                    </Button>
                    <Button size="small" @click="openDialog('edit',slotProps.data)">
                      <Icon name="lucide:edit" />
                    </Button>
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <Card
          :pt="{
            body: '!py-0 !px-2',
          }"
        >
          <template #content>
            <div class="flex justify-between items-center text-xs">
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
          </template>
        </Card>

      </div>
    </div>
    
    <div class="md:col-span-1">

      <div v-if="loadingTotalByType" class="animate-pulse text-xs">
        <Icon name="lucide:loader-circle" class="animate-spin" /> Hitung total modul..
      </div>

      <div v-if="totalByType" class="space-y-2">
        <div v-for="(item, index) in totalByType" :key="index">
          <Card
            :pt="{
              body: '!py-2 !px-4',
            }"
            class="w-full"
          >
            <template #content>
              <div class="flex justify-between items-top gap-3">
                <div>
                  <Icon name="lucide:box" />
                  <div>{{ index }}</div>
                </div>
                <div class="text-2xl font-bold text-right">{{ item }}</div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

  </div>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog === 'add' ? 'Tambah' : 'Update'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">  
    <ModuleProjectForm :action="actionDialog" :data="dataDialog" @submit="getData" />
  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Module Projects',
    description: 'Daftar modul projek',
})
const route = useRoute()
const client = useSanctumClient()

const filters = reactive({
    per_page: 20,
    page: computed(() => route.query.page || 1),
    type: ' ',
    q: route.query.q || '',
} as any)

const loading = ref(false)
const data = ref({} as any)
const getData = async () => {
  loading.value = true
  try {
    const res = await client('/api/module-projects',{
        params: filters
    })
    loading.value = false
    data.value = res
  } catch (error) {
    const er = useSanctumError(error)
    loading.value = false
  }
}
onMounted(() => {
  //setelah data diambil, ambil total by type
  getData()
  getTotalByType()
})

const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    getData()
};

// Dialog state
const visibleDialog = ref(false);
const actionDialog = ref('add');
const dataDialog = ref({});
const openDialog = async (action: string, data = {}) => {
  visibleDialog.value = true;
  actionDialog.value = action;
  dataDialog.value = data;
}


//total by type
const totalByType = ref({} as any)
const loadingTotalByType = ref(false)
const getTotalByType = async () => {
  loadingTotalByType.value = true
  try {
    const res = await client('/api/module-project-total-by-type')
    totalByType.value = res
  } catch (error) {
    const er = useSanctumError(error)
  } finally {
    loadingTotalByType.value = false
  }
}
</script>