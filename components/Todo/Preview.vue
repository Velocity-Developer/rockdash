<script setup lang="ts">
interface Todo {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date?: string;
    due_date_days_left?: number;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
        icon?: string;
        color?: string;
    };
    creator?: {
        id: number;
        name: string;
        email: string;
        user_roles?: Array<{
            id: number;
            name: string;
        }>;
        avatar_url?: string;
    };
    assignments?: Array<{
        id: number;
        tipe: string;
        assignable: {
            id: number;
            name: string;
        };
    }>;
}

const props = defineProps<{
    todo: Todo;
}>();

const emit = defineEmits<{
    close: [];
    updateTodo: [todo: Todo];
}>();

// Import composables for API calls
const { editTodo } = useTodoList();
const client = useSanctumClient();
const toast = useToast()

// Loading and error states
const isUpdatingStatus = ref(false);
const statusUpdateError = ref<string | null>(null);

const useDayjs = () => {
    const dayjs = (date: string) => {
        return {
            format: (pattern: string) => {
                const d = new Date(date);
                if (pattern === "YYYY-MM-DD") {
                    return d.toISOString().split("T")[0];
                } else if (pattern === "HH:mm:ss") {
                    return d.toTimeString().split(" ")[0];
                } else if (pattern === "DD MMMM YYYY") {
                    return d.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    });
                }
                return d.toString();
            },
        };
    };
    return { dayjs };
};

const { dayjs } = useDayjs();

const getStatusSeverity = (status: string) => {
    const severityMap: Record<string, any> = {
        pending: "warning",
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
        medium: "warning",
        high: "danger",
        urgent: "danger",
    };
    return severityMap[priority] || "secondary";
};

const getPriorityLabel = (priority: string) => {
    const labelMap: Record<string, string> = {
        low: "Rendah",
        medium: "Sedang",
        high: "Tinggi",
        urgent: "Mendesak",
    };
    return labelMap[priority] || priority;
};

const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
        pending: "Menunggu",
        assigned: "Ditugaskan",
        in_progress: "Dalam Progres",
        completed: "Selesai",
        declined: "Ditolak",
    };
    return labelMap[status] || status;
};

const startWorkingOnTodo = async () => {
    if (isUpdatingStatus.value) return; // Prevent multiple simultaneous calls

    // Directly call handleStatusChange with 'in_progress' status
    // This will trigger TodoUser creation on the backend
    await handleStatusChange('in_progress');
};

const completeTodo = async () => {
    if (isUpdatingStatus.value) return; // Prevent multiple simultaneous calls

    await handleStatusChange('completed');
};

const cancelTodo = async () => {
    if (isUpdatingStatus.value) return; // Prevent multiple simultaneous calls

    // Show confirmation dialog
    const confirmed = confirm('Apakah Anda yakin ingin membatalkan pengerjaan todo ini? Data pengerjaan akan dihapus.');
    if (!confirmed) return;

    await handleStatusChange('assigned');
};

const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
        pending: 'lucide:clock',
        assigned: 'lucide:user-check',
        in_progress: 'lucide:play-circle',
        completed: 'lucide:check-circle',
        declined: 'lucide:x-circle',
        cancelled: 'lucide:ban'
    };
    return iconMap[status] || 'lucide:circle';
};

const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
        pending: 'text-orange-500',
        assigned: 'text-blue-500',
        in_progress: 'text-purple-500',
        completed: 'text-green-500',
        declined: 'text-red-500',
        cancelled: 'text-gray-500'
    };
    return colorMap[status] || 'text-gray-500';
};

