<script setup lang="ts">
definePageMeta({
  title: 'Subscriptions Webhost',
  description: 'Daftar subscription dari webhost',
})

const route = useRoute()
const id = route.params.id
const client = useSanctumClient()
const config = useRuntimeConfig()
const timezone = computed(() => config.public.appTimezone || 'Asia/Jakarta')

const { data: webhost, status: statusWebhost, refresh: refreshWebhost } = await useAsyncData(
  `webhost-subscription-webhost-${id}`,
  () => client(`/api/webhost/${id}`, {
    params: {
      with: 'paket,whmcs_domain'
    }
  })
) as any

const filters = reactive({
  page: 1,
  per_page: 50,
  order_by: 'start_date',
  order: 'desc',
}) as any

const refreshKey = computed(() => {
  return `webhost-subscriptions-${id}-${filters.page}-${filters.per_page}-${filters.order_by}-${filters.order}`
})

const fetchSubscriptions = () => client('/api/webhost-subscription', {
  params: {
    ...filters,
    webhost_id: id,
  }
})

const { data: subscriptions, status: statusSubscriptions, refresh: refreshSubscriptions } = await useAsyncData(
  refreshKey,
  fetchSubscriptions,
  {
    watch: [() => filters.page, () => filters.per_page, () => filters.order_by, () => filters.order]
  }
) as any

const items = computed(() => {
  return subscriptions.value?.data || []
})

const stats = computed(() => {
  const rows = items.value

  return {
    total: rows.length,
    active: rows.filter((item: any) => item.status === 'active').length,
    expired: rows.filter((item: any) => item.status === 'expired').length,
    totalNominal: rows.reduce((acc: number, item: any) => acc + (Number(item?.nominal) || 0), 0),
  }
})

const paginationText = computed(() => {
  if (!subscriptions.value?.total) return 'Belum ada subscription'

  return `${subscriptions.value?.from || 0} - ${subscriptions.value?.to || 0} dari ${subscriptions.value?.total || 0}`
})

const onPaginate = (event: { page: number }) => {
  filters.page = event.page + 1
}

const refreshAll = () => {
  refreshWebhost()
  refreshSubscriptions()
}

const statusSeverity = (status: string) => {
  if (status === 'active') return 'success'
  if (status === 'expired') return 'danger'
  if (status === 'pending') return 'warn'
  return 'secondary'
}

const serviceSeverity = (serviceType: string) => {
  if (serviceType === 'domain') return 'info'
  if (serviceType === 'hosting') return 'success'
  return 'contrast'
}

const paymentSeverity = (status: string) => {
  if (status === 'paid') return 'success'
  if (status === 'partial') return 'warn'
  if (status === 'unpaid') return 'danger'
  return 'secondary'
}

const formatDate = (value?: string | null, withTime = false) => {
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
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

const formatMoneyCompact = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? 'compact' : 'standard',
  }).format(value || 0)
}

const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')
const idDialog = ref<number>(0)
const openDialog = (action: 'add' | 'edit' = 'add', data: any = null) => {
  actionDialog.value = action
  visibleDialog.value = true
  idDialog.value = data?.id || 0
}
</script>

