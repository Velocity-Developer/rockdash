<script setup lang="ts">
definePageMeta({
  title: 'Riwayat Cek Server Tim Support',
  description: 'Daftar riwayat pengecekan server tim support berdasarkan server',
})

const { start, finish } = useLoadingIndicator()
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

type ServerOption = {
  id: number
  name: string
  hostname: string | null
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
  created_at?: string
  updated_at?: string
}

const route = useRoute()
const router = useRouter()
const client = useSanctumClient()
const toast = useToast()
const confirm = useConfirm()

const serverId = computed(() => Number(route.params.id))
const loading = ref(false)
const loadingSubmit = ref(false)
const items = ref<CekServerItem[]>([])
const server = ref<ServerOption | null>(null)
const errors = ref({} as Record<string, string[] | string>)

const filters = reactive({
  cek_error_idrac: route.query.cek_error_idrac ? String(route.query.cek_error_idrac) : 'all',
})

const pagination = reactive({
  current_page: route.query.page ? Number(route.query.page) : 1,
  per_page: route.query.per_page ? Number(route.query.per_page) : 25,
  total: 0,
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
  return previewData.value?.server?.name || server.value?.name || 'Preview Cek Server'
})

const firstRow = computed(() => {
  return (pagination.current_page - 1) * pagination.per_page
})