const handleStatusChange = async (newStatus: string) => {
    if (isUpdatingStatus.value) return; // Prevent multiple simultaneous calls

    isUpdatingStatus.value = true;
    statusUpdateError.value = null;
    const oldStatus = props.todo.status;
    const updatedTodo = props.todo;

    try {
        // Update todo via API - convert status to match API expected type
        const apiStatus = newStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled';

        try {
            // Update todo assignments status
            const res = await client(`api/todos/update-status/${props.todo.id}`, {
                method: 'PUT',
                params: {
                    status: apiStatus
                }
            }) as any
            updatedTodo.status = res.data.status;

        } catch (error) {
            console.error('Failed to update assignments status:', error);
            throw error; // Re-throw to be caught in outer try-catch
        }

        // Create a simple todo object for emission with minimal conversion
        const todoForEmit: Todo = {
            ...props.todo,
            status: updatedTodo.status,
            updated_at: updatedTodo.updated_at
        };

        // Emit the updated todo to parent
        emit('updateTodo', todoForEmit);

        // Show success toast with context-specific message
        let successMessage = 'Status berhasil diperbarui';

        if (oldStatus === 'assigned' && newStatus === 'in_progress') {
            successMessage = 'Todo dimulai! Waktu pengerjaan telah dicatat.';
        } else if (oldStatus === 'in_progress' && newStatus === 'completed') {
            successMessage = 'Todo selesai! Great job! Waktu selesai telah dicatat.';
        } else if (oldStatus === 'in_progress' && newStatus === 'assigned') {
            successMessage = 'Todo dibatalkan. Data pengerjaan dan journal telah dihapus.';
        } else if (newStatus === 'completed') {
            successMessage = 'Todo selesai! Great job!';
        }

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: successMessage,
            life: 3000
        })
    } catch (error) {
        console.error('Failed to update status:', error);
        statusUpdateError.value = 'Gagal mengubah status. Silakan coba lagi.';

        // Optionally show error toast
        // You can import and use toast notification here
    } finally {
        isUpdatingStatus.value = false;
    }
};

</script>

