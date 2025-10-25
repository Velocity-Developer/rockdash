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
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-teal-100 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {{ todo.title }}
          </h1>
          <!-- Category -->
          <div v-if="todo.category" class="flex items-center text-sm">
            <span class="text-xl mr-2">{{ todo.category.icon || '📋' }}</span>
            <span class="text-teal-700 dark:text-teal-400 font-medium">
              {{ todo.category.name }}
            </span>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Badge
            :value="getStatusLabel(todo.status)"
            :severity="getStatusSeverity(todo.status)"
            class="text-xs sm:text-sm"
          />
          <Badge
            :value="getPriorityLabel(todo.priority)"
            :severity="getPrioritySeverity(todo.priority)"
            class="text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-6">
        <!-- Description Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 px-5 py-4 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center text-blue-700 dark:text-blue-400">
              <Icon name="lucide:file-text" class="w-5 h-5 mr-3" />
              <h3 class="font-semibold">Deskripsi</h3>
            </div>
          </div>
          <div class="p-5">
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {{ todo.description || 'Tidak ada deskripsi tersedia' }}
            </p>
          </div>
        </div>

        <!-- Dates Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-700 px-5 py-4 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center text-amber-700 dark:text-amber-400">
              <Icon name="lucide:calendar" class="w-5 h-5 mr-3" />
              <h3 class="font-semibold">Informasi Tanggal</h3>
            </div>
          </div>
          <div class="p-5">
            <div class="space-y-4">
              <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <Icon name="lucide:plus-circle" class="w-4 h-4 mr-2" />
                  Dibuat
                </span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ dayjs(todo.created_at).format('DD MMMM YYYY') }}
                </span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
                  Diperbarui
                </span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ dayjs(todo.updated_at).format('DD MMMM YYYY') }}
                </span>
              </div>
              <div v-if="todo.due_date" class="flex items-center justify-between py-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <Icon name="lucide:clock" class="w-4 h-4 mr-2" />
                  Deadline
                </span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ dayjs(todo.due_date).format('DD MMMM YYYY') }}
                </span>
              </div>
              <div v-if="todo.due_date && todo.due_date_days_left !== undefined" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-center">
                  <Badge
                    v-if="todo.due_date_days_left > 0"
                    :value="`${todo.due_date_days_left} hari lagi`"
                    severity="success"
                    class="text-sm px-4 py-2"
                  />
                  <Badge
                    v-else-if="todo.due_date_days_left === 0"
                    value="Hari ini"
                    severity="warning"
                    class="text-sm px-4 py-2"
                  />
                  <Badge
                    v-else
                    :value="`Terlambat ${Math.abs(todo.due_date_days_left)} hari`"
                    severity="danger"
                    class="text-sm px-4 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Author Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 px-5 py-4 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center text-purple-700 dark:text-purple-400">
              <Icon name="lucide:user" class="w-5 h-5 mr-3" />
              <h3 class="font-semibold">Pembuat</h3>
            </div>
          </div>
          <div class="p-5">
            <div v-if="todo.creator" class="flex items-center space-x-4">
              <Avatar
                :label="todo.creator.name.charAt(0).toUpperCase()"
                class="w-12 h-12 bg-teal-500 text-white font-bold text-lg"
                shape="circle"
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 dark:text-white text-base">{{ todo.creator.name }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ todo.creator.email }}</p>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <Icon name="lucide:user-x" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 text-sm">Tidak ada informasi pembuat</p>
            </div>
          </div>
        </div>

        <!-- Assignments Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 px-5 py-4 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center text-green-700 dark:text-green-400">
              <Icon name="lucide:users" class="w-5 h-5 mr-3" />
              <h3 class="font-semibold">Penugasan</h3>
            </div>
          </div>
          <div class="p-5">
            <div v-if="todo.assignments && todo.assignments.length > 0" class="space-y-3">
              <div
                v-for="assignment in todo.assignments"
                :key="assignment.id"
                class="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
              >
                <div class="flex-shrink-0">
                  <Icon
                    :name="assignment.tipe === 'User' ? 'lucide:user' : 'lucide:layers'"
                    class="w-5 h-5 text-teal-600 dark:text-teal-400"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">
                    {{ assignment.assignable.name }}
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
              <Icon name="lucide:user-minus" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-500 text-sm font-medium">Tidak ada penugasan</p>
              <p class="text-gray-400 text-xs mt-1">Todo ini belum ditugaskan kepada siapapun</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div class="flex justify-end">
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
