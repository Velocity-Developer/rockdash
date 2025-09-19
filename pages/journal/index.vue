<template>
  
  <!-- Filter untuk desktop -->
  <div class="hidden md:block mb-2">
    <!-- View Toggle -->
    <div class="flex items-center justify-end gap-2 mb-1">
      <SelectButton v-model="viewMode" :options="viewOptions" optionLabel="label" optionValue="value" @change="toggleView" size="small"/>
      <Button @click="openFormDialog('add','')" size="small" :loading="loading">
        <Icon name="lucide:plus" />
        Tambah
      </Button>
    </div>
    
    <div class="flex items-center justify-end gap-2">
      <Select v-model="filters.role" :options="opsiRoles" showClear optionValue="value" optionLabel="label" size="small" placeholder="Pilih Role">
      </Select>
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
      <Button @click="getData()" size="small" :loading="loading" severity="info">
        <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
        Refresh
      </Button>
    </div>
  </div>

  <!-- Filter untuk mobile dengan drawer -->
  <div class="flex flex-col md:hidden gap-2 mb-2">
    <div class="flex items-center gap-2">
      <Button @click="visibleFilterDrawer = true" size="small" outlined>
        <Icon name="lucide:filter" />
        Filter
      </Button>
      <!-- View Toggle Mobile -->
      <div class="flex items-center gap-1">
        <SelectButton v-model="viewMode" :options="viewOptions" optionLabel="label" optionValue="value" @change="toggleView" size="small" />
      </div>
    </div>
    <Button @click="openFormDialog('add','')" size="small" :loading="loading">
      <Icon name="lucide:plus" />
      Tambah
    </Button>
  </div>
  
  <div v-if="data?.categoryStats" class="overflow-x-auto overflow-y-hidden mb-5">
    <div class="flex items-center gap-3 my-1 mr-1">
      <Card v-for="item in data?.categoryStats" :key="item.category_id" class="min-w-[220px]">
        <template #content>
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 text-2xl flex items-center justify-center whitespace-nowrap bg-indigo-100 dark:bg-indigo-700 rounded-full mr-3">
              {{ item.icon }}
            </div>
            <div>
              <div class="text-2xl font-bold">{{ item.jumlah }}</div>
              <div class="text-xs font-medium">{{ item.nama }}</div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>

  <div class="mb-5">
      <JournalDataView v-if="viewMode === 'list'" :data="data.data" @openPreviewDialog="openPreviewDialog" />
      <JournalCalendarView v-else-if="viewMode === 'calendar'" :data="data.data" :start="filters.date_start" :end="filters.date_end" @openPreviewDialog="openPreviewDialog" />
      <JournalDataTable v-else-if="viewMode === 'table'" :data="data.data" @openPreviewDialog="openPreviewDialog" />      
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

  <!-- Filter Drawer untuk Mobile -->
  <Drawer v-model:visible="visibleFilterDrawer" header="Filter Jurnal" position="right" class="!w-80">
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">Role</label>
        <Select v-model="filters.role" :options="opsiRoles" showClear optionValue="value" optionLabel="label" class="w-full" placeholder="Pilih Role">
        </Select>
      </div>
      
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
const router = useRouter();
const useConfig = useConfigStore()
const defaultUser = () => {
  if(useConfig.config?.role === 'admin'&& !route.query.user_id) {
    return ''
  } else {
    return useConfig.config?.user?.id
  }
}

const filters = reactive({
  date_start: route.query.date_start || dayjs().startOf('month').format('YYYY-MM-DD'),  
  date_end: route.query.date_end || dayjs().format('YYYY-MM-DD'),
  role: route.query.role || '',
  user_id: route.query.user_id || defaultUser,
  page: route.query.page ? Number(route.query.page) : 1,
  pagination: route.query.page ? true : false,
  order: 'asc',
}) as any

// Fungsi untuk mengubah params filters menjadi query URL route
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data: opsiUsers } = await useAsyncData(
  'opsi-users', 
  () => client('/api/data_opsi/users'),
) as any

const { data: opsiRoles } = await useAsyncData(
  'opsi-roles', 
  () => client('/api/option/roles'),
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

    //if viewMode = 'calendar' , pagination = false
    if(viewMode.value === 'calendar') {
        filters.pagination = false
        filters.order = 'asc'
    } else {
        filters.pagination = true
        filters.order = 'desc'
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

    // Update route params setelah data diambil
    updateRouteParams();
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
const viewMode = ref('list');
const viewOptions = [
  { label: 'Daftar', value: 'list', icon: 'lucide:list' },
  { label: 'Kalender', value: 'calendar', icon: 'lucide:calendar' },
  { label: 'Tabel', value: 'table', icon: 'lucide:table' }
];

// Initialize view mode from localStorage
const initializeViewMode = () => {
  if (process.client) {
    const savedView = localStorage.getItem('view_journal');
    if (savedView && ['list', 'calendar', 'table'].includes(savedView)) {
      viewMode.value = savedView;
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

//watch user_id
watch(() => useConfig.config?.user?.id, (newVal) => {
  if(newVal) {
    filters.user_id = newVal
    getData()
  }
})
</script>
