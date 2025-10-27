<template>
    <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
            <div>
                <label
                    for="title"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Judul Todo <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="title"
                    v-model="form.title"
                    placeholder="Masukkan judul todo"
                    class="w-full"
                    :class="{ 'p-invalid': errors.title }"
                    required
                />
                <small v-if="errors.title" class="text-red-500">{{
                    errors.title
                }}</small>
            </div>

            <div>
                <label
                    for="description"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Deskripsi
                </label>
                <Textarea
                    id="description"
                    v-model="form.description"
                    placeholder="Masukkan deskripsi todo"
                    rows="4"
                    class="w-full"
                />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        for="priority"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Prioritas
                    </label>
                    <Select
                        id="priority"
                        v-model="form.priority"
                        :options="priorityOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Pilih prioritas"
                        class="w-full"
                    />
                </div>

                <div>
                    <label
                        for="category_id"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Kategori
                    </label>
                    <Select
                        id="category_id"
                        v-model="form.category_id"
                        :options="opsiCategories"
                        optionLabel="name"
                        optionValue="id"
                        showClear
                        placeholder="Pilih kategori"
                        class="w-full"
                    />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        for="due_date"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Deadline
                    </label>
                    <DatePicker
                        id="due_date"
                        v-model="form.due_date"
                        dateFormat="yy-mm-dd"
                        :minDate="new Date()"
                        placeholder="Pilih deadline"
                        class="w-full"
                    />
                </div>

                <div class="flex items-center gap-4 pt-6">
                    <div class="flex items-center">
                        <Checkbox
                            id="is_private"
                            v-model="form.is_private"
                            binary
                        />
                        <label
                            for="is_private"
                            class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                            Private
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <label
                    for="notes"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Catatan Tambahan
                </label>
                <Textarea
                    id="notes"
                    v-model="form.notes"
                    placeholder="Masukkan catatan tambahan"
                    rows="2"
                    class="w-full"
                />
            </div>
        </div>

        <!-- Assignments -->

        <div
            class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6"
        >
            <div>
                <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Assign ke <span class="text-red-500">*</span>
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Pilih user atau role yang akan ditugaskan untuk mengerjakan
                    todo ini
                </p>

                <!-- Assignment Type Selection -->
                <div class="mb-4">
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                    >
                        Pilih Tipe Assignment:
                    </label>
                    <div class="space-y-3">
                        <!-- Option 1: Diri Sendiri -->
                        <div
                            class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            :class="{
                                'border-blue-500 bg-blue-50 dark:bg-blue-900/20':
                                    assignmentType === 'self',
                            }"
                        >
                            <RadioButton
                                v-model="assignmentType"
                                inputId="assign-self"
                                value="self"
                                class="mr-3"
                            />
                            <label
                                for="assign-self"
                                class="flex items-center cursor-pointer flex-1"
                            >
                                <span class="text-lg mr-2">📝</span>
                                <div>
                                    <div
                                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Untuk Diri Sendiri
                                    </div>
                                    <div
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        Todo pribadi untuk
                                        {{ currentUser?.name || "Anda" }}
                                    </div>
                                </div>
                            </label>
                        </div>

                        <!-- Option 2: Untuk Role -->
                        <div
                            class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            :class="{
                                'border-blue-500 bg-blue-50 dark:bg-blue-900/20':
                                    assignmentType === 'role',
                            }"
                        >
                            <RadioButton
                                v-model="assignmentType"
                                inputId="assign-role"
                                value="role"
                                class="mr-3"
                            />
                            <label
                                for="assign-role"
                                class="flex items-center cursor-pointer flex-1"
                            >
                                <span class="text-lg mr-2">👥</span>
                                <div>
                                    <div
                                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Untuk Role Departemen
                                    </div>
                                    <div
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        Assign ke seluruh anggota role
                                    </div>
                                </div>
                            </label>
                        </div>

                        <!-- Option 3: User Lain -->
                        <div
                            class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            :class="{
                                'border-blue-500 bg-blue-50 dark:bg-blue-900/20':
                                    assignmentType === 'user',
                            }"
                        >
                            <RadioButton
                                v-model="assignmentType"
                                inputId="assign-user"
                                value="user"
                                class="mr-3"
                            />
                            <label
                                for="assign-user"
                                class="flex items-center cursor-pointer flex-1"
                            >
                                <span class="text-lg mr-2">👤</span>
                                <div>
                                    <div
                                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Untuk User Lain
                                    </div>
                                    <div
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        Assign ke user spesifik (selain diri
                                        sendiri)
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Dynamic Content Based on Assignment Type -->
                <!-- Role Selection -->
                <div v-if="assignmentType === 'role'" class="mb-4">
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Pilih Role:
                    </label>
                    <MultiSelect
                        v-model="selectedRolesModel"
                        :options="opsiRoles"
                        optionLabel="label"
                        optionValue="id"
                        showClear
                        filter
                        placeholder="Pilih role yang akan ditugaskan"
                        class="w-full"
                    />
                </div>

                <!-- User Selection -->
                <div v-if="assignmentType === 'user'" class="mb-4">
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Pilih User Lain:
                    </label>
                    <MultiSelect
                        v-model="selectedUsersModel"
                        :options="opsiUsersFilter"
                        optionLabel="label"
                        optionValue="value"
                        showClear
                        filter
                        placeholder="Pilih user yang akan ditugaskan"
                        class="w-full"
                    >
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <img
                                    :alt="slotProps.option.label"
                                    :src="slotProps.option.avatar"
                                    class="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                                <div>{{ slotProps.option.label }}</div>
                            </div>
                        </template>
                        <template #empty>
                            <div class="p-2 text-gray-500">
                                Tidak ada user tersedia
                            </div>
                        </template>
                    </MultiSelect>
                </div>

                <small v-if="errors.assignments" class="text-red-500">{{
                    errors.assignments
                }}</small>
            </div>
        </div>

        <!-- Actions -->
        <div
            class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
            <Button
                type="button"
                @click="$emit('cancel')"
                outlined
                severity="secondary"
                :disabled="loading"
            >
                Batal
            </Button>
            <Button
                type="submit"
                :loading="loading"
                :disabled="assignmentType.length === 0"
            >
                <Icon name="lucide:save" />
                {{ action === "create" ? "Buat Todo" : "Update Todo" }}
            </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
