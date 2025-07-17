<template>

  <div class="pt-10">
    <DataTable :value="data.data" size="small" class="text-sm" stripedRows scrollHeight="70vh" scrollable>
      <Column field="package_name" header="Paket"></Column>
      <Column field="status" header="Status">
        <template #body="slotProps">
          {{ slotProps.data.icon }} {{ slotProps.data.status }}
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
  </div>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Check Paket',
    description: 'Check Paket server & WHMCS',
    // development: true
})

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
    const response = await client('/api/check_paket',{
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
