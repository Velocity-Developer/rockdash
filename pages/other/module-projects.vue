<template>
  <div class="md:max-w-4xl mx-auto">

    <div class="flex justify-end mb-2">
      <Button @click="openDialog('add','')" size="small">
        <Icon name="lucide:plus-circle" /> Tambah
      </Button>
    </div>
    
    <div v-if="data?.data">
      
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

  </div>

  <Dialog v-model:visible="visibleDialog" modal header="Preview" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <ModuleProjectForm :action="actionDialog" :data="dataDialog" />
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
    type: computed(() => route.query.type || ''),
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
  getData()
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
</script>