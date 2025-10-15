import { useFetch, useRuntimeConfig } from '#app'

export interface User {
  id: number
  name: string
  username: string
  email: string
  avatar_url?: string
  status: string
}

export interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export interface SelectedUser extends User {
  selected: boolean
}

export interface SelectedRole extends Role {
  selected: boolean
}

export const useUserSelect = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiURL

  const users = ref<User[]>([])
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const debouncedSearch = ref('')

  // Debounce search
  const debounceTimer = ref<NodeJS.Timeout>()
  watch(searchQuery, (value) => {
    clearTimeout(debounceTimer.value)
    debounceTimer.value = setTimeout(() => {
      debouncedSearch.value = value
    }, 300)
  })

  // Load users
  const loadUsers = async (search = '') => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (search) {
        params.append('search', search)
      }

      const { data } = await useFetch<{ data: User[] }>(`${baseURL}/dash/users`, {
        key: `users-${search}`,
        query: search ? { search } : {},
        headers: {
          'Accept': 'application/json',
        }
      })

      if (data.value) {
        users.value = data.value.data
      }
    } catch (err) {
      error.value = 'Failed to load users'
      console.error('Error loading users:', err)
    } finally {
      loading.value = false
    }
  }

  // Load roles
  const loadRoles = async () => {
    loading.value = true
    error.value = null

    try {
      const { data } = await useFetch<Role[]>(`${baseURL}/dash/settings/roles`, {
        key: 'roles',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (data.value) {
        roles.value = data.value
      }
    } catch (err) {
      error.value = 'Failed to load roles'
      console.error('Error loading roles:', err)
    } finally {
      loading.value = false
    }
  }

  // Watch debounced search
  watch(debouncedSearch, (newValue) => {
    loadUsers(newValue)
  })

  // Initialize
  onMounted(() => {
    loadUsers()
    loadRoles()
  })

  return {
    users: readonly(users),
    roles: readonly(roles),
    loading: readonly(loading),
    error: readonly(error),
    searchQuery,
    debouncedSearch: readonly(debouncedSearch),
    loadUsers,
    loadRoles
  }
}

export const useMultiSelect = <T extends { id: number }>() => {
  const items = ref<T[]>([])
  const selectedIds = ref<Set<number>>(new Set())

  const selectedItems = computed(() => {
    return items.value.filter(item => selectedIds.value.has(item.id))
  })

  const toggleSelection = (id: number) => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  const selectAll = () => {
    items.value.forEach(item => {
      selectedIds.value.add(item.id)
    })
  }

  const deselectAll = () => {
    selectedIds.value.clear()
  }

  const isSelected = (id: number) => {
    return selectedIds.value.has(id)
  }

  const getSelectedIds = () => {
    return Array.from(selectedIds.value)
  }

  const setItems = (newItems: T[]) => {
    items.value = newItems
  }

  const setSelectedIds = (ids: number[]) => {
    selectedIds.value = new Set(ids)
  }

  return {
    items: readonly(items),
    selectedItems: readonly(selectedItems),
    selectedIds: readonly(selectedIds),
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedIds,
    setItems,
    setSelectedIds
  }
}

// User selection composable
export const useUserSelection = () => {
  const { users, loading, error, searchQuery, loadUsers } = useUserSelect()
  const {
    selectedItems,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedIds,
    setItems
  } = useMultiSelect<User>()

  // Set users as multi-select items
  watch(users, (newUsers) => {
    setItems(newUsers)
  }, { immediate: true })

  return {
    users,
    selectedUsers: selectedItems,
    loading,
    error,
    searchQuery,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedUserIds: getSelectedIds,
    loadUsers
  }
}

// Role selection composable
export const useRoleSelection = () => {
  const { roles, loading, error, loadRoles } = useUserSelect()
  const {
    selectedItems,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedIds,
    setItems
  } = useMultiSelect<Role>()

  // Set roles as multi-select items
  watch(roles, (newRoles) => {
    setItems(newRoles)
  }, { immediate: true })

  return {
    roles,
    selectedRoles: selectedItems,
    loading,
    error,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedRoleIds: getSelectedIds,
    loadRoles
  }
}