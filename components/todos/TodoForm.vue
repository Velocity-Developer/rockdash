<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <!-- Basic Information -->
    <div class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <label for="category_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <label for="due_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <label for="is_private" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Private
            </label>
          </div>
        </div>
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

    <div class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Assign ke <span class="text-red-500">*</span>
        </label>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Pilih user atau role yang akan ditugaskan untuk mengerjakan todo ini
        </p>

        <!-- Include Me Checkbox -->
        <div class="flex items-center mb-4">
          <Checkbox
            id="include_me"
            v-model="includeMe"
            binary
            @change="handleIncludeMeChange"
          />
          <label for="include_me" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Sertakan saya ({{ currentUser?.name }})
          </label>
        </div>

        <!-- Role Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role/Departemen
          </label>
          <Select
            v-model="selectedRoles"
            :options="opsiRoles"
            optionLabel="label"
            optionValue="value"
            showClear
            filter
            multiple
            placeholder="Pilih role yang akan ditugaskan"
            class="w-full"
          />
        </div>

        <!-- User Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User Spesifik
          </label>
          <Select
            v-model="selectedUsers"
            :options="opsiUsers"
            optionLabel="label"
            optionValue="value"
            showClear
            filter
            multiple
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
          </Select>
        </div>
       
        <!-- Assignment Summary -->
        <div v-if="assignments.length > 0" class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assignments ({{ assignments.length }}):
          </h4>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="assignment in assignments"
              :key="`${assignment.type}-${assignment.id}`"
              :value="getAssignmentLabel(assignment)"
              severity="info"
              class="text-xs"
            />
          </div>
        </div>

        <small v-if="errors.assignments" class="text-red-500">{{ errors.assignments }}</small>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
        :disabled="assignments.length === 0"
      >
        <Icon name="lucide:save" />
        {{ action === 'create' ? 'Buat Todo' : 'Update Todo' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  action: 'create' | 'edit'
  todo?: any
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

// Use the todo composable for API calls
const { addTodo, editTodo } = useTodoList()
const toast = useToast()
const client = useSanctumClient()

// Mock current user for now (this should come from auth)
const currentUser = ref({
  id: 1,
  name: 'admin'
})

// Fetch users and roles options
const { data: opsiUsers } = await useAsyncData(
  'opsi-users-todoform',
  () => client('/api/data_opsi/users'),
  { default: () => [] }
) as any

const { data: opsiRoles } = await useAsyncData(
  'opsi-roles-todoform',
  () => client('/api/option/roles'),
  { default: () => [] }
) as any

// State
const loading = ref(false)
const selectedUsers = ref<any[]>([])
const selectedRoles = ref<any[]>([])
const includeMe = ref(false)

// Form
const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  due_date: null,
  category_id: null,
  is_private: false,
  notes: ''
})

const errors = ref<Record<string, string>>({})

// Options
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

// Computed
const assignments = computed(() => {
  const result = []

  // Add current user if include me is checked
  if (includeMe.value && currentUser.value) {
    result.push({
      type: 'user',
      id: currentUser.value.id,
      name: currentUser.value.name
    })
  }

  // Add selected users (now using IDs from Select component)
  if (selectedUsers.value && Array.isArray(selectedUsers.value)) {
    selectedUsers.value.forEach(userId => {
      const user = opsiUsers.value.find((u: any) => u.value === userId)
      if (user) {
        result.push({
          type: 'user',
          id: user.value,
          name: user.label
        })
      }
    })
  }

  // Add selected roles (now using IDs from Select component)
  if (selectedRoles.value && Array.isArray(selectedRoles.value)) {
    selectedRoles.value.forEach(roleId => {
      const role = opsiRoles.value.find((r: any) => r.value === roleId)
      if (role) {
        result.push({
          type: 'role',
          id: role.value,
          name: role.label
        })
      }
    })
  }

  return result
})

// Methods
const opsiCategories = ref<any[]>([])
const loadCategories = async () => {
  try {
    const response = await client(`api/todo_categories`) as any
    opsiCategories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

const handleIncludeMeChange = () => {
  if (includeMe.value && currentUser.value) {
    // Remove from selectedUsers if it exists there
    selectedUsers.value = selectedUsers.value.filter(
      userId => userId !== currentUser.value?.id
    )
  }
}

const getAssignmentLabel = (assignment: any) => {
  const icon = assignment.type === 'user' ? '👤' : '👥'
  return `${icon} ${assignment.name}`
}

const validateForm = () => {
  errors.value = {}

  if (!form.title.trim()) {
    errors.value.title = 'Judul todo harus diisi'
  }

  if (assignments.value.length === 0) {
    errors.value.assignments = 'Pilih minimal satu user atau role untuk diassign'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Prepare the payload according to backend API structure
    const assignedUsers = assignments.value
      .filter(a => a.type === 'user')
      .map(a => a.id)

    const assignedRoles = assignments.value
      .filter(a => a.type === 'role')
      .map(a => a.id)

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      priority: form.priority as 'low' | 'medium' | 'high' | 'urgent',
      due_date: form.due_date ? form.due_date : undefined,
      category_id: form.category_id || undefined,
      is_private: form.is_private,
      notes: form.notes?.trim() || undefined,
      assigned_users: assignedUsers,
      assigned_roles: assignedRoles
    }

    if (props.action === 'create') {
      await addTodo(payload)

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Todo berhasil dibuat',
        life: 3000
      })
    } else if (props.todo) {
      await editTodo(props.todo.id, payload)

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Todo berhasil diupdate',
        life: 3000
      })
    }

    emit('success')
  } catch (error: any) {
    console.error('Error submitting form:', error)

    if (error.data?.errors) {
      // Handle Laravel validation errors
      errors.value = {}
      Object.keys(error.data.errors).forEach(key => {
        errors.value[key] = error.data.errors[key][0]
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Gagal menyimpan todo',
        life: 3000
      })
    }
  } finally {
    loading.value = false
  }
}

const initializeForm = () => {
  if (props.action === 'edit' && props.todo) {
    Object.assign(form, {
      title: props.todo.title || '',
      description: props.todo.description || '',
      priority: props.todo.priority || 'medium',
      due_date: props.todo.due_date ? new Date(props.todo.due_date) : null,
      category_id: props.todo.category?.id || null,
      is_private: props.todo.is_private || false,
      notes: props.todo.notes || ''
    })

    // Set assignments from todo
    if (props.todo.assignments_summary) {
      selectedUsers.value = props.todo.assignments_summary.users.map((u: any) => u.id)
      selectedRoles.value = props.todo.assignments_summary.roles.map((r: any) => r.id)

      // Check if current user is in assignments
      if (currentUser.value) {
        const userAssignment = props.todo.assignments_summary.users.find(
          (u: any) => u.id === currentUser.value.id
        )
        includeMe.value = !!userAssignment
      }
    }
  } else {
    // Reset form for create
    Object.assign(form, {
      title: '',
      description: '',
      priority: 'medium',
      due_date: null,
      category_id: null,
      is_private: false,
      notes: ''
    })

    selectedUsers.value = []
    selectedRoles.value = []
    includeMe.value = false
  }
}

// Watchers
watch(() => props.todo, () => {
  initializeForm()
}, { immediate: true })

// Initialize
onMounted(() => {
  loadCategories()
  initializeForm()
})
</script>