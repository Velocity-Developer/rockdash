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
const showCheckoutDialog = ref(false)

const checkoutTodos = [
  'Matikan AC',
  'Copot Jek Tembok',
  'Copot Jek Laptop',
]

const checkoutChecklist = reactive<Record<string, boolean>>(
  checkoutTodos.reduce((items, todo) => {
    items[todo] = false
    return items
  }, {} as Record<string, boolean>),
)

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

const checkoutComplete = computed(() => {
  return checkoutTodos.every(todo => checkoutChecklist[todo])
})

function shiftOptionLabel(shift: ShiftItem) {
  return `${shift.nama} (${formatTime(shift.masuk)} - ${formatTime(shift.pulang)})`
}

function formatTime(value?: string | null) {
  if (!value) return '-'
  if (value.length >= 8 && !value.includes('T')) return value.slice(0, 5)
  return dayjs(value).format('HH:mm')
}

function formatDateToTime(value?: string | null) {
  if (!value) return '-'
  return dayjs(value).format('HH:mm')
}

function normalizeTime(value?: string | null) {
  if (!value) return null
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value
  return dayjs(value).format('HH:mm:ss')
}

function scheduleDateTime(tanggal: string, time?: string | null) {
  if (!time) return null
  const normalizedTime = normalizeTime(time)
  if (!normalizedTime) return null
  const parsed = dayjs(`${tanggal} ${normalizedTime}`)
  return parsed.isValid() ? parsed : null
}

