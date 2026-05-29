<script setup lang="ts">
definePageMeta({
  title: 'Reminder CS',
  description: 'Daftar reminder customer service',
})

type ReminderUser = {
  id: number
  name: string
  username?: string
}

type ReminderItem = {
  id: number
  jam: string | null
  keterangan: string | null
  user_id: number | null
  user?: ReminderUser | null
  created_at?: string
  updated_at?: string
}

type PaginationResponse = {
  data: ReminderItem[]
  current_page: number
  per_page: number
  total: number
}

const client = useSanctumClient()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const loadingSubmit = ref(false)
const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')
const errors = ref({} as Record<string, string[] | string>)

const filters = reactive({
  page: route.query.page ? Number(route.query.page) : 1,
  per_page: route.query.per_page ? Number(route.query.per_page) : 20,
  search: route.query.search ? String(route.query.search) : '',
  order_by: route.query.order_by ? String(route.query.order_by) : 'jam',
  order: route.query.order ? String(route.query.order) : 'asc',
})

const data = ref<PaginationResponse>({
  data: [],
  current_page: 1,
  per_page: 20,
  total: 0,
})

const form = reactive({
  id: null as number | null,
  jam: '',
  keterangan: '',
})

const dialogTitle = computed(() => {
  return actionDialog.value === 'edit' ? 'Edit Reminder CS' : 'Tambah Reminder CS'
})

const submitLabel = computed(() => {
  return actionDialog.value === 'edit' ? 'Update' : 'Simpan'
})

function normalizeTime(value?: string | null) {
  if (!value) return ''
  return value.length >= 5 ? value.slice(0, 5) : value
}

function timeForApi(value?: string | null) {
  const normalized = normalizeTime(value)
  if (!normalized) return null
  return normalized
}

function formatDate(value?: string) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function updateRouteParams() {
  const query: Record<string, string> = {
    page: String(filters.page),
    per_page: String(filters.per_page),
    order_by: filters.order_by,
    order: filters.order,
  }

  if (filters.search) {
    query.search = filters.search
  }

  router.replace({ query })
}

async function loadData() {
  loading.value = true

  try {
    const res = await client('/api/reminder-cs', {
      params: {
        page: filters.page,
        per_page: filters.per_page,
        search: filters.search || undefined,
        order_by: filters.order_by,
        order: filters.order,
      },
    }) as PaginationResponse

    data.value = res
    filters.page = Number(res.current_page || filters.page)
    filters.per_page = Number(res.per_page || filters.per_page)
    updateRouteParams()
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat mengambil data reminder',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id = null
  form.jam = ''
  form.keterangan = ''
}

function openDialog(action: 'add' | 'edit', row?: ReminderItem) {
  actionDialog.value = action
  errors.value = {}

  if (action === 'edit' && row) {
    form.id = row.id
    form.jam = normalizeTime(row.jam)
    form.keterangan = row.keterangan || ''
  } else {
    resetForm()
  }

  visibleDialog.value = true
}

async function handleSubmit() {
  loadingSubmit.value = true
  errors.value = {}

  const payload = {
    jam: timeForApi(form.jam),
    keterangan: form.keterangan,
  }

  try {
    if (actionDialog.value === 'edit' && form.id) {
      await client(`/api/reminder-cs/${form.id}`, {
        method: 'PUT',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Reminder berhasil diperbarui',
        life: 3000,
      })
    } else {
      await client('/api/reminder-cs', {
        method: 'POST',
        body: payload,
      })

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Reminder berhasil ditambahkan',
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
      detail: er.msg || 'Terjadi kesalahan saat menyimpan reminder',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}

function confirmDelete(row: ReminderItem) {
  confirm.require({
    message: `Hapus reminder ${normalizeTime(row.jam) || 'ini'}?`,
    header: 'Hapus Reminder',
    accept: async () => {
      try {
        await client(`/api/reminder-cs/${row.id}`, {
          method: 'DELETE',
        })

        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Reminder berhasil dihapus',
          life: 3000,
        })

        await loadData()
      } catch (error) {
        const er = useSanctumError(error)
        toast.add({
          severity: 'error',
          summary: 'Gagal',
          detail: er.msg || 'Terjadi kesalahan saat menghapus reminder',
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

function applyFilter() {
  filters.page = 1
  loadData()
}

function onPaginate(event: { page: number; rows: number }) {
  filters.page = event.page + 1
  filters.per_page = event.rows
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-4">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div class="grid gap-3 md:grid-cols-[minmax(16rem,1fr)]">
        <div>
          <label class="mb-1 block text-sm font-medium">Cari Keterangan</label>
          <InputText
            v-model="filters.search"
            class="w-full"
            placeholder="Cari teks keterangan"
            size="small"
            @keyup.enter="applyFilter"
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
          Tambah
        </Button>
      </div>
    </div>

    <Card>
      <template #content>
        <DataTable
          :value="data.data"
          size="small"
          stripedRows
          :loading="loading"
          scrollable
          responsiveLayout="scroll"
          scrollHeight="70vh"
          class="text-sm"
        >
          <template #empty>
            <div class="py-10 text-center text-sm text-slate-500">
              Belum ada data reminder CS.
            </div>
          </template>

          <Column header="#" headerStyle="width: 4rem">
            <template #body="slotProps">
              {{ ((data.current_page || 1) - 1) * (data.per_page || filters.per_page) + slotProps.index + 1 }}
            </template>
          </Column>

          <Column field="jam" header="Jam" headerStyle="width: 8rem">
            <template #body="slotProps">
              {{ normalizeTime(slotProps.data.jam) || '-' }}
            </template>
          </Column>

          <Column field="keterangan" header="Keterangan">
            <template #body="slotProps">
              <div class="whitespace-pre-line leading-relaxed">
                {{ slotProps.data.keterangan || '-' }}
              </div>
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

        <Paginator
          :rows="data.per_page || filters.per_page"
          :totalRecords="data.total || 0"
          :rowsPerPageOptions="[10, 20, 50, 100]"
          @page="onPaginate"
          :pt="{
            root: (event: any) => {
              const itemForPage = data.per_page || filters.per_page
              const currentPage = (data.current_page || filters.page) - 1
              event.state.d_first = itemForPage * currentPage
            },
          }"
        />
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
          <label class="mb-1 block text-sm font-medium" for="jam">Jam</label>
          <InputText
            id="jam"
            v-model="form.jam"
            type="text"
            class="w-full"
          />
          <Message v-if="errors.jam" severity="error" size="small" class="mt-1">
            {{ Array.isArray(errors.jam) ? errors.jam[0] : errors.jam }}
          </Message>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="keterangan">Keterangan</label>
          <Textarea
            id="keterangan"
            v-model="form.keterangan"
            class="w-full"
            rows="6"
            placeholder="Masukkan keterangan reminder"
          />
          <Message v-if="errors.keterangan" severity="error" size="small" class="mt-1">
            {{ Array.isArray(errors.keterangan) ? errors.keterangan[0] : errors.keterangan }}
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
