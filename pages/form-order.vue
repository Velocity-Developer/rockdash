<template>
  <div class="space-y-4">
    <Card>
      <template #content>
          <div class="flex flex-wrap justify-end items-end gap-2">
            <InputText
              v-model="filters.q"
              placeholder="Cari nama / HP / kebutuhan"
              size="small"
              class="w-full md:w-64"
              @keyup.enter="handleRefresh"
            />
            <InputText
              v-model="filters.source"
              placeholder="Source"
              size="small"
              class="w-36"
              @keyup.enter="handleRefresh"
            />
            <InputNumber
              v-model="filters.usia"
              placeholder="Usia"
              size="small"
              inputClass="w-24"
              :min="1"
              :max="150"
              @keyup.enter="handleRefresh"
            />
            <Select
              v-model="filters.per_page"
              :options="[20, 50, 100]"
              size="small"
              @change="handleRefresh"
            />
            <Button size="small" severity="secondary" outlined @click="resetFilters">
              <Icon name="lucide:rotate-ccw" />
            </Button>
            <Button size="small" severity="info" @click="handleRefresh">
              <Icon name="lucide:refresh-cw" :class="status === 'pending' ? 'animate-spin' : ''" />
              Refresh
            </Button>
          </div>
      </template>
    </Card>

    <Card>
      <template #content>
        <DataTable
          :value="tableRows"
          :loading="status === 'pending'"
          size="small"
          class="text-sm"
          stripedRows
          scrollHeight="75vh"
          scrollable
        >
          <Column header="#" headerStyle="width:4rem">
            <template #body="slotProps">
              {{ rowNumber(slotProps.index) }}
            </template>
          </Column>

          <Column field="created_at" header="Tanggal" sortable headerStyle="min-width:10rem">
            <template #body="slotProps">
              <span class="whitespace-nowrap">
                {{ formatDate(slotProps.data.created_at, 'DD/MM/YY HH:mm') }}
              </span>
            </template>
          </Column>

          <Column field="source" header="Source" headerStyle="min-width:10rem">
            <template #body="slotProps">
              <Badge :value="slotProps.data.source || '-'" severity="info" />
            </template>
          </Column>

          <Column field="nama" header="Nama" headerStyle="min-width:12rem">
            <template #body="slotProps">
              <button
                type="button"
                class="font-medium text-left hover:text-primary"
                @click="openPreview(slotProps.data)"
              >
                {{ slotProps.data.nama || '-' }}
              </button>
            </template>
          </Column>

          <Column field="hp" header="HP" sortable headerStyle="min-width:10rem">
            <template #body="slotProps">
                {{ slotProps.data.hp || '-' }}
            </template>
          </Column>

          <Column field="usia" header="Usia" sortable headerStyle="min-width:6rem">
            <template #body="slotProps">
              {{ slotProps.data.usia ? `${slotProps.data.usia} th` : '-' }}
            </template>
          </Column>

          <Column field="kebutuhan" header="Kebutuhan" headerStyle="min-width:22rem">
            <template #body="slotProps">
              <div class="max-w-md break-words" v-tooltip="slotProps.data.kebutuhan">
                {{ slotProps.data.kebutuhan || '-' }}
              </div>
            </template>
          </Column>

          <Column header="Aksi" headerStyle="width:9rem">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button size="small" severity="secondary" outlined @click="openPreview(slotProps.data)">
                  <Icon name="lucide:eye" />
                </Button>
                <Button size="small" severity="danger" outlined @click="confirmDelete(slotProps.data.id)">
                  <Icon name="lucide:trash-2" />
                </Button>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="flex justify-center items-center p-4">Tidak ada data form order.</div>
          </template>
        </DataTable>

        <div class="flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-xs mt-3">
          <div>{{ paginationText }}</div>

          <Paginator
            v-if="data?.total"
            :rows="data.per_page"
            :totalRecords="data.total"
            @page="onPaginate"
            :pt="{
              root: (event: any) => {
                const itemForPage = data.per_page
                const currentPage = page - 1
                event.state.d_first = itemForPage * currentPage
              },
            }"
          />
        </div>
      </template>
    </Card>

    <DashLoader :loading="status === 'pending'" />
  </div>

  <Dialog
    v-model:visible="visiblePreview"
    modal
    header="Detail Form Order"
    :dismissableMask="true"
    :style="{ width: '42rem' }"
    :breakpoints="{ '1000px': '75vw', '575px': '90vw' }"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div class="text-xs text-surface-500">Nama</div>
          <div class="font-medium">{{ selectedOrder.nama || '-' }}</div>
        </div>
        <div>
          <div class="text-xs text-surface-500">HP</div>
          {{ selectedOrder.hp || '-' }}
        </div>
        <div>
          <div class="text-xs text-surface-500">Source</div>
          <Badge :value="selectedOrder.source || '-'" severity="info" />
        </div>
        <div>
          <div class="text-xs text-surface-500">Usia</div>
          <div>{{ selectedOrder.usia || '-' }}</div>
        </div>
        <div>
          <div class="text-xs text-surface-500">Dibuat</div>
          <div> {{ formatDate(selectedOrder.created_at || '', 'DD/MM/YY HH:mm') }}</div>
        </div>
      </div>

      <div>
        <div class="text-xs text-surface-500">Kebutuhan</div>
        <div class="mt-1 rounded border border-surface-200 dark:border-surface-700 p-3 whitespace-pre-line">
          {{ selectedOrder.kebutuhan || '-' }}
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Form Order',
  description: 'Daftar data Form Order',
})