const props = defineProps<{
    action: "create" | "edit";
    todo?: any;
}>();

const emit = defineEmits<{
    success: [];
    cancel: [];
}>();

import { useDayjs } from "#dayjs";
const dayjs = useDayjs();

// Use the todo composable for API calls
const { addTodo, editTodo } = useTodoList();
const toast = useToast();
const client = useSanctumClient();

// Get current user from auth
interface User {
    id: number;
    name: string;
    email: string;
}
const currentUser = useSanctumUser<User>() as any;

// Fetch users and roles options
const { data: opsiUsers } = (await useAsyncData(
    "opsi-users-todoform",
    () => client("/api/data_opsi/users"),
    { default: () => [] },
)) as any;

const { data: opsiRoles } = (await useAsyncData(
    "opsi-roles-todoform",
    () => client("/api/option/roles"),
    { default: () => [] },
)) as any;

// State
const loading = ref(false);
const selectedUsers = ref<any[]>([]);
const selectedRoles = ref<any[]>([]);
const includeMe = ref(false);
const assignmentType = ref<"self" | "role" | "user">("self");

// Create reactive getters/setters for Select components
const selectedUsersModel = computed({
    get: () => selectedUsers.value,
    set: (value) => {
        console.log("selectedUsersModel setter called with:", value);
        selectedUsers.value = Array.isArray(value)
            ? value
            : value
              ? [value]
              : [];
        console.log("selectedUsers.value after setter:", selectedUsers.value);
    },
});

const selectedRolesModel = computed({
    get: () => selectedRoles.value,
    set: (value) => {
        console.log("selectedRolesModel setter called with:", value);
        selectedRoles.value = Array.isArray(value)
            ? value
            : value
              ? [value]
              : [];
        console.log("selectedRoles.value after setter:", selectedRoles.value);
    },
});

