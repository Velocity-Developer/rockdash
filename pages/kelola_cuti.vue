<script setup lang="ts">
definePageMeta({
  title: 'Kelola Data Cuti',
  description: 'Catatan cuti karyawan',
  development: true
})

import { useDayjs } from '#dayjs'

const dayjs = useDayjs()
const client = useSanctumClient()

const loading = ref(false)
const tahun = ref(Number(dayjs().format('YYYY')))
const items = ref<any[]>([])
const expandedRows = ref<any[]>([])

const stats = computed(() => {
  const totalKaryawan = items.value.length
  const totalCatatan = items.value.reduce((sum, item) => sum + (item.total || 0), 0)
  const totalCuti = items.value.reduce((sum, item) => sum + Number(item.detail?.Cuti || 0), 0)
  const totalSakit = items.value.reduce((sum, item) => sum + Number(item.detail?.Sakit || 0), 0)

  return [
    {
      label: 'Karyawan Tercatat',
      value: totalKaryawan,
      tone: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-700 dark:text-amber-100 dark:ring-amber-600',
      icon: 'lucide:users',
    },
    {
      label: 'Total Catatan',
      value: totalCatatan,
      tone: 'bg-cyan-100 text-cyan-700 ring-cyan-200 dark:bg-cyan-700 dark:text-cyan-100 dark:ring-cyan-600',
      icon: 'lucide:notebook-pen',
    },
    {
      label: 'Akumulasi Cuti',
      value: `${totalCuti.toFixed(2)} hari`,
      tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-700 dark:text-emerald-100 dark:ring-emerald-600',
      icon: 'lucide:briefcase-business',
    },
    {
      label: 'Akumulasi Sakit',
      value: `${totalSakit.toFixed(2)} hari`,
      tone: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-700 dark:text-rose-100 dark:ring-rose-600',
      icon: 'lucide:heart-pulse',
    },
  ]
})

async function loadData() {
  loading.value = true
  try {
    const res = await client('/api/cuti', {
      params: {
        tahun: tahun.value,
      },
    }) as any

    items.value = Array.isArray(res?.data?.data)
      ? res.data.data
      : (Array.isArray(res?.data) ? res.data : [])
  } finally {
    loading.value = false
  }
}

function detailSummary(detail: Record<string, string>) {
  return [
    {
      label: 'Cuti',
      value: detail?.Cuti || '0.00',
      severity: 'success',
    },
    {
      label: 'Sakit',
      value: detail?.Sakit || '0.00',
      severity: 'danger',
    },
    {
      label: 'Belum diganti',
      value: detail?.['Blm diganti'] || '00 Hari 00 Jam 00 Menit',
      severity: 'warn',
    },
  ]
}

function jenisSeverity(jenis?: string) {
  if (jenis === 'Full') return 'info'
  if (jenis === 'Jam') return 'contrast'
  return 'secondary'
}

function tipeSeverity(tipe?: string) {
  if (tipe === 'Belum diganti') return 'warn'
  if (tipe === 'Sudah diganti') return 'success'
  if (tipe === 'Sakit') return 'danger'
  return 'secondary'
}