<template>
  <div class="space-y-4">
    <template v-if="webhost?.id_webhost">
      <Card class="overflow-hidden">
        <template #content>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <div class="text-xl font-semibold text-surface-900 dark:text-surface-0">
                  {{ webhost?.nama_web || '-' }}
                </div>
                <Badge value="Subscriptions" severity="contrast" />
                <Badge
                  v-if="webhost?.whmcs_domain?.status"
                  :value="webhost.whmcs_domain.status"
                  :severity="statusSeverity(webhost.whmcs_domain.status)"
                />
              </div>

              <div class="grid gap-2 text-sm text-surface-600 dark:text-surface-300 md:grid-cols-2">
                <div>
                  <span class="font-medium text-surface-900 dark:text-surface-0">Paket:</span>
                  {{ webhost?.paket?.paket || '-' }}
                </div>
                <div>
                  <span class="font-medium text-surface-900 dark:text-surface-0">Registration Date:</span>
                  {{ formatDate(webhost?.whmcs_domain?.registrationdate) }}
                </div>
                <div>
                  <span class="font-medium text-surface-900 dark:text-surface-0">Expiry Date:</span>
                  {{ formatDate(webhost?.whmcs_domain?.expirydate) }}
                </div>
              </div>
            </div>

            <Button size="small" @click="refreshAll" :loading="statusWebhost === 'pending' || statusSubscriptions === 'pending'">
              <Icon
                name="lucide:refresh-ccw"
                :class="statusWebhost === 'pending' || statusSubscriptions === 'pending' ? 'animate-spin' : ''"
              />
              Refresh
            </Button>
          </div>
        </template>
      </Card>      

      <Card>
        <template #title>
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-2">
              <Icon name="lucide:calendar-sync" />
              Daftar Subscription
            </div>
            <div class="text-xs text-surface-500">
              Tanggal mengikuti timezone {{ timezone }}
            </div>
          </div>
        </template>
        <template #content>
          <div v-if="items.length" class="space-y-4">
            <DataTable
              :value="items"
              scrollable
              scrollHeight="42rem"
              size="small"
              class="text-xs"
              stripedRows
            >
              <Column header="#" headerStyle="width:4rem">
                <template #body="slotProps">
                  {{ slotProps.index + (subscriptions?.from || 1) }}
                </template>
              </Column>

              <Column field="service_type" header="Service">
                <template #body="slotProps">
                  <Badge
                    :severity="serviceSeverity(slotProps.data.service_type)"
                    :value="slotProps.data.service_type || '-'"
                  />
                </template>
              </Column>

              <Column field="source_type" header="Source">
                <template #body="slotProps">
                  <div class="capitalize">{{ slotProps.data.source_type || '-' }}</div>
                </template>
              </Column>

              <Column field="start_date" header="Start Periode" headerStyle="min-width:15rem">
                <template #body="slotProps">
                  <div class="font-medium">{{ formatDate(slotProps.data.start_date) }}</div>
                </template>
              </Column>
              <Column field="end_date" header="End Periode" headerStyle="min-width:15rem">
                <template #body="slotProps">
                  <div class="font-medium">{{ formatDate(slotProps.data.end_date) }}</div>
                </template>
              </Column>

              <Column field="status" header="Status">
                <template #body="slotProps">
                    <Badge
                      :severity="statusSeverity(slotProps.data.status)"
                      :value="slotProps.data.status || '-'"
                    />
                </template>
              </Column>
              <Column field="payment_status" header="Status Bayar">
                <template #body="slotProps">
                  <div class="flex flex-col gap-1">                    
                    <Badge
                      :severity="paymentSeverity(slotProps.data.payment_status)"
                      :value="slotProps.data.payment_status || '-'"
                    />
                    <div class="text-[11px] text-surface-500">
                      Dibayar: {{ formatDate(slotProps.data.paid_at) }}
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="csMainProject.jenis" header="Project" headerStyle="min-width:14rem">
                <template #body="slotProps">
                  <div class="font-medium">{{ slotProps.data.csMainProject?.jenis || '-' }}</div>
                  <div v-if="slotProps.data.csMainProject?.tgl_masuk" class="mt-1 opacity-60">
                    {{ formatDate(slotProps.data.csMainProject?.tgl_masuk) }}
                  </div>
                </template>
              </Column>

              <Column field="description" header="Deskripsi">
                <template #body="slotProps">
                  <div class="max-w-[20rem] whitespace-normal break-words leading-relaxed">
                    {{ slotProps.data.description || '-' }}
                  </div>
                </template>
              </Column>

              <Column field="act" header="">
                <template #body="slotProps">
                  <div class="flex justify-end">
                    <Button @click="openDialog('edit', slotProps.data)" size="small">
                      <Icon name="lucide-pen"/>
                    </Button>
                  </div>
                </template>
              </Column>
            </DataTable>

            <div v-if="subscriptions?.total > 0" class="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-xs dark:border-surface-700 dark:bg-surface-900/60 md:flex-row md:items-center md:justify-between">
              <div>{{ paginationText }}</div>

              <Paginator
                :rows="subscriptions?.per_page || filters.per_page"
                :totalRecords="subscriptions?.total || 0"
                @page="onPaginate"
                :pt="{
                  root: (event: any) => {
                    const itemForPage = subscriptions?.per_page || filters.per_page
                    const currentPage = filters.page - 1
                    event.state.d_first = itemForPage * currentPage
                  },
                }"
              />
            </div>
          </div>

          <Message v-else severity="warn">
            Belum ada subscription yang terhubung ke webhost ini.
          </Message>
        </template>
      </Card>
    </template>

    <Message v-else-if="statusWebhost !== 'pending'" severity="warn">
      Data webhost tidak ditemukan.
    </Message>

    <DashLoader :loading="statusWebhost === 'pending' || statusSubscriptions === 'pending'" />
  </div>

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah':'Edit'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <WebhostSubscriptionForm :id="idDialog" action="edit" @submit="refreshSubscriptions();visibleDialog = false" />
  </Dialog>

</template>
