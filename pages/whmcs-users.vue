<template>
  <div class="space-y-4">
    
    <div class="flex justify-end items-end gap-1">
      <InputText v-model="filters.search" placeholder="Cari user.." class="w-40" size="small"/>
      <Select v-model="filters.per_page" :options="[20,50,100]" size="small"/>
      <Button @click="refresh()" size="small" severity="info">
        <Icon name="lucide:refresh-cw" :class="status==='pending'?'animate-spin':''" /> Refresh
      </Button>
    </div>

    <Card>
      <template #content>
        <DataTable :value="data.data" size="small" class="text-xs" stripedRows scrollHeight="80vh" scrollable>
          <Column header="#" headerStyle="width:3rem">
            <template #body="slotProps">
                {{ data.from + slotProps.index }}
            </template>
          </Column>
          <Column field="firstname" header="Firstname"></Column>
          <Column field="lastname" header="Lastname"></Column>
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

      </template>
    </Card>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Data Users WHMCS',
    description: 'Whmcs Users',
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
    search: '',
    order_by: 'id',
    order: 'desc',
} as any);

const { data, status, error, refresh } = await useAsyncData(
    'whmcs-user-page-'+page.value,
    () => client('/api/whmcs-user',{
        params: filters
    })
) as any
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}
</script>
