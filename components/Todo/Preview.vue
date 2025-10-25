<script setup lang="ts">
interface Todo {
  id: number
  title: string
  description: string
  status: string
  priority: string
  due_date?: string
  due_date_days_left?: number
  created_at: string
  updated_at: string
  category?: {
    id: number
    name: string
    icon?: string
    color?: string
  }
  creator?: {
    id: number
    name: string
    email: string
  }
  assignments?: Array<{
    id: number
    tipe: string
    assignable: {
      id: number
      name: string
    }
  }>
}

defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  close: []
}>()

const useDayjs = () => {
  const dayjs = (date: string) => {
    return {
      format: (pattern: string) => {
        const d = new Date(date)
        if (pattern === 'YYYY-MM-DD') {
          return d.toISOString().split('T')[0]
        } else if (pattern === 'HH:mm:ss') {
          return d.toTimeString().split(' ')[0]
        } else if (pattern === 'DD MMMM YYYY') {
          return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        }
        return d.toString()
      }
    }
  }
  return { dayjs }
}

const { dayjs } = useDayjs()

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, any> = {
    assigned: 'secondary',
    in_progress: 'info',
    completed: 'success',
    declined: 'danger'
  }
  return severityMap[status] || 'secondary'
}

const getPrioritySeverity = (priority: string) => {
  const severityMap: Record<string, any> = {
    low: 'secondary',
    medium: 'warning',
    high: 'danger',
    urgent: 'danger'
  }
  return severityMap[priority] || 'secondary'
}

const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
    urgent: 'Mendesak'
  }
  return labelMap[priority] || priority
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    assigned: 'Ditugaskan',
    in_progress: 'Dalam Progres',
    completed: 'Selesai',
    declined: 'Ditolak'
  }
  return labelMap[status] || status
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header Section -->
    <div class="border-b pb-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ todo.title }}
        </h2>
        <div class="flex gap-2">
          <Badge
            :value="getStatusLabel(todo.status)"
            :severity="getStatusSeverity(todo.status)"
          />
          <Badge
            :value="getPriorityLabel(todo.priority)"
            :severity="getPrioritySeverity(todo.priority)"
          />
        </div>
      </div>

      <!-- Category -->
      <div v-if="todo.category" class="mt-2 flex items-center">
        <span class="text-lg mr-2">{{ todo.category.icon || '⚙' }}</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ todo.category.name }}
        </span>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-4">
        <!-- Description -->
        <Card>
          <template #title>
            <Icon name="lucide:file-text" class="mr-2" />
            Deskripsi
          </template>
          <template #content>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ todo.description || 'Tidak ada deskripsi' }}
            </p>
          </template>
        </Card>

        <!-- Dates -->
        <Card>
          <template #title>
            <Icon name="lucide:calendar" class="mr-2" />
            Informasi Tanggal
          </template>
          <template #content>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Dibuat:</span>
                <span class="text-sm">
                  {{ dayjs(todo.created_at).format('DD MMMM YYYY') }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Diperbarui:</span>
                <span class="text-sm">
                  {{ dayjs(todo.updated_at).format('DD MMMM YYYY') }}
                </span>
              </div>
              <div v-if="todo.due_date" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Deadline:</span>
                <span class="text-sm">
                  {{ dayjs(todo.due_date).format('DD MMMM YYYY') }}
                </span>
              </div>
              <div v-if="todo.due_date" class="mt-2">
                <Badge
                  v-if="todo.due_date_days_left > 0"
                  :value="`${todo.due_date_days_left} hari lagi`"
                  severity="success"
                />
                <Badge
                  v-else-if="todo.due_date_days_left === 0"
                  value="hari ini"
                  severity="warning"
                />
                <Badge
                  v-else
                  :value="`telat ${Math.abs(todo.due_date_days_left)} hari`"
                  severity="danger"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Right Column -->
      <div class="space-y-4">
        <!-- Author -->
        <Card>
          <template #title>
            <Icon name="lucide:user" class="mr-2" />
            Pembuat
          </template>
          <template #content>
            <div v-if="todo.creator" class="flex items-center space-x-3">
              <Avatar
                :label="todo.creator.name.charAt(0).toUpperCase()"
                class="mr-2"
                shape="circle"
              />
              <div>
                <p class="font-medium">{{ todo.creator.name }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ todo.creator.email }}
                </p>
              </div>
            </div>
            <p v-else class="text-gray-500">Tidak ada informasi pembuat</p>
          </template>
        </Card>

        <!-- Assignments -->
        <Card>
          <template #title>
            <Icon name="lucide:users" class="mr-2" />
            Penugasan
          </template>
          <template #content>
            <div v-if="todo.assignments && todo.assignments.length > 0" class="space-y-2">
              <div
                v-for="assignment in todo.assignments"
                :key="assignment.id"
                class="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <Icon
                  :name="assignment.tipe === 'User' ? 'lucide:user' : 'lucide:layers'"
                  class="w-4 h-4 text-gray-500"
                />
                <span class="text-sm">{{ assignment.assignable.name }}</span>
                <Badge
                  :value="assignment.tipe"
                  size="small"
                  severity="secondary"
                />
              </div>
            </div>
            <p v-else class="text-gray-500">Tidak ada penugasan</p>
          </template>
        </Card>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="flex justify-end pt-4 border-t">
      <Button
        @click="emit('close')"
        severity="secondary"
        outlined
      >
        <Icon name="lucide:x" class="mr-2" />
        Tutup
      </Button>
    </div>
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
