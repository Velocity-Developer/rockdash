<template>
  <div class="space-y-4">
    <Card>
      <template #content>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div class="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div class="xl:col-span-2">
              <label class="mb-1 block text-xs opacity-70">Nama Web</label>
              <InputText
                v-model="filters.search_nama_web"
                placeholder="Cari nama web..."
                size="small"
                class="w-full"
                @keyup.enter="handleRefresh"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs opacity-70">Search</label>
              <InputText
                v-model="filters.search"
                placeholder="Deskripsi / source..."
                size="small"
                class="w-full"
                @keyup.enter="handleRefresh"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs opacity-70">Service</label>
              <Select
                v-model="filters.service_type"
                :options="serviceTypeOptions"
                size="small"
                showClear
                class="w-full"
                @change="handleRefresh"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs opacity-70">Status</label>
              <Select
                v-model="filters.status"
                :options="statusOptions"
                size="small"
                showClear
                class="w-full"
                @change="handleRefresh"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs opacity-70">Payment</label>
              <Select
                v-model="filters.payment_status"
                :options="paymentStatusOptions"
                size="small"
                showClear
                class="w-full"
                @change="handleRefresh"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-end gap-2">
            <div>
              <label class="mb-1 block text-xs opacity-70">Per Page</label>
              <Select
                v-model="filters.per_page"
                :options="[20, 50, 100, 200]"
                size="small"
                class="w-24"
                @change="handleRefresh"
              />
            </div>
            <Button @click="handleRefresh" size="small" severity="info">
              <Icon name="lucide:refresh-cw" :class="status === 'pending' ? 'animate-spin' : ''" />
              Refresh
            </Button>
            <Button @click="resetFilters" size="small" severity="contrast" outlined>
              <Icon name="lucide:x" />
              Reset
            </Button>
          </div>
        </div>
      </template>
    </Card>

    <Card>
      <template #title>
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-2">
            <Icon name="lucide:database" />
            Semua Webhost Subscriptions
          </div>
          <div class="text-xs text-surface-500">
            Tanggal mengikuti timezone {{ timezone }}
          </div>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="rows"
          :loading="status === 'pending'"
          size="small"
          class="text-xs"
          stripedRows
          scrollable
          scrollHeight="72vh"
        >
          <Column header="#" headerStyle="width:4rem">
            <template #body="slotProps">
              {{ rowNumber(slotProps.index) }}
            </template>
          </Column>

          <Column field="webhost.nama_web" header="Nama Web" headerStyle="min-width:16rem">
            <template #body="slotProps">
              <div class="font-medium">
                {{ slotProps.data.webhost?.nama_web || '-' }}
              </div>
              <div class="text-[11px] text-surface-500">
                ID Webhost: {{ slotProps.data.webhost_id || '-' }}
              </div>
            </template>
          </Column>

          <Column field="service_type" header="Service" headerStyle="min-width:8rem">
            <template #body="slotProps">
              <Badge :value="slotProps.data.service_type || '-'" :severity="serviceSeverity(slotProps.data.service_type)" />
            </template>
          </Column>

          <Column field="source_type" header="Source" headerStyle="min-width:8rem">
            <template #body="slotProps">
              <div class="capitalize">{{ slotProps.data.source_type || '-' }}</div>
            </template>
          </Column>

          <Column field="start_date" header="Periode" headerStyle="min-width:15rem">
            <template #body="slotProps">
              <div class="font-medium">{{ formatDate(slotProps.data.start_date) }}</div>
              <div class="text-[11px] text-surface-500">
                s/d {{ formatDate(slotProps.data.end_date) }}
              </div>
            </template>
          </Column>

          <Column field="renewed_from_date" header="Renewal" headerStyle="min-width:10rem">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.renewed_from_date) }}
            </template>
          </Column>

          <Column field="status" header="Status" headerStyle="min-width:9rem">
            <template #body="slotProps">
              <div class="flex flex-col gap-1">
                <Badge :value="slotProps.data.status || '-'" :severity="statusSeverity(slotProps.data.status)" />
                <Badge :value="slotProps.data.payment_status || '-'" :severity="paymentSeverity(slotProps.data.payment_status)" />
              </div>
            </template>
          </Column>

          <Column field="nominal" header="Nominal" headerStyle="min-width:10rem">
            <template #body="slotProps">
              <div class="font-medium">{{ formatMoney(slotProps.data.nominal) }}</div>
              <div class="text-[11px] text-surface-500">
                Dibayar: {{ formatDate(slotProps.data.paid_at) }}
              </div>
            </template>
          </Column>

          <Column field="csMainProject.jenis" header="Project" headerStyle="min-width:14rem">
            <template #body="slotProps">
              <div>{{ slotProps.data.csMainProject?.jenis || '-' }}</div>
              <div class="text-[11px] text-surface-500">
                {{ formatDate(slotProps.data.csMainProject?.tgl_masuk) }}
              </div>
            </template>
          </Column>

          <Column field="description" header="Deskripsi" headerStyle="min-width:18rem">
            <template #body="slotProps">
              <div class="max-w-[20rem] whitespace-normal break-words leading-relaxed">
                {{ slotProps.data.description || '-' }}
              </div>
            </template>
          </Column>

          <Column field="act" header="" headerStyle="width:5rem">
            <template #body="slotProps">
              <div class="flex justify-end">
                <Button @click="openEditDialog(slotProps.data)" severity="info" size="small">
                  <Icon name="lucide:pencil" />
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>

        <div class="mt-3 flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-xs dark:border-surface-700 dark:bg-surface-900/60 md:flex-row md:items-center md:justify-between">
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

    <Dialog
      v-model:visible="visibleDialog"
      modal
      header="Edit Webhost Subscription"
      :style="{ width: '60rem' }"
      :breakpoints="{ '1000px': '75vw', '575px': '94vw' }"
    >
      <WebhostSubscriptionForm
        v-if="selectedId"
        :id="selectedId"
        action="edit"
        @submit="handleSubmitSuccess"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Webhost Subscriptions',
  description: 'Daftar semua webhost subscriptions',
})

