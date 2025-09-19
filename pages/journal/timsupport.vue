<template>
      
  <div class="flex justify-end items-center gap-1">
    <Button @click="getData()" size="small" :loading="loading" severity="info">
      <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
      Refresh
    </Button>
    <Button @click="openFormDialog('add','')" size="small" :loading="loading">
      <Icon name="lucide:plus" />
      Tambah
    </Button>
  </div>
  
  <Card class="shadow mt-4">
    <template #content>

      <DataTable :value="data.data" stripedRows responsiveLayout="scroll" size="small" class="text-sm">
         <Column field="journal_category" header="Kategori" :sortable="false">
          <template #body="slotProps">
            <div class="flex items-start gap-2">
                <span v-tooltip="slotProps.data.journal_category?.name" class="w-5 h-5 flex items-center justify-center bg-indigo-200 text-sm p-1 rounded-full">
                  {{ slotProps.data.journal_category?.icon }}
                </span>
                <div>
                  <div class="hover:underline cursor-pointer text-sm" @click="openPreviewDialog(slotProps.data)">
                    {{ slotProps.data.journal_category?.name }}
                  </div>
                </div>
              </div>
          </template>
        </Column>
        <Column field="hp" header="Hp" :sortable="false">
          <template #body="slotProps">            
            <template v-if="slotProps.data.detail_support?.hp">
              {{ slotProps.data.detail_support?.hp }}
            </template>
          </template>
        </Column>
        <Column field="wa" header="WA"  class="hidden md:table-cell">
          <template #body="slotProps">           
            <template v-if="slotProps.data.detail_support?.wa">
              {{ slotProps.data.detail_support?.wa }}
            </template>
          </template>
        </Column>
        <Column field="webhost.nama_web" header="Web" :sortable="false">
          <template #body="slotProps">           
            <template v-if="slotProps.data.webhost?.nama_web">
              {{ slotProps.data.webhost?.nama_web }}
            </template>
          </template>
        </Column>
        <Column field="start" header="Masuk" :sortable="false">
          <template #body="slotProps">           
            <template v-if="slotProps.data.start">
              {{ formatDate(slotProps.data.start,'DD/MM/YY HH:mm') }}
            </template>
          </template>
        </Column>
        <Column field="end" header="Selesai" :sortable="false">
          <template #body="slotProps">
            <template v-if="slotProps.data.end">
              {{ formatDate(slotProps.data.end,'DD/MM/YY HH:mm') }}
            </template>
          </template>
        </Column>
        <Column field="description" header="Detail" class="hidden md:table-cell">
          <template #body="slotProps">         
            <div class="truncate text-xs w-[150px]" v-tooltip="slotProps.data.description">
              {{ slotProps.data.description }}
            </div>  
          </template>
        </Column>
        <Column field="biaya" header="Biaya" :sortable="false">
          <template #body="slotProps">           
              <template v-if="slotProps.data.detail_support?.biaya">
                {{ formatMoney(slotProps.data.detail_support?.biaya,'Rp',0) }}
                <div class="text-xs text-green-500" v-if="slotProps.data.detail_support?.tanggal_bayar" v-tooltip="'Sudah dibayar'">
                  <Icon name="lucide:circle-check" class="opacity-50"/> {{ formatDate(slotProps.data.detail_support?.tanggal_bayar,'DD/MM/YY HH:mm') }}
                </div>
              </template>
              <template v-else>
                <Icon name="lucide:circle-x" class="opacity-50"/>
              </template>
          </template>
        </Column>
        <Column field="status" header="Status" :sortable="false">
          <template #body="slotProps">
              <JournalBadgeStatus :status="slotProps.data.status" />
          </template>
        </Column>
        <Column field="user.name" header="User" style="width: 60px">
          <template #body="slotProps">
            <div class="flex justify-center">
              <Avatar 
                :image="slotProps.data.user?.avatar_url" 
                shape="circle" 
                size="small" 
                class="w-8 h-8" 
                v-tooltip.top="slotProps.data.user?.name"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex flex-col md:flex-row justify-center md:justify-between md:items-center text-xs">
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

  <!-- Form Dialog -->
  <Dialog v-model:visible="visibleFormDialog" modal :header="actionFormDialog === 'add' ? 'Tambah Jurnal' : 'Edit Jurnal'" :style="{ width: '50rem' }">
    <JournalForm 
      :action="actionFormDialog" 
      :item="selectedItem" 
      @update="getData" 
      @delete="deletedJournal"
      defaultRole="support"
    />
  </Dialog>

  <!-- Preview Dialog -->
  <Dialog v-model:visible="visiblePreviewDialog" modal header="Detail Jurnal" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '768px': '90vw' }">
    <JournalPreview :journal="selectedPreviewItem" />
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="openFormDialog('edit', selectedPreviewItem)" size="small">
          <Icon name="lucide:pen" /> Edit
        </Button>
        <Button severity="contrast" @click="visiblePreviewDialog = false" size="small">
          <Icon name="lucide:x" /> Tutup
        </Button>
      </div>
    </template>
  </Dialog>
  
  <DashLoader :loading="loading" />
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Jurnal Tim Support',
    description: 'Daftar Jurnal Tim Support',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();
const route = useRoute();
const useConfig = useConfigStore()

const filters = reactive({
  date_start: '',
  date_end: '',
  role: 'support',
  user_id: '',
  page: route.query.page ? Number(route.query.page) : 1,
  pagination: true,
  order: 'desc',
}) as any

const loading = ref(false);
const data = ref({} as any);
const getData = async () => {
    loading.value = true;

    //ubah format date
    if(filters.date_start) {
      filters.date_start = dayjs(filters.date_start).local().format('YYYY-MM-DD')
    }
    if(filters.date_end) {
      filters.date_end = dayjs(filters.date_end).local().format('YYYY-MM-DD')
    }

    try {
      const res = await client('/api/journal',{
        params: filters,
      }) as any
      data.value = res;
      
      // categoryStats sekarang sudah dihitung di backend
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
}
const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    getData()
};

// Preview Dialog
const visiblePreviewDialog = ref(false);
const selectedPreviewItem = ref({} as any);
const openPreviewDialog = (item: any) => {
  visiblePreviewDialog.value = true;
  selectedPreviewItem.value = item;
}

const visibleFormDialog = ref(false);
const selectedItem = ref({} as any);
const actionFormDialog = ref('add');
const openFormDialog = (action: string, item: any) => {
  visibleFormDialog.value = true;
  actionFormDialog.value = action;
  if(item) {
    selectedItem.value = item;
  } else {
    selectedItem.value = {};
  }
  // Tutup preview dialog jika sedang terbuka
  visiblePreviewDialog.value = false;
}

const deletedJournal = () => {
  getData()
  visibleFormDialog.value = false;
  selectedItem.value = {};
}

// Initialize on component mount
onMounted(() => {
  getData();
});
</script>