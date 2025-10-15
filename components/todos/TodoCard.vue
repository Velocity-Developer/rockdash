<template>
  <Card
    class="todo-card"
    :class="{
      'border-l-4': true,
      'border-l-gray-400': todo.priority === 'low',
      'border-l-blue-400': todo.priority === 'medium',
      'border-l-yellow-400': todo.priority === 'high',
      'border-l-red-400': todo.priority === 'urgent',
      'opacity-75': todo.status === 'completed'
    }"
  >
    <template #content>
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ todo.title }}
              </h3>

              <!-- Priority Badge -->
              <Badge
                :value="todo.priority_label"
                :severity="getPrioritySeverity(todo.priority)"
                size="small"
              />

              <!-- Overdue Indicator -->
              <Badge
                v-if="todo.is_overdue"
                value="Overdue"
                severity="danger"
                size="small"
              />
            </div>

            <!-- Description -->
            <p v-if="todo.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ todo.description }}
            </p>

            <!-- Meta Info -->
            <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-1">
                <Icon name="lucide:calendar" class="w-3 h-3" />
                <span v-if="todo.due_date">
                  {{ formatDate(todo.due_date) }}
                  <span v-if="todo.due_date_days_left > 0" class="text-green-600">
                    ({{ todo.due_date_days_left }} hari lagi)
                  </span>
                  <span v-else-if="todo.due_date_days_left === 0" class="text-yellow-600">
                    (hari ini)
                  </span>
                  <span v-else class="text-red-600">
                    (telat {{ Math.abs(todo.due_date_days_left) }} hari)
                  </span>
                </span>
                <span v-else>Tidak ada deadline</span>
              </div>

              <div v-if="todo.category" class="flex items-center gap-1">
                <Icon :name="todo.category.icon || 'lucide:tag'" class="w-3 h-3" />
                <span>{{ todo.category.name }}</span>
              </div>

              <div class="flex items-center gap-1">
                <Icon name="lucide:user" class="w-3 h-3" />
                <span>{{ todo.creator?.name || 'Unknown' }}</span>
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <Badge
            :value="todo.status_label"
            :severity="getStatusSeverity(todo.status)"
            size="small"
          />
        </div>

        <!-- Assignments Summary -->
        <div v-if="todo.assignments_summary" class="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Assignments
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ todo.assignments_summary.completed_count }}/{{ todo.assignments_summary.total_count }} completed
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="mb-3">
            <ProgressBar
              :value="todo.completion_percentage"
              class="h-2"
              :showValue="false"
            />
          </div>

          <!-- Assigned Users & Roles -->
          <div class="space-y-2">
            <!-- Users -->
            <div v-if="todo.assignments_summary.users.length > 0" class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <Avatar
                  v-for="user in todo.assignments_summary.users.slice(0, 4)"
                  :key="user.id"
                  :image="user.avatar"
                  :label="user.name"
                  size="small"
                  class="border-2 border-white dark:border-gray-800"
                  v-tooltip="user.name"
                />
                <div
                  v-if="todo.assignments_summary.users.length > 4"
                  class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium"
                  v-tooltip="todo.assignments_summary.users.slice(4).map(u => u.name).join(', ')"
                >
                  +{{ todo.assignments_summary.users.length - 4 }}
                </div>
              </div>
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="user in todo.assignments_summary.users"
                  :key="user.id"
                  :value="user.status_label"
                  :severity="getAssignmentStatusSeverity(user.status)"
                  size="small"
                  class="text-xs"
                />
              </div>
            </div>

            <!-- Roles -->
            <div v-if="todo.assignments_summary.roles.length > 0" class="flex items-center gap-2">
              <div class="flex gap-1">
                <div
                  v-for="role in todo.assignments_summary.roles"
                  :key="role.id"
                  class="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                >
                  <Icon name="lucide:users" class="w-3 h-3" />
                  <span>{{ role.name }}</span>
                  <span v-if="role.user_count > 0" class="text-gray-500">({{ role.user_count }})</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="role in todo.assignments_summary.roles"
                  :key="role.id"
                  :value="role.status_label"
                  :severity="getAssignmentStatusSeverity(role.status)"
                  size="small"
                  class="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <!-- Status Update for Assigned Users -->
          <Dropdown
            v-if="canUpdateStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Update Status"
            class="text-xs"
            @change="updateStatus"
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <Badge
                  :value="slotProps.option.label"
                  :severity="getStatusSeverity(slotProps.option.value)"
                  size="small"
                />
              </div>
            </template>
          </Dropdown>

          <!-- View Details -->
          <Button
            @click="$emit('view', todo)"
            size="small"
            outlined
            severity="secondary"
          >
            <Icon name="lucide:eye" />
            Detail
          </Button>

          <!-- Edit (for creators) -->
          <Button
            v-if="todo.can?.update"
            @click="$emit('edit', todo)"
            size="small"
            outlined
          >
            <Icon name="lucide:edit" />
            Edit
          </Button>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  todo: any
}>()

const emit = defineEmits<{
  refresh: []
  edit: [todo: any]
  view: [todo: any]
}>()

const client = useSanctumClient()
const toast = useToast()
const user = useSanctumUser<User>()

// Computed
const canUpdateStatus = computed(() => {
  return props.todo.can?.update_status || false
})

const statusOptions = [
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Declined', value: 'declined' }
]

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getPrioritySeverity = (priority: string) => {
  const severityMap: Record<string, any> = {
    low: 'secondary',
    medium: 'info',
    high: 'warning',
    urgent: 'danger'
  }
  return severityMap[priority] || 'secondary'
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

const getAssignmentStatusSeverity = (status: string) => {
  const severityMap: Record<string, any> = {
    assigned: 'secondary',
    in_progress: 'info',
    completed: 'success',
    declined: 'danger'
  }
  return severityMap[status] || 'secondary'
}

const updateStatus = async (newStatus: string) => {
  try {
    // Find the assignment for current user
    const userAssignment = props.todo.assignments?.find((assignment: any) =>
      assignment.assignable_type === 'user' && assignment.assignable_id === user.value?.id
    )

    if (!userAssignment) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Assignment tidak ditemukan',
        life: 3000
      })
      return
    }

    await client(`/api/todos/${props.todo.id}/assignments/${userAssignment.id}/status`, {
      method: 'PUT',
      body: {
        status: newStatus
      }
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Status berhasil diperbarui',
      life: 3000
    })

    emit('refresh')
  } catch (error: any) {
    console.error('Error updating status:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.data?.message || 'Gagal memperbarui status',
      life: 3000
    })
  }
}
</script>

<style scoped>
.todo-card {
  transition: all 0.2s ease;
}

.todo-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>