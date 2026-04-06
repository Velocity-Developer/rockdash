<template>
  <div class="space-y-4">

    <div class="flex flex-wrap justify-end items-end gap-2">
      <Button
        v-if="selectedRows.length > 0"
        size="small"
        severity="warn"
        :loading="syncWebhostLoading"
        :disabled="syncWebhostLoading"
        @click="syncSelectedWebhost"
      >
        <Icon name="lucide:refresh-cw" :class="syncWebhostLoading ? 'animate-spin' : ''" />
        {{ syncWebhostLoading ? `Sync Webhost ${syncWebhostProgress}/${syncWebhostTotal}` : 'Sync Webhost' }}
      </Button>
      <ToggleButton 
        v-model="filters.uppercase_only" 
        class="flex" 
        onLabel="Uppercase Domain" offLabel="Lowercase" 
        size="small"
        @change="handleRefresh"
      />
      <InputText
        v-model="filters.search"
        placeholder="Cari domain / email.."
        size="small"
      />
      <Select
        v-model="filters.per_page"
        :options="[20, 50, 100]"
        size="small"
        @change="handleRefresh"
      />
      <Select
        v-model="filters.status"
        :options="['Expired', 'Active', 'Grace']"
        size="small" showClear
        @change="handleRefresh"
      />
      <Button @click="handleRefresh" size="small" severity="info">
        <Icon name="lucide:refresh-cw" :class="status === 'pending' ? 'animate-spin' : ''" />
        Refresh
      </Button>
    </div>

    <Card>
      <template #content>
        <DataTable
          :value="tableRows"
          :loading="status === 'pending'"
          size="small"
          class="text-xs"
          stripedRows
          scrollHeight="80vh"
          scrollable
          v-model:selection="selectedRows"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column header="#" headerStyle="width:4rem">
            <template #body="slotProps">
              {{ rowNumber(slotProps.index) }}
            </template>
          </Column>

          <Column field="domain" header="Domain" headerStyle="min-width:16rem">
            <template #body="slotProps">
              <div class="font-medium">
                {{ slotProps.data.domain || '-' }}
              </div>
            </template>
          </Column>

          <Column field="user_email" header="Email User" headerStyle="min-width:16rem">
            <template #body="slotProps">
              {{ slotProps.data.user_email || '-' }}
            </template>
          </Column>

          <Column field="status" header="Status" headerStyle="min-width:8rem">
            <template #body="slotProps">
              <Badge
                :value="slotProps.data.status || '-'"
                :severity="statusSeverity(slotProps.data.status)"
                size="small"
              />
            </template>
          </Column>          

          <Column field="registrationdate" header="Register" headerStyle="min-width:9rem">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.registrationdate) }}
            </template>
          </Column>

          <Column field="expirydate" header="Expired" headerStyle="min-width:9rem">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.expirydate) }}
            </template>
          </Column>
          <Column field="webhost_data" header="Webhost Data">
            <template #body="slotProps">              
              <Button v-if="!slotProps.data.webhost_data" @click="openWebhostSyncDialog(slotProps.data)" size="small" severity="warn">
                <Icon name="lucide:globe" /> Sync
              </Button>
              <Badge v-else>
                <Icon name="lucide:check-circle" />
              </Badge>
            </template>
          </Column>

          <Column field="act" header="">
            <template #body="slotProps">
              <div class="flex items-center justify-end">
                <Button @click="openDialog(slotProps.data)" size="small" severity="info">
                  <Icon name="lucide:pen" />
                </Button>
              </div>
            </template>
          </Column>

        </DataTable>

        <div class="flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-xs mt-3">
          <div>
            {{ paginationText }}
          </div>

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

  <Dialog v-model:visible="visibleDialog" modal :header="dialogData.domain || '-' " :dismissableMask="true" :style="{ width: '60rem' }" :breakpoints="{ '1000px': '75vw', '575px': '90vw' }">
    <WhmcsDomainForm :id="dialogData.id" @submit="refresh();visibleDialog = false"/>
  </Dialog>

  
  <Dialog v-model:visible="visibleWebhostSync" modal header="Sync Webhost" :dismissableMask="true" :style="{ width: '80rem' }" :breakpoints="{ '1000px': '75vw', '575px': '90vw' }">
    <WhmcsDomainWebhostSync :data="dataWebhostSync" @update="refresh()"/>
  </Dialog>

