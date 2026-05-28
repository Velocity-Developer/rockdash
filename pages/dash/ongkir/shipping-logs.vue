<template>
  <div class="space-y-4">

    <Card>
      <template #header>
        <div class="flex flex-wrap items-center justify-end gap-2 px-4 pt-4">
          <DatePicker
            v-model="filters.created_at_start"
            dateFormat="yy-mm-dd"
            placeholder="dari"
            size="small"
            showIcon
            showClear
            class="w-[11rem]"
          />
          <DatePicker
            v-model="filters.created_at_end"
            dateFormat="yy-mm-dd"
            placeholder="sampai"
            size="small"
            showIcon
            showClear
            class="w-[11rem]"
          />
          <InputText
            v-model="filters.search"
            placeholder="Cari data"
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
              <Button
                v-if="isDomainField(column.field)"
                type="button"
                link
                size="small"
                class="!p-0 text-left"
                @click="openDetailDialog(slotProps.data)"
              >
                {{ formatValue(valueAt(slotProps.data, column.field), column.field) }}
              </Button>
              <Badge
                v-else-if="column.field === 'status'"
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
              Belum ada shipping log
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
      :header="selectedLog?.domain || selectedLog?.nama_web || 'Detail Shipping Log'"
      :style="{ width: '56rem' }"
      :breakpoints="{ '960px': '75vw', '640px': '92vw' }"
    >
      <div class="max-h-[70vh] overflow-auto">
        <table class="w-full text-sm">
          <tbody>
            <tr
              v-for="[field, value] in selectedLogEntries"
              :key="field"
              class="border-b border-zinc-200 align-top last:border-0 dark:border-zinc-700"
            >
              <th class="w-40 px-0 py-2 pr-4 text-left font-medium text-zinc-500">
                {{ titleCase(field) }}
              </th>
              <td class="py-2">
                <pre
                  v-if="shouldRenderAsJson(field, value)"
                  class="max-h-72 overflow-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                >{{ formatJsonValue(value) }}</pre>
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
import { useDayjs } from '#dayjs'

definePageMeta({
  title: 'Ongkir : Shipping Logs',
  description: 'Daftar shipping log Ongkir VD',
})

type ShippingLog = Record<string, any>

const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()
const client = useSanctumClient()

const page = ref(route.query.page ? Number(route.query.page) : 1)
const visibleDetailDialog = ref(false)
const selectedLog = ref<ShippingLog | null>(null)
const filters = reactive({
  page: computed(() => page.value),
  per_page: route.query.per_page ? Number(route.query.per_page) : 50,
  search: typeof route.query.search === 'string' ? route.query.search : '',
  created_at_start: parseQueryDate(route.query.created_at_start),
  created_at_end: parseQueryDate(route.query.created_at_end),
})

const requestParams = computed(() => ({
  page: page.value,
  per_page: filters.per_page,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.created_at_start ? { created_at_start: formatFilterDate(filters.created_at_start) } : {}),
  ...(filters.created_at_end ? { created_at_end: formatFilterDate(filters.created_at_end) } : {}),
}))

const { data, status, refresh, error } = await useAsyncData(
  'ongkir-vd-shipping-logs',
  () =>
    client('/api/ongkir-vd/shipping-logs', {
      params: requestParams.value,
    }),
) as any

const payload = computed(() => data.value ?? null)

const paginatedPayload = computed(() => {
  if (payload.value?.total && Array.isArray(payload.value?.data)) return payload.value
  if (payload.value?.data?.total && Array.isArray(payload.value?.data?.data)) return payload.value.data

  return null
})

const tableRows = computed<ShippingLog[]>(() => {
  if (paginatedPayload.value) return paginatedPayload.value.data
  if (Array.isArray(payload.value)) return payload.value
  if (Array.isArray(payload.value?.data)) return payload.value.data
  if (Array.isArray(payload.value?.data?.data)) return payload.value.data.data
  if (Array.isArray(payload.value?.shipping_logs)) return payload.value.shipping_logs
  if (Array.isArray(payload.value?.logs)) return payload.value.logs

  return []
})