function itemTone(item: any) {
  if (item.tipe === 'Belum diganti' && item.detail !== 'Sakit') return 'border-l-4 border-amber-400 bg-amber-50/60 dark:bg-amber-900'
  if (item.detail === 'Sakit' || item.tipe === 'Sakit') return 'border-l-4 border-rose-400 bg-rose-50/60 dark:bg-rose-900'
  if (item.detail === 'Cuti') return 'border-l-4 border-emerald-400 bg-emerald-50/60 dark:bg-emerald-900'
  return 'border-l-4 border-slate-300 bg-white dark:bg-slate-900'
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-5 pt-20">

    <div class="flex gap-2 items-center justify-end">
      <InputNumber
        v-model="tahun"
        size="small"
        class="w-24"
        :useGrouping="false" fluid
      />
      <Button
        size="small"
        class="rounded-2xl"
        @click="loadData()"
        :loading="loading"
      >
        <Icon
          name="lucide:refresh-cw"
          :class="loading ? 'animate-spin' : ''"
        />
        Refresh
      </Button>
    </div>

    <div v-if="isPermissions('edit-cuti')" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl p-4 shadow-sm ring-1"
        :class="stat.tone"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-xs font-medium uppercase tracking-wide opacity-80">
              {{ stat.label }}
            </div>
            <div class="mt-2 text-2xl font-semibold">
              {{ stat.value }}
            </div>
          </div>
          <div class="rounded-xl bg-white dark:bg-slate-800 p-2">
            <Icon :name="stat.icon" class="text-lg" />
          </div>
        </div>
      </div>
    </div>

    <Card class="overflow-hidden shadow-sm">
      <template #content>
        <DataTable
          :value="items"
          v-model:expandedRows="expandedRows"
          dataKey="nama"
          size="small"
          stripedRows
          :loading="loading"
          scrollable
          responsiveLayout="scroll"
          scrollHeight="75vh"
          class="text-sm"
        >
          <template #empty>
            <div class="py-10 text-center text-sm">
              Belum ada data cuti untuk tahun {{ tahun }}.
            </div>
          </template>

          <Column expander headerStyle="width:3rem" />
          <Column header="#" headerStyle="width:3.5rem">
            <template #body="slotProps">
              <div class="font-medium">
                {{ slotProps.index + 1 }}
              </div>
            </template>
          </Column>
          <Column field="nama" header="Karyawan" sortable>
            <template #body="slotProps">
              <div class="space-y-1 py-1">
                <div class="font-semibold">
                  {{ slotProps.data.nama }}
                </div>
                <div class="text-xs">
                  {{ slotProps.data.total }} catatan
                </div>
              </div>
            </template>
          </Column>
          <Column header="Cuti">
            <template #body="slotProps" class="text-emerald-500 font-medium">
                {{ slotProps.data.cuti }}
            </template>
          </Column>
          <Column header="Sakit" class="text-rose-500 font-medium">
            <template #body="slotProps">
                {{ slotProps.data.sakit }}
            </template>
          </Column>
          <Column header="Blm Diganti" class="text-blue-500 font-medium">
            <template #body="slotProps">
                {{ slotProps.data.blmdiganti || '-' }}
            </template>
          </Column>

          <Column header="Terakhir Diinput" style="min-width: 10rem">
            <template #body="slotProps">
              <div class="py-1 text-sm">
                {{ slotProps.data.items?.length ? dayjs(slotProps.data.items[slotProps.data.items.length - 1].tanggal).format('DD MMM YYYY') : '-' }}
              </div>
            </template>
          </Column>

          <template #expansion="slotProps">
            <div class="space-y-4 bg-gray-100 dark:bg-gray-800 p-4 md:p-8 md:rounded-xl">
              <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div class="text-sm font-semibold">
                    Detail catatan {{ slotProps.data.nama }}
                  </div>
                  <div class="text-xs">
                    Total {{ slotProps.data.items.length }} entri pada tahun {{ tahun }}
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Tag
                    v-for="info in detailSummary(slotProps.data.detail)"
                    :key="`${slotProps.data.nama}-${info.label}`"
                    :severity="info.severity"
                    rounded
                    class="!text-xs"
                  >
                    {{ info.label }}: {{ info.value }}
                  </Tag>
                </div>
              </div>

              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="(item, index) in slotProps.data.items"
                  :key="`${slotProps.data.nama}-${index}-${item.tanggal}`"
                  class="rounded-2xl p-4 shadow-sm ring-1 ring-slate-200"
                  :class="itemTone(item)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-sm font-semibold">
                        {{ dayjs(item.tanggal).format('DD MMMM YYYY') }}
                      </div>
                      <div class="mt-1 text-xs">
                        {{ item.detail || '-' }}
                      </div>
                    </div>
                    <Tag :severity="jenisSeverity(item.jenis)" rounded class="!text-xs">
                      {{ item.jenis || '-' }}
                    </Tag>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <Tag
                      v-if="item.tipe"
                      :severity="tipeSeverity(item.tipe)"
                      class="!text-xs"
                    >
                      {{ item.tipe }}
                    </Tag>
                    <Tag
                      v-if="item.time && item.time !== '00:00'"
                      severity="contrast"
                      class="!text-xs"
                    >
                      {{ item.time }}
                    </Tag>
                    <Tag
                      v-if="!item.tipe && (!item.time || item.time === '00:00')"
                      severity="secondary"
                      class="!text-xs"
                    >
                      Tanpa tambahan
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
