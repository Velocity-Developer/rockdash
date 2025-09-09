<template>
        
      <div class="w-full flex flex-col md:flex-row gap-2 md:justify-between items-end text-xs mb-5">
        <form @submit.prevent="refresh();updateRouteParams()" class="flex items-end gap-2">
          <div>
            <div class="mb-1 opacity-50">Per Page : </div>            
            <InputText type="number" v-model="filters.per_page" placeholder="per Page" size="small" class="w-[70px] shadow rounded" />
          </div>
          <div class="hidden md:block">
              <div class="mb-1 opacity-50">Tanggal</div>
              <div class="flex items-center justify-end gap-2 mt-1">
                <DatePicker v-model="filters.tanggal_start" dateFormat="dd/mm/yy" placeholder="dari" size="small" class="w-[130px] shadow rounded"/>
                <DatePicker v-model="filters.tanggal_end" dateFormat="dd/mm/yy" placeholder="sampai" size="small" class="w-[130px] shadow rounded"/>
              </div>
          </div>
          <div>
            <Button type="submit" size="small" severity="info" class="shadow-md">
              Go
            </Button>
          </div>
        </form>

        <div class="flex justify-end items-center gap-2">
          <Button @click="openDialog('add')" size="small" class="shadow-md">
            <Icon name="lucide:plus-circle" /> Tambah
          </Button>
          <Button @click="visibleDrawerFilter = true" size="small" severity="info" class="shadow-md">
            <Icon name="lucide:filter" /> Filter
            <span
            class="w-2 h-2 bg-yellow-300 rounded-full inline-block absolute top-0 right-0 m-1"
            v-if="filters.nomor || filters.unit || filters.nama || filters.status"
            ></span>
          </Button>
        </div>
      </div>

      <Card>
        <template #content>
          <DataTable @sort="handleSortTable" :value="data.data" size="small" class="text-xs" v-model:selection="selectedRows" stripedRows scrollHeight="70vh" scrollable>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column header="#" headerStyle="width:3rem">
              <template #body="slotProps">
                  {{ slotProps.index + 1 }}
              </template>
            </Column>
            <Column field="nomor" header="Nomor Invoice" sortable>
              <template #body="slotProps">
                <div class="group relative py-1">
                  <span @click="openPreview(slotProps.data.id)" class="hover:underline cursor-pointer">
                    {{ slotProps.data.nomor }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="unit" header="Unit">
              <template #body="slotProps">
                <span class="uppercase">{{ slotProps.data.unit }}</span>
              </template>
            </Column>
            <Column field="nama_klien" header="Nama Klien">
              <template #body="slotProps">
                <div class="max-w-[200px] whitespace-normal">
                  {{ slotProps.data.customer?.nama }}
                </div>
              </template>
            </Column>           
            <Column field="status" header="Status" sortable>
              <template #body="slotProps">
                <Tag class="!text-xs" :severity="getStatusSeverity(slotProps.data.status)">
                  {{ slotProps.data.status }}
                </Tag>
              </template>
            </Column>
            <Column field="tanggal" sortable header="Tanggal">        
              <template #body="slotProps">
                  {{ slotProps.data.tanggal }}
              </template>
            </Column>
            <Column field="total" header="Total">
              <template #body="slotProps">
                  {{ formatMoney(calculateTotal(slotProps.data.items)) }}
              </template>
            </Column>
            <Column field="act" header="">
              <template #body="slotProps">
                <div class="flex item-center gap-1 justify-end">
                  <Button @click="printInvoice(slotProps.data.id)" severity="contrast" size="small">
                    <Icon name="lucide:printer" />
                  </Button>
                  <Button @click="openDialog('edit',slotProps.data)" severity="info" size="small">
                    <Icon name="lucide:pencil" />
                  </Button>
                  <Button @click="confirmDelete(slotProps.data.id)" severity="danger" size="small">
                    <Icon name="lucide:trash-2" />
                  </Button>
                </div>
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
                        const currentPage =  page - 1;
                        event.state.d_first = itemForPage * currentPage;
                    },
                }"
            >
            </Paginator>
          </div>
        </template>
      </Card>

      <div class="mt-3">
        <Button v-if="selectedRowsNomor" @click="copyToClipboard()" size="small">
          <Icon name="lucide:copy" /> Copy Nomor Invoice
        </Button>
      </div>
    

  <Drawer v-model:visible="visibleDrawerFilter" header="Filters" position="right">
    <form @submit.prevent="filterSubmit">

      <ScrollPanel style="width: 100%; height: 69vh">
        <div v-for="item in fieldsFilter" class="mb-3 md:mb-4">
          <label class="mb-1 block text-sm" :for="item.key">
            {{ item.label }}
          </label>

          <DatePicker
            v-if="item.key == 'tanggal_start' || item.key == 'tanggal_end'"
            v-model="filters[item.key]"
            class="w-full mb-1" 
            size="small"
            :placeholder="item.label" 
          />

          <Select
            v-else-if="item.key == 'status'"
            v-model="filters[item.key]"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full mb-1"
            size="small"
            :placeholder="item.label"
          />

          <InputText 
            v-else
            v-model="filters[item.key]"
            :id="item.key" 
            class="w-full" 
            :placeholder="item.label" 
            size="small"
          />
        </div>
      </ScrollPanel>
      
      <div>
        <Button type="submit" class="w-full shadow">
          <Icon name="lucide:filter" /> Filter
        </Button>
        <Button @click="resetFilters()" severity="contrast" class="w-full mt-3 shadow">
          <Icon name="lucide:x" /> Reset
        </Button>
      </div>
    </form>
  </Drawer>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah Invoice':'Edit Invoice'" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <InvoiceForm 
      :action="actionDialog as 'add' | 'edit'"
      :model-value="dataDialog" 
      @update="refresh()" 
      @close="visibleDialog = false"
    />
  </Dialog>

  <Dialog v-model:visible="visibleDialogPreview" modal header="Preview Invoice" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <InvoicePreview v-if="previewId" :id="previewId" />
  </Dialog>

  <DashLoader :loading="isLoadingDash"/>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Invoice',
    description: 'Daftar Invoice',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();

