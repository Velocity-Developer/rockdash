<template>
  
  <!-- Filter untuk desktop -->
  <div class="hidden md:flex justify-between items-center gap-2 mb-2">
    <!-- View Toggle -->
    <div class="flex items-center gap-2">
      <ToggleSwitch v-model="isCalendarView" @change="toggleView" />
      <Icon name="lucide:calendar" v-if="viewMode === 'calendar'"/>
      <Icon name="lucide:list" v-if="viewMode === 'list'"/>
      <span class="text-sm font-medium">{{ viewMode === 'calendar' ? 'Kalender' : 'Daftar' }}</span>
    </div>
    
    <div class="flex items-center gap-2">
      <Select v-model="filters.user_id" :options="opsiUsers" showClear filter optionValue="value" optionLabel="label" size="small" required>
        <template #option="slotProps">
          <div class="flex items-center">
              <img :alt="slotProps.option.label" :src="slotProps.option.avatar" class="w-8 h-8 rounded-full mr-2 object-cover" />
              <div>{{ slotProps.option.label }}</div>
          </div>
        </template>
      </Select>
      <DatePicker dateFormat="yy-mm-dd" v-model="filters.date_start" size="small" />
      <DatePicker dateFormat="yy-mm-dd" v-model="filters.date_end" size="small" />
      <Button @click="getData()" size="small" :loading="loading">
        <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
        Refresh
      </Button>
      <Button @click="openFormDialog('add','')" size="small" :loading="loading">
        <Icon name="lucide:plus" />
        Tambah
      </Button>
    </div>
  </div>

  <!-- Filter untuk mobile dengan drawer -->
  <div class="flex md:hidden justify-between items-center gap-2 mb-2">
    <div class="flex items-center gap-2">
      <Button @click="visibleFilterDrawer = true" size="small" outlined>
        <Icon name="lucide:filter" />
        Filter
      </Button>
      <!-- View Toggle Mobile -->
      <div class="flex items-center gap-1">
        <Icon name="lucide:list" :class="{ 'text-blue-600': viewMode === 'list' }" class="w-4 h-4" />
        <ToggleSwitch v-model="isCalendarView" @change="toggleView" />
        <Icon name="lucide:calendar" :class="{ 'text-blue-600': viewMode === 'calendar' }" class="w-4 h-4" />
      </div>
    </div>
    <Button @click="openFormDialog('add','')" size="small" :loading="loading">
      <Icon name="lucide:plus" />
      Tambah
    </Button>
  </div>
  
  <div class="mb-5">
      <JournalDataView v-if="viewMode === 'list'" :data="data.data" @openPreviewDialog="openPreviewDialog" />
      <JournalCalendarView v-else :data="data.data" @openPreviewDialog="openPreviewDialog" />      
  </div>

  <Card
  v-if="data.per_page"
  :pt="{
    body: {
      class: 'md:py-0'
    }
  }">
    <template #content>
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

  <!-- Filter Drawer untuk Mobile -->
  <Drawer v-model:visible="visibleFilterDrawer" header="Filter Jurnal" position="right" class="!w-80">
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">User</label>
        <Select v-model="filters.user_id" :options="opsiUsers" showClear filter optionValue="value" optionLabel="label" class="w-full">
          <template #option="slotProps">
            <div class="flex items-center">
                <img :alt="slotProps.option.label" :src="slotProps.option.avatar" class="w-8 h-8 rounded-full mr-2 object-cover" />
                <div>{{ slotProps.option.label }}</div>
            </div>
          </template>
        </Select>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Tanggal Mulai</label>
        <DatePicker dateFormat="yy-mm-dd" v-model="filters.date_start" class="w-full" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Tanggal Selesai</label>
        <DatePicker dateFormat="yy-mm-dd" v-model="filters.date_end" class="w-full" />
      </div>
      
      <div class="flex gap-2 mt-4">
        <Button @click="getData(); visibleFilterDrawer = false" class="flex-1" :loading="loading">
          <Icon name="lucide:search" />
          Terapkan Filter
        </Button>
        <Button @click="getData()" outlined :loading="loading">
          <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
        </Button>
      </div>
    </div>
  </Drawer>

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
  pagination: true,
}) as any

const { data: opsiUsers } = await useAsyncData(
  'opsi-users', 
  () => client('/api/data_opsi/users'),
) as any

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

    //if isCalendarView = 'calendar' , pagination = false
    if(isCalendarView.value) {
        filters.pagination = false
    } else {
        filters.pagination = true
    }

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
// onMounted is now handled in the View Mode Toggle section above

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
// Filter Drawer
const visibleFilterDrawer = ref(false);

// View Mode Toggle
const isCalendarView = ref(false);
const viewMode = computed(() => isCalendarView.value ? 'calendar' : 'list');

// Initialize view mode from localStorage
const initializeViewMode = () => {
  if (process.client) {
    const savedView = localStorage.getItem('view_journal');
    if (savedView) {
      isCalendarView.value = savedView === 'calendar';
    }
  }
};

const toggleView = () => {
  if (process.client) {
    localStorage.setItem('view_journal', viewMode.value);
  }
  getData();
};

// Initialize view mode on component mount
onMounted(() => {
  initializeViewMode();
  getData();
});
</script>
