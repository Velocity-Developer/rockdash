<template>
  <div class="space-y-4">
    <Card>
      <template #header>
        <div class="flex flex-wrap items-center justify-end gap-2 px-4 pt-4">
          <InputText
            v-model="filters.search"
            placeholder="Cari kurir"
            size="small"
            @keyup.enter="handleRefresh"
          />
          <Select
            v-model="filters.per_page"
            :options="[20, 50, 100, 250]"
            size="small"
            @change="handleRefresh"
          />
          <Button size="small" severity="info" :disabled="status === 'pending'" @click="handleRefresh">
            <Icon name="lucide:refresh-cw" :class="status === 'pending' ? 'animate-spin' : ''" />
            Refresh
          </Button>
        </div>
      </template>

      <template #content>
        <Message v-if="errorMessage" severity="error" class="mb-3">
          {{ errorMessage }}
        </Message>

        <DataTable
          :value="tableRows"
          :loading="status === 'pending'"
          size="small"
          class="text-xs"
          stripedRows
          scrollHeight="75vh"
          scrollable
        >
          <Column header="#" headerStyle="width:4rem">
            <template #body="slotProps">
              {{ rowNumber(slotProps.index) }}
            </template>
          </Column>

          <Column
            v-for="column in visibleColumns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
            sortable
            headerStyle="min-width:10rem"
          >
            <template #body="slotProps">
              <span
                v-if="isPrimaryField(column.field)"
                class="cursor-pointer hover:underline"
                @click="openDetailDialog(slotProps.data)"
              >
                {{ formatValue(valueAt(slotProps.data, column.field), column.field) }}
              </span>
              <Badge
                v-else-if="isStatusField(column.field)"
                :value="formatValue(valueAt(slotProps.data, column.field), column.field)"
                :severity="statusSeverity(valueAt(slotProps.data, column.field))"
              />
              <span v-else>
                {{ formatValue(valueAt(slotProps.data, column.field), column.field) }}
              </span>
            </template>
          </Column>

          <template #empty>
            <div class="py-6 text-center text-sm text-zinc-500">
              Belum ada data kurir
            </div>
          </template>
        </DataTable>

        <div class="mt-3 flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
          <div>{{ paginationText }}</div>

          <Paginator
            v-if="pagination.total"
            :rows="pagination.per_page"
            :totalRecords="pagination.total"
            @page="onPaginate"
            :pt="{
              root: (event: any) => {
                const itemForPage = pagination.per_page
                const currentPage = page - 1
                event.state.d_first = itemForPage * currentPage
              },
            }"
          />
        </div>
      </template>
    </Card>

    <Dialog
      v-model:visible="visibleDetailDialog"
      modal
      dismissableMask
      :header="detailTitle"
      :style="{ width: '56rem' }"
      :breakpoints="{ '960px': '75vw', '640px': '92vw' }"
    >
      <div class="max-h-[70vh] overflow-auto">
        <div class="mb-4 flex flex-col gap-4 border-b border-zinc-200 pb-2 dark:border-zinc-700 md:flex-row md:items-center md:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <img
              v-if="selectedCourier?.logo"
              :src="selectedCourier.logo"
              :alt="detailTitle"
              class="h-12 w-12 rounded border border-zinc-200 object-contain p-1 dark:border-zinc-700"
            >
            <div
              v-else
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-sky-700 bg-sky-800 text-sm font-semibold uppercase text-sky-100 dark:border-sky-700 dark:bg-sky-900 dark:text-sky-300"
            >
              {{ courierInitials }}
            </div>

            <div class="min-w-0">
              <div class="truncate text-base font-semibold">
                {{ formatValue(selectedCourier?.name) }}
              </div>
              <div class="mt-1 text-xs uppercase text-zinc-500">
                {{ formatValue(selectedCourier?.code) }}
              </div>
            </div>
          </div>

          <Badge :value="`${selectedCourierServices.length} service`" severity="info" />
        </div>

        <div>
          <div class="mb-2 text-sm font-semibold">Courier Services</div>
          <DataTable
            :value="selectedCourierServices"
            size="small"
            class="text-xs"
            stripedRows
            scrollable
          >
            <Column header="#" headerStyle="width:4rem">
              <template #body="slotProps">
                {{ slotProps.index + 1 }}
              </template>
            </Column>

            <Column
              v-for="column in courierServiceColumns(selectedCourierServices)"
              :key="column.field"
              :field="column.field"
              :header="column.header"
              headerStyle="min-width:8rem"
            >
              <template #body="slotProps">
                <Badge
                  v-if="isStatusField(column.field)"
                  :value="formatValue(valueAt(slotProps.data, column.field), column.field)"
                  :severity="statusSeverity(valueAt(slotProps.data, column.field))"
                />
                <span v-else>
                  {{ formatValue(valueAt(slotProps.data, column.field), column.field) }}
                </span>
              </template>
            </Column>

            <template #empty>
              <div class="py-4 text-center text-sm text-zinc-500">
                Belum ada service
              </div>
            </template>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <Button size="small" severity="secondary" @click="visibleDetailDialog = false">
          <Icon name="lucide:x" />
          Tutup
        </Button>
      </template>
    </Dialog>

    <DashLoader :loading="status === 'pending'" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Ongkir : Kurir',
  description: 'Daftar kurir Ongkir VD',
})

type Courier = Record<string, any>

