<script setup lang="ts">
definePageMeta({
  title: 'Cek Server Tim Support',
  description: 'Kelola data pengecekan server tim support',
})

const { start, finish } = useLoadingIndicator()
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

type ServerOption = {
  id: number
  name: string
  hostname: string | null
  type?: string | null
  ip_address?: string | null
  is_active?: boolean | number | null
}

type CekServerItem = {
  id: number
  server_id: number | null
  user_id: number | null
  server?: ServerOption | null
  user?: {
    id: number
    name: string
    username?: string | null
  } | null
  hapus_backup_admin: string | Date | null
  kapasitas_ssh: string | null
  cek_error_idrac: boolean | number | null
  error_idrac: string | null
  tanggal_update_cek_error_idrac?: string | Date | null
  tanggal_update_kapasitas_ssh?: string | Date | null
  created_at?: string
  updated_at?: string
}

type ServerCekRow = ServerOption & {
  latest_check: CekServerItem | null
  cek_server_tim_support_latest?: CekServerItem | null
}

const client = useSanctumClient()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const loadingSubmit = ref(false)
const loadingField = reactive({
  hapus_backup_admin: false,
  kapasitas_ssh: false,
  cek_error_idrac: false,
  error_idrac: false,
})
const latestRows = ref<ServerCekRow[]>([])
const errors = ref({} as Record<string, string[] | string>)

const filters = reactive({
  server_id: null as number | null,
  cek_error_idrac: 'all',
})

const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')
const visiblePreviewDialog = ref(false)
const previewData = ref<CekServerItem | null>(null)

const form = reactive({
  id: null as number | null,
  server_id: null as number | null,
  hapus_backup_admin: null as Date | null,
  kapasitas_ssh: null as string | null,
  cek_error_idrac: false,
  error_idrac: null as string | null,
})

const dialogTitle = computed(() => {
  return actionDialog.value === 'edit' ? 'Edit Cek Server' : 'Tambah Cek Server'
})

const submitLabel = computed(() => {
  return actionDialog.value === 'edit' ? 'Update' : 'Simpan'
})

const previewTitle = computed(() => {
  if (!previewData.value) return 'Preview Cek Server'

  return previewData.value.server?.name || getServerName(previewData.value.server_id)
})

const serverOptions = computed(() => latestRows.value)

const tableRows = computed<ServerCekRow[]>(() => {
  return latestRows.value.filter((row) => {
    if (filters.server_id && row.id !== filters.server_id) {
      return false
    }

    if (filters.cek_error_idrac !== 'all') {
      if (!row.latest_check) return false

      return toBoolean(row.latest_check.cek_error_idrac) === (filters.cek_error_idrac === 'true')
    }

    return true
  })
})

const summary = computed(() => {
  return {
    total: tableRows.value.length,
    checked: tableRows.value.filter((row) => row.latest_check).length,
    error: tableRows.value.filter((row) => row.latest_check && toBoolean(row.latest_check.cek_error_idrac)).length,
  }
})

function errorText(field: string) {
  const value = errors.value[field]
  if (!value) return ''
  return Array.isArray(value) ? value[0] : value
}

function toBoolean(value: boolean | number | string | null | undefined) {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function toServerId(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null

  const id = Number(value)
  return Number.isNaN(id) ? null : id
}

function formatDateTimeForApi(value: Date | null) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss').toString() : null
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getServerName(serverId: number | null | undefined) {
  const id = toServerId(serverId)
  if (!id) return '-'

  return latestRows.value.find((server) => server.id === id)?.name || '-'
}

function openPreviewDialog(row: CekServerItem) {
  previewData.value = row
  visiblePreviewDialog.value = true
}

function editPreviewData() {
  if (!previewData.value) return

  visiblePreviewDialog.value = false
  openDialog('edit', previewData.value)
}

function resetForm() {
  form.id = null
  form.server_id = null
  form.hapus_backup_admin = null
  form.kapasitas_ssh = null
  form.cek_error_idrac = false
  form.error_idrac = null
}

async function loadData() {
  loading.value = true
  start()
  try {
    const params: Record<string, any> = {
      per_page: 20,
      order_by: 'name',
      order: 'asc',
    }

    const res = await client('/api/cek_server_tim_support_latest', { params }) as any
    const rows = Array.isArray(res?.data) ? res.data : []

    latestRows.value = rows.map((row: ServerCekRow) => {
      const latestCheck = row.latest_check || row.cek_server_tim_support_latest || null

      return {
        ...row,
        id: toServerId(row.id) || row.id,
        latest_check: latestCheck
          ? {
              ...latestCheck,
              server_id: toServerId(latestCheck.server_id),
            }
          : null,
      }
    })
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat mengambil data cek server',
      life: 3000,
    })
  } finally {
    loading.value = false
    finish()
  }
}