</template>

<script setup lang="ts">
definePageMeta({
  title: 'Data Domain WHMCS',
  description: 'Whmcs Domain',
})

const route = useRoute()
const router = useRouter()
const client = useSanctumClient()
const toast = useToast()

const page = ref(route.query.page ? Number(route.query.page) : 1)
const filters = reactive({
  per_page: route.query.per_page ? Number(route.query.per_page) : 50,
  page: computed(() => page.value),
  search: typeof route.query.search === 'string' ? route.query.search : '',
  order_by: 'id',
  order: 'desc',
  status: '',
  uppercase_only: false
} as any)

const { data, status, refresh } = await useAsyncData(
  'whmcs-domain-page'+filters.page,
  () =>
    client('/api/whmcs-domain', {
      params: filters,
    }),
) as any

const tableRows = computed(() => data.value?.data || [])

const rowNumber = (index: number) => {
  return (data.value?.from || 1) + index
}

const formatDate = (value: string | null) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const statusSeverity = (value: string | null) => {
  const statusValue = (value || '').toLowerCase()

  if (['active', 'ok'].includes(statusValue)) return 'success'
  if (['expired', 'cancelled', 'fraud'].includes(statusValue)) return 'danger'
  if (['pending', 'grace', 'grace period'].includes(statusValue)) return 'warn'

  return 'info'
}

const paginationText = computed(() => {
  if (!data.value?.total) return 'Belum ada data domain'

  return `${data.value.from} - ${data.value.to} dari ${data.value.total}`
})

function updateRouteParams() {
  router.push({
    query: {
      page: String(page.value),
      per_page: String(filters.per_page),
      ...(filters.search ? { search: filters.search } : {}),
    },
  })
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

const visibleDialog = ref(false);
const dialogData = ref<any>({})
const openDialog = (data: any) => {
  visibleDialog.value = true
  dialogData.value = data
}

const visibleWebhostSync = ref(false);
const dataWebhostSync = ref<any>({})
const openWebhostSyncDialog = (data: any) => {
  visibleWebhostSync.value = true
  dataWebhostSync.value = data
}

const selectedRows = ref([]);
const syncWebhostLoading = ref(false)
const syncWebhostProgress = ref(0)
const syncWebhostTotal = ref(0)

const syncSelectedWebhost = async () => {
  if (syncWebhostLoading.value || selectedRows.value.length === 0) return

  syncWebhostLoading.value = true
  syncWebhostProgress.value = 0
  syncWebhostTotal.value = selectedRows.value.length

  let successCount = 0
  let skippedCount = 0
  let failedCount = 0

  try {
    for (const row of selectedRows.value as any[]) {
      syncWebhostProgress.value += 1

      if (row.webhost_data || row.webhost_id) {
        skippedCount += 1
        continue
      }

      try {
        const response = await client('/api/whmcs-domain-webhost-search', {
          method: 'POST',
          body: {
            id: row.id,
            domain: row.domain,
            email: row.user_email,
          },
        }) as any

        if (response?.auto_assigned) {
          successCount += 1
        }
      } catch (error) {
        failedCount += 1
        console.log(error)
      }
    }

    await refresh()
    selectedRows.value = []

    toast.add({
      severity: failedCount > 0 ? 'warn' : 'success',
      summary: 'Sync Webhost selesai',
      detail: `${successCount} berhasil, ${skippedCount} dilewati, ${failedCount} gagal`,
      life: 4000,
    })
  } finally {
    syncWebhostLoading.value = false
    syncWebhostProgress.value = 0
    syncWebhostTotal.value = 0
  }
}
</script>
