<template>
  <div class="space-y-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">TodoList</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Kelola tugas dan assignment</p>
      </div>
      <Button @click="navigateTo('/todos/create')" size="small" :loading="loading">
        <Icon name="lucide:plus" />
        Todo Baru
      </Button>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="switchTab(tab.key)"
          :class="[
            activeTab === tab.key
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors'
          ]"
        >
          <Icon :name="tab.icon" class="w-4 h-4 mr-2" />
          {{ tab.label }}
          <Badge v-if="tab.count > 0" :value="tab.count" class="ml-2" />
        </button>
      </nav>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics && activeTab === 'my'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Icon name="lucide:list-checks" class="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Todo</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ statistics.my_total }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Icon name="lucide:check-circle" class="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ statistics.my_completed }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Icon name="lucide:clock" class="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ statistics.my_pending }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Icon name="lucide:plus-circle" class="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Dibuat Saya</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ statistics.created_total }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Filters -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="lg:col-span-2">
            <IconField>
              <InputIcon>
                <Icon name="lucide:search" />
              </InputIcon>
              <InputText
                v-model="filters.search"
                placeholder="Cari todo..."
                class="w-full"
                @keyup.enter="getTodos"
              />
            </IconField>
          </div>

          <!-- Status Filter -->
          <Select
            v-model="filters.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            showClear
            placeholder="Semua Status"
            class="w-full"
          />

          <!-- Priority Filter -->
          <Select
            v-model="filters.priority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            showClear
            placeholder="Semua Prioritas"
            class="w-full"
          />

          <!-- Category Filter -->
          <Select
            v-model="filters.category_id"
            :options="categories"
            optionLabel="name"
            optionValue="id"
            showClear
            placeholder="Semua Kategori"
            class="w-full"
          />

          <!-- Action Buttons -->
          <div class="lg:col-span-5 flex justify-end gap-2">
            <Button
              @click="resetFilters"
              size="small"
              outlined
              severity="secondary"
            >
              <Icon name="lucide:rotate-ccw" />
              Reset
            </Button>
            <Button
              @click="getTodos"
              size="small"
              :loading="loading"
            >
              <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin': loading }" />
              Refresh
            </Button>
          </div>
        </div>
      </template>
    </Card>

    <!-- Todo List -->
    <div class="space-y-3">
      <div v-if="loading && !todos.length" class="flex justify-center py-8">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
      </div>

      <div v-else-if="!todos.length && !loading" class="text-center py-8">
        <Icon name="lucide:inbox" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          {{ getEmptyMessage() }}
        </p>
        <Button
          v-if="activeTab === 'created'"
          @click="navigateTo('/todos/create')"
          class="mt-4"
        >
          <Icon name="lucide:plus" />
          Buat Todo Baru
        </Button>
      </div>

      <div v-else class="space-y-3">
        <todosTodoCard
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @refresh="getTodos"
          @edit="navigateTo(`/todos/${todo.id}`)"
          @view="navigateTo(`/todos/${todo.id}`)"
        />
      </div>
    </div>

    <!-- Pagination -->
    <Card v-if="pagination && todos.length">
      <template #content>
        <Paginator
          :rows="pagination.per_page"
          :totalRecords="pagination.total"
          :first="(pagination.current_page - 1) * pagination.per_page"
          @page="onPageChange"
        />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'TodoList',
  description: 'Kelola tugas dan assignment',
})

const client = useSanctumClient()
const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const todos = ref<any[]>([])
const statistics = ref<any>(null)
const pagination = ref<any>(null)
const categories = ref<any[]>([])

// Tabs
const activeTab = ref(route.query.tab as string || 'my')
const tabs = computed(() => [
  {
    key: 'my',
    label: 'Todo Saya',
    icon: 'lucide:user',
    count: statistics.value?.my_total || 0
  },
  {
    key: 'created',
    label: 'Saya Buat',
    icon: 'lucide:plus-circle',
    count: statistics.value?.created_total || 0
  }
])

// Filters
const filters = reactive({
  search: '',
  status: '',
  priority: '',
  category_id: '',
  page: 1,
  per_page: 10
})

// Options
const statusOptions = [
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Declined', value: 'declined' }
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

// Methods
const switchTab = (tabKey: string) => {
  if (tabKey !== activeTab.value) {
    // Update URL first
    const query = { ...route.query }
    if (tabKey === 'my') {
      // Default tab, omit from URL for cleaner URLs
      delete query.tab
    } else {
      query.tab = tabKey
    }

    router.push({
      path: route.path,
      query
    })

    // Then update active tab (this will trigger the watcher that loads data)
    activeTab.value = tabKey
  }
}

const getTodos = async () => {
  loading.value = true

  try {
    const endpoint = activeTab.value === 'my' ? '/api/todos/my' : '/api/todos/created'
    const response = await client(endpoint, {
      params: {
        ...filters,
        pagination: 'true'
      }
    }) as any

    todos.value = response.data || []
    pagination.value = response

  } catch (error) {
    console.error('Error fetching todos:', error)
    useToast().add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat todo',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const getCategories = async () => {
  try {
    const response = await client('/api/todo_categories') as any
    categories.value = response.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    status: '',
    priority: '',
    category_id: '',
    page: 1
  })
  getTodos()
}

const onPageChange = (event: any) => {
  filters.page = event.page + 1
  getTodos()
}

const getEmptyMessage = () => {
  if (activeTab.value === 'my') {
    return 'Tidak ada todo yang ditugaskan kepada Anda'
  } else {
    return 'Anda belum membuat todo apapun'
  }
}

// Watchers
watch(() => route.query.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab as string
    resetFilters()
  }
  getTodos()
})

watch(() => filters.search, () => {
  filters.page = 1
  getTodos()
})

watch(() => filters.status, () => {
  filters.page = 1
  getTodos()
})

watch(() => filters.priority, () => {
  filters.page = 1
  getTodos()
})

watch(() => filters.category_id, () => {
  filters.page = 1
  getTodos()
})

// Initialize
onMounted(async () => {
  await Promise.all([
    getCategories(),
    getTodos(),
  ])
})
</script>