function openDialog(action: 'add' | 'edit', row?: CekServerItem) {
  actionDialog.value = action
  errors.value = {}

  if (action === 'edit' && row) {
    form.id = row.id
    form.server_id = toServerId(row.server_id)
    form.hapus_backup_admin = row.hapus_backup_admin ? dayjs(row.hapus_backup_admin).toDate() : null
    form.kapasitas_ssh = row.kapasitas_ssh || ''
    form.cek_error_idrac = toBoolean(row.cek_error_idrac)
    form.error_idrac = row.error_idrac || ''
  } else {
    resetForm()
  }

  visibleDialog.value = true
}

function openCreateForServer(server: ServerOption) {
  openDialog('add')
  form.server_id = server.id
}

async function refreshData() {
  await loadData()
}

async function handleSubmit() {
  loadingSubmit.value = true
  errors.value = {}

  const payload = {
    server_id: form.server_id,
    hapus_backup_admin: formatDateTimeForApi(form.hapus_backup_admin),
    kapasitas_ssh: form.kapasitas_ssh || null,
    cek_error_idrac: form.cek_error_idrac,
    error_idrac: form.error_idrac || null,
  }

  try {
    if (actionDialog.value === 'edit' && form.id) {
      await client(`/api/cek-server-tim-support/${form.id}`, {
        method: 'PUT',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data cek server berhasil diperbarui',
        life: 3000,
      })
    } else {
      await client('/api/cek-server-tim-support', {
        method: 'POST',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data cek server berhasil ditambahkan',
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
      detail: er.msg || 'Terjadi kesalahan saat menyimpan data cek server',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}

async function handleSaveField(field: keyof typeof loadingField) {
  if (!form.id) return

  loadingField[field] = true
  errors.value = {}

  const payload: Record<string, any> = {
    server_id: form.server_id,
  }

  if (field === 'hapus_backup_admin') {
    payload.hapus_backup_admin = formatDateTimeForApi(form.hapus_backup_admin)
  }

  if (field === 'kapasitas_ssh') {
    payload.kapasitas_ssh = form.kapasitas_ssh || null
  }

  if (field === 'cek_error_idrac') {
    payload.cek_error_idrac = form.cek_error_idrac
  }

  if (field === 'error_idrac') {
    payload.error_idrac = form.error_idrac || null
  }

  try {
    const updated = await client(`/api/cek-server-tim-support/${form.id}`, {
      method: 'PUT',
      body: payload,
    }) as CekServerItem

    const normalizedUpdated = {
      ...updated,
      server_id: toServerId(updated.server_id),
    }

    latestRows.value = latestRows.value.map((row) => {
      if (row.id !== normalizedUpdated.server_id) return row

      return {
        ...row,
        latest_check: normalizedUpdated,
      }
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil disimpan',
      life: 2000,
    })
  } catch (error) {
    const er = useSanctumError(error)
    errors.value = er.bag || {}
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat menyimpan data',
      life: 3000,
    })
  } finally {
    loadingField[field] = false
  }
}

function confirmDelete(row: CekServerItem) {
  confirm.require({
    message: `Hapus data cek server "${row.server?.name || getServerName(row.server_id) || row.id}"?`,
    header: 'Hapus Cek Server',
    accept: async () => {
      try {
        await client(`/api/cek-server-tim-support/${row.id}`, {
          method: 'DELETE',
        })

        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Data cek server berhasil dihapus',
          life: 3000,
        })

        await loadData()
      } catch (error) {
        const er = useSanctumError(error)
        toast.add({
          severity: 'error',
          summary: 'Gagal',
          detail: er.msg || 'Terjadi kesalahan saat menghapus data cek server',
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

onMounted(refreshData)
</script>

<template>
  <div class="mx-auto space-y-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div class="grid gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium">Server</label>
          <Select
            v-model="filters.server_id"
            :options="serverOptions"
            optionLabel="name"
            optionValue="id"
            showClear
            filter
            class="w-full md:w-72"
            placeholder="Semua server"
            size="small"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Error iDRAC</label>
          <Select
            v-model="filters.cek_error_idrac"
            class="w-full md:w-56"
            :options="[
              { label: 'Semua', value: 'all' },
              { label: 'Ada Error', value: 'true' },
              { label: 'Tidak Ada Error', value: 'false' },
            ]"
            optionLabel="label"
            optionValue="value"
            size="small"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-2">
        <Button size="small" severity="contrast" :loading="loading" @click="refreshData">
          <Icon name="lucide:refresh-cw" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </Button>
        <!-- <Button size="small" @click="openDialog('add')">
          <Icon name="lucide:plus" />
          Tambah
        </Button> -->
      </div>
    </div>

    <!-- <div class="grid gap-3 md:grid-cols-3">
      <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
        <div class="text-xs text-slate-500">Server Ditampilkan</div>
        <div class="mt-1 text-xl font-semibold">{{ summary.total }}</div>
      </div>
      <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
        <div class="text-xs text-slate-500">Sudah Ada Riwayat</div>
        <div class="mt-1 text-xl font-semibold">{{ summary.checked }}</div>
      </div>
      <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
        <div class="text-xs text-slate-500">Riwayat Terakhir Error iDRAC</div>
        <div class="mt-1 text-xl font-semibold">{{ summary.error }}</div>
      </div>
    </div> -->

    <Card>
      <template #content>
        <DataTable
          :value="tableRows"
          size="small"
          stripedRows
          :loading="loading"
          scrollable
          responsiveLayout="scroll"
          scrollHeight="72vh"
          class="text-xs"
        >
          <template #empty>
            <div class="py-10 text-center text-sm text-slate-500">
              Tidak ada server yang sesuai filter.
            </div>
          </template>

          <Column header="#" headerStyle="width: 4rem">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>

          <Column field="name" header="Server" sortable>
            <template #body="slotProps">
              <div>
                <NuxtLink
                  :to="`/cek-server-tim-support-single/${slotProps.data.id}`"
                  class="font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                  {{ slotProps.data.name || '-' }}
                </NuxtLink>
                <div class="text-xs text-slate-500">
                  {{ slotProps.data.hostname || slotProps.data.ip_address || '-' }}
                </div>
              </div>
            </template>
          </Column>

          <!-- <Column field="latest_check.updated_at" header="Riwayat Terakhir">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.latest_check?.updated_at || slotProps.data.latest_check?.created_at) }}
            </template>
          </Column> -->

          <Column field="hapus_backup_admin" header="Hapus Backup di folder Admin Backup">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.latest_check?.hapus_backup_admin) }}
            </template>
          </Column>

          <Column field="kapasitas_ssh" header="Cek Kapasitas lewat SSH">
            <template #body="slotProps">
              <div>
              {{ slotProps.data.latest_check?.kapasitas_ssh || '-' }}
              </div>
              <Badge v-if="slotProps.data.latest_check" class="mt-1" severity="secondary">
                {{ formatDateTime(slotProps.data.latest_check?.tanggal_update_kapasitas_ssh || slotProps.data.latest_check?.updated_at ) }}
              </Badge>
            </template>
          </Column>

          <Column field="cek_error_idrac" header="iDRAC">
            <template #body="slotProps">
              <div>
                <Tag size="small" class="text-xs" :severity="slotProps.data.latest_check ? (toBoolean(slotProps.data.latest_check.cek_error_idrac) ? 'danger' : 'success') : 'secondary'">
                  {{ slotProps.data.latest_check ? (toBoolean(slotProps.data.latest_check.cek_error_idrac) ? 'Error' : 'Aman') : 'Belum Dicek' }}
                </Tag>
              </div>
              <Badge class="mt-1" v-if="slotProps.data.latest_check" severity="secondary">
                {{ formatDateTime(slotProps.data.latest_check?.tanggal_update_cek_error_idrac || slotProps.data.latest_check?.updated_at) }}
              </Badge>
            </template>
          </Column>

          <Column field="error_idrac" header="Keterangan Error">
            <template #body="slotProps">
              <div class="max-w-md whitespace-normal">
                {{ slotProps.data.latest_check?.error_idrac || '-' }}
              </div>
            </template>
          </Column>

          <Column header="" headerStyle="width: 8rem">
            <template #body="slotProps">
              <div class="flex justify-end gap-2">
                <Button
                  v-if="slotProps.data.latest_check"
                  size="small"
                  severity="info"
                  @click="openDialog('edit', slotProps.data.latest_check)"
                >
                  <Icon name="lucide:pencil" />
                </Button>
                <Button
                  v-if="slotProps.data.latest_check"
                  size="small"
                  severity="danger"
                  @click="confirmDelete(slotProps.data.latest_check)"
                >
                  <Icon name="lucide:trash-2" />
                </Button>
                <Button
                  v-else
                  size="small"
                  severity="success"
                  @click="openCreateForServer(slotProps.data)"
                >
                  <Icon name="lucide:plus" />
                </Button>
                <!-- <Button
                  size="small"
                  severity="contrast"
                  @click="navigateTo(`/cek-server-tim-support-single/${slotProps.data.id}`)"
                >
                  <Icon name="lucide:list" />
                </Button> -->
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="visiblePreviewDialog"
      modal
      :header="previewTitle"
      :style="{ width: '46rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
      :dismissableMask="true"
    >
      <div v-if="previewData" class="space-y-4">
        <div class="grid gap-3 grid-cols-1 md:grid-cols-2">
          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Server</div>
            <div class="mt-1 flex items-center justify-between">
              <div class="font-medium">{{ previewData.server?.name || getServerName(previewData.server_id) }}</div>
              <Badge severity="secondary">{{ previewData.server?.hostname || '-' }}</Badge>
            </div>
          </div>

          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Hapus Backup Admin</div>
            <div class="mt-1 font-medium">{{ formatDateTime(previewData.hapus_backup_admin) }}</div>
          </div>

          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Kapasitas SSH</div>
            <div class="mt-1 font-medium">{{ previewData.kapasitas_ssh || '-' }}</div>
          </div>

          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Dibuat Oleh</div>
            <div class="mt-1 font-medium">
              {{ previewData.user?.name || previewData.user?.username || '-' }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between rounded border border-slate-200 p-3 dark:border-slate-700">
          <div>
            <div class="text-xs text-slate-500">Status iDRAC</div>
            <div class="mt-1 font-medium">
              {{ toBoolean(previewData.cek_error_idrac) ? 'Ada Error' : 'Aman' }}
            </div>
          </div>
          <Tag :severity="toBoolean(previewData.cek_error_idrac) ? 'danger' : 'success'">
            {{ toBoolean(previewData.cek_error_idrac) ? 'Error' : 'Aman' }}
          </Tag>
        </div>

        <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
          <div class="text-xs text-slate-500">Keterangan Error iDRAC</div>
          <div class="mt-2 whitespace-pre-line text-sm">
            {{ previewData.error_idrac || '-' }}
          </div>
        </div>

        <!-- <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Dibuat</div>
            <div class="mt-1 font-medium">{{ formatDateTime(previewData.created_at) }}</div>
          </div>

          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Diupdate</div>
            <div class="mt-1 font-medium">{{ formatDateTime(previewData.updated_at) }}</div>
          </div>
        </div> -->

        <div class="flex justify-end gap-2">
          <Button type="button" severity="secondary" @click="visiblePreviewDialog = false">
            Tutup
          </Button>
          <Button type="button" severity="info" @click="editPreviewData">
            <Icon name="lucide:pencil" />
            Edit
          </Button>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="visibleDialog"
      modal
      :header="dialogTitle"
      :style="{ width: '42rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
      :dismissableMask="true"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">

        <div>
          <Select
            id="server_id"
            v-model="form.server_id"
            :options="serverOptions"
            optionLabel="name"
            optionValue="id"
            showClear
            filter
            class="w-full"
            placeholder="Pilih server"
            :disabled="actionDialog === 'edit'"
          >            
            <template #option="slotProps">
                <div class="flex items-center justify-between w-full gap-3">                      
                    <div>{{ slotProps.option.name }}</div>
                    <Badge>{{ slotProps.option.hostname }}</Badge>
                </div>
            </template>
        </Select>
          <Message v-if="errorText('server_id')" severity="error" size="small" class="mt-1">
            {{ errorText('server_id') }}
          </Message>
        </div>
         
        <div>
          <label class="mb-1 block text-sm font-medium" for="hapus_backup_admin">
            Hapus Backup di folder Admin Backup
          </label>
          <div class="flex gap-1 justify-between align-bottom">
            <DatePicker id="hapus_backup_admin" v-model="form.hapus_backup_admin" showTime hourFormat="24" class="w-full" fluid />
            <div v-if="actionDialog === 'edit'">
              <Button
                type="button"
                size="small"
                severity="success"
                :loading="loadingField.hapus_backup_admin"
                @click="handleSaveField('hapus_backup_admin')"
              >
                <Icon v-if="loadingField.hapus_backup_admin" name="lucide:loader-circle" class="animate-spin" />
                <Icon v-else name="lucide:save" />
                Save
              </Button>
            </div>
          </div>
          <Message v-if="errorText('hapus_backup_admin')" severity="error" size="small" class="mt-1">
            {{ errorText('hapus_backup_admin') }}
          </Message>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="kapasitas_ssh">
            Cek Kapasitas lewat SSH
          </label>
          <div class="flex gap-1 justify-between align-bottom">
            <Textarea
              id="kapasitas_ssh"
              v-model="form.kapasitas_ssh"
              class="w-full"
              placeholder="Contoh: 10 user"
            />
            <div v-if="actionDialog === 'edit'">
              <Button
                type="button"
                size="small"
                severity="success"
                :loading="loadingField.kapasitas_ssh"
                @click="handleSaveField('kapasitas_ssh')"
              >
                <Icon v-if="loadingField.kapasitas_ssh" name="lucide:loader-circle" class="animate-spin" />
                <Icon v-else name="lucide:save" />
                Save
              </Button>
            </div>
          </div>
          <Message v-if="errorText('kapasitas_ssh')" severity="error" size="small" class="mt-1">
            {{ errorText('kapasitas_ssh') }}
          </Message>
        </div>


        <div class="mt-10">          
          <div class="text-sm font-medium">Cek Error iDRAC</div>
          <div class="flex gap-1 justify-between align-bottom">
            <div class="flex items-center gap-4">
                <div class="text-xs text-slate-500">
                  Aktifkan bila ditemukan error pada iDRAC.
                </div>
                <ToggleSwitch v-model="form.cek_error_idrac" @change="handleSaveField('cek_error_idrac')"/>
                <Button
                  v-if="actionDialog === 'edit'"
                  type="button"
                  size="small"
                  severity="success"
                  :loading="loadingField.cek_error_idrac"
                  @click="handleSaveField('cek_error_idrac')"
                >
                  <Icon v-if="loadingField.cek_error_idrac" name="lucide:loader-circle" class="animate-spin" />
                  <Icon v-else name="lucide:refresh-cw" />
                  Update
                </Button>
            </div>
          </div>
        </div>
        
        <div v-if="form.cek_error_idrac">
          <label class="mb-1 block text-sm font-medium" for="error_idrac">Keterangan Error iDRAC</label>
          <div class="flex gap-1 justify-between align-bottom">            
            <Textarea
              id="error_idrac"
              v-model="form.error_idrac"
              class="w-full"
              rows="4"
              autoResize
              placeholder="Catatan error iDRAC"
            />            
            <div v-if="actionDialog === 'edit'" >         
              <Button
                type="button"
                size="small"
                severity="success"
                :loading="loadingField.error_idrac"
                @click="handleSaveField('error_idrac')"
              >
                <Icon v-if="loadingField.error_idrac" name="lucide:loader-circle" class="animate-spin" />
                <Icon v-else name="lucide:save" />
                Save
              </Button>
            </div>
          </div>
        </div>


        <div class="flex justify-end gap-2">
          <Button type="button" severity="secondary" :disabled="loadingSubmit" @click="visibleDialog = false">
            Batal
          </Button>
          <Button v-if="actionDialog === 'add'" type="submit" :loading="loadingSubmit">
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
