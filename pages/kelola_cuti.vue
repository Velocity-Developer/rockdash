<script setup lang="ts">
definePageMeta({
  title: 'Data Cuti',
  description: 'Catatan cuti karyawan',
})

import { useDayjs } from '#dayjs'

const dayjs = useDayjs()
const client = useSanctumClient()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const tahun = ref(Number(dayjs().format('YYYY')))
const items = ref<any[]>([])
const expandedRows = ref<any[]>([])
const karyawans = ref<string[]>([])
const visibleDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const form = reactive({
  id: null as number | null,
  nama: '',
  tanggal: dayjs().format('YYYY-MM-DD'),
  jenis: 'Full',
  detail: '',
  time: '00:00',
  tipe: '',
})

const jenisOptions = ['Full', 'Jam']
const tipeOptions = ['Belum diganti', 'Sudah diganti', 'Sakit']
const detailOptions = ['Cuti', 'Sakit']
const canEditCuti = computed(() => isPermissions('edit-cuti'))
const dialogTitle = computed(() => dialogMode.value === 'add' ? 'Tambah Data Cuti' : 'Edit Data Cuti')
const isJamForm = computed(() => form.jenis === 'Jam')

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

    karyawans.value = Array.isArray(res?.karyawans) ? res.karyawans : []
    items.value = Array.isArray(res?.data)
      ? res.data : []
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
      value: detail?.['Blm diganti'] || false,
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

function resetForm() {
  form.id = null
  form.nama = karyawans.value[0] || ''
  form.tanggal = dayjs().format('YYYY-MM-DD')
  form.jenis = 'Full'
  form.detail = 'Cuti'
  form.time = '00:00'
  form.tipe = ''
}

function openAddDialog() {
  dialogMode.value = 'add'
  resetForm()
  visibleDialog.value = true
}

function openEditDialog(item: any) {
  dialogMode.value = 'edit'
  form.id = item.id
  form.nama = item.nama || ''
  form.tanggal = item.tanggal || dayjs().format('YYYY-MM-DD')
  form.jenis = item.jenis || 'Full'
  form.detail = item.detail || ''
  form.time = item.time || '00:00'
  form.tipe = item.tipe || ''
  visibleDialog.value = true
}

watch(() => form.jenis, (jenis) => {
  if (jenis === 'Full') {
    form.time = '00:00'
    form.tipe = ''
    return
  }

  if (!form.time) {
    form.time = '00:00'
  }
})

async function submitForm() {
  if (!form.nama || !form.tanggal || !form.jenis) {
    toast.add({
      severity: 'warn',
      summary: 'Lengkapi data',
      detail: 'Nama, tanggal, dan jenis harus diisi.',
      life: 3000,
    })
    return
  }

  if (form.jenis === 'Jam' && (form.time < '00:00' || form.time > '08:00')) {
    toast.add({
      severity: 'warn',
      summary: 'Jam tidak valid',
      detail: 'Waktu izin hanya bisa diisi dari 00:00 sampai 08:00.',
      life: 3000,
    })
    return
  }

  saving.value = true

  try {
    const payload = {
      nama: form.nama,
      tanggal: form.tanggal,
      jenis: form.jenis,
      detail: form.detail || null,
      time: form.jenis === 'Jam' ? (form.time || '00:00') : '00:00',
      tipe: form.jenis === 'Jam' ? (form.tipe || null) : null,
    }

    if (dialogMode.value === 'edit' && form.id) {
      await client(`/api/cuti/${form.id}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await client('/api/cuti', {
        method: 'POST',
        body: payload,
      })
    }

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: dialogMode.value === 'edit' ? 'Data cuti berhasil diperbarui.' : 'Data cuti berhasil ditambahkan.',
      life: 3000,
    })

    visibleDialog.value = false
    await loadData()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Gagal menyimpan',
      detail: error?.data?.message || 'Terjadi kesalahan saat menyimpan data cuti.',
      life: 4000,
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-5">

    <div class="flex gap-2 items-center justify-end">
      <Button
        size="small"
        v-if="canEditCuti"
        @click="openAddDialog()"
      >
        <Icon
          name="lucide:plus"
        />
        Tambah
      </Button>
      <InputNumber
        v-model="tahun"
        size="small"
        class="!w-24"
        :useGrouping="false" fluid
      />
      <Button
        size="small"
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

    <div v-if="canEditCuti" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                {{ slotProps.data.detail?.Cuti || '0.00' }}
            </template>
          </Column>
          <Column header="Sakit" class="text-rose-500 font-medium">
            <template #body="slotProps">
                {{ slotProps.data.detail?.Sakit || '0.00' }}
            </template>
          </Column>
          <Column header="Blm Diganti" class="text-blue-500 font-medium">
            <template #body="slotProps">
                {{ slotProps.data.detail?.['Blm diganti'] || '-' }}
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
                    v-show="info.value"
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

                  <div v-if="canEditCuti" class="mt-4 flex justify-end">
                    <Button
                      size="small"
                      severity="secondary"
                      outlined
                      @click="openEditDialog(item)"
                    >
                      <Icon name="lucide:pencil" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-if="canEditCuti" 
      v-model:visible="visibleDialog"
      modal
      :header="dialogTitle"
      :style="{ width: '42rem' }"
      :breakpoints="{ '1199px': '70vw', '575px': '95vw' }"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-2 block text-sm font-medium">Nama</label>
          <Select
            v-model="form.nama"
            :options="karyawans"
            placeholder="Pilih karyawan"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">Tanggal</label>
          <InputText
            v-model="form.tanggal"
            type="date"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">Jenis</label>
          <Select
            v-model="form.jenis"
            :options="jenisOptions"
            class="w-full"
          />
        </div>

        <div class="md:col-span-2">
          <label class="mb-2 block text-sm font-medium">Detail</label>
          <Textarea
            v-model="form.detail"
            placeholder="Masukkan detail"
            class="w-full"
          />
        </div>

        <div v-if="isJamForm">
          <label class="mb-2 block text-sm font-medium">Waktu</label>
          <InputText
            v-model="form.time"
            type="time"
            min="00:00"
            max="08:00"
            class="w-full"
          />
          <div class="mt-1 text-xs text-slate-500">
            Isi waktu dari 00:00 sampai 08:00.
          </div>
        </div>

        <div v-if="isJamForm">
          <label class="mb-2 block text-sm font-medium">Tipe</label>
          <Select
            v-model="form.tipe"
            :options="tipeOptions"
            placeholder="Pilih tipe"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Batal"
            severity="secondary"
            @click="visibleDialog = false"
          />
          <Button
            :label="dialogMode === 'edit' ? 'Simpan perubahan' : 'Tambah data'"
            :loading="saving"
            @click="submitForm()"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped></style>
