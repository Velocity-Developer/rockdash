<template>
    <div class="space-y-4">
        <!-- Tab Navigation -->
        <div
            class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    @click="switchTab(tab.key)"
                    :class="[
                        activeTab === tab.key
                            ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                        'whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors',
                    ]"
                >
                    <Icon :name="tab.icon" class="w-4 h-4 mr-2" />
                    {{ tab.label }}
                    <Badge
                        v-if="tab.count > 0"
                        :value="tab.count"
                        class="ml-2"
                    />
                </button>
            </nav>
            <Button @click="openCreateDialog" size="small" :loading="loading">
                <Icon name="lucide:plus" />
                Todo Baru
            </Button>
        </div>

        <!-- Statistics Cards -->
        <div
            v-if="statistics && activeTab === 'my'"
            class="overflow-x-auto"
            >
            <div class="flex items-center gap-2 md:justify-between py-1">
                <Card>
                    <template #content>
                        <div class="flex items-center min-w-[200px]">
                            <div
                                class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg"
                            >
                                <Icon
                                    name="lucide:loader"
                                    class="w-6 h-6 text-blue-600 dark:text-blue-300"
                                />
                            </div>
                            <div class="ml-4">
                                <p
                                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                                >
                                    Dalam Progres
                                </p>
                                <p
                                    class="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    {{ statistics.in_progress_count || 0 }}
                                </p>
                            </div>
                        </div>
                    </template>
                </Card>
                <Card>
                    <template #content>
                        <div class="flex items-center min-w-[200px]">
                            <div
                                class="p-3 bg-red-100 dark:bg-red-900 rounded-lg"
                            >
                                <Icon
                                    name="lucide:alert-triangle"
                                    class="w-6 h-6 text-red-600 dark:text-red-300"
                                />
                            </div>
                            <div class="ml-4">
                                <p
                                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                                >
                                    Urgent
                                </p>
                                <p
                                    class="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    {{ statistics.assigned_urgent_count || 0 }}
                                </p>
                            </div>
                        </div>
                    </template>
                </Card>                
                <Card>
                    <template #content>
                        <div class="flex items-center min-w-[200px]">
                            <div
                                class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg"
                            >
                                <Icon
                                    name="lucide:clock"
                                    class="w-6 h-6 text-yellow-600 dark:text-yellow-300"
                                />
                            </div>
                            <div class="ml-4">
                                <p
                                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                                >
                                    Pending
                                </p>
                                <p
                                    class="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    {{ statistics.my_pending }}
                                </p>
                            </div>
                        </div>
                    </template>
                </Card>
                <Card>
                    <template #content>
                        <div class="flex items-center min-w-[200px]">
                            <div
                                class="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg"
                            >
                                <Icon
                                    name="lucide:user-check"
                                    class="w-6 h-6 text-orange-600 dark:text-orange-300"
                                />
                            </div>
                            <div class="ml-4">
                                <p
                                    class="text-sm font-medium text-gray-600 dark:text-gray-400"
                                >
                                    Ditugaskan
                                </p>
                                <p
                                    class="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    {{ statistics.assigned_count || 0 }}
                                </p>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Filters -->
        <Card>
            <template #content>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
                >
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
                            @click="loadTodos"
                            size="small"
                            :loading="loading"
                        >
                            <Icon
                                name="lucide:refresh-ccw"
                                :class="{ 'animate-spin': loading }"
                            />
                            Refresh
                        </Button>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Todo List -->
        <div class="space-y-3">
            <div
                v-if="loading && !todos.length"
                class="flex justify-center py-8"
            >
                <ProgressSpinner
                    style="width: 50px; height: 50px"
                    strokeWidth="8"
                />
            </div>

            <div v-else-if="!todos.length && !loading" class="text-center py-8">
                <Icon
                    name="lucide:inbox"
                    class="w-12 h-12 mx-auto text-gray-400 mb-4"
                />
                <p class="text-gray-600 dark:text-gray-400">
                    {{ getEmptyMessage() }}
                </p>
                <Button
                    v-if="activeTab === 'created'"
                    @click="openCreateDialog"
                    class="mt-4"
                >
                    <Icon name="lucide:plus" />
                    Buat Todo Baru
                </Button>
            </div>

            <Card v-else class="space-y-3">
                <template #content>
                    <DataTable
                        :value="todos"
                        scrollable
                        scrollHeight="42rem"
                        size="small"
                        class="text-xs"
                        stripedRows
                    >
                        <Column field="title" header="Judul">
                            <template #body="slotProps">
                                <span
                                    @click="viewTodo(slotProps.data)"
                                    class="cursor-pointer hover:underline"
                                >
                                    {{ slotProps.data.title }}
                                </span>

                                <div class="flex items-center gap-1">
                                    <div
                                        v-if="slotProps.data.category"
                                        class="mt-1"
                                    >
                                        <span class="noto-emoji">{{
                                            slotProps.data.category.icon || "⚙"
                                        }}</span>
                                        <span class="opacity-50">{{
                                            slotProps.data.category.name
                                        }}</span>
                                    </div>
                                    <div v-if="slotProps.data.creator" class="flex items-center gap-1">
                                        <Avatar
                                            shape="circle" size="small"
                                            class="!w-3 !h-3"
                                            :image="slotProps.data.creator?.avatar_url || ''"
                                        />
                                        {{ slotProps.data.creator.name }}
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <Column field="status" header="Status">
                            <template #body="slotProps">
                                <Badge
                                    :value="getStatusLabel(slotProps.data.status)"
                                    :severity="
                                        getStatusSeverity(slotProps.data.status)
                                    "
                                    size="small"
                                />
                            </template>
                        </Column>
                        <Column field="priority" header="Prioritas" class="capitalize">
                            <template #body="slotProps">
                                <Badge
                                    :value="getPriorityLabel(slotProps.data.priority)"
                                    :severity="
                                        getPrioritySeverity(slotProps.data.priority)
                                    "
                                    size="small"
                                />
                            </template>
                        </Column>
                        <Column field="due_date" header="Deadline">
                            <template #body="slotProps">
                                <div
                                    v-if="slotProps.data.due_date"
                                    class="text-xs"
                                >
                                    {{ slotProps.data.due_date }}
                                </div>

                                <!-- Overdue Indicator -->
                                <span v-if="slotProps.data.due_date">
                                    <span
                                        v-if="
                                            slotProps.data.due_date_days_left >
                                            0
                                        "
                                        class="text-green-600"
                                    >
                                        ({{ slotProps.data.due_date_days_left }}
                                        hari lagi)
                                    </span>
                                    <span
                                        v-else-if="
                                            slotProps.data
                                                .due_date_days_left === 0
                                        "
                                        class="text-yellow-600"
                                    >
                                        (hari ini)
                                    </span>
                                    <span v-else class="text-red-600">
                                        (telat
                                        {{
                                            Math.abs(
                                                slotProps.data
                                                    .due_date_days_left,
                                            )
                                        }}
                                        hari)
                                    </span>
                                </span>
                            </template>
                        </Column>
                        <Column field="description" header="Deskipsi">
                            <template #body="slotProps">
                                <div class="truncate max-w-[150px]">
                                    {{ purifyHtml(slotProps.data.description,40) }}
                                </div>
                            </template>
                        </Column>
                        <Column field="assign" header="Assignment">
                            <template #body="slotProps">
                                <AvatarGroup>
                                    <Avatar
                                        v-for="assignment in slotProps.data.assignments"
                                        shape="circle"
                                        size="small"
                                        class="!w-5 !h-5"
                                        v-tooltip="assignment.assignable?.name"
                                        v-bind="assignment.assignable?.avatar_url
                                            ? { image: assignment.assignable.avatar_url }
                                            : { label: assignment.assignable.name.charAt(0).toUpperCase() }"
                                    />
                                </AvatarGroup>
                            </template>
                        </Column>
                        <Column field="created_at" header="Dibuat" class="whitespace-nowrap">
                            <template #body="slotProps">
                                <div
                                    v-if="slotProps.data.created_at"
                                    class="text-xs"
                                >
                                    {{
                                        dayjs(slotProps.data.created_at).format(
                                            "YYYY-MM-DD",
                                        )
                                    }}
                                    <br />
                                    {{
                                        dayjs(slotProps.data.created_at).format(
                                            "HH:mm:ss",
                                        )
                                    }}
                                </div>
                            </template>
                        </Column>
                        <!-- <Column field="author" header="Author">
                            <template #body="slotProps">
                                <div
                                    v-if="slotProps.data.creator"
                                    class="text-xs"
                                >
                                    {{ slotProps.data.creator.name }}
                                </div>
                            </template>
                        </Column> -->
                        <Column field="act" header="" v-if="activeTab !== 'my'">
                            <template #body="slotProps">
                                <div class="flex items-center justify-end">
                                    <Button
                                        size="small"
                                        severity="primary"
                                        variant="text"
                                        class="px-1"
                                        @click="editTodo(slotProps.data)"
                                    >
                                        <Icon name="lucide:pen" />
                                    </Button>
                                    <Button
                                        size="small"
                                        severity="danger"
                                        variant="text"
                                        class="px-1"
                                        @click="confirmDelete(slotProps.data)"
                                    >
                                        <Icon name="lucide:trash" />
                                    </Button>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
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

        <!-- Todo Dialog (Create/Edit) -->
        <Dialog
            v-model:visible="showCreateDialog"
            modal
            :header="dialogMode === 'create' ? 'Buat Todo Baru' : 'Edit Todo'"
            :style="{ width: '60vw' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
            :draggable="false"
        >
            <TodoForm
                :action="dialogMode"
                :todo="selectedTodo"
                @success="handleFormSuccess"
                @cancel="handleFormCancel"
            />
        </Dialog>

        <!-- Todo Preview Dialog -->
        <Dialog
            v-model:visible="showPreviewDialog"
            modal
            header="Detail Todo"
            :style="{ width: '70vw' }"
            :breakpoints="{ '1199px': '85vw', '575px': '95vw' }"
            :draggable="false"
        >
            <TodoPreview
                v-if="selectedIdTodoPreview"
                :todo="selectedTodo || {}"
                :todoId="selectedIdTodoPreview"
                @close="showPreviewDialog = false"
            />
        </Dialog>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    title: "TodoList",
    description: "Kelola tugas dan assignment",
});

