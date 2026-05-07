<template>
  <div class="space-y-4">
    <Card>
      <template #content>
        <div class="flex flex-wrap justify-end items-end gap-2">
          <InputText
            v-model="filters.search"
            placeholder="Cari domain / paket.."
            size="small"
          />
          <InputText
            v-model="filters.package_name"
            placeholder="Paket.."
            size="small"
          />
          <InputText
            v-model="filters.whmcs_userid"
            placeholder="User ID WHMCS"
            size="small"
            class="w-32"
          />
          <InputText
            v-model="filters.nextduedate_from"
            type="date"
            size="small"
            class="w-40"
          />
          <InputText
            v-model="filters.nextduedate_to"
            type="date"
            size="small"
            class="w-40"
          />
          <Select
            v-model="filters.domainstatus"
            :options="['Active', 'Suspended', 'Terminated', 'Cancelled', 'Fraud', 'Pending']"
            placeholder="Status"
            size="small"
            showClear
            @change="handleRefresh"
          />
          <Select
            v-model="filters.billingcycle"
            :options="['Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'Biennially', 'Triennially', 'Free Account', 'One Time']"
            placeholder="Billing"
            size="small"
            showClear
            @change="handleRefresh"
          />
          <Select
            v-model="filters.per_page"
            :options="[20, 50, 100, 500]"
            size="small"
            @change="handleRefresh"
          />
          <Button @click="handleRefresh" size="small" severity="info">
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
          class="text-xs"
          stripedRows
          scrollHeight="80vh"
          scrollable
        >
          <Column header="#" headerStyle="width:4rem">
            <template #body="slotProps">
              {{ rowNumber(slotProps.index) }}
            </template>
          </Column>

          <Column field="domain" header="Domain" headerStyle="min-width:16rem">
            <template #body="slotProps">
              <span
                role="button"
                aria-label="Buka preview hosting"
                class="font-medium cursor-pointer hover:text-primary"
                @click="openDialogPreview(slotProps.data)"
              >
                {{ slotProps.data.domain || '-' }}
              </span>
            </template>
          </Column>

          <Column field="whmcs_user" header="User" headerStyle="min-width:16rem">
            <template #body="slotProps">
              <div v-if="slotProps.data.whmcs_user">
                <div class="font-medium">
                  {{ slotProps.data.whmcs_user.firstname }} {{ slotProps.data.whmcs_user.lastname }}
                </div>
                <div class="text-surface-500">
                  {{ slotProps.data.whmcs_user.email }}
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </Column>

          <Column field="domainstatus" header="Status" headerStyle="min-width:9rem">
            <template #body="slotProps">
              <Badge
                :value="slotProps.data.domainstatus || '-'"
                :severity="statusSeverity(slotProps.data.domainstatus)"
                size="small"
              />
            </template>
          </Column>

          <Column field="nextduedate" header="Next Due" headerStyle="min-width:9rem">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.nextduedate) }}
            </template>
          </Column>

          <Column field="billingcycle" header="Billing" headerStyle="min-width:10rem">
            <template #body="slotProps">
              {{ slotProps.data.billingcycle || '-' }}
            </template>
          </Column>

          <Column field="package_name" header="Paket" headerStyle="min-width:14rem">
            <template #body="slotProps">
              <div>{{ slotProps.data.package_name || '-' }}</div>
              <div v-if="slotProps.data.package_servertype" class="text-surface-500">
                {{ slotProps.data.package_servertype }}
              </div>
            </template>
          </Column>

          <Column field="whmcs_domain" header="Domain WHMCS" headerStyle="min-width:9rem">
            <template #body="slotProps">
              <Badge v-if="slotProps.data.whmcs_domain" severity="success">
                <Icon name="lucide:check-circle" />
              </Badge>
              <span v-else>-</span>
            </template>
          </Column>

          <Column field="webhost" header="Webhost" headerStyle="min-width:9rem">
            <template #body="slotProps">
              <NuxtLink
                v-if="slotProps.data.webhost"
                :to="`/webhost/${slotProps.data.webhost.id_webhost}`"
                target="_blank"
                class="text-blue-500 hover:underline"
              >
                <Icon name="lucide:external-link" />
                Buka
              </NuxtLink>
              <span v-else>-</span>
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

  <Dialog
    v-model:visible="visibleDialogPreview"
    modal
    :header="dialogDataPreview.domain || '-'"
    :dismissableMask="true"
    :style="{ width: '60rem' }"
    :breakpoints="{ '1000px': '75vw', '575px': '90vw' }"
  >
    <WhmcsHostingPreview :id="dialogDataPreview.id" />
  </Dialog>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Data Hosting WHMCS',
  description: 'Whmcs Hosting',
})

const route = useRoute()
const router = useRouter()
const client = useSanctumClient()

const page = ref(route.query.page ? Number(route.query.page) : 1)
const filters = reactive({
  per_page: route.query.per_page ? Number(route.query.per_page) : 50,
  page: computed(() => page.value),
  search: typeof route.query.search === 'string' ? route.query.search : '',
  package_name: typeof route.query.package_name === 'string' ? route.query.package_name : '',
  whmcs_userid: typeof route.query.whmcs_userid === 'string' ? route.query.whmcs_userid : '',
  domainstatus: typeof route.query.domainstatus === 'string' ? route.query.domainstatus : '',
  billingcycle: typeof route.query.billingcycle === 'string' ? route.query.billingcycle : '',
  nextduedate_from: typeof route.query.nextduedate_from === 'string' ? route.query.nextduedate_from : '',
  nextduedate_to: typeof route.query.nextduedate_to === 'string' ? route.query.nextduedate_to : '',
  with: 'whmcs_user,whmcs_domain,webhost',
} as any)

const { data, status, refresh } = await useAsyncData(
  () => `whmcs-hosting-page-${page.value}-${filters.per_page}`,
  () =>
    client('/api/whmcs-hosting', {
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
  if (['terminated', 'cancelled', 'fraud'].includes(statusValue)) return 'danger'
  if (['pending', 'suspended'].includes(statusValue)) return 'warn'

  return 'info'
}

const paginationText = computed(() => {
  if (!data.value?.total) return 'Belum ada data hosting'

  return `${data.value.from} - ${data.value.to} dari ${data.value.total}`
})

function updateRouteParams() {
  router.push({
    query: {
      page: String(page.value),
      per_page: String(filters.per_page),
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.package_name ? { package_name: filters.package_name } : {}),
      ...(filters.whmcs_userid ? { whmcs_userid: filters.whmcs_userid } : {}),
      ...(filters.domainstatus ? { domainstatus: filters.domainstatus } : {}),
      ...(filters.billingcycle ? { billingcycle: filters.billingcycle } : {}),
      ...(filters.nextduedate_from ? { nextduedate_from: filters.nextduedate_from } : {}),
      ...(filters.nextduedate_to ? { nextduedate_to: filters.nextduedate_to } : {}),
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

const visibleDialogPreview = ref(false)
const dialogDataPreview = ref<any>({})
const openDialogPreview = (data: any) => {
  visibleDialogPreview.value = true
  dialogDataPreview.value = data
}
</script>