function calculateWorkMetrics(params: {
  tanggal: string
  jamMasuk?: string | null
  jamPulang?: string | null
  jadwalMasuk?: string | null
  jadwalPulang?: string | null
}) {
  const actualMasuk = params.jamMasuk ? dayjs(params.jamMasuk) : null
  const actualPulang = params.jamPulang ? dayjs(params.jamPulang) : null
  const scheduledMasuk = scheduleDateTime(params.tanggal, params.jadwalMasuk)
  let scheduledPulang = scheduleDateTime(params.tanggal, params.jadwalPulang)

  if (scheduledMasuk && scheduledPulang && !scheduledPulang.isAfter(scheduledMasuk)) {
    scheduledPulang = scheduledPulang.add(1, 'day')
  }

  const detikTelat = actualMasuk && scheduledMasuk && actualMasuk.isAfter(scheduledMasuk)
    ? actualMasuk.diff(scheduledMasuk, 'second')
    : 0
  const detikPulangCepat = actualPulang && scheduledPulang && actualPulang.isBefore(scheduledPulang)
    ? scheduledPulang.diff(actualPulang, 'second')
    : 0
  const detikLebih = actualPulang && scheduledPulang && actualPulang.isAfter(scheduledPulang)
    ? actualPulang.diff(scheduledPulang, 'second')
    : 0
  const totalDetikKerja = actualMasuk && actualPulang
    ? Math.max(actualPulang.diff(actualMasuk, 'second'), 0)
    : 0

  return {
    detik_telat: detikTelat,
    detik_pulang_cepat: detikPulangCepat,
    detik_kurang: detikTelat + detikPulangCepat,
    detik_lebih: detikLebih,
    total_detik_kerja: totalDetikKerja,
  }
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
      const jadwalMasuk = todayAbsensi.value.jadwal_masuk ?? selectedShift.value?.masuk?.slice(0, 8) ?? null
      const jadwalPulang = todayAbsensi.value.jadwal_pulang ?? selectedShift.value?.pulang?.slice(0, 8) ?? null
      const metrics = calculateWorkMetrics({
        tanggal: todayAbsensi.value.tanggal,
        jamMasuk: todayAbsensi.value.jam_masuk,
        jamPulang: jamNow,
        jadwalMasuk,
        jadwalPulang,
      })

      const payload = {
        user_id: todayAbsensi.value.user_id,
        tanggal: todayAbsensi.value.tanggal,
        absensi_shift_id: todayAbsensi.value.absensi_shift_id ?? selectedShift.value?.id ?? null,
        status: todayAbsensi.value.status || 'Hadir',
        catatan: todayAbsensi.value.catatan ?? null,
        jam_masuk: todayAbsensi.value.jam_masuk,
        jam_pulang: jamNow,
        detik_telat: metrics.detik_telat,
        detik_pulang_cepat: metrics.detik_pulang_cepat,
        detik_kurang: metrics.detik_kurang,
        detik_lebih: metrics.detik_lebih,
        total_detik_kerja: metrics.total_detik_kerja,
        nama_shift: todayAbsensi.value.nama_shift ?? selectedShift.value?.nama ?? null,
        jadwal_masuk: jadwalMasuk,
        jadwal_pulang: jadwalPulang,
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
    resetCheckoutChecklist()
    showCheckoutDialog.value = false
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

function resetCheckoutChecklist() {
  checkoutTodos.forEach((todo) => {
    checkoutChecklist[todo] = false
  })
}

function handleScanClick() {
  if (scanState.value === 'pulang') {
    resetCheckoutChecklist()
    showCheckoutDialog.value = true
    return
  }

  submitAbsensi()
}

async function submitCheckoutAbsensi() {
  if (!checkoutComplete.value) {
    toast.add({
      severity: 'warn',
      summary: 'Checklist belum lengkap',
      detail: 'Lengkapi checklist sebelum absen pulang',
      life: 3000,
    })
    return
  }

  await submitAbsensi()
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

        <div class="flex items-center justify-center gap-2" v-tooltip="currentUser?.name || 'User Login'">
          <Avatar :image="currentUser?.avatar_url" shape="circle" class="w-5 h-5"/>
          <div class="text-sm font-normal truncate max-w-[120px]">
              {{ currentUser?.name || 'User Login' }}
          </div>
        </div>

        
        <div class="flex flex-col items-center justify-center gap-1">
            <h1 class="font-bold text-3xl md:text-5xl font-mono">{{ time }}</h1> 
            <div class="text-sm opacity-75 font-mono">
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
              @click="handleScanClick"
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
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-700 hover:shadow">
            <div class="text-xs text-slate-500">Shift Aktif</div>
            <div class="mt-1 font-medium">
              {{ todayAbsensi?.nama_shift || selectedShift?.nama || 'Belum ada shift' }}
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-700 hover:shadow">
            <div class="text-xs text-slate-500">Masuk</div>
            <div class="mt-1 font-medium">
              {{ formatDateToTime(todayAbsensi?.jam_masuk) }}
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-700 hover:shadow">
            <div class="text-xs text-slate-500">Pulang</div>
            <div class="mt-1 font-medium">
              {{ formatDateToTime(todayAbsensi?.jam_pulang) }}
            </div>
          </div>
        </div>

      </div>
    </template>
  </Card>

  <Dialog
    v-model:visible="showCheckoutDialog"
    modal
    header="Checklist Sebelum Pulang"
    :style="{ width: '28rem' }"
    :breakpoints="{ '575px': '92vw' }"
  >
    <div class="space-y-3">
      <div
        v-for="(todo, index) in checkoutTodos"
        :key="todo"
        class="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
      >
        <Checkbox
          v-model="checkoutChecklist[todo]"
          :inputId="`checkout-${index}`"
          binary
        />
        <label :for="`checkout-${index}`" class="flex-1 cursor-pointer font-medium">
          {{ todo }}
        </label>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          severity="secondary"
          outlined
          :disabled="loadingSubmit"
          @click="showCheckoutDialog = false"
        >
          Batal
        </Button>
        <Button
          type="button"
          severity="warn"
          :loading="loadingSubmit"
          :disabled="!checkoutComplete"
          @click="submitCheckoutAbsensi"
        >
          <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin" />
          <Icon v-else name="lucide:check-check" />
          Proses Pulang
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped></style>
