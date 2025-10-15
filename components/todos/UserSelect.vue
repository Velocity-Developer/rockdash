<template>
  <div class="space-y-3">
    <!-- Search Input -->
    <div>
      <IconField>
        <InputIcon>
          <Icon name="lucide:search" />
        </InputIcon>
        <InputText
          v-model="searchQuery"
          :placeholder="placeholder"
          class="w-full"
          @keyup.enter="searchUsers"
        />
      </IconField>
    </div>

    <!-- Selected Users -->
    <div v-if="modelValue.length > 0" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        User yang Dipilih ({{ modelValue.length }}):
      </label>
      <div class="flex flex-wrap gap-2">
        <Chip
          v-for="user in modelValue"
          :key="user.id"
          :label="user.name"
          :image="user.avatar"
          removable
          @remove="removeUser(user)"
          class="text-sm"
        />
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Pilih User:
      </label>
      <div class="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
        <div
          v-for="user in searchResults"
          :key="user.id"
          @click="toggleUser(user)"
          class="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <Checkbox
            :modelValue="isUserSelected(user)"
            binary
            readonly
          />
          <Avatar
            :image="user.avatar"
            :label="user.name"
            size="small"
            class="shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ user.name }}
            </div>
            <div v-if="user.email" class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ user.email }}
            </div>
          </div>
          <div v-if="user.roles && user.roles.length > 0" class="flex flex-wrap gap-1">
            <Badge
              v-for="role in user.roles.slice(0, 2)"
              :key="role.id"
              :value="role.name"
              size="small"
              severity="secondary"
              class="text-xs"
            />
            <Badge
              v-if="user.roles.length > 2"
              :value="`+${user.roles.length - 2}`"
              size="small"
              severity="secondary"
              class="text-xs"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="searchQuery && !loading" class="text-center py-4">
      <Icon name="lucide:users" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Tidak ada user ditemukan
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-4">
      <ProgressSpinner style="width: 24px; height: 24px" strokeWidth="8" />
    </div>

    <!-- Quick Access - Recent Users -->
    <div v-if="recentUsers.length > 0 && !searchQuery" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        User Sering Digunakan:
      </label>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="user in recentUsers"
          :key="user.id"
          @click="toggleUser(user)"
          :outlined="!isUserSelected(user)"
          size="small"
          class="text-xs"
        >
          <Avatar
            :image="user.avatar"
            :label="user.name"
            size="small"
            class="mr-1"
          />
          {{ user.name }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any[]
  placeholder?: string
  excludeIds?: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const client = useSanctumClient()
const currentUser = useSanctumUser<User>()

// State
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const recentUsers = ref<any[]>([])
const loading = ref(false)
const searchTimeout = ref<NodeJS.Timeout>()

// Debounced search
watch(searchQuery, (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (newValue.trim()) {
    searchTimeout.value = setTimeout(() => {
      searchUsers()
    }, 300)
  } else {
    searchResults.value = []
  }
})

// Methods
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true

  try {
    const response = await client('/api/user_search/' + encodeURIComponent(searchQuery.value.trim()))

    let users = response.data || []

    // Filter out current user and excluded IDs
    users = users.filter(user => {
      const isCurrentUser = user.id === currentUser.value?.id
      const isExcluded = props.excludeIds?.includes(user.id)
      const isSelected = props.modelValue.some(selected => selected.id === user.id)

      return !isCurrentUser && !isExcluded && !isSelected
    })

    searchResults.value = users.slice(0, 10) // Limit to 10 results
  } catch (error) {
    console.error('Error searching users:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const getRecentUsers = async () => {
  try {
    // Get a list of all users using existing search endpoint with empty search
    const response = await client('/api/user_search/')
    let users = response.data || []

    // Filter out current user and excluded IDs
    users = users.filter(user => {
      const isCurrentUser = user.id === currentUser.value?.id
      const isExcluded = props.excludeIds?.includes(user.id)
      const isSelected = props.modelValue.some(selected => selected.id === user.id)

      return !isCurrentUser && !isExcluded && !isSelected
    })

    // Take first 6 as "recent" users
    recentUsers.value = users.slice(0, 6)
  } catch (error) {
    console.error('Error fetching recent users:', error)
    recentUsers.value = []
  }
}

const toggleUser = (user: any) => {
  const newValue = [...props.modelValue]
  const existingIndex = newValue.findIndex(u => u.id === user.id)

  if (existingIndex >= 0) {
    newValue.splice(existingIndex, 1)
  } else {
    newValue.push(user)
  }

  emit('update:modelValue', newValue)

  // Remove from search results if selected
  if (existingIndex < 0) {
    searchResults.value = searchResults.value.filter(u => u.id !== user.id)
  }
}

const removeUser = (user: any) => {
  const newValue = props.modelValue.filter(u => u.id !== user.id)
  emit('update:modelValue', newValue)

  // Add back to search results if there's a search query
  if (searchQuery.value.trim()) {
    const isExcluded = props.excludeIds?.includes(user.id)
    const isCurrentUser = user.id === currentUser.value?.id

    if (!isExcluded && !isCurrentUser) {
      searchResults.value.unshift(user)
      searchResults.value = searchResults.value.slice(0, 10)
    }
  }
}

const isUserSelected = (user: any) => {
  return props.modelValue.some(u => u.id === user.id)
}

// Initialize
onMounted(() => {
  getRecentUsers()
})
</script>