const route = useRoute()
const router = useRouter()
const client = useSanctumClient()

const page = ref(route.query.page ? Number(route.query.page) : 1)
const visibleDetailDialog = ref(false)
const selectedCourier = ref<Courier | null>(null)
const filters = reactive({
  page: computed(() => page.value),
  per_page: route.query.per_page ? Number(route.query.per_page) : 50,
  search: typeof route.query.search === 'string' ? route.query.search : '',
})

const requestParams = computed(() => ({
  page: page.value,
  per_page: filters.per_page,
  ...(filters.search ? { search: filters.search } : {}),
}))

const { data, status, refresh, error } = await useAsyncData(
  'ongkir-vd-couriers',
  () =>
    client('/api/ongkir-vd/couriers', {
      params: requestParams.value,
    }),
) as any

const payload = computed(() => data.value ?? null)

const paginatedPayload = computed(() => {
  if (payload.value?.total && Array.isArray(payload.value?.data)) return payload.value
  if (payload.value?.data?.total && Array.isArray(payload.value?.data?.data)) return payload.value.data

  return null
})

const tableRows = computed<Courier[]>(() => {
  if (paginatedPayload.value) return paginatedPayload.value.data
  if (Array.isArray(payload.value)) return payload.value
  if (Array.isArray(payload.value?.data)) return payload.value.data
  if (Array.isArray(payload.value?.data?.data)) return payload.value.data.data
  if (Array.isArray(payload.value?.couriers)) return payload.value.couriers

  return []
})

const preferredColumns = [
  ['code', 'Kode'],
  ['name', 'Nama'],
] as const

const visibleColumns = computed(() => {
  return preferredColumns
    .filter(([field]) => hasField(field))
    .map(([field, header]) => ({ field, header }))
})

const pagination = computed(() => ({
  total: Number(paginatedPayload.value?.total || 0),
  from: Number(paginatedPayload.value?.from || 0),
  to: Number(paginatedPayload.value?.to || 0),
  per_page: Number(paginatedPayload.value?.per_page || filters.per_page),
}))

const selectedCourierServices = computed(() => {
  const row = selectedCourier.value || {}
  const services = row.courier_services || row.courier_service || row.services || row.service

  return courierServiceRows(services)
})

const courierInitials = computed(() => {
  const name = String(selectedCourier.value?.name || selectedCourier.value?.code || '')

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('') || '-'
})

const detailTitle = computed(() => {
  const row = selectedCourier.value
  if (!row) return 'Detail Kurir'

  return row.name || row.courier_name || row.code || row.courier_code || 'Detail Kurir'
})

const errorMessage = computed(() => {
  if (error.value) return 'Gagal mengambil data kurir'
  if (payload.value?.success === false) return payload.value.message || payload.value.body || 'Gagal mengambil data kurir'

  return ''
})

const paginationText = computed(() => {
  if (pagination.value.total) {
    return `${pagination.value.from} - ${pagination.value.to} dari ${pagination.value.total}`
  }

  return `${tableRows.value.length} data`
})

const rowNumber = (index: number) => {
  return (pagination.value.from || 1) + index
}

const handleRefresh = () => {
  page.value = 1
  updateRouteParams()
  refresh()
}

const onPaginate = (event: { page: number }) => {
  page.value = event.page + 1
  updateRouteParams()
  refresh()
}

const openDetailDialog = (row: Courier) => {
  selectedCourier.value = row
  visibleDetailDialog.value = true
}

function updateRouteParams() {
  router.push({
    query: {
      page: String(page.value),
      per_page: String(filters.per_page),
      ...(filters.search ? { search: filters.search } : {}),
    },
  })
}

function hasField(field: string) {
  return tableRows.value.slice(0, 10).some((row) => valueAt(row, field) !== undefined)
}

function valueAt(row: Courier, field: string) {
  return field.split('.').reduce((value, key) => value?.[key], row)
}

function formatValue(value: any, field = '') {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (isDateField(field)) return formatDate(value)
  if (typeof value === 'object') return JSON.stringify(value)

  return value
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function titleCase(value: string) {
  return value
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.slice(1))
}

function isDateField(field: string) {
  return field.includes('date') || field.endsWith('_at') || field.includes('tanggal')
}

function isObjectValue(value: any) {
  return value !== null && typeof value === 'object'
}

function courierServiceRows(value: any) {
  if (!Array.isArray(value)) return []

  return value.map((item) => (isObjectValue(item) ? item : { service: item }))
}

function courierServiceColumns(value: any) {
  if (!courierServiceRows(value).length) return []

  return [
    { field: 'name', header: 'Nama' },
    { field: 'description', header: 'Deskripsi' },
  ]
}

function isPrimaryField(field: string) {
  return ['code', 'courier_code', 'name', 'courier_name'].includes(field)
}

function isStatusField(field: string) {
  return ['status', 'is_active', 'active', 'enabled'].includes(field)
}

function statusSeverity(value: any) {
  if (typeof value === 'boolean') return value ? 'success' : 'danger'

  const statusValue = String(value || '').toLowerCase()

  if (['1', 'active', 'enabled', 'success', 'yes', 'true'].includes(statusValue)) return 'success'
  if (['0', 'inactive', 'disabled', 'failed', 'error', 'no', 'false'].includes(statusValue)) return 'danger'
  if (['pending', 'process', 'processing', 'waiting'].includes(statusValue)) return 'warn'

  return 'info'
}
</script>
