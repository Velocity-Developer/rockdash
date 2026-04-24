<script setup lang="ts">
import { useDayjs } from '#dayjs'
import SelectUser from '~/components/Form/SelectUser.vue'

definePageMeta({
  title: 'Riwayat Absensi',
  description: 'Riwayat absensi user',
})

type AuthUser = {
  id: number
  name?: string
  user_permissions?: string[]
}

type AbsensiItem = {
  id: number
  user_id: number
  tanggal: string
  status: string
  catatan?: string | null
  jam_masuk?: string | null
  jam_pulang?: string | null
  detik_telat?: number
  detik_pulang_cepat?: number
  detik_kurang?: number
  detik_lebih?: number
  total_detik_kerja?: number
  nama_shift?: string | null
  jadwal_masuk?: string | null
  jadwal_pulang?: string | null
  user?: {
    id: number
    name?: string
    username?: string
  } | null
  shift?: {
    id: number
    nama?: string
  } | null
}

const dayjs = useDayjs()
const client = useSanctumClient()
const toast = useToast()
const currentUser = useSanctumUser<AuthUser>()

const loading = ref(false)
const items = ref<AbsensiItem[]>([])

const canManageAbsensi = computed(() => isPermissions('manage-absensi'))

const filters = reactive({
  user_id: null as number | null,
  status: 'all',
  tanggal_mulai: dayjs().subtract(30, 'day').toDate(),
  tanggal_selesai: dayjs().toDate(),
})

const stats = computed(() => {
  const total = items.value.length
  const hadir = items.value.filter(item => item.status === 'Hadir').length
  const terlambat = items.value.filter(item => item.status === 'Terlambat').length
  const totalDetikKerja = items.value.reduce((sum, item) => sum + Number(item.total_detik_kerja || 0), 0)

  return [
    {
      label: 'Total Riwayat',
      value: total,
      tone: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900 dark:text-sky-100 dark:ring-sky-700',
      icon: 'lucide:calendar-range',
    },
    {
      label: 'Hadir',
      value: hadir,
      tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 dark:ring-emerald-700',
      icon: 'lucide:badge-check',
    },
    {
      label: 'Terlambat',
      value: terlambat,
      tone: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:ring-amber-700',
      icon: 'lucide:clock-alert',
    },
    {
      label: 'Total Jam Kerja',
      value: formatDuration(totalDetikKerja),
      tone: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900 dark:text-violet-100 dark:ring-violet-700',
      icon: 'lucide:timer',
    },
  ]
})

function formatDate(value?: string | null) {
  if (!value) return '-'
  return dayjs(value).format('DD MMM YYYY')
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  return dayjs(value).format('DD MMM YYYY HH:mm')
}

function formatTime(value?: string | null) {
  if (!value) return '-'
  if (value.length >= 8 && !value.includes('T')) return value.slice(0, 5)
  return dayjs(value).format('HH:mm')
}

function formatDuration(totalSeconds?: number | null) {
  const seconds = Number(totalSeconds || 0)
  if (!seconds) return '0j 0m'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  return `${hours}j ${minutes}m`
}

function statusSeverity(status?: string) {
  switch (status) {
    case 'Hadir':
      return 'success'
    case 'Terlambat':
      return 'warn'
    case 'Izin':
    case 'Cuti':
    case 'Libur':
      return 'info'
    case 'Sakit':
      return 'danger'
    case 'Setengah Hari':
      return 'contrast'
    case 'Alpha':
      return 'danger'
    default:
      return 'secondary'
  }
}

