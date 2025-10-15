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
          @keyup.enter="searchRoles"
        />
      </IconField>
    </div>

    <!-- Selected Roles -->
    <div v-if="modelValue.length > 0" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Role yang Dipilih ({{ modelValue.length }}):
      </label>
      <div class="flex flex-wrap gap-2">
        <Chip
          v-for="role in modelValue"
          :key="role.id"
          :label="getRoleLabel(role)"
          removable
          @remove="removeRole(role)"
          class="text-sm"
        />
      </div>
    </div>

    <!-- All Roles (when not searching) -->
    <div v-if="!searchQuery && !loading" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Pilih Role:
      </label>
      <div class="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
        <div
          v-for="role in allRoles"
          :key="role.id"
          @click="toggleRole(role)"
          class="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <Checkbox
            :modelValue="isRoleSelected(role)"
            binary
            readonly
          />
          <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
            <Icon name="lucide:users" class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ role.name }}
            </div>
            <div v-if="role.user_count !== undefined" class="text-xs text-gray-500 dark:text-gray-400">
              {{ role.user_count }} user
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-else-if="searchResults.length > 0" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Hasil Pencarian:
      </label>
      <div class="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
        <div
          v-for="role in searchResults"
          :key="role.id"
          @click="toggleRole(role)"
          class="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <Checkbox
            :modelValue="isRoleSelected(role)"
            binary
            readonly
          />
          <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
            <Icon name="lucide:users" class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ role.name }}
            </div>
            <div v-if="role.user_count !== undefined" class="text-xs text-gray-500 dark:text-gray-400">
              {{ role.user_count }} user
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="searchQuery && !loading" class="text-center py-4">
      <Icon name="lucide:users" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Tidak ada role ditemukan
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-4">
      <ProgressSpinner style="width: 24px; height: 24px" strokeWidth="8" />
    </div>

    <!-- Common Roles -->
    <div v-if="commonRoles.length > 0 && !searchQuery" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Role Umum:
      </label>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="role in commonRoles"
          :key="role.id"
          @click="toggleRole(role)"
          :outlined="!isRoleSelected(role)"
          size="small"
          class="text-xs"
        >
          <Icon name="lucide:users" class="mr-1" />
          {{ role.name }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const client = useSanctumClient()

// State
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const allRoles = ref<any[]>([])
const commonRoles = ref<any[]>([])
const loading = ref(false)
const searchTimeout = ref<NodeJS.Timeout>()

// Common role names that are frequently used
const commonRoleNames = ['admin', 'manager', 'developer', 'staff']

// Debounced search
watch(searchQuery, (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (newValue.trim()) {
    searchTimeout.value = setTimeout(() => {
      searchRoles()
    }, 300)
  } else {
    searchResults.value = []
  }
})

// Methods
const getRoles = async () => {
  loading.value = true

  try {
    const response = await client('/api/option/roles')
    let roles = response.data || []

    // Filter out already selected roles
    roles = roles.filter(role => !props.modelValue.some(selected => selected.id === role.id))

    allRoles.value = roles

    // Identify common roles
    commonRoles.value = roles.filter(role =>
      commonRoleNames.some(commonName =>
        role.name.toLowerCase().includes(commonName.toLowerCase())
      )
    ).slice(0, 6) // Limit to 6 common roles
  } catch (error) {
    console.error('Error fetching roles:', error)
    allRoles.value = []
    commonRoles.value = []
  } finally {
    loading.value = false
  }
}

const searchRoles = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase().trim()

  // Filter from all roles
  searchResults.value = allRoles.value.filter(role => {
    const isAlreadySelected = props.modelValue.some(selected => selected.id === role.id)
    return !isAlreadySelected && role.name.toLowerCase().includes(query)
  }).slice(0, 10)
}

const toggleRole = (role: any) => {
  const newValue = [...props.modelValue]
  const existingIndex = newValue.findIndex(r => r.id === role.id)

  if (existingIndex >= 0) {
    newValue.splice(existingIndex, 1)
  } else {
    newValue.push(role)
  }

  emit('update:modelValue', newValue)

  // Remove from search results if selected
  if (existingIndex < 0) {
    searchResults.value = searchResults.value.filter(r => r.id !== role.id)
    allRoles.value = allRoles.value.filter(r => r.id !== role.id)
    commonRoles.value = commonRoles.value.filter(r => r.id !== role.id)
  }
}

const removeRole = (role: any) => {
  const newValue = props.modelValue.filter(r => r.id !== role.id)
  emit('update:modelValue', newValue)

  // Add back to available roles
  allRoles.value.push(role)
  allRoles.value.sort((a, b) => a.name.localeCompare(b.name))

  // Update common roles if needed
  if (commonRoleNames.some(commonName =>
    role.name.toLowerCase().includes(commonName.toLowerCase())
  )) {
    commonRoles.value.push(role)
    commonRoles.value.sort((a, b) => a.name.localeCompare(b.name))
    commonRoles.value = commonRoles.value.slice(0, 6)
  }

  // Update search results if there's a search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    if (role.name.toLowerCase().includes(query)) {
      searchResults.value.push(role)
      searchResults.value.sort((a, b) => a.name.localeCompare(b.name))
      searchResults.value = searchResults.value.slice(0, 10)
    }
  }
}

const isRoleSelected = (role: any) => {
  return props.modelValue.some(r => r.id === role.id)
}

const getRoleLabel = (role: any) => {
  return `${role.name} ${role.user_count ? `(${role.user_count} users)` : ''}`
}

// Watch for changes in modelValue to refresh available roles
watch(() => props.modelValue, () => {
  getRoles()
}, { deep: true })

// Initialize
onMounted(() => {
  getRoles()
})
</script>