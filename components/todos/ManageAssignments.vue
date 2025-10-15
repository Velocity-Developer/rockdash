<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <!-- Current Assignments -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Assignments Saat Ini
        </h3>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ currentAssignments.length }} assignment(s)
        </span>
      </div>

      <div v-if="currentAssignments.length > 0" class="space-y-2">
        <div
          v-for="assignment in currentAssignments"
          :key="`${assignment.type}-${assignment.id}`"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div
              v-if="assignment.type === 'user'"
              class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
            >
              <Icon name="lucide:user" class="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div
              v-else
              class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
            >
              <Icon name="lucide:users" class="w-4 h-4 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ assignment.name }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ getAssignmentTypeLabel(assignment.type) }}
                <span v-if="assignment.type === 'role' && assignment.user_count">
                  ({{ assignment.user_count }} users)
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Badge
              :value="getStatusLabel(assignment.status)"
              :severity="getStatusSeverity(assignment.status)"
              size="small"
            />
            <Button
              @click="removeAssignment(assignment)"
              size="small"
              severity="danger"
              outlined
              :disabled="loading"
            >
              <Icon name="lucide:x" />
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Icon name="lucide:users" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Belum ada assignments
        </p>
      </div>
    </div>

    <!-- New Assignments -->
    <div class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tambah Assignment Baru
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Pilih user atau role yang akan ditugaskan untuk todo ini
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

        <!-- User Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User Spesifik
          </label>
          <UserSelect
            v-model="selectedUsers"
            :exclude-ids="getExcludeUserIds()"
            placeholder="Pilih user yang akan ditugaskan"
          />
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role/Departemen
          </label>
          <RoleSelect
            v-model="selectedRoles"
            placeholder="Pilih role yang akan ditugaskan"
          />
        </div>

        <!-- Assignment Summary -->
        <div v-if="newAssignments.length > 0" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Akan Ditambahkan ({{ newAssignments.length }}):
          </h4>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="assignment in newAssignments"
              :key="`new-${assignment.type}-${assignment.id}`"
              :value="getAssignmentLabel(assignment)"
              severity="info"
              class="text-xs"
            />
          </div>
        </div>
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
        :disabled="!hasChanges"
      >
        <Icon name="lucide:save" />
        Update Assignments
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  todo: any
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const client = useSanctumClient()
const toast = useToast()
const currentUser = useSanctumUser<User>()

// State
const loading = ref(false)
const currentAssignments = ref<any[]>([])
const selectedUsers = ref<any[]>([])
const selectedRoles = ref<any[]>([])
const includeMe = ref(false)

// Computed
const newAssignments = computed(() => {
  const result = []

  // Add current user if include me is checked
  if (includeMe.value && currentUser.value) {
    result.push({
      type: 'user',
      id: currentUser.value.id,
      name: currentUser.value.name
    })
  }

  // Add selected users
  selectedUsers.value.forEach(user => {
    result.push({
      type: 'user',
      id: user.id,
      name: user.name
    })
  })

  // Add selected roles
  selectedRoles.value.forEach(role => {
    result.push({
      type: 'role',
      id: role.id,
      name: role.name
    })
  })

  return result
})

const hasChanges = computed(() => {
  // Check if there are new assignments to add
  if (newAssignments.value.length > 0) {
    return true
  }

  // Check if any current assignments are removed
  if (currentAssignments.value.length > 0 && selectedUsers.value.length === 0 && !includeMe.value) {
    return true
  }

  return false
})

// Methods
const getCurrentAssignments = () => {
  if (!props.todo?.assignments_summary) {
    currentAssignments.value = []
    return
  }

  const assignments = []

  // Add user assignments
  props.todo.assignments_summary.users.forEach((user: any) => {
    assignments.push({
      type: 'user',
      id: user.id,
      name: user.name,
      status: user.status,
      avatar: user.avatar
    })
  })

  // Add role assignments
  props.todo.assignments_summary.roles.forEach((role: any) => {
    assignments.push({
      type: 'role',
      id: role.id,
      name: role.name,
      status: role.status,
      user_count: role.user_count
    })
  })

  currentAssignments.value = assignments

  // Set initial selection
  selectedUsers.value = assignments
    .filter(a => a.type === 'user')
    .map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar
    }))

  selectedRoles.value = assignments
    .filter(a => a.type === 'role')
    .map(r => ({
      id: r.id,
      name: r.name
    }))

  // Check if current user is included
  if (currentUser.value) {
    const userAssignment = assignments.find(a =>
      a.type === 'user' && a.id === currentUser.value.id
    )
    includeMe.value = !!userAssignment
  }
}

const getExcludeUserIds = () => {
  const excludeIds = [currentUser.value?.id].filter(Boolean)

  // Add current assignments to exclude
  currentAssignments.value
    .filter(a => a.type === 'user')
    .forEach(a => {
      if (!excludeIds.includes(a.id)) {
        excludeIds.push(a.id)
      }
    })

  return excludeIds
}

const handleIncludeMeChange = () => {
  if (includeMe.value && currentUser.value) {
    // Remove from selectedUsers if it exists there
    selectedUsers.value = selectedUsers.value.filter(
      user => user.id !== currentUser.value?.id
    )
  }
}

const removeAssignment = (assignment: any) => {
  if (assignment.type === 'user') {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== assignment.id)
    if (assignment.id === currentUser.value?.id) {
      includeMe.value = false
    }
  } else {
    selectedRoles.value = selectedRoles.value.filter(r => r.id !== assignment.id)
  }
}

const getAssignmentLabel = (assignment: any) => {
  const icon = assignment.type === 'user' ? '👤' : '👥'
  return `${icon} ${assignment.name}`
}

const getAssignmentTypeLabel = (type: string) => {
  return type === 'user' ? 'User' : 'Role'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    declined: 'Declined'
  }
  return labelMap[status] || status
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, any> = {
    assigned: 'secondary',
    in_progress: 'info',
    completed: 'success',
    declined: 'danger'
  }
  return severityMap[status] || 'secondary'
}

const submitForm = async () => {
  loading.value = true

  try {
    const assignments = newAssignments.value.map(a => ({
      type: a.type,
      id: a.id
    }))

    const response = await client(`/api/todos/${props.todo.id}/assign`, {
      method: 'POST',
      body: {
        assignments
      }
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Assignments berhasil diperbarui',
      life: 3000
    })

    emit('success')
  } catch (error: any) {
    console.error('Error updating assignments:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.data?.message || 'Gagal memperbarui assignments',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  getCurrentAssignments()
})
</script>