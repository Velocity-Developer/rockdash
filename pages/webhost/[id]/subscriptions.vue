<script setup lang="ts">
definePageMeta({
  title: 'Subscriptions Webhost',
  description: 'Daftar subscription dari webhost',
})

const route = useRoute()
const id = route.params.id
const client = useSanctumClient()

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
</script>

<template>
  <div class="space-y-4">
    
    <template v-if="webhost?.id_webhost">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <template #content>
            <div class="text-xs uppercase tracking-wide opacity-60">Total Subscription</div>
            <div class="mt-2 text-2xl font-semibold">{{ subscriptions?.total || 0 }}</div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="text-xs uppercase tracking-wide opacity-60">Active</div>
            <div class="mt-2 text-2xl font-semibold text-emerald-600">{{ stats.active }}</div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="text-xs uppercase tracking-wide opacity-60">Expired</div>
            <div class="mt-2 text-2xl font-semibold text-rose-600">{{ stats.expired }}</div>
          </template>
        </Card>
      </div>

      <Card>
        <template #title>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div class="flex items-center gap-2">
                <Icon name="lucide:calendar-sync" />
                Daftar Subscription
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

              <Column field="start_date" header="Start" />

              <Column field="end_date" header="End">
                <template #body="slotProps">
                  {{ slotProps.data.end_date || '-' }}
                </template>
              </Column>

              <Column field="renewed_from_date" header="Renewed From">
                <template #body="slotProps">
                  {{ slotProps.data.renewed_from_date || '-' }}
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

              <Column field="nominal" header="Nominal">
                <template #body="slotProps">
                  {{ formatMoney(slotProps.data.nominal) }}
                </template>
              </Column>

              <Column field="csMainProject.jenis" header="Project">
                <template #body="slotProps">
                  <div>{{ slotProps.data.csMainProject?.jenis || '-' }}</div>
                  <div v-if="slotProps.data.csMainProject?.tgl_masuk" class="mt-1 opacity-60">
                    {{ slotProps.data.csMainProject?.tgl_masuk }}
                  </div>
                </template>
              </Column>

              <Column field="parent.id" header="Parent">
                <template #body="slotProps">
                  <div v-if="slotProps.data.parent">
                    #{{ slotProps.data.parent.id }}
                  </div>
                  <div v-else>-</div>
                </template>
              </Column>

              <Column field="renewals" header="Renewals">
                <template #body="slotProps">
                  {{ slotProps.data.renewals?.length || 0 }}
                </template>
              </Column>

              <Column field="description" header="Deskripsi">
                <template #body="slotProps">
                  <div class="max-w-[18rem] whitespace-normal break-words">
                    {{ slotProps.data.description || '-' }}
                  </div>
                </template>
              </Column>
            </DataTable>

            <div v-if="subscriptions?.total > 0" class="flex flex-col gap-3 text-xs md:flex-row md:items-center md:justify-between">
              <div>
                {{ subscriptions?.from || 0 }} - {{ subscriptions?.to || 0 }} dari {{ subscriptions?.total || 0 }}
              </div>

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
</template>
