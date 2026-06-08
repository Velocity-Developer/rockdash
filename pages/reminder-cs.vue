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
  __isNew?: boolean
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

const loading = ref(false)
const loadingSubmit = ref(false)
const editingId = ref<number | null>(null)
const errors = ref({} as Record<string, string[] | string>)

const filters = reactive({
  page: route.query.page ? Number(route.query.page) : 1,
  per_page: route.query.per_page ? Number(route.query.per_page) : 20,
  search: route.query.search ? String(route.query.search) : '',
  order_by: 'jam',
  order: 'asc',
})

const data = ref<PaginationResponse>({
  data: [],
  current_page: 1,
  per_page: 20,
  total: 0,
})

const newForm = reactive({
  jam: '',
  keterangan: '',
})

const editForm = reactive({
  jam: '',
  keterangan: '',
})

const tableRows = computed<ReminderItem[]>(() => {
  return [
    {
      id: 0,
      jam: newForm.jam,
      keterangan: newForm.keterangan,
      user_id: null,
      __isNew: true,
    },
    ...(data.value.data || []),
  ]
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

function updateRouteParams() {
  const query: Record<string, string> = {
    page: String(filters.page),
    per_page: String(filters.per_page),
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

function applyFilter() {
  filters.page = 1
  clearNewForm()
  cancelEdit()
  loadData()
}

function onPaginate(event: { page: number; rows: number }) {
  filters.page = event.page + 1
  filters.per_page = event.rows
  clearNewForm()
  cancelEdit()
  loadData()
}

function clearNewForm() {
  newForm.jam = ''
  newForm.keterangan = ''
  errors.value = {}
}

function startEdit(row: ReminderItem) {
  clearNewForm()
  errors.value = {}
  editingId.value = row.id
  editForm.jam = normalizeTime(row.jam)
  editForm.keterangan = row.keterangan || ''
}

function cancelEdit() {
  editingId.value = null
  editForm.jam = ''
  editForm.keterangan = ''
  errors.value = {}
}

async function saveNew() {
  loadingSubmit.value = true
  errors.value = {}

  try {
    await client('/api/reminder-cs', {
      method: 'POST',
      body: {
        jam: timeForApi(newForm.jam),
        keterangan: newForm.keterangan,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Reminder berhasil ditambahkan',
      life: 3000,
    })

    clearNewForm()
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

async function saveEdit(row: ReminderItem) {
  loadingSubmit.value = true
  errors.value = {}

  try {
    await client(`/api/reminder-cs/${row.id}`, {
      method: 'PUT',
      body: {
        jam: timeForApi(editForm.jam),
        keterangan: editForm.keterangan,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Reminder berhasil diperbarui',
      life: 3000,
    })

    cancelEdit()
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

async function deleteReminder(row: ReminderItem) {
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
}

function rowNumber(row: ReminderItem, index: number) {
  if (row.__isNew) return 'Baru'
  return ((data.value.current_page || 1) - 1) * (data.value.per_page || filters.per_page) + index
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
          <InputText
            v-model="filters.search"
            class="w-full"
            placeholder="Cari keterangan"
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
      </div>
    </div>

    <Card>
      <template #content>
        <DataTable
          :value="tableRows"
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
              <Tag v-if="slotProps.data.__isNew" severity="success">Baru</Tag>
              <span v-else>{{ rowNumber(slotProps.data, slotProps.index) }}</span>
            </template>
          </Column>

          <Column field="jam" header="Jam" headerStyle="width: 10rem">
            <template #body="slotProps">
              <InputText
                v-if="slotProps.data.__isNew"
                v-model="newForm.jam"
                type="text"
                class="w-full"
                size="small"
                placeholder="08:00"
              />
              <InputText
                v-else-if="editingId === slotProps.data.id"
                v-model="editForm.jam"
                type="text"
                class="w-full"
                size="small"
              />
              <span v-else>{{ normalizeTime(slotProps.data.jam) || '-' }}</span>
              <Message v-if="errors.jam && (slotProps.data.__isNew || editingId === slotProps.data.id)" severity="error" size="small" class="mt-1">
                {{ Array.isArray(errors.jam) ? errors.jam[0] : errors.jam }}
              </Message>
            </template>
          </Column>

          <Column field="keterangan" header="Keterangan">
            <template #body="slotProps">
              <div v-if="slotProps.data.__isNew">
                <Textarea
                  v-model="newForm.keterangan"
                  class="w-full"
                  rows="2"
                  autoResize
                  placeholder="Masukkan keterangan reminder"
                />
              </div>
              <div v-else-if="editingId === slotProps.data.id">
                <Textarea
                  v-model="editForm.keterangan"
                  class="w-full"
                  rows="2"
                  autoResize
                />
              </div>
              <div v-else class="whitespace-pre-line leading-relaxed">
                {{ slotProps.data.keterangan || '-' }}
              </div>
              <Message v-if="errors.keterangan && (slotProps.data.__isNew || editingId === slotProps.data.id)" severity="error" size="small" class="mt-1">
                {{ Array.isArray(errors.keterangan) ? errors.keterangan[0] : errors.keterangan }}
              </Message>
            </template>
          </Column>

          <Column header="" headerStyle="width: 9rem">
            <template #body="slotProps">
              <div v-if="slotProps.data.__isNew" class="flex justify-end gap-2">
                <Button size="small" severity="success" :loading="loadingSubmit" @click="saveNew">
                  <Icon name="lucide:check" />
                </Button>
                <Button size="small" severity="secondary" :disabled="loadingSubmit" @click="clearNewForm">
                  <Icon name="lucide:x" />
                </Button>
              </div>
              <div v-else-if="editingId === slotProps.data.id" class="flex justify-end gap-2">
                <Button size="small" severity="success" :loading="loadingSubmit" @click="saveEdit(slotProps.data)">
                  <Icon name="lucide:check" />
                </Button>
                <Button size="small" severity="secondary" :disabled="loadingSubmit" @click="cancelEdit">
                  <Icon name="lucide:x" />
                </Button>
              </div>
              <div v-else class="flex justify-end gap-2">
                <Button size="small" severity="info" @click="startEdit(slotProps.data)">
                  <Icon name="lucide:pencil" />
                </Button>
                <Button size="small" severity="danger" @click="deleteReminder(slotProps.data)">
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
  </div>
</template>

<style scoped></style>
