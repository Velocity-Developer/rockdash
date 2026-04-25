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
  absensi_shift_id?: number | null
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

type ShiftItem = {
  id: number
  nama: string
  masuk?: string | null
  pulang?: string | null
  aktif: boolean
}

const dayjs = useDayjs()
const client = useSanctumClient()
const toast = useToast()
const confirm = useConfirm()
const currentUser = useSanctumUser<AuthUser>()

const loading = ref(false)
const loadingSubmit = ref(false)
const items = ref<AbsensiItem[]>([])
const shiftOptions = ref<ShiftItem[]>([])
const errors = ref({} as Record<string, string[] | string>)

const canManageAbsensi = computed(() => isPermissions('manage-absensi'))

const statusOptions = [
  { label: 'Hadir', value: 'Hadir' },
  { label: 'Terlambat', value: 'Terlambat' },
  { label: 'Izin', value: 'Izin' },
  { label: 'Sakit', value: 'Sakit' },
  { label: 'Cuti', value: 'Cuti' },
  { label: 'Alpha', value: 'Alpha' },
  { label: 'Libur', value: 'Libur' },
  { label: 'Setengah Hari', value: 'Setengah Hari' },
]

const visibleDialog = ref(false)

const form = reactive({
  id: null as number | null,
  user_id: null as number | null,
  tanggal: null as Date | null,
  absensi_shift_id: null as number | null,
  status: 'Hadir',
  jam_masuk: '',
  jam_pulang: '',
  catatan: '',
  detik_telat: 0,
  detik_pulang_cepat: 0,
  detik_kurang: 0,
  detik_lebih: 0,
  total_detik_kerja: 0,
  nama_shift: null as string | null,
  jadwal_masuk: null as string | null,
  jadwal_pulang: null as string | null,
})

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

function normalizeTime(value?: string | null) {
  if (!value) return null
  return value.length >= 8 && !value.includes('T') ? value.slice(0, 8) : dayjs(value).format('HH:mm:ss')
}

function dateTimeForInput(value?: string | null) {
  if (!value) return ''
  return dayjs(value).format('YYYY-MM-DDTHH:mm')
}

function dateTimeForApi(value?: string | null) {
  if (!value) return null
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
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

async function loadShiftOptions() {
  try {
    const res = await client('/api/absensi-shift', {
      params: {
        pagination: false,
        per_page: 200,
        order_by: 'nama',
        order: 'asc',
      },
    }) as any

    shiftOptions.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat mengambil data shift',
      life: 3000,
    })
  }
}

function openEditDialog(row: AbsensiItem) {
  errors.value = {}
  form.id = row.id
  form.user_id = row.user_id
  form.tanggal = row.tanggal ? dayjs(row.tanggal).toDate() : null
  form.absensi_shift_id = row.absensi_shift_id ?? row.shift?.id ?? null
  form.status = row.status || 'Hadir'
  form.jam_masuk = dateTimeForInput(row.jam_masuk)
  form.jam_pulang = dateTimeForInput(row.jam_pulang)
  form.catatan = row.catatan || ''
  form.detik_telat = Number(row.detik_telat || 0)
  form.detik_pulang_cepat = Number(row.detik_pulang_cepat || 0)
  form.detik_kurang = Number(row.detik_kurang || 0)
  form.detik_lebih = Number(row.detik_lebih || 0)
  form.total_detik_kerja = Number(row.total_detik_kerja || 0)
  form.nama_shift = row.nama_shift || row.shift?.nama || null
  form.jadwal_masuk = normalizeTime(row.jadwal_masuk)
  form.jadwal_pulang = normalizeTime(row.jadwal_pulang)
  visibleDialog.value = true
}

