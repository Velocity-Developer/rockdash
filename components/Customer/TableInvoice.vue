<template>
  <DataTable @sort="handleSortTable" :value="data.data" size="small" class="text-xs" v-model:selection="selectedRows" stripedRows scrollHeight="70vh" scrollable>
    
    <Column field="nomor" header="Nomor Invoice" sortable>
      <template #body="slotProps">
        <div class="group relative py-1">
          <span @click="openPreview(slotProps.data.id)" class="hover:underline cursor-pointer">
            {{ slotProps.data.nomor }}
          </span>
        </div>
      </template>
    </Column>

    <Column field="tanggal" sortable header="Tanggal">
      <template #body="slotProps">
          {{ formatDate(slotProps.data.tanggal,'YYYY-MM-DD HH:mm') }}
      </template>
    </Column>

    <Column field="unit" header="Unit">
      <template #body="slotProps">
        <Tag
          :value="slotProps.data.unit"
          :severity="slotProps.data.unit === 'vdi' ? 'info' : 'success'"
          class="!text-xs"
        />
      </template>
    </Column>

    <Column field="status" header="Status" sortable>
      <template #body="slotProps">
        <Tag class="!text-xs capitalize" :severity="getStatusSeverity(slotProps.data.status)">
          {{ slotProps.data.status }}
        </Tag>
      </template>
    </Column>

    <Column field="total" header="Total">
      <template #body="slotProps">
          {{ formatMoney(slotProps.data.total) }}
      </template>
    </Column>

    <Column field="jatuh_tempo" header="Jatuh Tempo" sortable>
      <template #body="slotProps">
        <div v-if="slotProps.data.jatuh_tempo">
          {{ formatDate(slotProps.data.jatuh_tempo,'YYYY-MM-DD HH:mm') }}
        </div>
        <span v-else class="text-gray-400">-</span>
      </template>
    </Column>

    <Column field="tanggal_bayar" header="Tanggal Bayar" sortable>
      <template #body="slotProps">
        <div v-if="slotProps.data.tanggal_bayar">
          {{ formatDate(slotProps.data.tanggal_bayar,'YYYY-MM-DD HH:mm') }}
        </div>
        <span v-else class="text-gray-400">-</span>
      </template>
    </Column>

    <Column field="act" header="">
      <template #body="slotProps">
        <div class="flex item-center gap-1 justify-end">
          <Button @click="downloadPDF(slotProps.data.url_pdf_download,slotProps.data.nomor)" severity="contrast" size="small">
            <Icon name="lucide:download" />
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

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah Invoice':'Edit Invoice'" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <InvoiceForm
      :action="actionDialog as 'add' | 'edit'"
      :model-value="dataDialog"
      @update="refresh()"
      @close="visibleDialog = false"
    />
  </Dialog>

  <Dialog v-model:visible="visibleDialogPreview" modal header="Preview Invoice" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <InvoicePreview
      v-if="previewId"
      :id="previewId"
      @edit="handleEditFromPreview"
    />
  </Dialog>

  <DashLoader :loading="isLoadingDash"/>
</template>

<script setup lang="ts">
const props = defineProps({
  customerId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['openPreview'])

const client = useSanctumClient()
const router = useRouter()
const dayjs = useDayjs()

const page = ref(1)

const filters = reactive({
    per_page: 20,
    page: computed(() => page.value),
    customer_id: computed(() => props.customerId),
    order_by: 'tanggal',
    order: 'desc',
} as any)

// Function untuk update route params
function updateRouteParams() {
  router.push({
    query: { ...filters },
  });
}

const { data, status, refresh } = await useAsyncData(
    'customer-invoice-page-'+page.value,
    () => client('/api/invoice',{
        params: filters
    })
) as any

const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    updateRouteParams()
    refresh()
};

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
watch(selectedRows, (newValue) => {
  if(newValue && newValue.length > 0) {
    //set selectedRowsNomor array, join dengan koma
    selectedRowsNomor.value = newValue.map((item: any) => item.nomor).join(', ');
  } else {
    selectedRowsNomor.value = '';
  }
})

// Status severity function
function getStatusSeverity(status: string) {
  switch(status) {
    case 'lunas': return 'success';
    case 'belum': return 'contrast';
    case 'batal': return 'danger';
    default: return 'info';
  }
}

// Format date function
function formatDate(date: string, format: string) {
  if (!date) return '-'
  return dayjs(date).format(format)
}

// Format money function
function formatMoney(amount: number | string) {
  if (!amount) return 'Rp 0'
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}

// Loading state
const isLoadingDash = ref(false)
watch(status, (newValue) => {
    if(newValue == 'success') {
      isLoadingDash.value = false;
    } else {
      isLoadingDash.value = true;
    }
})

// Dialog state
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

// Download PDF function
function downloadPDF(url: any,nomor: any) {
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-VD${nomor}.pdf`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Handler untuk edit dari preview
function handleEditFromPreview(id: string | number) {
  // Cari data invoice berdasarkan id
  const invoiceData = data.value?.data?.find((item: any) => item.id == id)
  if (invoiceData) {
    visibleDialogPreview.value = false
    openDialog('edit', invoiceData)
  }
}

// Toast dan confirm untuk delete
const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {
    confirm.require({
        message: 'Anda yakin hapus data ini?',
        header: 'Hapus Data',
        accept: async () => {
            try {
              await client(`/api/invoice/${id}`, {
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

// Watch perubahan customer_id
watch(() => props.customerId, (newId) => {
  if (newId) {
    refresh()
  }
}, { immediate: true })
</script>