import { useDayjs } from "#dayjs";
const dayjs = useDayjs();
const client = useSanctumClient();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// State
const loading = ref(false);
const todos = ref<any[]>([]);
const statistics = ref<any>(null);
const pagination = ref<any>(null);
const categories = ref<any[]>([]);
const showCreateDialog = ref(false);
const showPreviewDialog = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const selectedTodo = ref<any>(null);
const selectedIdTodoPreview = ref<number>(0);

// Tabs
const activeTab = ref((route.query.tab as string) || "my");
const tabs = computed(() => [
    {
        key: "my",
        label: "Todo Saya",
        icon: "lucide:user",
        count: statistics.value?.my_total || 0,
    },
    {
        key: "created",
        label: "Saya Buat",
        icon: "lucide:plus-circle",
        count: statistics.value?.created_total || 0,
    },
]);

// get label status
const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
        pending: "Menunggu",
        assigned: "Ditugaskan",
        in_progress: "Progres",
        completed: "Selesai",
        declined: "Ditolak",
    };
    return labelMap[status] || status;
};

//get priority label
const getPriorityLabel = (priority: string) => {
    const labelMap: Record<string, string> = {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent",
    };
    return labelMap[priority] || priority;
};

//get priority severity
const getPrioritySeverity = (severity: string) => {
    const labelMap: Record<string, string> = {
        low: "secondary",
        medium: "info",
        high: "warn",
        urgent: "danger",
    };
    return labelMap[severity] || severity;
};

