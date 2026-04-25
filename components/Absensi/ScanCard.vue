<script setup lang="ts">
import { useDayjs } from '#dayjs'

type AuthUser = {
  id: number
  name?: string
  avatar_url?: string
}

type ShiftItem = {
  id: number
  nama: string
  masuk?: string | null
  pulang?: string | null
  aktif: boolean
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
}

const emit = defineEmits(['submitted'])

const dayjs = useDayjs()
const client = useSanctumClient()
const toast = useToast()
const currentUser = useSanctumUser<AuthUser>()

const loading = ref(false)
const loadingSubmit = ref(false)
const todayAbsensi = ref<AbsensiItem | null>(null)
const shiftOptions = ref<ShiftItem[]>([])
const selectedShiftId = ref<number | null>(null)

const todayLabel = computed(() => dayjs().format('DD MMMM YYYY'))

const selectedShift = computed(() => {
  return shiftOptions.value.find(shift => shift.id === selectedShiftId.value) || null
})

const scanState = computed<'masuk' | 'pulang' | 'done'>(() => {
  if (!todayAbsensi.value) return 'masuk'
  if (todayAbsensi.value.jam_masuk && !todayAbsensi.value.jam_pulang) return 'pulang'
  return 'done'
})

const buttonLabel = computed(() => {
  if (scanState.value === 'masuk') return 'Masuk'
  if (scanState.value === 'pulang') return 'Pulang'
  return 'Absensi Hari Ini Selesai'
})

const buttonSeverity = computed(() => {
  if (scanState.value === 'masuk') return 'primary'
  if (scanState.value === 'pulang') return 'warn'
  return 'success'
})

const buttonDisabled = computed(() => {
  return loading.value || loadingSubmit.value || !currentUser.value?.id || scanState.value === 'done'
})

const shiftSelectDisabled = computed(() => {
  return loading.value || loadingSubmit.value || scanState.value !== 'masuk'
})

function shiftOptionLabel(shift: ShiftItem) {
  return `${shift.nama} (${formatTime(shift.masuk)} - ${formatTime(shift.pulang)})`
}

function formatTime(value?: string | null) {
  if (!value) return '-'
  if (value.length >= 8 && !value.includes('T')) return value.slice(0, 5)
  return dayjs(value).format('HH:mm')
}

