<script setup lang="ts">
import { useDayjs } from '#dayjs'
import * as XLSX from 'xlsx'

definePageMeta({
  title: 'Laporan Rincian Transaksi Tanggal',
  page_key: 'rincian_transaksi_tgl',
})

type ColumnConfig = {
  field: string
  header: string
  type: 'text' | 'number' | 'money'
}

type ReportTable = {
  name: string
  columns: ColumnConfig[]
  rows: Record<string, any>[]
  wide?: boolean
}

const client = useSanctumClient()
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const toDayNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value || fallback)
  return Math.max(1, Math.min(31, numberValue))
}

const filter = reactive({
  dari: route.query.dari
    ? dayjs(route.query.dari as string).toDate()
    : dayjs().subtract(12, 'month').toDate(),
  sampai: route.query.sampai
    ? dayjs(route.query.sampai as string).toDate()
    : dayjs().toDate(),
  tgl_dari: toDayNumber(route.query.tgl_dari || route.query['tgl-dari'], 1),
  tgl_sampai: toDayNumber(route.query.tgl_sampai || route.query['tgl-sampai'], dayjs().date()),
})

const loading = ref(false)
const report = ref({
  summary: {
    columns: [] as ColumnConfig[],
    rows: [] as Record<string, any>[],
  },
  tables: [] as ReportTable[],
})

const updateRouteParams = () => {
  router.push({
    query: {
      dari: dayjs(filter.dari).format('YYYY-MM'),
      sampai: dayjs(filter.sampai).format('YYYY-MM'),
      tgl_dari: filter.tgl_dari,
      tgl_sampai: filter.tgl_sampai,
    },
  })
}

const getData = async () => {
  loading.value = true

  try {
    const response = await client('/api/laporan/rincian_transaksi_tgl', {
      params: {
        dari: dayjs(filter.dari).format('YYYY-MM'),
        sampai: dayjs(filter.sampai).format('YYYY-MM'),
        tgl_dari: filter.tgl_dari,
        tgl_sampai: filter.tgl_sampai,
      },
    }) as any

    report.value = response
    updateRouteParams()
  } catch (error) {
    const er = useSanctumError(error)
    console.error(er)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getData()
})

const formatCell = (value: any, type: ColumnConfig['type']) => {
  if (type === 'money') {
    return formatMoney(Number(value || 0), '', 0)
  }

  if (type === 'number') {
    return Number(value || 0).toLocaleString('id-ID')
  }

  return value || '-'
}

const sheetName = (name: string, used: Record<string, number>) => {
  const clean = (name || 'Sheet').replace(/[\\/?*[\]:]/g, ' ').trim() || 'Sheet'
  const base = clean.substring(0, 31)

  if (!used[base]) {
    used[base] = 1
    return base
  }

  used[base] += 1
  const suffix = ` (${used[base]})`
  return `${base.substring(0, 31 - suffix.length)}${suffix}`
}

const rowsForExport = (columns: ColumnConfig[], rows: Record<string, any>[]) => {
  return [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => row[column.field] ?? 0)),
  ]
}

const exportExcel = () => {
  const wb = XLSX.utils.book_new()
  const usedNames = {} as Record<string, number>

  if (report.value.summary?.rows?.length) {
    const ws = XLSX.utils.aoa_to_sheet(
      rowsForExport(report.value.summary.columns, report.value.summary.rows)
    )
    XLSX.utils.book_append_sheet(wb, ws, sheetName('Kesimpulan', usedNames))
  }

  report.value.tables.forEach((table) => {
    const ws = XLSX.utils.aoa_to_sheet(rowsForExport(table.columns, table.rows))
    XLSX.utils.book_append_sheet(wb, ws, sheetName(table.name, usedNames))
  })

  XLSX.writeFile(
    wb,
    `Rincian_Transaksi_Tanggal_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`
  )
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-end">
      <div>
        <label class="mb-1 block text-xs">Dari :</label>
        <DatePicker v-model="filter.dari" view="month" dateFormat="mm/yy" size="small" />
      </div>
      <div>
        <label class="mb-1 block text-xs">Sampai :</label>
        <DatePicker v-model="filter.sampai" view="month" dateFormat="mm/yy" size="small" />
      </div>
      <div>
        <label class="mb-1 block text-xs">Tanggal Dari :</label>
        <InputNumber
          v-model="filter.tgl_dari"
          inputId="tgl_dari"
          :min="1"
          :max="31"
          showButtons
          size="small"
          class="w-32"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs">Tanggal Sampai :</label>
        <InputNumber
          v-model="filter.tgl_sampai"
          inputId="tgl_sampai"
          :min="1"
          :max="31"
          showButtons
          size="small"
          class="w-32"
        />
      </div>
      <Button @click="getData">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
        <Icon v-else name="lucide:search" />
      </Button>
      <Button severity="success" size="small" :disabled="loading" @click="exportExcel">
        <Icon name="lucide:download" />
        <span>Excel</span>
      </Button>
    </div>

    <Card>
      <template #header>
        <div class="px-5 pt-4 font-bold">
          Kesimpulan
        </div>
      </template>
      <template #content>
        <DataTable
          :value="report.summary.rows"
          :loading="loading"
          size="small"
          class="text-xs"
          stripedRows
          scrollable
        >
          <Column
            v-for="column in report.summary.columns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
          >
            <template #body="slotProps">
              <div v-if="column.field === 'omzet'">
                <div>{{ formatCell(slotProps.data[column.field], column.type) }}</div>
                <div v-if="slotProps.data.prediksi" class="text-red-600">
                  {{ formatMoney(slotProps.data.prediksi, '', 0) }}
                </div>
              </div>
              <span v-else>{{ formatCell(slotProps.data[column.field], column.type) }}</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card
        v-for="table in report.tables"
        :key="table.name"
        :class="table.wide ? 'lg:col-span-2' : ''"
      >
        <template #header>
          <div class="px-5 pt-4 font-bold">
            {{ table.name }}
          </div>
        </template>
        <template #content>
          <DataTable
            :value="table.rows"
            :loading="loading"
            size="small"
            class="text-xs"
            stripedRows
            scrollable
          >
            <Column
              v-for="column in table.columns"
              :key="`${table.name}-${column.field}`"
              :field="column.field"
              :header="column.header"
            >
              <template #body="slotProps">
                {{ formatCell(slotProps.data[column.field], column.type) }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <DashLoader :loading="loading" />
  </div>
</template>
