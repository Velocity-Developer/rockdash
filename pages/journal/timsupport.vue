<template>
  
  <!-- Mobile header: filter + actions -->
  <div class="flex md:hidden justify-end gap-2 mb-2">
    <Button @click="visibleFilterDrawer = true" size="small" outlined>
      <Icon name="lucide:filter" />
      Filter
    </Button>
    <Button @click="getData()" size="small" :loading="loading" severity="info">
      <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
      Refresh
    </Button>
    <Button @click="openFormDialog('add','')" size="small" :loading="loading">
      <Icon name="lucide:plus" />
      Tambah
    </Button>
  </div>

  <!-- Desktop filters -->
  <div class="hidden md:flex md:flex-row justify-between items-end gap-2 mb-4">
    <!-- Filter Kategori -->
    <div class="flex flex-col md:flex-row gap-1">
      <div>
        <label class="text-sm font-medium block opacity-50">
          Kategori:
        </label>
        <Select 
          v-model="filters.journal_category_id" 
          :options="categories" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Semua Kategori"
          :loading="loadingCategories"
          @change="getData()"
          showClear
          size="small"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <span class="text-sm noto-emoji">{{ slotProps.option.icon }}</span>
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-2">
              <span class="text-sm noto-emoji">{{ categories.find(c => c.id === slotProps.value)?.icon }}</span>
              <span>{{ categories.find(c => c.id === slotProps.value)?.name }}</span>
            </div>
            <span v-else class="text-gray-500">Semua Kategori</span>
          </template>
        </Select>
      </div>
      
      <!-- Filter Status -->
      <div>
        <label class="text-sm block font-medium opacity-50">
          Status:
        </label>
        <Select 
          v-model="filters.status" 
          :options="statusOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Semua Status"
          @change="getData()"
          showClear
          size="small"
        />
      </div>
      
      <!-- Filter User -->
      <div>
        <label class="text-sm block font-medium opacity-50">
          User:
        </label>
        <Select 
          v-model="filters.user_id" 
          :options="users" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Semua User"
          :loading="loadingUsers"
          @change="getData()"
          :clearable="true"
          size="small"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <Avatar 
                :image="slotProps.option.avatar_url" 
                shape="circle" 
                size="small" 
                class="w-6 h-6"
              />
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-2">
              <Avatar 
                :image="users.find(u => u.id === slotProps.value)?.avatar_url" 
                shape="circle" 
                size="small" 
                class="w-6 h-6"
              />
              <span>{{ users.find(u => u.id === slotProps.value)?.name }}</span>
            </div>
            <span v-else class="text-gray-500">Semua User</span>
          </template>
        </Select>
      </div>
    </div>


    <!-- Action Buttons -->
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
  </div>
  
  <Card class="shadow mt-4">
    <template #content>

      <DataTable :value="data.data" stripedRows responsiveLayout="scroll" size="small" class="text-sm">
         <Column field="journal_category" header="Kategori" :sortable="false">
          <template #body="slotProps">
            <div class="flex items-start gap-2">
                <span v-tooltip="slotProps.data.journal_category?.name" class="noto-emoji w-5 h-5 flex items-center justify-center bg-indigo-200 dark:bg-indigo-800 text-sm p-1 rounded-full">
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
              {{ purifyHtml(slotProps.data.description, 30) }}
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
        <Column header="Aksi" style="width: 80px">
          <template #body="slotProps">
            <div class="flex gap-1 justify-center">
              <Button size="small" severity="contrast" @click="openFormDialog('clone', slotProps.data)" v-tooltip.top="'Clone Jurnal'">
                <Icon name="lucide:copy" />
              </Button>
              <Button size="small" severity="secondary" @click="openFormDialog('edit', slotProps.data)" v-tooltip.top="'Edit Jurnal'">
                <Icon name="lucide:pen" />
              </Button>
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
  <Dialog v-model:visible="visibleFormDialog" modal :header="getDialogHeader()" :style="{ width: '50rem' }">
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
  
  <!-- Filter Drawer untuk Mobile -->
  <Drawer v-model:visible="visibleFilterDrawer" header="Filter Jurnal Support" position="right" class="!w-80">
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">Kategori</label>
        <Select 
          v-model="filters.journal_category_id" 
          :options="categories" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Semua Kategori"
          :loading="loadingCategories"
          showClear
          size="small"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <span class="text-sm noto-emoji">{{ slotProps.option.icon }}</span>
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-2">
              <span class="text-sm noto-emoji">{{ categories.find(c => c.id === slotProps.value)?.icon }}</span>
              <span>{{ categories.find(c => c.id === slotProps.value)?.name }}</span>
            </div>
            <span v-else class="text-gray-500">Semua Kategori</span>
          </template>
        </Select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Status</label>
        <Select 
          v-model="filters.status" 
          :options="statusOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Semua Status"
          showClear
          size="small"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">User</label>
        <Select 
          v-model="filters.user_id" 
          :options="users" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Semua User"
          :loading="loadingUsers"
          showClear
          size="small"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <Avatar 
                :image="slotProps.option.avatar_url" 
                shape="circle" 
                size="small" 
                class="w-6 h-6"
              />
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-2">
              <Avatar 
                :image="users.find(u => u.id === slotProps.value)?.avatar_url" 
                shape="circle" 
                size="small" 
                class="w-6 h-6"
              />
              <span>{{ users.find(u => u.id === slotProps.value)?.name }}</span>
            </div>
            <span v-else class="text-gray-500">Semua User</span>
          </template>
        </Select>
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
  journal_category_id: null,
  status: null,
  page: route.query.page ? Number(route.query.page) : 1,
  pagination: true,
  order: 'desc',
}) as any

const loading = ref(false);
const data = ref({} as any);
const categories = ref([] as any[]);
const loadingCategories = ref(false);
const users = ref([] as any[]);
const loadingUsers = ref(false);

// Status options
const statusOptions = [
  { label: 'Semua Status', value: null },
  { label: 'Follow Up', value: 'followup' },
  { label: 'Proses', value: 'ongoing' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Batal', value: 'cancelled' },
  { label: 'Arsip', value: 'archived' },
  { label: 'Draft', value: 'draft' }
]

// Fungsi untuk mengambil daftar kategori dengan role support
const getCategories = async () => {
  loadingCategories.value = true;
  try {
    const res = await client('/api/journal_category', {
      params: {
        role: 'support',
        per_page: 100 // Ambil semua kategori support
      }
    }) as any;
    categories.value = res.data || [];
  } catch (error) {
    console.log('Error fetching categories:', error);
  }
  loadingCategories.value = false;
}

// Fungsi untuk mengambil daftar user dengan role support
const getUsers = async () => {
  loadingUsers.value = true;
  try {
    const res = await client('/api/users', {
      params: {
        role: 'support',
        per_page: 100 // Ambil semua user support
      }
    }) as any;
    users.value = res.data || [];
  } catch (error) {
    console.log('Error fetching users:', error);
  }
  loadingUsers.value = false;
}

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

  if(action === 'clone' && item) {
    // Untuk clone, kirim full item dengan id untuk API call
    selectedItem.value = item;
  } else if(action === 'edit' && item) {
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

const getDialogHeader = () => {
  switch (actionFormDialog.value) {
    case 'add':
      return 'Tambah Jurnal';
    case 'edit':
      return 'Edit Jurnal';
    case 'clone':
      return 'Tambah Jurnal (Clone)';
    default:
      return 'Jurnal';
  }
}

// Filter Drawer (mobile)
const visibleFilterDrawer = ref(false);

// Initialize on component mount
onMounted(() => {
  getCategories();
  getUsers();
  getData();
});
</script>