async function loadTodayAbsensi() {
  if (!currentUser.value?.id) return

  loading.value = true

  try {
    const [absensiRes, shiftRes] = await Promise.all([
      client('/api/absensi', {
        params: {
          pagination: false,
          per_page: 1,
          user_id: currentUser.value.id,
          tanggal: dayjs().format('YYYY-MM-DD'),
        },
      }) as Promise<any>,
      client('/api/absensi-shift', {
        params: {
          pagination: false,
          per_page: 50,
          aktif: true,
          order_by: 'nama',
          order: 'asc',
        },
      }) as Promise<any>,
    ])

    todayAbsensi.value = Array.isArray(absensiRes?.data) && absensiRes.data.length > 0
      ? absensiRes.data[0]
      : null

    shiftOptions.value = Array.isArray(shiftRes?.data) ? shiftRes.data : []

    const savedShiftId = todayAbsensi.value?.absensi_shift_id ?? null
    const currentShiftStillExists = selectedShiftId.value
      ? shiftOptions.value.some(shift => shift.id === selectedShiftId.value)
      : false

    if (savedShiftId) {
      selectedShiftId.value = savedShiftId
    } else if (!currentShiftStillExists) {
      selectedShiftId.value = shiftOptions.value[0]?.id ?? null
    }
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat mengambil data absensi hari ini',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

async function submitAbsensi() {
  if (!currentUser.value?.id) return

  loadingSubmit.value = true

  try {
    const now = dayjs()
    const tanggal = now.format('YYYY-MM-DD')
    const jamNow = now.format('YYYY-MM-DD HH:mm:ss')

    if (scanState.value === 'masuk') {
      const payload = {
        user_id: currentUser.value.id,
        tanggal,
        absensi_shift_id: selectedShift.value?.id ?? null,
        status: 'Hadir',
        catatan: null,
        jam_masuk: jamNow,
        jam_pulang: null,
        detik_telat: 0,
        detik_pulang_cepat: 0,
        detik_kurang: 0,
        detik_lebih: 0,
        total_detik_kerja: 0,
        nama_shift: selectedShift.value?.nama ?? null,
        jadwal_masuk: selectedShift.value?.masuk?.slice(0, 8) ?? null,
        jadwal_pulang: selectedShift.value?.pulang?.slice(0, 8) ?? null,
      }

      await client('/api/absensi', {
        method: 'POST',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Absensi masuk berhasil disimpan',
        life: 3000,
      })
    } else if (scanState.value === 'pulang' && todayAbsensi.value) {
      const jamMasuk = todayAbsensi.value.jam_masuk ? dayjs(todayAbsensi.value.jam_masuk) : now
      const totalDetikKerja = Math.max(now.diff(jamMasuk, 'second'), 0)

      const payload = {
        user_id: todayAbsensi.value.user_id,
        tanggal: todayAbsensi.value.tanggal,
        absensi_shift_id: todayAbsensi.value.absensi_shift_id ?? selectedShift.value?.id ?? null,
        status: todayAbsensi.value.status || 'Hadir',
        catatan: todayAbsensi.value.catatan ?? null,
        jam_masuk: todayAbsensi.value.jam_masuk,
        jam_pulang: jamNow,
        detik_telat: todayAbsensi.value.detik_telat ?? 0,
        detik_pulang_cepat: todayAbsensi.value.detik_pulang_cepat ?? 0,
        detik_kurang: todayAbsensi.value.detik_kurang ?? 0,
        detik_lebih: todayAbsensi.value.detik_lebih ?? 0,
        total_detik_kerja: totalDetikKerja,
        nama_shift: todayAbsensi.value.nama_shift ?? selectedShift.value?.nama ?? null,
        jadwal_masuk: todayAbsensi.value.jadwal_masuk ?? selectedShift.value?.masuk?.slice(0, 8) ?? null,
        jadwal_pulang: todayAbsensi.value.jadwal_pulang ?? selectedShift.value?.pulang?.slice(0, 8) ?? null,
      }

      await client(`/api/absensi/${todayAbsensi.value.id}`, {
        method: 'PUT',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Absensi pulang berhasil disimpan',
        life: 3000,
      })
    }

    await loadTodayAbsensi()
    emit('submitted')
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat menyimpan absensi',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}

watch(
  () => currentUser.value?.id,
  (userId) => {
    if (userId) {
      loadTodayAbsensi()
    }
  },
  { immediate: true },
)

const time = ref('')
let interval = null as any
const updateClock = () => {
  const now = new Date()
  
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')

  time.value = `${h}:${m}:${s}`
}
onMounted(() => {
  updateClock()
  interval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <Card class="shadow-sm">
    <template #content>
      <div class="space-y-8">

        <div class="flex items-center justify-center gap-1">
          <Avatar :image="currentUser?.avatar_url" shape="circle" />
          <div class="text-md font-semibold">
              {{ currentUser?.name || 'User Login' }}
          </div>
        </div>

        
        <div class="flex flex-col items-center justify-center gap-1">
            <h1 class="font-bold text-xl md:text-3xl">{{ time }}</h1> 
            <div class="text-sm text-slate-500">
              {{ todayLabel }}
            </div>
        </div>

        <div class="flex flex-col items-center justify-center gap-1">
          <Select
            v-model="selectedShiftId"
            class="w-full rounded-full"
            :options="shiftOptions"
            optionLabel="nama"
            optionValue="id"
            placeholder="Pilih shift"
            :loading="loading"
            :disabled="shiftSelectDisabled"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex flex-col px-3">
                <span>{{ selectedShift?.nama || todayAbsensi?.nama_shift || 'Shift dipilih' }}</span>
                <span class="text-xs text-slate-500">
                  {{ formatTime(todayAbsensi?.jadwal_masuk || selectedShift?.masuk) }} - {{ formatTime(todayAbsensi?.jadwal_pulang || selectedShift?.pulang) }}
                </span>
              </div>
              <span v-else class="text-slate-500">Pilih shift</span>
            </template>
            <template #option="slotProps">
              <div class="flex flex-col">
                <span>{{ shiftOptionLabel(slotProps.option) }}</span>
              </div>
            </template>
          </Select>
          <Button
              :severity="buttonSeverity"
              :loading="loadingSubmit"
              :disabled="buttonDisabled"
              @click="submitAbsensi"
              rounded 
              class="rounded-full py-3 px-20 hover:shadow-md w-full"
            >
            <div class="flex flex-col items-center justify-center gap-1">
              <Icon
                v-if="loadingSubmit"
                name="lucide:loader-circle"
                class="animate-spin"
              />
              <Icon
                v-else-if="scanState === 'masuk'"
                name="lucide:square-arrow-down"
                size="2rem"
              />
              <Icon
                v-else-if="scanState === 'pulang'"
                name="lucide:square-arrow-up"
                size="2rem"
              />
              <Icon
                v-else
                name="lucide:badge-check"
              />
              <span class="text-sm">{{ buttonLabel }}</span>
            </div>
            </Button>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Shift Aktif</div>
            <div class="mt-1 font-medium">
              {{ todayAbsensi?.nama_shift || selectedShift?.nama || 'Belum ada shift' }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ formatTime(todayAbsensi?.jadwal_masuk || selectedShift?.masuk) }} - {{ formatTime(todayAbsensi?.jadwal_pulang || selectedShift?.pulang) }}
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Masuk</div>
            <div class="mt-1 font-medium">
              {{ formatTime(todayAbsensi?.jam_masuk) }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ todayAbsensi?.jam_masuk ? 'Sudah tercatat' : 'Belum absen masuk' }}
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Pulang</div>
            <div class="mt-1 font-medium">
              {{ formatTime(todayAbsensi?.jam_pulang) }}
            </div>
            <div class="mt-1 text-xs text-slate-500">
              {{ todayAbsensi?.jam_pulang ? 'Sudah tercatat' : 'Belum absen pulang' }}
            </div>
          </div>
        </div>

      </div>
    </template>
  </Card>
</template>

<style scoped></style>
