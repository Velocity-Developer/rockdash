<template>
  
  <div class="flex justify-end items-center gap-2 mb-2">
    <Select v-model="filters.user_id" :options="opsiUsers" showClear filter optionValue="value" optionLabel="label" size="small" required>
      <template #option="slotProps">
        <div class="flex items-center">
            <img :alt="slotProps.option.label" :src="slotProps.option.avatar" class="w-8 h-8 rounded-full mr-2 object-cover" />
            <div>{{ slotProps.option.label }}</div>
        </div>
      </template>
    </Select>
    <DatePicker v-model="filters.date_start" size="small"/>
    <DatePicker v-model="filters.date_end" size="small"/>
    <Button @click="getData()" size="small" :loading="loading">
      <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
      Refresh
    </Button>
    <Button @click="openFormDialog('add','')" size="small" :loading="loading">
      <Icon name="lucide:plus" />
      Tambah
    </Button>
  </div>

  <Card>
    <template #content>
      <DataTable 
          :value="data.data" 
          size="small" class="text-sm" 
          selectionMode="multiple" 
          stripedRows scrollable scrollHeight="70vh"
        >
          <Column field="title" header="Judul">
            <template #body="slotProps">
              <span @click="openPreviewDialog(slotProps.data)">
              {{ slotProps.data.title }}
              </span>
            </template>
          </Column>
          <Column field="description" header="Deskripsi">
            <template #body="slotProps">
              {{ slotProps.data.description }}
            </template>
          </Column>
          <Column field="web" header="Web">
            <template #body="slotProps">
              <span class="block" v-if="slotProps.data.webhost">
                {{ slotProps.data.webhost?.nama_web }}
              </span>
              <Badge v-if="slotProps.data.cs_main_project" size="small">
                {{ slotProps.data.cs_main_project?.jenis }}
              </Badge>
            </template>
          </Column>
          <Column field="start" header="Waktu">
            <template #body="slotProps">
              <div class="flex items-center gap-1">
               <Icon name="lucide:clock" />
               <span class="text-xs whitespace-nowrap">{{ formatDate(slotProps.data.start,'DD/MM/YY HH:mm') }}</span>
              </div>
              <div v-if="slotProps.data.end" class="text-teal-500 flex items-center gap-1">
                <Icon name="lucide:circle-check" />
                <span class="text-xs whitespace-nowrap">{{ formatDate(slotProps.data.end,'DD/MM/YY HH:mm') }}</span>
              </div>
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="slotProps">
              <JournalBadgeStatus :status="slotProps.data.status" />
            </template>
          </Column>
          <Column field="act" header="">
            <template #body="slotProps">
              <AvatarGroup>
                <Avatar :image="slotProps.data.user?.avatar_url" shape="circle" v-tooltip.left="slotProps.data.user?.name" class="hover:relative"/>
                <Avatar @click="openPreviewDialog(slotProps.data)" :label="slotProps.data.journal_category.icon" v-tooltip.left="slotProps.data.journal_category.name" class="bg-indigo-300 hover:animate-pulse" shape="circle" />
                <Avatar shape="circle" class="cursor-pointer bg-sky-300" v-tooltip.left="'Edit'" @click="openFormDialog('edit',slotProps.data)">
                  <Icon name="lucide:pen" mode="svg"/>
                </Avatar>
              </AvatarGroup>              
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
    </template>
  </Card>

  <!-- Form Dialog -->
  <Dialog v-model:visible="visibleFormDialog" modal :header="actionFormDialog === 'add' ? 'Tambah Jurnal' : 'Edit Jurnal'" :style="{ width: '50rem' }">
    <JournalForm :action="actionFormDialog" :item="selectedItem" @update="getData" @delete="deletedJournal"/>
  </Dialog>

  <!-- Preview Dialog -->
  <Dialog v-model:visible="visiblePreviewDialog" modal header="Detail Jurnal" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <JournalPreview :journal="selectedPreviewItem" />
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button @click="openFormDialog('edit', selectedPreviewItem)" size="small">
          <Icon name="lucide:pen" /> Edit
        </Button>
        <Button @click="visiblePreviewDialog = false" size="small">
          Tutup
        </Button>
      </div>
    </template>
  </Dialog>

  <DashLoader :loading="loading" />
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Jurnal',
    description: 'Daftar Jurnal',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();
const route = useRoute();

const filters = reactive({
  date_start: dayjs().startOf('month').format('YYYY-MM-DD'),
  date_end: dayjs().format('YYYY-MM-DD'),
  user_id: '',
  page: route.query.page ? Number(route.query.page) : 1,
}) as any

const { data: opsiUsers } = await useAsyncData(
  'opsi-users', 
  () => client('/api/data_opsi/users'),
) as any

const loading = ref(false);
const data = ref({} as any);
const getData = async () => {
    loading.value = true;
    try {
      const res = await client('/api/journal',{
        params: filters,
      }) as any
      data.value = res;
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
}
const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    getData()
};
onMounted(() => {
    getData()
})

// Form Dialog
const visibleFormDialog = ref(false);
const actionFormDialog = ref('add');
const selectedItem = ref({} as any);
const openFormDialog = (action:string,item:any) => {
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

// Preview Dialog
const visiblePreviewDialog = ref(false);
const selectedPreviewItem = ref({} as any);
const openPreviewDialog = (item: any) => {
  visiblePreviewDialog.value = true;
  selectedPreviewItem.value = item;
}

const deletedJournal = () => {
  getData()
  visibleFormDialog.value = false;
  selectedItem.value = {};
}
</script>
