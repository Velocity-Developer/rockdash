<template>
  <div class="space-y-2">
    
    <div class="flex items-center justify-end gap-1">
      <Button size="small">
        <Icon name="lucide:plus" /> Tambah
      </Button>
      <Select @change="refreshDataImproveChat();updateRouteParams()" v-model="filters.per_page" :options="[25,50,100,500]" size="small"/>
      <Button @click="refreshDataImproveChat()" size="small">
        <Icon name="lucide:refresh-cw" :class="statusDataImproveChat=='pending'?'animate-spin':''"/> Refresh
      </Button>
    </div>
    <Card>
      <template #content>
        <DataTable :value="dataImproveChat.data" :loading="statusDataImproveChat=='pending'" size="small" class="text-sm" stripedRows scrollHeight="70vh" scrollable>
          <Column header="#" headerStyle="width:3rem">
              <template #body="slotProps">
                  {{ slotProps.index + dataImproveChat.from }}
              </template>
          </Column>
          <Column field="kategori" header="Kategori">        
              <template #body="slotProps">
                  {{ slotProps.data.kategori }}
              </template>
          </Column>
          <Column field="nohp" header="No.HP">        
              <template #body="slotProps">
                  {{ slotProps.data.nohp }}
              </template>
          </Column>
          <Column field="masukkan" header="Masukkan">        
              <template #body="slotProps">
                  {{ slotProps.data.masukkan }}
              </template>
          </Column>
          <Column field="created_at" sortable header="Tanggal">        
            <template #body="slotProps">
                {{ formatDate(slotProps.data.created_at,'DD/MM/YY HH:mm') }}
            </template>
          </Column>
        </DataTable>
        <div class="flex justify-between items-center text-xs mt-3">
            <div>
              {{ dataImproveChat.from }} - {{ dataImproveChat.to }} dari {{ dataImproveChat.total }}
            </div>
            <Paginator
                :rows="dataImproveChat.per_page"
                :totalRecords="dataImproveChat.total"
                @page="onPaginate"
                :pt="{
                    root: (event: any) => {
                        const itemForPage =  dataImproveChat.per_page;
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
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Improve Chat',
    description: 'Daftar Improve Chat',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();

const filters = reactive({
    per_page: route.query.per_page?Number(route.query.per_page):Number(25),
    page: route.query.page || 1,
    search: route.query.search || '',
} as any);

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data: dataImproveChat, status: statusDataImproveChat, refresh: refreshDataImproveChat } = await useAsyncData(
    'improve-chat-page-'+filters.page,
    () => client('/api/improve-chat',{
        params: filters
    })
) as any
const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    updateRouteParams()
    refreshDataImproveChat()
};
</script>