// Filters
const filters = reactive({
    search: (route.query.search as string) || "",
    status: (route.query.status as string) || "",
    priority: (route.query.priority as string) || "",
    category_id: (route.query.category_id as string) || "",
    page: parseInt(route.query.page as string) || 1,
    per_page: parseInt(route.query.per_page as string) || 10,
});

// Options
const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Ditugaskan", value: "assigned" },
    { label: "Progres", value: "in_progress" },
    { label: "Selesai", value: "completed" },
    { label: "Ditolak", value: "declined" },
];

const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
];

// Methods
const updateUrlParams = () => {
    const query: any = {};

    // Add tab parameter if not default
    if (activeTab.value !== "my") {
        query.tab = activeTab.value;
    }

    // Add filter parameters only if they have values
    if (filters.search) query.search = filters.search;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.category_id) query.category_id = filters.category_id;
    if (filters.page > 1) query.page = filters.page;
    if (filters.per_page !== 10) query.per_page = filters.per_page;

    router.push({
        path: route.path,
        query,
    });
};

const switchTab = async (tabKey: string) => {
    if (tabKey !== activeTab.value) {
        activeTab.value = tabKey;
        resetFilters();
        await Promise.all([loadTodos(), getStatistics()]);
    }
};

const getTodos = async () => {
    loading.value = true;

    try {
        const endpoint =
            activeTab.value === "my" ? "/api/todos/my" : "/api/todos/created";
        const response = (await client(endpoint, {
            params: {
                ...filters,
                pagination: "true",
            },
        })) as any;

        todos.value = response.data || [];
        pagination.value = response;
    } catch (error) {
        console.error("Error fetching todos:", error);
        useToast().add({
            severity: "error",
            summary: "Error",
            detail: "Gagal memuat todo",
            life: 3000,
        });
    } finally {
        loading.value = false;
    }

    await getStatistics();
};

