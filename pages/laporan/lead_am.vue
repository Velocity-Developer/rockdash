<script setup lang="ts">
import { useDayjs } from '#dayjs'
import * as XLSX from 'xlsx'
import { pastelColors, pastelBorderColors } from '~/utils/chartColors'

definePageMeta({
  title: 'Lead AM',
  page_key: 'lead_am',
})

const client = useSanctumClient()
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const staffOptions = ['-', 'CS', 'Dini']

const filters = reactive({
  dari: route.query.dari
    ? dayjs(String(route.query.dari)).toDate()
    : dayjs().subtract(30, 'day').toDate(),
  sampai: route.query.sampai
    ? dayjs(String(route.query.sampai)).toDate()
    : dayjs().toDate(),
  ma: typeof route.query.ma === 'string' ? route.query.ma : '',
  nama_web: typeof route.query.nama_web === 'string' ? route.query.nama_web : '',
  page: route.query.page ? Number(route.query.page) : 1,
  per_page: route.query.per_page ? Number(route.query.per_page) : 100,
  sort_by: typeof route.query.sort_by === 'string' ? route.query.sort_by : 'tgl_masuk',
  sort_order: typeof route.query.sort_order === 'string' ? route.query.sort_order : 'desc',
} as any)

const loading = ref(false)
const savingId = ref<number | null>(null)
const data = ref({} as any)

const tableRows = computed(() => data.value?.data?.data || [])
const diniSummary = computed(() => data.value?.dini_summary || [])
const totalOrder = computed(() => data.value?.data?.total || 0)
const firstRow = computed(() => data.value?.data?.from || 0)
const paginationText = computed(() => {
  const meta = data.value?.data
  if (!meta?.total) return '0 data'
  return `${meta.from} - ${meta.to} dari ${meta.total}`
})

function updateRouteParams() {
  const query: any = {
    dari: dayjs(filters.dari).format('YYYY-MM-DD'),
    sampai: dayjs(filters.sampai).format('YYYY-MM-DD'),
    ma: filters.ma || undefined,
    nama_web: filters.nama_web || undefined,
    page: filters.page > 1 ? filters.page : undefined,
    per_page: filters.per_page !== 100 ? filters.per_page : undefined,
    sort_by: filters.sort_by !== 'tgl_masuk' ? filters.sort_by : undefined,
    sort_order: filters.sort_order !== 'desc' ? filters.sort_order : undefined,
  }

  router.push({ query })
}

