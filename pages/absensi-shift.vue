<script setup lang="ts">
definePageMeta({
  title: 'Shift Absensi',
  description: 'Kelola daftar shift absensi',
})

const client = useSanctumClient()
const toast = useToast()
const confirm = useConfirm()

type ShiftItem = {
  id: number
  nama: string
  masuk: string
  pulang: string
  aktif: boolean
  created_at?: string
  updated_at?: string
}

const loading = ref(false)
const loadingSubmit = ref(false)
const items = ref<ShiftItem[]>([])
const errors = ref({} as Record<string, string[] | string>)

const filters = reactive({
  nama: '',
  aktif: 'all',
})

const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')

const form = reactive({
  id: null as number | null,
  nama: '',
  masuk: '08:00:00',
  pulang: '17:00:00',
  aktif: true,
})

const dialogTitle = computed(() => {
  return actionDialog.value === 'edit' ? 'Edit Shift Absensi' : 'Tambah Shift Absensi'
})

const submitLabel = computed(() => {
  return actionDialog.value === 'edit' ? 'Update' : 'Simpan'
})

function normalizeTime(value?: string | null) {
  if (!value) return ''
  return value.length >= 8 ? value.slice(0, 8) : value
}

function timeForApi(value?: string | null) {
  const normalized = normalizeTime(value)
  if (!normalized) return ''
  if (normalized.length === 5) return `${normalized}:00`
  return normalized
}

function resetForm() {
  form.id = null
  form.nama = ''
  form.masuk = '08:00:00'
  form.pulang = '17:00:00'
  form.aktif = true
}