const summary = computed(() => {
  return {
    total: pagination.total,
    error: items.value.filter((item) => toBoolean(item.cek_error_idrac)).length,
    aman: items.value.filter((item) => !toBoolean(item.cek_error_idrac)).length,
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

function formatDateTime(value?: string | Date | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function rowNumber(index: number) {
  return firstRow.value + index + 1
}

function updateRouteQuery() {
  router.replace({
    query: {
      ...route.query,
      page: String(pagination.current_page),
      per_page: String(pagination.per_page),
      cek_error_idrac: filters.cek_error_idrac !== 'all' ? filters.cek_error_idrac : undefined,
    },
  })
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
  form.server_id = serverId.value
  form.hapus_backup_admin = null
  form.kapasitas_ssh = null
  form.cek_error_idrac = false
  form.error_idrac = null
}

async function loadServer() {
  try {
    server.value = await client(`/api/servers/${serverId.value}`) as ServerOption
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat mengambil data server',
      life: 3000,
    })
  }
}

async function loadData() {
  loading.value = true
  start()
  try {
    const params: Record<string, any> = {
      server_id: serverId.value,
      page: pagination.current_page,
      per_page: pagination.per_page,
      order_by: 'id',
      order: 'desc',
    }

    if (filters.cek_error_idrac !== 'all') {
      params.cek_error_idrac = filters.cek_error_idrac === 'true'
    }

    const res = await client('/api/cek-server-tim-support', { params }) as any
    items.value = Array.isArray(res?.data) ? res.data : []
    pagination.current_page = Number(res?.current_page || pagination.current_page)
    pagination.per_page = Number(res?.per_page || pagination.per_page)
    pagination.total = Number(res?.total || items.value.length)
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

async function applyFilter() {
  pagination.current_page = 1
  updateRouteQuery()
  await loadData()
}

async function onPaginate(event: any) {
  pagination.current_page = Number(event.page) + 1
  pagination.per_page = Number(event.rows)
  updateRouteQuery()
  await loadData()
}

async function refreshData() {
  await Promise.all([
    loadServer(),
    loadData(),
  ])
}

function openDialog(action: 'add' | 'edit', row?: CekServerItem) {
  actionDialog.value = action
  errors.value = {}

  if (action === 'edit' && row) {
    form.id = row.id
    form.server_id = serverId.value
    form.hapus_backup_admin = row.hapus_backup_admin ? dayjs(row.hapus_backup_admin).toDate() : null
    form.kapasitas_ssh = row.kapasitas_ssh || ''
    form.cek_error_idrac = toBoolean(row.cek_error_idrac)
    form.error_idrac = row.error_idrac || ''
  } else {
    resetForm()
  }

  visibleDialog.value = true
}

async function handleSubmit() {
  loadingSubmit.value = true
  errors.value = {}

  const payload = {
    server_id: serverId.value,
    hapus_backup_admin: form.hapus_backup_admin ? dayjs(form.hapus_backup_admin).format('YYYY-MM-DD HH:mm:ss').toString() : null,
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

function confirmDelete(row: CekServerItem) {
  confirm.require({
    message: `Hapus data cek server "${server.value?.name || row.id}"?`,
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
      <div>
        <h1 class="text-xl font-semibold">{{ server?.name || `Server #${serverId}` }}</h1>
        <div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{{ server?.hostname || '-' }}</span>
          <span v-if="server?.ip_address">/ {{ server.ip_address }}</span>
          <Tag :severity="toBoolean(server?.is_active) ? 'success' : 'secondary'">
            {{ toBoolean(server?.is_active) ? 'Active' : 'Inactive' }}
          </Tag>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2">
        <Select
          v-model="filters.cek_error_idrac"
          :options="[
            { label: 'Semua', value: 'all' },
            { label: 'Ada Error', value: 'true' },
            { label: 'Tidak Ada Error', value: 'false' },
          ]"
          optionLabel="label"
          optionValue="value"
          size="small"
          @change="applyFilter"
        />
        <Button size="small" severity="contrast" outlined :loading="loading" @click="refreshData">
          <Icon name="lucide:refresh-cw" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </Button>
        <Button size="small" @click="openDialog('add')">
          <Icon name="lucide:plus" />
          Tambah
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
          scrollHeight="72vh"
          class="text-xs"
        >
          <template #empty>
            <div class="py-10 text-center text-sm text-slate-500">
              Belum ada data cek server tim support untuk server ini.
            </div>
          </template>

          <Column header="#" headerStyle="width: 4rem">
            <template #body="slotProps">
              {{ rowNumber(slotProps.index) }}
            </template>
          </Column>

          <Column field="created_at" header="Tanggal Cek" sortable>
            <template #body="slotProps">
              <button
                type="button"
                class="font-medium text-primary-600 hover:underline dark:text-primary-400"
                @click="openPreviewDialog(slotProps.data)"
              >
                {{ formatDateTime(slotProps.data.created_at || slotProps.data.updated_at) }}
              </button>
            </template>
          </Column>

          <Column field="hapus_backup_admin" header="Hapus Backup di folder Admin Backup">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.hapus_backup_admin) }}
            </template>
          </Column>

          <Column field="kapasitas_ssh" header="Cek Kapasitas lewat SSH">
            <template #body="slotProps">
              {{ slotProps.data.kapasitas_ssh || '-' }}
            </template>
          </Column>

          <Column field="cek_error_idrac" header="iDRAC">
            <template #body="slotProps">
              <Tag size="small" class="text-xs" :severity="toBoolean(slotProps.data.cek_error_idrac) ? 'danger' : 'success'">
                {{ toBoolean(slotProps.data.cek_error_idrac) ? 'Error' : 'Aman' }}
              </Tag>
            </template>
          </Column>

          <Column field="error_idrac" header="Keterangan Error">
            <template #body="slotProps">
              <div class="max-w-md whitespace-normal">
                {{ slotProps.data.error_idrac || '-' }}
              </div>
            </template>
          </Column>

          <Column field="user.name" header="Dibuat Oleh">
            <template #body="slotProps">
              {{ slotProps.data.user?.name || slotProps.data.user?.username || '-' }}
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

        <div class="flex justify-end">
          <Paginator
            class="mt-4"
            :first="firstRow"
            :rows="pagination.per_page"
            :totalRecords="pagination.total"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            @page="onPaginate"
            size="small"
          />
        </div>
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
        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Server</div>
            <div class="mt-1 flex items-center justify-between">
              <div class="font-medium">{{ previewData.server?.name || server?.name || '-' }}</div>
              <Badge severity="secondary">{{ previewData.server?.hostname || server?.hostname || '-' }}</Badge>
            </div>
          </div>

          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Tanggal Cek</div>
            <div class="mt-1 font-medium">{{ formatDateTime(previewData.created_at || previewData.updated_at) }}</div>
          </div>

          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Hapus Backup Admin</div>
            <div class="mt-1 font-medium">{{ formatDateTime(previewData.hapus_backup_admin) }}</div>
          </div>

          <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
            <div class="text-xs text-slate-500">Kapasitas SSH</div>
            <div class="mt-1 font-medium">{{ previewData.kapasitas_ssh || '-' }}</div>
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
        <div class="rounded border border-slate-200 p-3 dark:border-slate-700">
          <div class="text-xs text-slate-500">Server</div>
          <div class="mt-1 font-medium">{{ server?.name || `Server #${serverId}` }}</div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="hapus_backup_admin">
            Hapus Backup di folder Admin Backup
          </label>
          <DatePicker id="hapus_backup_admin" v-model="form.hapus_backup_admin" showTime hourFormat="24" fluid />
          <Message v-if="errorText('hapus_backup_admin')" severity="error" size="small" class="mt-1">
            {{ errorText('hapus_backup_admin') }}
          </Message>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="kapasitas_ssh">
            Cek Kapasitas lewat SSH
          </label>
          <InputText
            id="kapasitas_ssh"
            v-model="form.kapasitas_ssh"
            class="w-full"
            placeholder="Contoh: 10 user"
          />
          <Message v-if="errorText('kapasitas_ssh')" severity="error" size="small" class="mt-1">
            {{ errorText('kapasitas_ssh') }}
          </Message>
        </div>

        <div class="flex items-center justify-between rounded border border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <div class="text-sm font-medium">Cek Error iDRAC</div>
            <div class="text-xs text-slate-500">
              Aktifkan bila ditemukan error pada iDRAC.
            </div>
          </div>
          <ToggleSwitch v-model="form.cek_error_idrac" />
        </div>
        <Message v-if="errorText('cek_error_idrac')" severity="error" size="small">
          {{ errorText('cek_error_idrac') }}
        </Message>

        <div v-if="form.cek_error_idrac">
          <label class="mb-1 block text-sm font-medium" for="error_idrac">Keterangan Error iDRAC</label>
          <Textarea
            id="error_idrac"
            v-model="form.error_idrac"
            class="w-full"
            rows="4"
            autoResize
            placeholder="Catatan error iDRAC"
          />
          <Message v-if="errorText('error_idrac')" severity="error" size="small" class="mt-1">
            {{ errorText('error_idrac') }}
          </Message>
        </div>

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
