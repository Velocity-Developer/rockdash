<template>
    <div class="max-w-6xl mx-auto space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner
                style="width: 50px; height: 50px"
                strokeWidth="8"
            />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
            <Icon
                name="lucide:alert-circle"
                class="w-12 h-12 mx-auto text-red-500 mb-4"
            />
            <h2
                class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
                Error
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
            <Button @click="navigateTo('/todos')">
                <Icon name="lucide:arrow-left" />
                Kembali ke Todo List
            </Button>
        </div>

        <!-- Todo Details -->
        <div v-else-if="todo" class="space-y-6">
            <!-- Header -->
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <Button
                            @click="navigateTo('/todos')"
                            outlined
                            severity="secondary"
                            size="small"
                        >
                            <Icon name="lucide:arrow-left" />
                        </Button>
                        <h1
                            class="text-2xl font-bold text-gray-900 dark:text-white"
                        >
                            {{ todo.title }}
                        </h1>
                    </div>

                    <!-- Meta Information -->
                    <div
                        class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
                    >
                        <div class="flex items-center gap-1">
                            <Icon name="lucide:calendar" class="w-4 h-4" />
                            <span
                                >Dibuat {{ formatDate(todo.created_at) }}</span
                            >
                        </div>
                        <div class="flex items-center gap-1">
                            <Icon name="lucide:user" class="w-4 h-4" />
                            <span>Oleh {{ todo.creator?.name }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <Icon name="lucide:clock" class="w-4 h-4" />
                            <span
                                >Update {{ formatDate(todo.updated_at) }}</span
                            >
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                    <Button
                        v-if="todo.can?.update"
                        @click="showEditDialog = true"
                        size="small"
                        outlined
                    >
                        <Icon name="lucide:edit" />
                        Edit
                    </Button>
                    <Button
                        v-if="todo.can?.delete"
                        @click="confirmDelete"
                        size="small"
                        severity="danger"
                        outlined
                    >
                        <Icon name="lucide:trash" />
                        Hapus
                    </Button>
                </div>
            </div>

            <!-- Status & Priority Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Status -->
                <Card>
                    <template #content>
                        <div class="text-center">
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400 mb-1"
                            >
                                Status
                            </div>
                            <Badge
                                :value="todo.status_label"
                                :severity="getStatusSeverity(todo.status)"
                                size="large"
                            />
                        </div>
                    </template>
                </Card>

                <!-- Priority -->
                <Card>
                    <template #content>
                        <div class="text-center">
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400 mb-1"
                            >
                                Prioritas
                            </div>
                            <Badge
                                :value="todo.priority_label"
                                :severity="getPrioritySeverity(todo.priority)"
                                size="large"
                            />
                        </div>
                    </template>
                </Card>

                <!-- Progress -->
                <Card>
                    <template #content>
                        <div class="text-center">
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400 mb-1"
                            >
                                Progress
                            </div>
                            <div
                                class="text-2xl font-bold text-blue-600 dark:text-blue-400"
                            >
                                {{ todo.completion_percentage }}%
                            </div>
                            <div class="text-xs text-gray-500">
                                {{
                                    todo.assignments_summary?.completed_count ||
                                    0
                                }}/{{
                                    todo.assignments_summary?.total_count || 0
                                }}
                                selesai
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Description -->
                    <Card v-if="todo.description">
                        <template #header>
                            <h3
                                class="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                Deskripsi
                            </h3>
                        </template>
                        <template #content>
                            <div class="prose dark:prose-invert max-w-none">
                                <p>{{ todo.description }}</p>
                            </div>
                        </template>
                    </Card>

                    <!-- Notes -->
                    <Card v-if="todo.notes">
                        <template #header>
                            <h3
                                class="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                Catatan Tambahan
                            </h3>
                        </template>
                        <template #content>
                            <div class="prose dark:prose-invert max-w-none">
                                <p>{{ todo.notes }}</p>
                            </div>
                        </template>
                    </Card>

                    <!-- Assignments -->
                    <Card>
                        <template #header>
                            <div class="flex items-center justify-between">
                                <h3
                                    class="text-lg font-semibold text-gray-900 dark:text-white"
                                >
                                    Assignments
                                </h3>
                                <Button
                                    v-if="todo.can?.manage_assignments"
                                    @click="showAssignDialog = true"
                                    size="small"
                                    outlined
                                >
                                    <Icon name="lucide:user-plus" />
                                    Kelola Assignments
                                </Button>
                            </div>
                        </template>
                        <template #content>
                            <div
                                v-if="todo.assignments_summary"
                                class="space-y-4"
                            >
                                <!-- Progress Overview -->
                                <div>
                                    <div
                                        class="flex justify-between text-sm mb-2"
                                    >
                                        <span>Progress Keseluruhan</span>
                                        <span
                                            >{{
                                                todo.completion_percentage
                                            }}%</span
                                        >
                                    </div>
                                    <ProgressBar
                                        :value="todo.completion_percentage"
                                        class="h-3"
                                    />
                                </div>

                                <!-- User Assignments -->
                                <div
                                    v-if="
                                        todo.assignments_summary.users.length >
                                        0
                                    "
                                >
                                    <h4
                                        class="font-medium text-gray-900 dark:text-white mb-3"
                                    >
                                        User Assignments
                                    </h4>
                                    <div class="space-y-3">
                                        <div
                                            v-for="user in todo
                                                .assignments_summary.users"
                                            :key="user.id"
                                            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <div
                                                class="flex items-center gap-3"
                                            >
                                                <Avatar
                                                    :image="user.avatar"
                                                    :label="user.name"
                                                    size="small"
                                                />
                                                <div>
                                                    <div
                                                        class="font-medium text-gray-900 dark:text-white"
                                                    >
                                                        {{ user.name }}
                                                    </div>
                                                    <div
                                                        class="text-xs text-gray-500 dark:text-gray-400"
                                                    >
                                                        Assigned
                                                        {{
                                                            formatDate(
                                                                todo.assigned_at,
                                                            )
                                                        }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <Badge
                                                    :value="user.status_label"
                                                    :severity="
                                                        getAssignmentStatusSeverity(
                                                            user.status,
                                                        )
                                                    "
                                                    size="small"
                                                />
                                                <Dropdown
                                                    v-if="
                                                        canUpdateAssignmentStatus(
                                                            user,
                                                        )
                                                    "
                                                    :options="statusOptions"
                                                    optionLabel="label"
                                                    optionValue="value"
                                                    placeholder="Update"
                                                    size="small"
                                                    @change="
                                                        updateAssignmentStatus(
                                                            user.id,
                                                            $event.value,
                                                        )
                                                    "
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Role Assignments -->
                                <div
                                    v-if="
                                        todo.assignments_summary.roles.length >
                                        0
                                    "
                                >
                                    <h4
                                        class="font-medium text-gray-900 dark:text-white mb-3"
                                    >
                                        Role Assignments
                                    </h4>
                                    <div class="space-y-3">
                                        <div
                                            v-for="role in todo
                                                .assignments_summary.roles"
                                            :key="role.id"
                                            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <div
                                                class="flex items-center gap-3"
                                            >
                                                <div
                                                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                                >
                                                    <Icon
                                                        name="lucide:users"
                                                        class="w-4 h-4"
                                                    />
                                                </div>
                                                <div>
                                                    <div
                                                        class="font-medium text-gray-900 dark:text-white"
                                                    >
                                                        {{ role.name }}
                                                    </div>
                                                    <div
                                                        class="text-xs text-gray-500 dark:text-gray-400"
                                                    >
                                                        {{ role.user_count }}
                                                        user terassign
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                :value="role.status_label"
                                                :severity="
                                                    getAssignmentStatusSeverity(
                                                        role.status,
                                                    )
                                                "
                                                size="small"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <!-- No Assignments -->
                                <div
                                    v-if="
                                        !todo.assignments_summary.users
                                            .length &&
                                        !todo.assignments_summary.roles.length
                                    "
                                    class="text-center py-8"
                                >
                                    <Icon
                                        name="lucide:users"
                                        class="w-8 h-8 mx-auto text-gray-400 mb-2"
                                    />
                                    <p
                                        class="text-sm text-gray-500 dark:text-gray-400"
                                    >
                                        Belum ada assignments
                                    </p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Category -->
                    <Card v-if="todo.category">
                        <template #header>
                            <h3
                                class="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                Kategori
                            </h3>
                        </template>
                        <template #content>
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 flex items-center justify-center rounded-lg"
                                    :style="{
                                        backgroundColor:
                                            todo.category.color + '20',
                                        color: todo.category.color,
                                    }"
                                >
                                    <Icon
                                        :name="
                                            todo.category.icon || 'lucide:tag'
                                        "
                                        class="w-5 h-5"
                                    />
                                </div>
                                <div>
                                    <div
                                        class="font-medium text-gray-900 dark:text-white"
                                    >
                                        {{ todo.category.name }}
                                    </div>
                                    <div
                                        v-if="todo.category.description"
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        {{ todo.category.description }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Deadline -->
                    <Card v-if="todo.due_date">
                        <template #header>
                            <h3
                                class="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                Deadline
                            </h3>
                        </template>
                        <template #content>
                            <div class="space-y-2">
                                <div class="flex items-center gap-2">
                                    <Icon
                                        name="lucide:calendar"
                                        class="w-4 h-4 text-gray-500"
                                    />
                                    <span>{{ formatDate(todo.due_date) }}</span>
                                </div>
                                <div
                                    v-if="todo.due_date_days_left !== undefined"
                                    class="text-sm"
                                >
                                    <span
                                        v-if="todo.due_date_days_left > 0"
                                        class="text-green-600"
                                    >
                                        {{ todo.due_date_days_left }} hari lagi
                                    </span>
                                    <span
                                        v-else-if="
                                            todo.due_date_days_left === 0
                                        "
                                        class="text-yellow-600"
                                    >
                                        Hari ini
                                    </span>
                                    <span v-else class="text-red-600">
                                        Telat
                                        {{ Math.abs(todo.due_date_days_left) }}
                                        hari
                                    </span>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Visibility -->
                    <Card>
                        <template #header>
                            <h3
                                class="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                Visibility
                            </h3>
                        </template>
                        <template #content>
                            <div class="flex items-center gap-2">
                                <Icon
                                    :name="
                                        todo.is_private
                                            ? 'lucide:lock'
                                            : 'lucide:unlock'
                                    "
                                    class="w-4 h-4"
                                />
                                <span>{{
                                    todo.is_private ? "Private" : "Public"
                                }}</span>
                            </div>
                            <p
                                v-if="todo.is_private"
                                class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                            >
                                Hanya Anda dan user yang diassign yang bisa
                                melihat todo ini
                            </p>
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- Edit Dialog -->
        <Dialog
            v-model:visible="showEditDialog"
            modal
            header="Edit Todo"
            :style="{ width: '60rem' }"
            :breakpoints="{ '1199px': '75vw', '768px': '90vw' }"
        >
            <TodoForm
                action="edit"
                :todo="todo"
                @success="handleEditSuccess"
                @cancel="showEditDialog = false"
            />
        </Dialog>

        <!-- Manage Assignments Dialog -->
        <Dialog
            v-model:visible="showAssignDialog"
            modal
            header="Kelola Assignments"
            :style="{ width: '50rem' }"
            :breakpoints="{ '1199px': '75vw', '768px': '90vw' }"
        >
            <ManageAssignments
                :todo="todo"
                @success="handleAssignmentSuccess"
                @cancel="showAssignDialog = false"
            />
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";

definePageMeta({
    title: "Todo Detail",
    description: "Detail todo dan assignments",
});

const route = useRoute();
const router = useRouter();
const client = useSanctumClient();
const toast = useToast();
const user = useSanctumUser<User>();

// State
const loading = ref(true);
const error = ref("");
const todo = ref<any>(null);
const showEditDialog = ref(false);
const showAssignDialog = ref(false);

// Options
const statusOptions = [
    { label: "Assigned", value: "assigned" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Declined", value: "declined" },
];

// Methods
const getTodo = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = (await client(`/api/todos/${route.params.id}`)) as any;
        todo.value = response;
    } catch (err: any) {
        console.error("Error fetching todo:", err);
        error.value = err.response?.data?.message || "Gagal memuat todo";
    } finally {
        loading.value = false;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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

const getPrioritySeverity = (priority: string) => {
    const severityMap: Record<string, any> = {
        low: "secondary",
        medium: "info",
        high: "warning",
        urgent: "danger",
    };
    return severityMap[priority] || "secondary";
};

const getAssignmentStatusSeverity = (status: string) => {
    const severityMap: Record<string, any> = {
        assigned: "secondary",
        in_progress: "info",
        completed: "success",
        declined: "danger",
    };
    return severityMap[status] || "secondary";
};

const canUpdateAssignmentStatus = (userAssignment: any) => {
    // User can update their own assignment status
    if (userAssignment.id === user.value?.id) {
        return true;
    }

    // Creator can update any assignment status
    if (todo.value?.created_by === user.value?.id) {
        return true;
    }

    return false;
};

const updateAssignmentStatus = async (userId: number, newStatus: string) => {
    try {
        // Find the assignment for this user
        const assignment = todo.value?.assignments?.find(
            (a: any) =>
                a.assignable_type === "user" && a.assignable_id === userId,
        );

        if (!assignment) {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: "Assignment tidak ditemukan",
                life: 3000,
            });
            return;
        }

        await client(
            `/api/todos/${todo.value.id}/assignments/${assignment.id}/status`,
            {
                method: "PUT",
                body: { status: newStatus },
            },
        );

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Status berhasil diperbarui",
            life: 3000,
        });

        // Refresh todo data
        await getTodo();
    } catch (error: any) {
        console.error("Error updating status:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.data?.message || "Gagal memperbarui status",
            life: 3000,
        });
    }
};

const confirmDelete = () => {
    useConfirm().require({
        message: "Apakah Anda yakin ingin menghapus todo ini?",
        header: "Konfirmasi Hapus",
        icon: "lucide:alert-triangle",
        accept: deleteTodo,
        reject: () => {
            // Do nothing
        },
    });
};

const deleteTodo = async () => {
    try {
        await client(`/api/todos/${todo.value?.id}`, {
            method: "DELETE",
        });

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Todo berhasil dihapus",
            life: 3000,
        });

        router.push("/todos");
    } catch (error: any) {
        console.error("Error deleting todo:", error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.data?.message || "Gagal menghapus todo",
            life: 3000,
        });
    }
};

const handleEditSuccess = () => {
    showEditDialog.value = false;
    getTodo();
    toast.add({
        severity: "success",
        summary: "Success",
        detail: "Todo berhasil diupdate",
        life: 3000,
    });
};

const handleAssignmentSuccess = () => {
    showAssignDialog.value = false;
    getTodo();
    toast.add({
        severity: "success",
        summary: "Success",
        detail: "Assignments berhasil diperbarui",
        life: 3000,
    });
};

// Initialize
onMounted(() => {
    getTodo();
});
</script>