const preferredColumns = [
  ['domain', 'Domain'],
  ['created_at', 'Tgl'],
  ['method', 'Method'],
  ['endpoint', 'Endpoint'],
  ['status_code', 'Status Code'],
  ['duration_ms', 'Duration'],
  ['source', 'Source'],
  ['success', 'Success'],
  ['ip_address', 'IP Address'],
  ['user_agent', 'User Agent'],
  ['error_message', 'Error'],
] as const

const hiddenColumns = new Set(['id', 'payload', 'updated_at', 'update_at'])

const visibleColumns = computed(() => {
  const keys = new Set<string>()
  tableRows.value.slice(0, 10).forEach((row) => {
    Object.keys(row || {}).forEach((key) => keys.add(key))
  })

  const preferred = preferredColumns
    .filter(([field]) => keys.has(field) && !hiddenColumns.has(field))
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

const selectedLogEntries = computed(() => Object.entries(selectedLog.value || {}))

const errorMessage = computed(() => {
  if (error.value) return 'Gagal mengambil shipping logs'
  if (payload.value?.success === false) return payload.value.message || payload.value.body || 'Gagal mengambil shipping logs'

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

const openDetailDialog = (row: ShippingLog) => {
  selectedLog.value = row
  visibleDetailDialog.value = true
}

function updateRouteParams() {
  router.push({
    query: {
      page: String(page.value),
      per_page: String(filters.per_page),
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.created_at_start ? { created_at_start: formatFilterDate(filters.created_at_start) } : {}),
      ...(filters.created_at_end ? { created_at_end: formatFilterDate(filters.created_at_end) } : {}),
    },
  })
}

function parseQueryDate(value: unknown) {
  if (typeof value !== 'string' || !value) return null

  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.toDate() : null
}

function formatFilterDate(value: Date | string) {
  return dayjs(value).format('YYYY-MM-DD')
}

function valueAt(row: ShippingLog, field: string) {
  return field.split('.').reduce((value, key) => value?.[key], row)
}

function formatValue(value: any, field = '') {
  if (value === null || value === undefined || value === '') return '-'
  if (field === 'error_message') return formatErrorMessage(value)
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (isCurrencyField(field) && !Number.isNaN(Number(value))) return formatCurrency(Number(value))
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.slice(1))
}

function isDateField(field: string) {
  return field.includes('date') || field.endsWith('_at') || field.includes('tanggal')
}

function isCurrencyField(field: string) {
  return ['price', 'cost', 'amount', 'total', 'ongkir', 'shipping_cost'].includes(field)
}

function isDomainField(field: string) {
  return ['domain', 'nama_web'].includes(field)
}

function isObjectValue(value: any) {
  return value !== null && typeof value === 'object'
}

function shouldRenderAsJson(field: string, value: any) {
  return isObjectValue(value) || (field === 'error_message' && Boolean(parseJsonString(value)))
}

function formatJsonValue(value: any) {
  const parsed = typeof value === 'string' ? parseJsonString(value) : value
  return JSON.stringify(parsed ?? value, null, 2)
}

function formatErrorMessage(value: any) {
  const parsed = parseJsonString(value)
  if (parsed?.message) return parsed.message
  if (parsed?.body) return parsed.body
  if (parsed) return JSON.stringify(parsed)

  return value
}

function parseJsonString(value: any) {
  if (typeof value !== 'string') return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function statusSeverity(value: any) {
  const statusValue = String(value || '').toLowerCase()

  if (['success', 'delivered', 'completed', 'done', 'paid'].includes(statusValue)) return 'success'
  if (['failed', 'cancelled', 'canceled', 'error', 'rejected'].includes(statusValue)) return 'danger'
  if (['pending', 'process', 'processing', 'waiting'].includes(statusValue)) return 'warn'

  return 'info'
}
</script>
