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
              @click="openDetailDialog(slotProps.data)"
              class="hover:underline cursor-pointer"
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
        <table class="w-full text-sm">
          <tbody>
            <tr
              v-for="[field, value] in selectedCourierEntries"
              :key="field"
              class="border-b border-zinc-200 align-top last:border-0 dark:border-zinc-700"
            >
              <th class="w-48 px-0 py-2 pr-4 text-left font-medium text-zinc-500">
                {{ titleCase(field) }}
              </th>
              <td class="py-2">
                <pre
                  v-if="isObjectValue(value)"
                  class="max-h-72 overflow-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                >{{ JSON.stringify(value, null, 2) }}</pre>
                <span v-else>{{ formatValue(value, field) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
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
  ['courier_code', 'Kode Kurir'],
  ['name', 'Nama'],
  ['courier_name', 'Nama Kurir'],
  ['type', 'Tipe'],
  ['status', 'Status'],
  ['is_active', 'Aktif'],
  ['active', 'Aktif'],
  ['created_at', 'Dibuat'],
  ['updated_at', 'Diubah'],
] as const

const hiddenColumns = new Set(['id', 'service', 'services', 'courier_service', 'courier_services', 'update_at'])

const visibleColumns = computed(() => {
  const keys = new Set<string>()
  tableRows.value.slice(0, 10).forEach((row) => {
    Object.keys(row || {}).forEach((key) => keys.add(key))
  })

  const preferred = preferredColumns
    .filter(([field]) => hasField(field) && !hiddenColumns.has(field))
    .map(([field, header]) => ({ field, header }))

  const preferredFields = new Set<string>(preferred.map((column) => column.field))
  const extras = Array.from(keys)
    .filter((field) => !preferredFields.has(field) && !hiddenColumns.has(field))
    .map((field) => ({ field, header: titleCase(field) }))

  return [...preferred, ...extras]
})

const pagination = computed(() => ({
  total: Number(paginatedPayload.value?.total || 0),
  from: Number(paginatedPayload.value?.from || 0),
  to: Number(paginatedPayload.value?.to || 0),
  per_page: Number(paginatedPayload.value?.per_page || filters.per_page),
}))

const selectedCourierEntries = computed(() => Object.entries(selectedCourier.value || {}))

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