const route = useRoute()
const router = useRouter()
const client = useSanctumClient()
const config = useRuntimeConfig()
const timezone = computed(() => config.public.appTimezone || 'Asia/Jakarta')

const page = ref(route.query.page ? Number(route.query.page) : 1)

const filters = reactive({
  per_page: route.query.per_page ? Number(route.query.per_page) : 50,
  page: computed(() => page.value),
  search_nama_web: typeof route.query.search_nama_web === 'string' ? route.query.search_nama_web : '',
  search: typeof route.query.search === 'string' ? route.query.search : '',
  service_type: typeof route.query.service_type === 'string' ? route.query.service_type : '',
  status: typeof route.query.status === 'string' ? route.query.status : '',
  payment_status: typeof route.query.payment_status === 'string' ? route.query.payment_status : '',
  order_by: 'start_date',
  order: 'desc',
} as any)

const { data, status, refresh } = await useAsyncData(
  () => `webhost-subscriptions-page-${page.value}-${filters.per_page}-${filters.search_nama_web}-${filters.search}-${filters.service_type}-${filters.status}-${filters.payment_status}`,
  () => client('/api/webhost-subscription', {
    params: filters,
  }),
) as any

const rows = computed(() => data.value?.data || [])

const serviceTypeOptions = ['domain', 'hosting', 'website', 'bundle']
const statusOptions = ['active', 'expired', 'cancelled', 'pending']
const paymentStatusOptions = ['paid', 'partial', 'unpaid']

const rowNumber = (index: number) => {
  return (data.value?.from || 1) + index
}

const formatDate = (value?: string | null) => {
  if (!value || value === '0000-00-00' || value === '0000-00-00 00:00:00') return '-'

  const hasTime = value.includes(':')
  const normalizedValue = hasTime ? value.replace(' ', 'T') : `${value}T12:00:00`
  const date = new Date(normalizedValue)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone.value,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const statusSeverity = (value?: string | null) => {
  if (value === 'active') return 'success'
  if (value === 'expired') return 'danger'
  if (value === 'pending') return 'warn'
  return 'secondary'
}

const paymentSeverity = (value?: string | null) => {
  if (value === 'paid') return 'success'
  if (value === 'partial') return 'warn'
  if (value === 'unpaid') return 'danger'
  return 'secondary'
}

const serviceSeverity = (value?: string | null) => {
  if (value === 'domain') return 'info'
  if (value === 'hosting') return 'success'
  return 'contrast'
}

const paginationText = computed(() => {
  if (!data.value?.total) return 'Belum ada data subscription'

  return `${data.value.from} - ${data.value.to} dari ${data.value.total}`
})

function updateRouteParams() {
  router.push({
    query: {
      page: String(page.value),
      per_page: String(filters.per_page),
      ...(filters.search_nama_web ? { search_nama_web: filters.search_nama_web } : {}),
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.service_type ? { service_type: filters.service_type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.payment_status ? { payment_status: filters.payment_status } : {}),
    },
  })
}

const handleRefresh = () => {
  page.value = 1
  updateRouteParams()
  refresh()
}

const resetFilters = () => {
  filters.search_nama_web = ''
  filters.search = ''
  filters.service_type = ''
  filters.status = ''
  filters.payment_status = ''
  filters.per_page = 50
  handleRefresh()
}

const onPaginate = (event: { page: number }) => {
  page.value = event.page + 1
  updateRouteParams()
  refresh()
}

const visibleDialog = ref(false)
const selectedId = ref(0)

const openEditDialog = (item: any) => {
  selectedId.value = Number(item?.id || 0)
  visibleDialog.value = true
}

const handleSubmitSuccess = () => {
  visibleDialog.value = false
  refresh()
}
</script>