const getCategories = async () => {
    try {
        const response = (await client("/api/todo_category")) as any;
        categories.value = response.data || [];
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
};

const getStatistics = async () => {
    try {
        const response = (await client("/api/todos/statistics")) as any;
        statistics.value = response.data || {};
    } catch (error) {
        console.error("Error fetching statistics:", error);
    }
};

const resetFilters = () => {
    Object.assign(filters, {
        search: "",
        status: "",
        priority: "",
        category_id: "",
        page: 1,
    });
    updateUrlParams();
};

// Separate function for getting todos without updating URL
const loadTodos = async () => {
    loading.value = true;

    try {
        const endpoint =
            activeTab.value === "my" ? "/api/todos/my" : "/api/todos/created";
        const response = (await client(endpoint, {
            params: {
                ...filters,
                pagination: "true",
            },
        })) as any;

        todos.value = response.data || [];
        pagination.value = response;
    } catch (error) {
        console.error("Error fetching todos:", error);
        useToast().add({
            severity: "error",
            summary: "Error",
            detail: "Gagal memuat todo",
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const onPageChange = (event: any) => {
    filters.page = event.page + 1;
    updateUrlParams();
    loadTodos();
};

const getEmptyMessage = () => {
    if (activeTab.value === "my") {
        return "Tidak ada todo yang ditugaskan kepada Anda";
    } else {
        return "Anda belum membuat todo apapun";
    }
};

const getStatusSeverity = (status: string) => {
    const severityMap: Record<string, any> = {
        assigned: "secondary",
        in_progress: "info",
        completed: "success",
        declined: "danger",
    };
    return severityMap[status] || "secondary";
};

// Dialog handlers
const handleFormSuccess = async () => {
    showCreateDialog.value = false;
    dialogMode.value = "create";
    selectedTodo.value = null;
    // Reload todos and statistics to show the updated/new item
    await Promise.all([loadTodos(), getStatistics()]);
};

const handleFormCancel = () => {
    showCreateDialog.value = false;
    dialogMode.value = "create";
    selectedTodo.value = null;
};

// Open create dialog
const openCreateDialog = () => {
    dialogMode.value = "create";
    selectedTodo.value = null;
    showCreateDialog.value = true;
};

// Open edit dialog
const editTodo = (todo: any) => {
    dialogMode.value = "edit";
    selectedTodo.value = todo;
    showCreateDialog.value = true;
};

// Open preview dialog
const viewTodo = (todo: any) => {
    selectedTodo.value = todo;
    showPreviewDialog.value = true;
    selectedIdTodoPreview.value = todo.id;
};

// Delete todo with confirmation
const confirmDelete = (todo: any) => {
    confirm.require({
        message: `Apakah Anda yakin ingin menghapus todo "${todo.title}"?`,
        header: "Konfirmasi Hapus",
        icon: "pi pi-exclamation-triangle",
        rejectClass: "p-button-secondary p-button-outlined",
        rejectLabel: "Batal",
        acceptLabel: "Hapus",
        acceptClass: "p-button-danger",
        accept: () => {
            deleteTodo(todo.id);
        },
        reject: () => {
            // User cancelled, do nothing
        },
    });
};

// Delete todo API call
const deleteTodo = async (todoId: number) => {
    loading.value = true;

    try {
        await client(`/api/todos/${todoId}`, {
            method: "DELETE",
        });

        // Show success toast
        toast.add({
            severity: "success",
            summary: "Berhasil",
            detail: "Todo berhasil dihapus",
            life: 3000,
        });

        // Reload todos and statistics to update the list
        await Promise.all([loadTodos(), getStatistics()]);
    } catch (error) {
        console.error("Error deleting todo:", error);

        // Show error toast
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Gagal menghapus todo",
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

// Watchers
watch(
    () => route.query.tab,
    (newTab) => {
        if (newTab && newTab !== activeTab.value) {
            activeTab.value = newTab as string;
            resetFilters();
        }
    },
);

watch(
    () => filters.search,
    (newVal, oldVal) => {
        if (newVal !== oldVal) {
            filters.page = 1;
            updateUrlParams();
            loadTodos();
        }
    },
);

watch(
    () => filters.status,
    (newVal, oldVal) => {
        if (newVal !== oldVal) {
            filters.page = 1;
            updateUrlParams();
            loadTodos();
        }
    },
);

watch(
    () => filters.priority,
    (newVal, oldVal) => {
        if (newVal !== oldVal) {
            filters.page = 1;
            updateUrlParams();
            loadTodos();
        }
    },
);

watch(
    () => filters.category_id,
    (newVal, oldVal) => {
        if (newVal !== oldVal) {
            filters.page = 1;
            updateUrlParams();
            loadTodos();
        }
    },
);

// Initialize
onMounted(async () => {
    await Promise.all([getCategories(), getStatistics(), loadTodos()]);

    //jika route.params.preview_todo ada, maka set selectedTodo.value = route.params.preview_todo
    if (route.query.preview_todo) {
        selectedIdTodoPreview.value = Number(route.query.preview_todo);
        showPreviewDialog.value = true;
    }
});
</script>