<template>
    <div class="space-y-6">
        <div>
            <div class="opacity-75 mb-1">Judul</div>            
            <h1
                class="text-md md:text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight"
            >
                {{ todo.title }}
            </h1>
            <div class="flex justify-end gap-2 sm:gap-3 mt-1">
                <!-- Category -->
                <Badge v-if="todo.category" size="small" class="font-normal">
                    <span>{{ todo.category.icon || "📋" }}</span>
                    <span>
                        {{ todo.category.name }}
                    </span>
                </Badge>
                <Badge
                    :value="getStatusLabel(todo.status)"
                    :severity="getStatusSeverity(todo.status)"
                    size="small"
                />
                <Badge
                    :value="getPriorityLabel(todo.priority)"
                    :severity="getPrioritySeverity(todo.priority)"
                    size="small"
                />
            </div>

            <!-- Action Buttons -->
            <div>
                <div class="text-sm font-bold opacity-75 mb-2">Aksi Todo</div>

                <!-- Show "Kerjakan Todo" button when status is assigned -->
                <div v-if="todo.status === 'assigned'" class="space-y-2">
                    <Button
                        @click="startWorkingOnTodo"
                        :disabled="isUpdatingStatus"
                        severity="success"
                        class="w-full"
                        v-tooltip="'Mulai kerjakan todo dan catat waktu mulai'"
                    >
                        <Icon name="lucide:play" class="mr-2 w-4 h-4" />
                        Kerjakan Todo
                    </Button>
                </div>

                <!-- Show "Todo Selesai" and "Batalkan Todo" buttons when status is in_progress -->
                <div v-else-if="todo.status === 'in_progress'" class="flex justify-between gap-2">
                    <Button
                        @click="completeTodo"
                        :disabled="isUpdatingStatus"
                        severity="success"
                        class="w-full"
                        v-tooltip="'Tandai todo sebagai selesai'"
                    >
                        <Icon name="lucide:check-circle" class="mr-2 w-4 h-4" />
                        Todo Selesai
                    </Button>
                    <Button
                        @click="cancelTodo"
                        :disabled="isUpdatingStatus"
                        severity="danger"
                        class="w-full"
                        v-tooltip="'Batalkan pengerjaan todo'"
                    >
                        <Icon name="lucide:x-circle" class="mr-2 w-4 h-4" />
                        Batalkan Todo
                    </Button>
                </div>

                <!-- Show status info for other statuses -->
                <div v-else class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center space-x-2">
                        <Icon
                            :name="getStatusIcon(todo.status)"
                            :class="getStatusColor(todo.status)"
                            class="w-4 h-4"
                        />
                        <span class="font-medium capitalize">{{ getStatusLabel(todo.status) }}</span>
                    </div>
                </div>

                <!-- Error message -->
                <div v-if="statusUpdateError" class="mt-2 text-sm text-red-600">
                    {{ statusUpdateError }}
                </div>
            </div>
        </div>

        <div>
            <div class="opacity-75 mb-1">Deskripsi</div>
            <div
                class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-md"
            >
                <p class="text-md text-gray-700 dark:text-gray-300 mb-2">
                    {{ todo.description }}
                </p>
            </div>
        </div>

        <div>
            <div class="opacity-75 mb-1">Assigned To</div>
            <div>
                <div
                    v-if="todo.assignments && todo.assignments.length > 0"
                    class="space-y-2"
                >
                    <div
                        v-for="assignment in todo.assignments"
                        :key="assignment.id"
                        class="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
                    >
                        <div class="flex-shrink-0">
                            <Icon
                                :name="
                                    assignment.tipe === 'User'
                                        ? 'lucide:user'
                                        : 'lucide:layers'
                                "
                                class="w-5 h-5 text-teal-600 dark:text-teal-400"
                            />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p
                                class="font-medium text-gray-900 dark:text-white truncate"
                            >
                                {{ assignment.assignable?.name }}
                            </p>
                        </div>
                        <div class="flex-shrink-0">
                            <Badge
                                :value="assignment.tipe"
                                size="small"
                                severity="info"
                                class="text-xs"
                            />
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-8">
                    <Icon
                        name="lucide:user-minus"
                        class="w-12 h-12 text-gray-400 mx-auto mb-3"
                    />
                    <p class="text-gray-500 text-sm font-medium">
                        Tidak ada penugasan
                    </p>
                    <p class="text-gray-400 text-xs mt-1">
                        Todo ini belum ditugaskan kepada siapapun
                    </p>
                </div>
            </div>
        </div>

        <div>
            <div class="flex flex-col md:flex-row md:justify-between gap-2">
                <div>
                    <div class="opacity-75 mb-1">Deadline</div>
                    <div
                        v-if="todo.due_date"
                        class="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                        {{
                            dayjs(todo.due_date).format("DD MMMM YYYY") ||
                            "Belum ada deadline"
                        }}
                    </div>
                    <div
                        v-if="
                            todo.due_date &&
                            todo.due_date_days_left !== undefined
                        "
                    >
                        <div class="flex justify-start mt-1">
                            <Badge
                                v-if="todo.due_date_days_left > 0"
                                :value="`${todo.due_date_days_left} hari lagi`"
                                severity="success"
                            />
                            <Badge
                                v-else-if="todo.due_date_days_left === 0"
                                value="Hari ini"
                                severity="warning"
                            />
                            <Badge
                                v-else
                                :value="`Terlambat ${Math.abs(todo.due_date_days_left)} hari`"
                                severity="danger"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <div class="opacity-75 mb-1">Dibuat</div>
                    <span
                        class="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                        {{ dayjs(todo.created_at).format("DD MMMM YYYY") }}
                    </span>
                </div>
                <div>
                    <div class="opacity-75 mb-1">Diupdate</div>
                    <span
                        class="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                        {{ dayjs(todo.updated_at).format("DD MMMM YYYY") }}
                    </span>
                </div>
            </div>
        </div>

        <div>
            <div class="opacity-75 mb-1">Author</div>
            <div
                class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-md"
            >
                <div v-if="todo.creator" class="flex items-center space-x-4">
                    <Avatar
                        :src="todo.creator?.avatar_url || todo.creator.name.charAt(0).toUpperCase()"
                        class="w-12 h-12 bg-teal-500 text-white font-bold text-lg"
                        shape="circle"
                    />
                    <div class="flex-1 min-w-0">
                        <p
                            class="font-semibold text-gray-900 dark:text-white text-base"
                        >
                            {{ todo.creator.name }}
                        </p>
                        <p
                            v-if="todo.creator?.user_roles"
                            class="text-sm text-gray-600 dark:text-gray-400 truncate"
                        >
                            {{ todo.creator?.user_roles[0] }}
                        </p>
                    </div>
                </div>
                <div v-else class="text-center py-4">
                    <Icon
                        name="lucide:user-x"
                        class="w-12 h-12 text-gray-400 mx-auto mb-2"
                    />
                    <p class="text-gray-500 text-sm">
                        Tidak ada informasi pembuat
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-4 flex justify-end">
        <Button
            @click="emit('close')"
            severity="secondary"
            outlined
            class="px-6 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <Icon name="lucide:x" class="mr-2 w-4 h-4" />
            Tutup
        </Button>
    </div>
</template>

<style scoped>
.p-card {
    margin-bottom: 1rem;
}

.p-card:last-child {
    margin-bottom: 0;
}
</style>