async function loadData() {
  if (!filters.user_id && !canManageAbsensi.value) {
    return
  }

  loading.value = true

  try {
    const params: Record<string, any> = {
      pagination: false,
      per_page: 200,
      order_by: 'tanggal',
      order: 'desc',
    }

    if (filters.user_id) {
      params.user_id = filters.user_id
    }

    if (filters.status !== 'all') {
      params.status = filters.status
    }

    if (filters.tanggal_mulai) {
      params.tanggal_mulai = dayjs(filters.tanggal_mulai).format('YYYY-MM-DD')
    }

    if (filters.tanggal_selesai) {
      params.tanggal_selesai = dayjs(filters.tanggal_selesai).format('YYYY-MM-DD')
    }

    const res = await client('/api/absensi', { params }) as any
    items.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat mengambil riwayat absensi',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

function resetToCurrentUser() {
  filters.user_id = currentUser.value?.id || null
}

watch(
  () => currentUser.value?.id,
  (userId) => {
    if (!userId) return

    if (!filters.user_id) {
      filters.user_id = userId
    }

    loadData()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-5">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          <div class="rounded-xl bg-white p-2 dark:bg-slate-800">
            <Icon :name="stat.icon" class="text-lg" />
          </div>
        </div>
      </div>
    </div>

    <Card>
      <template #content>
        <div class="grid gap-4 lg:grid-cols-5">
          <div v-if="canManageAbsensi" class="lg:col-span-2">
            <label class="mb-1 block text-sm font-medium">Filter User</label>
            <SelectUser v-model="filters.user_id" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">Status</label>
            <Select
              v-model="filters.status"
              class="w-full"
              :options="[
                { label: 'Semua', value: 'all' },
                { label: 'Hadir', value: 'Hadir' },
                { label: 'Terlambat', value: 'Terlambat' },
                { label: 'Izin', value: 'Izin' },
                { label: 'Sakit', value: 'Sakit' },
                { label: 'Cuti', value: 'Cuti' },
                { label: 'Alpha', value: 'Alpha' },
                { label: 'Libur', value: 'Libur' },
                { label: 'Setengah Hari', value: 'Setengah Hari' },
              ]"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">Tanggal Mulai</label>
            <DatePicker v-model="filters.tanggal_mulai" dateFormat="yy-mm-dd" class="w-full" showIcon />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">Tanggal Selesai</label>
            <DatePicker v-model="filters.tanggal_selesai" dateFormat="yy-mm-dd" class="w-full" showIcon />
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            v-if="canManageAbsensi"
            size="small"
            severity="secondary"
            outlined
            @click="resetToCurrentUser(); loadData()"
          >
            <Icon name="lucide:user-round" />
            User Saya
          </Button>

          <Button
            size="small"
            severity="secondary"
            :loading="loading"
            @click="loadData"
          >
            <Icon name="lucide:refresh-cw" :class="loading ? 'animate-spin' : ''" />
            Refresh
          </Button>
        </div>
      </template>
    </Card>

    <Card class="overflow-hidden shadow-sm">
      <template #content>
        <DataTable
          :value="items"
          size="small"
          stripedRows
          :loading="loading"
          scrollable
          responsiveLayout="scroll"
          scrollHeight="75vh"
          class="text-sm"
        >
          <template #empty>
            <div class="py-10 text-center text-sm text-slate-500">
              Belum ada data absensi untuk filter yang dipilih.
            </div>
          </template>

          <Column header="#" headerStyle="width: 4rem">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>

          <Column field="tanggal" header="Tanggal" sortable>
            <template #body="slotProps">
              <div class="space-y-1">
                <div class="font-medium">
                  {{ formatDate(slotProps.data.tanggal) }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ slotProps.data.user?.name || currentUser?.name || '-' }}
                </div>
              </div>
            </template>
          </Column>

          <Column field="status" header="Status">
            <template #body="slotProps">
              <Tag :severity="statusSeverity(slotProps.data.status)">
                {{ slotProps.data.status }}
              </Tag>
            </template>
          </Column>

          <Column header="Shift">
            <template #body="slotProps">
              <div class="space-y-1">
                <div class="font-medium">
                  {{ slotProps.data.nama_shift || slotProps.data.shift?.nama || '-' }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ formatTime(slotProps.data.jadwal_masuk) }} - {{ formatTime(slotProps.data.jadwal_pulang) }}
                </div>
              </div>
            </template>
          </Column>

          <Column header="Absen Masuk">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.jam_masuk) }}
            </template>
          </Column>

          <Column header="Absen Pulang">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.jam_pulang) }}
            </template>
          </Column>

          <Column header="Kerja">
            <template #body="slotProps">
              {{ formatDuration(slotProps.data.total_detik_kerja) }}
            </template>
          </Column>

          <Column header="Telat">
            <template #body="slotProps">
              {{ formatDuration(slotProps.data.detik_telat) }}
            </template>
          </Column>

          <Column header="Lebih">
            <template #body="slotProps">
              {{ formatDuration(slotProps.data.detik_lebih) }}
            </template>
          </Column>

          <Column header="Catatan" style="min-width: 16rem">
            <template #body="slotProps">
              <span class="text-sm text-slate-600 dark:text-slate-300">
                {{ slotProps.data.catatan || '-' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
