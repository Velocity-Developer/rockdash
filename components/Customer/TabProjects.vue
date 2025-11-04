<template>
  <div class="space-y-4">
    <!-- Header Actions -->
    <div class="flex justify-between items-center">
      <div class="text-sm text-gray-600">
        Menampilkan {{ data?.from }} - {{ data?.to }} dari {{ data?.total }} project
      </div>
    </div>

    <!-- Data Table -->
    <Card>
      <template #content>
        <DataTable
          @sort="handleSortTable"
          :value="data?.data || []"
          size="small"
          class="text-xs"
          v-model:selection="selectedRows"
          stripedRows
          scrollHeight="60vh"
          scrollable
          :loading="status === 'pending'
          "
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column header="#" headerStyle="width:3rem">
            <template #body="slotProps">
              {{ slotProps.index + (data?.from || 0) }}
            </template>
          </Column>
          <Column field="webhost.nama_web" header="Nama Web">
            <template #body="slotProps">
              <div class="group relative py-1">
                <NuxtLink :to="'/webhost/'+slotProps.data.id_webhost" class="hover:underline block">
                  {{ slotProps.data.webhost?.nama_web || '-' }}
                </NuxtLink>
                <div class="invisible group-hover:visible absolute bottom-[-1rem] inset-x-0 flex item-center">
                  <Button @click="openDialog('edit',slotProps.data)" class="!text-xs !px-1 !py-0" variant="text" severity="info" size="small">
                    <Icon name="lucide:pencil" /> Edit
                  </Button>
                  <Button @click="confirmDelete(slotProps.data.id)" class="!text-xs !px-1 !py-0" variant="text" severity="danger" size="small">
                    <Icon name="lucide:trash-2" /> Hapus
                  </Button>
                </div>
              </div>
            </template>
          </Column>
          <Column field="jenis" header="Jenis">
            <template #body="slotProps">
              <div>
                {{ slotProps.data.jenis }}
              </div>
              <div v-if="slotProps.data.webhost?.paket?.paket" class="text-xs text-emerald-500 mt-1 xl:hidden">
                {{ slotProps.data.webhost?.paket?.paket }}
              </div>
            </template>
          </Column>
          <Column field="webhost.paket.paket" header="Paket" class="hidden xl:table-cell"></Column>
          <Column field="deskripsi" header="Deskripsi">
            <template #body="slotProps">
              <div class="max-w-[200px] whitespace-normal">
                {{ slotProps.data.deskripsi }}
              </div>
            </template>
          </Column>
          <Column field="trf" header="Trf">
            <template #body="slotProps">
              {{ formatMoney(slotProps.data.trf) }}
            </template>
          </Column>
          <Column field="tgl_masuk" sortable header="Masuk Tgl">
            <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_masuk) }}
            </template>
          </Column>
          <Column field="tgl_deadline" sortable header="Deadline Tgl">
            <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_deadline) }}
            </template>
          </Column>
          <Column field="biaya" header="Total Biaya">
            <template #body="slotProps">
              {{ formatMoney(slotProps.data.biaya) }}
            </template>
          </Column>
          <Column field="dibayar" header="Dibayar">
            <template #body="slotProps">
              {{ formatMoney(slotProps.data.dibayar) }}
            </template>
          </Column>
          <Column field="lunas" sortable header="Kurang">
            <template #body="slotProps">
              {{ slotProps.data.lunas }}
            </template>
          </Column>
          <Column field="dikerjakan_oleh" header="Dikerjakan" class="hidden xl:table-cell">
            <template #body="slotProps">
              <div class="whitespace-normal max-w-[5rem] truncate" v-for="item in slotProps.data.karyawans" :key="item.id">
                <span>{{ item.nama }} ({{ item.pivot.porsi }}%)</span>,
              </div>
            </template>
          </Column>
          <Column field="act" header="">
            <template #body="slotProps">
              <div class="flex item-center gap-1 justify-end">
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

        <!-- Pagination -->
        <div class="flex justify-between items-center text-xs mt-3" v-if="data">
          <div>
            {{ data.from }} - {{ data.to }} dari {{ data.total }}
          </div>

          <Paginator
            :rows="data.per_page"
            :totalRecords="data.total"
            @page="onPaginate"
            :pt="{
              root: (event: any) => {
                const itemForPage = data.per_page;
                const currentPage = page - 1;
                event.state.d_first = itemForPage * currentPage;
              },
            }"
          >
          </Paginator>
        </div>
      </template>
    </Card>

    <!-- Copy Selected Names -->
    <div class="mt-3">
      <Button v-if="selectedRowsNamaWeb" @click="copyToClipboard()" size="small">
        <Icon name="lucide:copy" /> Copy Nama Web
      </Button>
    </div>

    <!-- Dialog for Add/Edit -->
    <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah Project':'Edit Project'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <CsMainProjectForm :action="actionDialog" :data="dataDialog" @update="refresh()" />
    </Dialog>

    <!-- Loading Overlay -->
    <DashLoader :loading="isLoadingDash"/>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  customerId: {
    type: String,
    required: true
  }
})

const client = useSanctumClient();
const toast = useToast();
const confirm = useConfirm();

// Pagination
const page = ref(1);

// Filters for customer projects
const filters = reactive({
  per_page: 50,
  page: computed(() => page.value),
  customer_id: props.customerId, // Filter by customer
  order_by: 'tgl_masuk',
  order: 'desc',
} as any);

// Fetch data
const { data, status, refresh } = await useAsyncData(
  `customer-projects-${props.customerId}-${page.value}`,
  () => client('/api/billing', {
    params: filters
  })
) as any

// Pagination handler
const onPaginate = (event: { page: number }) => {
  page.value = event.page + 1;
  refresh();
};

// Loading state
const isLoadingDash = ref(false)
watch(status, (newValue) => {
  if(newValue == 'success') {
    isLoadingDash.value = false;
  } else {
    isLoadingDash.value = true;
  }
})

// Sort handler
function handleSortTable(event: any) {
  const sortField = event.sortField;
  const sortOrder = event.sortOrder;
  filters.order_by = sortField;
  filters.order = sortOrder==1?'asc':'desc';
  refresh()
}

// Selected rows
const selectedRows = ref();
const selectedRowsNamaWeb = ref('');
watch(selectedRows, (newValue) => {
  if(newValue?.length > 0) {
    selectedRowsNamaWeb.value = newValue.map((item: any) => item.webhost?.nama_web).filter(Boolean).join(', ');
  } else {
    selectedRowsNamaWeb.value = '';
  }
})

// Copy to clipboard
function copyToClipboard() {
  if (selectedRowsNamaWeb.value) {
    navigator.clipboard.writeText(selectedRowsNamaWeb.value);
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Nama Web berhasil di copy ke clipboard',
      life: 3000
    });
  }
}

// Dialog management
const visibleDialog = ref(false);
const actionDialog = ref('add');
const dataDialog = ref({} as any);

const openDialog = (action: string, data = {}) => {
  visibleDialog.value = true;
  actionDialog.value = action || 'add';

  // If editing, merge with customer data
  if (action === 'edit') {
    dataDialog.value = { ...data };
  } else {
    // For new project, set customer_id
    dataDialog.value = { customer_id: props.customerId, ...data };
  }
}

// Delete confirmation
const confirmDelete = (id: any) => {
  confirm.require({
    message: 'Anda yakin hapus data ini?',
    header: 'Hapus Data',
    accept: async () => {
      try {
        await client(`/api/cs_main_project/${id}`, {
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

// Utility functions
function formatMoney(value: number) {
  if (!value) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatTanggal(value: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID');
}
</script>