async function handleSubmit() {
  if (!form.id) return

  loadingSubmit.value = true
  errors.value = {}

  const selectedShift = shiftOptions.value.find(shift => shift.id === form.absensi_shift_id) || null
  const jamMasuk = dateTimeForApi(form.jam_masuk)
  const jamPulang = dateTimeForApi(form.jam_pulang)

  const totalDetikKerja = jamMasuk && jamPulang
    ? Math.max(dayjs(jamPulang).diff(dayjs(jamMasuk), 'second'), 0)
    : form.total_detik_kerja

  const payload = {
    user_id: form.user_id,
    tanggal: form.tanggal ? dayjs(form.tanggal).format('YYYY-MM-DD') : null,
    absensi_shift_id: form.absensi_shift_id,
    status: form.status,
    catatan: form.catatan || null,
    jam_masuk: jamMasuk,
    jam_pulang: jamPulang,
    detik_telat: form.detik_telat,
    detik_pulang_cepat: form.detik_pulang_cepat,
    detik_kurang: form.detik_kurang,
    detik_lebih: form.detik_lebih,
    total_detik_kerja: totalDetikKerja,
    nama_shift: selectedShift?.nama ?? form.nama_shift,
    jadwal_masuk: normalizeTime(selectedShift?.masuk) ?? form.jadwal_masuk,
    jadwal_pulang: normalizeTime(selectedShift?.pulang) ?? form.jadwal_pulang,
  }

  try {
    await client(`/api/absensi/${form.id}`, {
      method: 'PUT',
      body: payload,
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data absensi berhasil diperbarui',
      life: 3000,
    })

    visibleDialog.value = false
    await loadData()
  } catch (error) {
    const er = useSanctumError(error)
    errors.value = er.bag || {}
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat menyimpan data absensi',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}

function confirmDelete(row: AbsensiItem) {
  confirm.require({
    message: `Hapus data absensi ${row.user?.name || currentUser.value?.name || 'user'} tanggal ${formatDate(row.tanggal)}?`,
    header: 'Hapus Absensi',
    accept: async () => {
      try {
        await client(`/api/absensi/${row.id}`, {
          method: 'DELETE',
        })

        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Data absensi berhasil dihapus',
          life: 3000,
        })

        await loadData()
      } catch (error) {
        const er = useSanctumError(error)
        toast.add({
          severity: 'error',
          summary: 'Gagal',
          detail: er.msg || 'Terjadi kesalahan saat menghapus data absensi',
          life: 3000,
        })
      }
    },
    rejectProps: {
      label: 'Batal',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Hapus',
      severity: 'danger',
    },
  })
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

onMounted(() => {
  loadShiftOptions()
})
</script>

<template>


  <div class="grid grid-cols-4 gap-4">
    
    <div class="col-span-4 md:col-span-1">
      <AbsensiScanCard />
    </div>

    <div class="col-span-4 md:col-span-3 space-y-5">
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
              @click="loadData(); loadShiftOptions()"
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

            <Column v-if="canManageAbsensi" header="" headerStyle="width: 8rem">
              <template #body="slotProps">
                <div class="flex justify-end gap-2">
                  <Button size="small" severity="info" @click="openEditDialog(slotProps.data)" v-tooltip="'Edit'">
                    <Icon name="lucide:pencil" />
                  </Button>
                  <Button size="small" severity="danger" @click="confirmDelete(slotProps.data)" v-tooltip="'Hapus'">
                    <Icon name="lucide:trash-2" />
                  </Button>
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  
  </div>

  <Dialog
    v-model:visible="visibleDialog"
    modal
    header="Edit Absensi"
    :style="{ width: '42rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium">User</label>
        <SelectUser v-model="form.user_id" />
        <Message v-if="errors.user_id" severity="error" size="small" class="mt-1">
          {{ Array.isArray(errors.user_id) ? errors.user_id[0] : errors.user_id }}
        </Message>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium">Tanggal</label>
          <DatePicker v-model="form.tanggal" dateFormat="yy-mm-dd" class="w-full" showIcon />
          <Message v-if="errors.tanggal" severity="error" size="small" class="mt-1">
            {{ Array.isArray(errors.tanggal) ? errors.tanggal[0] : errors.tanggal }}
          </Message>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Status</label>
          <Select
            v-model="form.status"
            class="w-full"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
          />
          <Message v-if="errors.status" severity="error" size="small" class="mt-1">
            {{ Array.isArray(errors.status) ? errors.status[0] : errors.status }}
          </Message>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium">Shift</label>
        <Select
          v-model="form.absensi_shift_id"
          class="w-full"
          :options="shiftOptions"
          optionLabel="nama"
          optionValue="id"
          placeholder="Pilih shift"
          showClear
        >
          <template #option="slotProps">
            <div class="flex flex-col">
              <span>{{ slotProps.option.nama }}</span>
              <span class="text-xs text-slate-500">
                {{ formatTime(slotProps.option.masuk) }} - {{ formatTime(slotProps.option.pulang) }}
              </span>
            </div>
          </template>
        </Select>
        <Message v-if="errors.absensi_shift_id" severity="error" size="small" class="mt-1">
          {{ Array.isArray(errors.absensi_shift_id) ? errors.absensi_shift_id[0] : errors.absensi_shift_id }}
        </Message>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium" for="jam_masuk">Jam Masuk</label>
          <InputText id="jam_masuk" v-model="form.jam_masuk" type="datetime-local" class="w-full" />
          <Message v-if="errors.jam_masuk" severity="error" size="small" class="mt-1">
            {{ Array.isArray(errors.jam_masuk) ? errors.jam_masuk[0] : errors.jam_masuk }}
          </Message>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="jam_pulang">Jam Pulang</label>
          <InputText id="jam_pulang" v-model="form.jam_pulang" type="datetime-local" class="w-full" />
          <Message v-if="errors.jam_pulang" severity="error" size="small" class="mt-1">
            {{ Array.isArray(errors.jam_pulang) ? errors.jam_pulang[0] : errors.jam_pulang }}
          </Message>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium" for="catatan">Catatan</label>
        <Textarea id="catatan" v-model="form.catatan" class="w-full" rows="3" autoResize />
        <Message v-if="errors.catatan" severity="error" size="small" class="mt-1">
          {{ Array.isArray(errors.catatan) ? errors.catatan[0] : errors.catatan }}
        </Message>
      </div>

      <div class="flex justify-end gap-2">
        <Button type="button" severity="secondary" :disabled="loadingSubmit" @click="visibleDialog = false">
          Batal
        </Button>
        <Button type="submit" :loading="loadingSubmit">
          <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin" />
          <Icon v-else name="lucide:save" />
          Update
        </Button>
      </div>
    </form>
  </Dialog>
</template>

<style scoped></style>