const getData = async () => {
  loading.value = true

  try {
    const response = await client('/api/laporan/lead_am', {
      params: {
        dari: filters.dari ? dayjs(filters.dari).format('YYYY-MM-DD') : null,
        sampai: filters.sampai ? dayjs(filters.sampai).format('YYYY-MM-DD') : null,
        ma: filters.ma || null,
        nama_web: filters.nama_web || null,
        page: filters.page,
        per_page: filters.ma ? 10000 : filters.per_page,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      },
    }) as any

    data.value = response
    updateRouteParams()
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: `Data gagal diambil ${er.bag || ''}`,
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const applyFilter = () => {
  filters.page = 1
  getData()
}

const resetFilter = () => {
  filters.dari = dayjs().subtract(30, 'day').toDate()
  filters.sampai = dayjs().toDate()
  filters.ma = ''
  filters.nama_web = ''
  filters.page = 1
  filters.per_page = 100
  filters.sort_by = 'tgl_masuk'
  filters.sort_order = 'desc'
  getData()
}

const handleSortTable = (event: any) => {
  filters.sort_by = event.sortField || 'tgl_masuk'
  filters.sort_order = event.sortOrder === 1 ? 'asc' : 'desc'
  filters.page = 1
  getData()
}

const onPaginate = (event: { page: number }) => {
  filters.page = event.page + 1
  getData()
}

const saveStaff = async (row: any) => {
  savingId.value = row.id

  try {
    await client(`/api/laporan/lead_am/${row.id}/staff`, {
      method: 'PUT',
      body: {
        staff: row.staff,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'MA berhasil diperbarui',
      life: 2500,
    })
    getData()
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: `MA gagal diperbarui ${er.bag || ''}`,
      life: 3000,
    })
  } finally {
    savingId.value = null
  }
}

const exportExcel = () => {
  const rows = tableRows.value.map((item: any, index: number) => ({
    No: firstRow.value + index,
    'Tanggal Order': item.tgl_masuk || '',
    Whatsapp: item.wa || item.hp || '',
    Paket: `${item.jenis || ''} ${item.paket || ''}`.trim(),
    'Nama Domain': item.nama_web || '',
    Nominal: Number(item.dibayar || 0),
    MA: item.staff || '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 18 },
    { wch: 35 },
    { wch: 35 },
    { wch: 14 },
    { wch: 10 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Lead AM')
  XLSX.writeFile(wb, `Lead_AM_${dayjs(filters.dari).format('YYYY-MM-DD')}_${dayjs(filters.sampai).format('YYYY-MM-DD')}.xlsx`)
}

onMounted(() => {
  getData()
})
</script>

<template>
  <div class="space-y-4">

    <Card>
      <template #content>
        <div class="flex flex-col md:flex-row md:items-end md:justify-end gap-2">
          <div>
            <label class="mb-1 block text-xs">Dari :</label>
            <DatePicker v-model="filters.dari" dateFormat="yy-mm-dd" size="small" showIcon showClear />
          </div>
          <div>
            <label class="mb-1 block text-xs">Sampai :</label>
            <DatePicker v-model="filters.sampai" dateFormat="yy-mm-dd" size="small" showIcon showClear />
          </div>
          <div>
            <label class="mb-1 block text-xs">Nama MA :</label>
            <InputText v-model="filters.ma" size="small" placeholder="Nama MA" @keyup.enter="applyFilter" />
          </div>
          <div>
            <label class="mb-1 block text-xs">Nama Web :</label>
            <InputText v-model="filters.nama_web" size="small" placeholder="Cari nama web" @keyup.enter="applyFilter" />
          </div>
          <div>
            <label class="mb-1 block text-xs">Per halaman :</label>
            <Select v-model="filters.per_page" :options="[50, 100, 250, 500, 1000, 10000]" size="small" @change="applyFilter" />
          </div>
          <ButtonGroup>
            <Button size="small" severity="contrast" @click="applyFilter">
              <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
              <Icon v-else name="lucide:search" />
            </Button>
            <Button size="small" severity="secondary" @click="resetFilter">
              <Icon name="lucide:rotate-ccw" />
              Reset
            </Button>
            <Button size="small" severity="success" :disabled="!tableRows.length" @click="exportExcel">
              <Icon name="lucide:download" />
              Export XLS
            </Button>
          </ButtonGroup>
        </div>
      </template>
    </Card>

    <div class="flex justify-end">
      <Button type="button" size="small" severity="info">
        Total Order
        <Badge :value="totalOrder" severity="contrast" />
      </Button>
    </div>

    <div class="grid grid-cols-8 gap-4">

      <div class="col-span-8 md:col-span-3 xl:col-span-2">
        <Card>
          <template #header>
            <div class="px-5 pt-4 font-bold">Dini</div>
          </template>
          <template #content>
            <Chart
              v-if="diniSummary.length"
              type="pie"
              :data="{
                labels: diniSummary.map((item: any) => `${item.jenis} (${item.total}) ${formatMoney(item.biaya, 'Rp', 0)}`),
                datasets: [
                  { 
                    data: diniSummary.map((item: any) => item.total),
                    backgroundColor: pastelColors,
                    borderColor: pastelBorderColors,
                    borderWidth: 1
                  }
                ],
              }"
              :options="{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }"
              class="h-[30rem]"
            />
            <div v-if="!diniSummary.length && loading">
              <Skeleton shape="circle" size="20rem" class="mx-auto mb-4"></Skeleton>
              <Skeleton v-for="i in 4" class="mb-1"></Skeleton>
            </div>
          </template>
        </Card>
      </div>

      <Card class="col-span-8 md:col-span-5 xl:col-span-6">
        <template #content>
          <DataTable
            :value="tableRows"
            :loading="loading"
            lazy
            :sort-field="filters.sort_by"
            :sort-order="filters.sort_order === 'asc' ? 1 : -1"
            @sort="handleSortTable($event)"
            size="small"
            class="text-xs"
            stripedRows
            scrollable
            scrollHeight="72vh"
          >
            <Column header="#" headerStyle="width:4rem">
              <template #body="slotProps">
                {{ firstRow + slotProps.index }}
              </template>
            </Column>

            <Column field="tgl_masuk" sortable header="Tanggal Order">
              <template #body="slotProps">
                {{ slotProps.data.tgl_masuk || '-' }}
              </template>
            </Column>

            <Column field="wa" sortable header="Whatsapp">
              <template #body="slotProps">
                {{ slotProps.data.wa || '-' }}
              </template>
            </Column>

            <Column field="paket" sortable header="Paket">
              <template #body="slotProps">
                {{ slotProps.data.jenis }} {{ slotProps.data.paket }}
              </template>
            </Column>

            <Column field="nama_web" sortable header="Nama Domain" />

            <Column field="dibayar" header="Nominal" class="text-right">
              <template #body="slotProps">
                {{ formatMoney(slotProps.data.dibayar || 0, 'Rp', 0) }}
              </template>
            </Column>

            <Column header="MA" field="staff" sortable>
              <template #body="slotProps">
                <Select
                  v-model="slotProps.data.staff"
                  :options="staffOptions"
                  size="small"
                  class="w-28"
                  :disabled="savingId !== null"
                />
              </template>
            </Column>

            <Column header="" headerStyle="width:4rem">
              <template #body="slotProps">
                <div class="flex justify-end">
                  <Button
                    size="small"
                    severity="info"
                    outlined
                    :loading="savingId === slotProps.data.id"
                    @click="saveStaff(slotProps.data)"
                  >
                    <Icon name="lucide:save" />
                  </Button>
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="flex justify-center p-4">
                Tidak ada data ditemukan.
              </div>
            </template>
          </DataTable>

          <div class="flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-xs mt-3">
            <div>{{ paginationText }}</div>

            <Paginator
              v-if="data?.data?.total"
              :first="(filters.page - 1) * filters.per_page"
              :rows="data.data.per_page"
              :totalRecords="data.data.total"
              @page="onPaginate"
            />
          </div>
        </template>
      </Card>
      
      
    </div>

    <DashLoader :loading="loading" />
  </div>
</template>