const page = ref(route.query.page ? Number(route.query.page) : 1);

const filters = reactive({
    per_page: route.query.per_page || 50,
    page: computed(() => page.value),
    tanggal_start: route.query.tanggal_start || '',
    tanggal_end: route.query.tanggal_end || '',
    nomor: route.query.nomor || '',
    unit: route.query.unit || '',
    nama_klien: route.query.nama_klien || '',
    status: route.query.status || '',
    order_by: 'tanggal',
    order: 'desc',
} as any);

// Status options untuk dropdown
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Canceled', value: 'canceled' }
];

// Fungsi untuk mendapatkan severity berdasarkan status
function getStatusSeverity(status: string) {
  switch(status) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'canceled': return 'danger';
    default: return 'info';
  }
}

// Fungsi untuk menghitung total dari items
function calculateTotal(items: any[]) {
  if (!items || !items.length) return 0;
  return items.reduce((sum, item) => sum + (Number(item.harga) || 0), 0);
}

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data, status, error, refresh } = await useAsyncData(
    'invoice-page-'+page.value,
    () => client('/api/invoice',{
        params: filters
    })
) as any
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

//watch filters.tanggal_start dan filters.tanggal_end
watch(filters, () => {
    //ubah format date dayjs
    filters.tanggal_start = filters.tanggal_start ? dayjs(filters.tanggal_start).format('YYYY-MM-DD') : '';
    filters.tanggal_end = filters.tanggal_end ? dayjs(filters.tanggal_end).format('YYYY-MM-DD') : '';
})

//watch status
const isLoadingDash = ref(false)
watch(status, (newValue, oldValue) => {
    if(newValue == 'success') {
      isLoadingDash.value = false;
    } else {
      isLoadingDash.value = true;
    }
})

const visibleDrawerFilter = ref(false);
const filterSubmit = async () => {
    refresh()
    visibleDrawerFilter.value = false;
    updateRouteParams()
}
const fieldsFilter = [
  { key: 'tanggal_start', label: 'Tanggal dari', type: 'date' },
  { key: 'tanggal_end', label: 'Tanggal sampai', type: 'date' },
  { key: 'nomor', label: 'Nomor Invoice', type: 'text' },
  { key: 'unit', label: 'Unit', type: 'text' },
  { key: 'nama_klien', label: 'Nama Klien', type: 'text' },
  { key: 'status', label: 'Status', type: 'dropdown' },
]

function split_comma(text: string) {
  return text ? text.split(',').join('\n') : '';
}

//reset filters
function resetFilters() {
  filters.per_page = 50;
  filters.tanggal_start = '';
  filters.tanggal_end = '';
  filters.nomor = '';
  filters.unit = '';
  filters.nama = '';
  filters.status = '';
  updateRouteParams()
  refresh()
  visibleDrawerFilter.value = false;
}

//handeSortTable
function handleSortTable(event: any) {
  const sortField = event.sortField;
  const sortOrder = event.sortOrder;
  filters.order_by = sortField;
  filters.order = sortOrder==1?'asc':'desc';
  updateRouteParams()
  refresh()
}

const selectedRows = ref();
const selectedRowsNomor = ref('');
//watch
watch(selectedRows, (newValue, oldValue) => {
  if(newValue && newValue.length > 0) {
    //set selectedRowsNomor array, join dengan koma
    selectedRowsNomor.value = newValue.map((item: any) => item.nomor).join(', ');
  } else {
    selectedRowsNomor.value = '';
  }
})

//copy selectedRowsNomor ke clipboard
function copyToClipboard() {
  navigator.clipboard.writeText(selectedRowsNomor.value);
  alert('Nomor invoice berhasil di copy ke clipboard');
}

const visibleDialog = ref(false);
const actionDialog = ref('add');
const dataDialog = ref({});
const openDialog = async (action: string, data = {}) => {
  visibleDialog.value = true;
  actionDialog.value = action;
  dataDialog.value = data;
}

// Preview dialog state
const visibleDialogPreview = ref(false);
const previewId = ref<number | null>(null);
function openPreview(id: number) {
  previewId.value = id;
  visibleDialogPreview.value = true;
}

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus data ini?',
        header: 'Hapus Data',
        accept: async () => {
            try {              
              const re = await client(`/api/invoice/${id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              refresh()
            } catch (error) {
                const er = useSanctumError(error)                 
                toast.add({
                    severity: 'error',
                    summary: 'Gagal!',
                    detail: er.msg ? er.msg : 'Terjadi kesalahan saat menghapus data',
                    life: 3000
                });
            }
        },
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Hapus',
            severity: 'danger',
            outlined: false
        },
        reject: () => {
            //callback to execute when user rejects to delete
        }
    });
}

// Open print page in new tab/window
function printInvoice(id: any) {
  const url = `/print/invoice?id=${id}&print=true`
  const features = [
    'popup=yes',
    'noopener',
    'noreferrer',
    'scrollbars=yes',
    'resizable=yes',
    'width=900',
    'height=1000'
  ].join(',')
  const win = window.open(url, `print_invoice_${id}`, features)
  if (win) {
    win.focus()
  } else {
    alert('Popup diblokir oleh browser. Izinkan popup lalu coba lagi.')
  }
}
</script>

<style scoped></style>