// Form
const form = reactive({
    title: "",
    description: "",
    priority: "medium",
    due_date: null,
    category_id: null,
    is_private: false,
    notes: "",
});

const errors = ref<Record<string, string>>({});

// Options
const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
];

// Computed
const opsiUsersFilter = computed(() => {
    const filtered = opsiUsers.value.filter(
        (user: any) => user.value !== currentUser.value?.id,
    );
    return filtered;
});

const assignments = computed(() => {
    const result = [];

    console.log("=== Debug Assignments ===");
    console.log("assignmentType:", assignmentType.value);
    console.log("selectedUsers:", selectedUsers.value);
    console.log("selectedRoles:", selectedRoles.value);
    console.log("selectedUsers type:", typeof selectedUsers.value);
    console.log("selectedUsers is array:", Array.isArray(selectedUsers.value));

    // Based on assignment type
    if (assignmentType.value === "self" && currentUser.value) {
        result.push({
            type: "user",
            id: currentUser.value.id,
        });
    }

    // Add selected users - more detailed check
    if (assignmentType.value === "user") {
        console.log("Assignment type is user, checking selectedUsers...");
        if (selectedUsers.value) {
            console.log("selectedUsers.value exists");
            console.log(
                "selectedUsers.value length:",
                selectedUsers.value.length,
            );

            if (selectedUsers.value.length > 0) {
                console.log("Processing selected users...");
                // Handle both array and single value cases
                const usersArray = Array.isArray(selectedUsers.value)
                    ? selectedUsers.value
                    : [selectedUsers.value];
                console.log("usersArray:", usersArray);

                usersArray.forEach((userId) => {
                    if (userId) {
                        // Skip null/undefined values
                        console.log("Adding user:", userId);
                        result.push({
                            type: "user",
                            id: userId,
                        });
                    }
                });
            } else {
                console.log("selectedUsers.value is empty");
            }
        } else {
            console.log("selectedUsers.value is null/undefined");
        }
    }

    // Add selected roles - simplified condition
    if (assignmentType.value === "role" && selectedRoles.value?.length > 0) {
        // Handle both array and single value cases
        const rolesArray = Array.isArray(selectedRoles.value)
            ? selectedRoles.value
            : [selectedRoles.value];
        rolesArray.forEach((roleId) => {
            if (roleId) {
                // Skip null/undefined values
                result.push({
                    type: "role",
                    id: roleId,
                });
            }
        });
    }

    // Handle mixed assignments case (when assignmentType is 'user' but we also have roles)
    if (assignmentType.value === "user" && selectedRoles.value?.length > 0) {
        // Handle both array and single value cases
        const rolesArray = Array.isArray(selectedRoles.value)
            ? selectedRoles.value
            : [selectedRoles.value];
        rolesArray.forEach((roleId) => {
            if (roleId) {
                // Skip null/undefined values
                result.push({
                    type: "role",
                    id: roleId,
                });
            }
        });
    }

    return result;
});

// Methods
const opsiCategories = ref<any[]>([]);
const loadCategories = async () => {
    try {
        const response = (await client(`api/todo_categories`)) as any;
        opsiCategories.value = response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

const validateForm = () => {
    errors.value = {};

    if (!form.title.trim()) {
        errors.value.title = "Judul todo harus diisi";
    }

    if (assignments.value.length === 0) {
        errors.value.assignments =
            "Pilih minimal satu user atau role untuk diassign";
    }

    return Object.keys(errors.value).length === 0;
};

const submitForm = async () => {
    if (!validateForm()) {
        return;
    }

    loading.value = true;

    try {
        const payload = {
            title: form.title.trim(),
            description: form.description?.trim() || undefined,
            priority: form.priority as "low" | "medium" | "high" | "urgent",
            due_date: form.due_date
                ? dayjs(form.due_date).local().format("YYYY-MM-DD")
                : undefined,
            category_id: form.category_id || undefined,
            is_private: form.is_private,
            notes: form.notes?.trim() || undefined,
            assignments: assignments.value,
        };

        if (props.action === "create") {
            await addTodo(payload);

            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Todo berhasil dibuat",
                life: 3000,
            });
        } else if (props.todo) {
            await editTodo(props.todo.id, payload);

            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Todo berhasil diupdate",
                life: 3000,
            });
        }

        emit("success");
    } catch (error: any) {
        console.error("Error submitting form:", error);

        if (error.data?.errors) {
            // Handle Laravel validation errors
            errors.value = {};
            Object.keys(error.data.errors).forEach((key) => {
                errors.value[key] = error.data.errors[key][0];
            });
        } else {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: error.data?.message || "Gagal menyimpan todo",
                life: 3000,
            });
        }
    } finally {
        loading.value = false;
    }
};