type FormOrder = {
  id: number
  source: string | null
  nama: string | null
  hp: string | null
  usia: number | null
  kebutuhan: string | null
  created_at: string | null
  updated_at: string | null
}

const route = useRoute()
const router = useRouter()
const client = useSanctumClient()

const page = ref(route.query.page ? Number(route.query.page) : 1)
const filters = reactive({
  per_page: route.query.per_page ? Number(route.query.per_page) : 20,
  page: computed(() => page.value),
  q: typeof route.query.q === 'string' ? route.query.q : '',
  source: typeof route.query.source === 'string' ? route.query.source : '',
  usia: route.query.usia ? Number(route.query.usia) : null,
} as any)

const { data, status, refresh } = await useAsyncData(
  () => `form-order-page-${page.value}-${filters.per_page}`,
  () =>
    client('/api/form-order', {
      params: filters,
    }),
) as any

const tableRows = computed<FormOrder[]>(() => data.value?.data || [])

const paginationText = computed(() => {
  if (!data.value?.total) return 'Belum ada data form order'

  return `${data.value.from} - ${data.value.to} dari ${data.value.total}`
})

const rowNumber = (index: number) => {
  return (data.value?.from || 1) + index
}

function updateRouteParams() {
  router.push({
    query: {
      page: String(page.value),
      per_page: String(filters.per_page),
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.source ? { source: filters.source } : {}),
      ...(filters.usia ? { usia: String(filters.usia) } : {}),
    },
  })
}

function handleRefresh() {
  page.value = 1
  updateRouteParams()
  refresh()
}

function resetFilters() {
  page.value = 1
  filters.q = ''
  filters.source = ''
  filters.usia = null
  updateRouteParams()
  refresh()
}

function onPaginate(event: { page: number }) {
  page.value = event.page + 1
  updateRouteParams()
  refresh()
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('62')) return digits

  return digits
}

const visiblePreview = ref(false)
const selectedOrder = ref<Partial<FormOrder>>({})

function openPreview(row: FormOrder) {
  selectedOrder.value = row
  visiblePreview.value = true
}

const toast = useToast()
const confirm = useConfirm()

function confirmDelete(id: number) {
  confirm.require({
    message: 'Anda yakin hapus data ini?',
    header: 'Hapus Data',
    accept: async () => {
      try {
        await client(`/api/form-order/${id}`, { method: 'DELETE' })
        toast.add({
          severity: 'success',
          summary: 'Berhasil!',
          detail: 'Data berhasil dihapus',
          life: 3000,
        })
        refresh()
      } catch (error: any) {
        const er = useSanctumError(error)
        toast.add({
          severity: 'error',
          summary: 'Gagal!',
          detail: er.msg ? er.msg : 'Terjadi kesalahan saat menghapus data',
          life: 3000,
        })
      }
    },
    acceptProps: {
      label: 'Hapus',
      severity: 'danger',
      outlined: false,
    },
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
  })
}
</script>