async function loadData() {
  loading.value = true

  try {
    const params: Record<string, any> = {
      pagination: false,
      per_page: 200,
      order_by: 'nama',
      order: 'asc',
    }

    if (filters.nama) {
      params.nama = filters.nama
    }

    if (filters.aktif !== 'all') {
      params.aktif = filters.aktif === 'true'
    }

    const res = await client('/api/absensi-shift', { params }) as any
    items.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat mengambil data shift',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

function openDialog(action: 'add' | 'edit', row?: ShiftItem) {
  actionDialog.value = action
  errors.value = {}

  if (action === 'edit' && row) {
    form.id = row.id
    form.nama = row.nama || ''
    form.masuk = normalizeTime(row.masuk) || '08:00:00'
    form.pulang = normalizeTime(row.pulang) || '17:00:00'
    form.aktif = Boolean(row.aktif)
  } else {
    resetForm()
  }

  visibleDialog.value = true
}

async function handleSubmit() {
  loadingSubmit.value = true
  errors.value = {}

  const payload = {
    nama: form.nama,
    masuk: timeForApi(form.masuk),
    pulang: timeForApi(form.pulang),
    aktif: form.aktif,
  }

  try {
    if (actionDialog.value === 'edit' && form.id) {
      await client(`/api/absensi-shift/${form.id}`, {
        method: 'PUT',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Shift absensi berhasil diperbarui',
        life: 3000,
      })
    } else {
      await client('/api/absensi-shift', {
        method: 'POST',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Shift absensi berhasil ditambahkan',
        life: 3000,
      })
    }

    visibleDialog.value = false
    await loadData()
  } catch (error) {
    const er = useSanctumError(error)
    errors.value = er.bag || {}
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat menyimpan data shift',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}

function confirmDelete(row: ShiftItem) {
  confirm.require({
    message: `Hapus shift "${row.nama}"?`,
    header: 'Hapus Shift',
    accept: async () => {
      try {
        await client(`/api/absensi-shift/${row.id}`, {
          method: 'DELETE',
        })

        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Shift absensi berhasil dihapus',
          life: 3000,
        })

        await loadData()
      } catch (error) {
        const er = useSanctumError(error)
        toast.add({
          severity: 'error',
          summary: 'Gagal',
          detail: er.msg || 'Terjadi kesalahan saat menghapus data shift',
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

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-4 mx-auto max-w-5xl">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label class="mb-1 block text-sm font-medium">Cari Nama Shift</label>
          <InputText
            v-model="filters.nama"
            class="w-full"
            placeholder="Contoh: Shift Pagi"
            @keyup.enter="loadData"
            size="small"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Status</label>
          <Select
            v-model="filters.aktif"
            class="w-full"
            :options="[
              { label: 'Semua', value: 'all' },
              { label: 'Aktif', value: 'true' },
              { label: 'Nonaktif', value: 'false' },
            ]"
            optionLabel="label"
            optionValue="value"
            size="small"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-2">
        <Button size="small" severity="secondary" :loading="loading" @click="loadData">
          <Icon name="lucide:refresh-cw" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </Button>
        <Button size="small" @click="openDialog('add')">
          <Icon name="lucide:plus" />
          Tambah Shift
        </Button>
      </div>
    </div>

    <Card>
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
              Belum ada data shift absensi.
            </div>
          </template>

          <Column header="#" headerStyle="width: 4rem">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>

          <Column field="nama" header="Nama Shift" sortable>
            <template #body="slotProps">
              <div class="font-medium">
                {{ slotProps.data.nama }}
              </div>
            </template>
          </Column>

          <Column field="masuk" header="Jam Masuk">
            <template #body="slotProps">
              {{ normalizeTime(slotProps.data.masuk) }}
            </template>
          </Column>

          <Column field="pulang" header="Jam Pulang">
            <template #body="slotProps">
              {{ normalizeTime(slotProps.data.pulang) }}
            </template>
          </Column>

          <Column field="aktif" header="Status">
            <template #body="slotProps">
              <Tag :severity="slotProps.data.aktif ? 'success' : 'secondary'">
                {{ slotProps.data.aktif ? 'Aktif' : 'Nonaktif' }}
              </Tag>
            </template>
          </Column>

          <Column header="" headerStyle="width: 8rem">
            <template #body="slotProps">
              <div class="flex justify-end gap-2">
                <Button size="small" severity="info" @click="openDialog('edit', slotProps.data)">
                  <Icon name="lucide:pencil" />
                </Button>
                <Button size="small" severity="danger" @click="confirmDelete(slotProps.data)">
                  <Icon name="lucide:trash-2" />
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="visibleDialog"
      modal
      :header="dialogTitle"
      :style="{ width: '38rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium" for="nama">Nama Shift</label>
          <InputText
            id="nama"
            v-model="form.nama"
            class="w-full"
            placeholder="Masukkan nama shift"
          />
          <Message v-if="errors.nama" severity="error" size="small" class="mt-1">
            {{ Array.isArray(errors.nama) ? errors.nama[0] : errors.nama }}
          </Message>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium" for="masuk">Jam Masuk</label>
            <InputText
              id="masuk"
              v-model="form.masuk"
              type="time"
              step="1"
              class="w-full"
            />
            <Message v-if="errors.masuk" severity="error" size="small" class="mt-1">
              {{ Array.isArray(errors.masuk) ? errors.masuk[0] : errors.masuk }}
            </Message>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium" for="pulang">Jam Pulang</label>
            <InputText
              id="pulang"
              v-model="form.pulang"
              type="time"
              step="1"
              class="w-full"
            />
            <Message v-if="errors.pulang" severity="error" size="small" class="mt-1">
              {{ Array.isArray(errors.pulang) ? errors.pulang[0] : errors.pulang }}
            </Message>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <div class="text-sm font-medium">Status Aktif</div>
            <div class="text-xs text-slate-500">
              Shift aktif akan tersedia untuk dipilih pada data absensi.
            </div>
          </div>
          <ToggleSwitch v-model="form.aktif" />
        </div>
        <Message v-if="errors.aktif" severity="error" size="small">
          {{ Array.isArray(errors.aktif) ? errors.aktif[0] : errors.aktif }}
        </Message>

        <div class="flex justify-end gap-2">
          <Button type="button" severity="secondary" :disabled="loadingSubmit" @click="visibleDialog = false">
            Batal
          </Button>
          <Button type="submit" :loading="loadingSubmit">
            <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin" />
            <Icon v-else name="lucide:save" />
            {{ submitLabel }}
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped></style>