const initializeForm = () => {
    if (props.action === "edit" && props.todo) {
        Object.assign(form, {
            title: props.todo.title || "",
            description: props.todo.description || "",
            priority: props.todo.priority || "medium",
            due_date: props.todo.due_date
                ? new Date(props.todo.due_date)
                : null,
            category_id: props.todo.category?.id || null,
            is_private: props.todo.is_private || false,
            notes: props.todo.notes || "",
        });

        // Set assignments from todo (determine assignment type based on existing assignments)
        let assignmentsSummary = props.todo.assignments_summary;

        // Convert assignments format to assignments_summary if not available
        if (!assignmentsSummary && props.todo.assignments) {
            assignmentsSummary = {
                users: [],
                roles: [],
            };

            props.todo.assignments.forEach((assignment: any) => {
                if (assignment.tipe === "User" && assignment.assignable) {
                    assignmentsSummary.users.push({
                        id: assignment.assignable.id,
                        name: assignment.assignable.name,
                        avatar: assignment.assignable.avatar,
                    });
                } else if (
                    assignment.tipe === "Role" &&
                    assignment.assignable
                ) {
                    assignmentsSummary.roles.push({
                        id: assignment.assignable.id,
                        name: assignment.assignable.name,
                    });
                }
            });
        }

        if (assignmentsSummary) {
            const hasCurrentUser =
                currentUser.value &&
                assignmentsSummary.users.some(
                    (u: any) => u.id === currentUser.value.id,
                );
            const hasOtherUsers = assignmentsSummary.users.some(
                (u: any) => u.id !== currentUser.value?.id,
            );
            const hasRoles =
                assignmentsSummary.roles && assignmentsSummary.roles.length > 0;

            // Determine assignment type based on existing assignments
            if (hasCurrentUser && !hasOtherUsers && !hasRoles) {
                // Only assigned to current user
                assignmentType.value = "self";
            } else if (hasRoles && !hasOtherUsers) {
                // Has roles but no other users
                assignmentType.value = "role";
                selectedRoles.value = Array.isArray(assignmentsSummary.roles)
                    ? assignmentsSummary.roles.map((r: any) => r.id)
                    : [];
            } else if (hasOtherUsers && !hasRoles) {
                // Has other users but no roles
                assignmentType.value = "user";
                selectedUsers.value = assignmentsSummary.users
                    .filter((u: any) => u.id !== currentUser.value?.id)
                    .map((u: any) => u.id);
            } else {
                // Mixed or complex assignments - default to user type
                assignmentType.value = "user";
                selectedUsers.value = assignmentsSummary.users
                    .filter((u: any) => u.id !== currentUser.value?.id)
                    .map((u: any) => u.id);
                selectedRoles.value = Array.isArray(assignmentsSummary.roles)
                    ? assignmentsSummary.roles.map((r: any) => r.id)
                    : [];
            }
        }
    } else {
        // Reset form for create
        Object.assign(form, {
            title: "",
            description: "",
            priority: "medium",
            due_date: null,
            category_id: null,
            is_private: false,
            notes: "",
        });

        selectedUsers.value = [];
        selectedRoles.value = [];
        includeMe.value = false;
        assignmentType.value = "self";
    }
};

// Watchers
watch(
    () => props.todo,
    () => {
        initializeForm();
    },
    { immediate: true },
);

// Initialize
onMounted(() => {
    loadCategories();
    initializeForm();
});
</script>
