import { useFetch, useRuntimeConfig } from '#app'

export interface TodoList {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  category_id?: number
  created_by: number
  is_private: boolean
  notes?: string
  created_at: string
  updated_at: string
  creator?: {
    id: number
    name: string
    username: string
    avatar_url?: string
  }
  category?: {
    id: number
    name: string
    color: string
    icon: string
  }
  assignments?: TodoAssignment[]
  _stats?: {
    total_assignments: number
    completed_assignments: number
    in_progress_assignments: number
    pending_assignments: number
    completion_percentage: number
  }
}

export interface TodoAssignment {
  id: number
  todo_id: number
  assignable_type: 'user' | 'role'
  assignable_id: number
  assigned_by: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_at: string
  completed_at?: string
  assignable?: {
    id: number
    name: string
    username?: string
    email?: string
    avatar_url?: string
  }
  assigner?: {
    id: number
    name: string
    username: string
  }
}

export interface TodoCategory {
  id: number
  name: string
  color: string
  icon: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TodoStats {
  total: number
  pending: number
  in_progress: number
  completed: number
  cancelled: number
  overdue_count: number
  completion_rate: number
  my_assigned_count: number
  my_created_count: number
}

export interface TodoFilters {
  search?: string
  status?: string
  priority?: string
  category_id?: number
  assigned_to?: 'me' | 'created_by_me' | 'all'
  due_date?: string
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'title'
  sort_direction?: 'asc' | 'desc'
}

export interface CreateTodoData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  category_id?: number
  is_private?: boolean
  notes?: string
  assigned_users?: number[]
  assigned_roles?: number[]
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export const useTodoApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiURL

  // Get all todos with filters and pagination
  const getTodos = async (filters: TodoFilters = {}, page = 1) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    params.append('page', page.toString())

    return useFetch<{ data: TodoList[], links: any, meta: any }>(`${baseURL}/todos`, {
      key: `todos-${params.toString()}`,
      query: Object.fromEntries(params),
      headers: {
        'Accept': 'application/json',
      }
    })
  }

  // Get single todo
  const getTodo = async (id: number) => {
    return useFetch<TodoList>(`${baseURL}/todos/${id}`, {
      key: `todo-${id}`,
      headers: {
        'Accept': 'application/json',
      }
    })
  }

  // Create todo
  const createTodo = async (data: CreateTodoData) => {
    return $fetch<TodoList>(`${baseURL}/todos`, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
  }

  // Update todo
  const updateTodo = async (id: number, data: UpdateTodoData) => {
    return $fetch<TodoList>(`${baseURL}/todos/${id}`, {
      method: 'PUT',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
  }

  // Delete todo
  const deleteTodo = async (id: number) => {
    return $fetch(`${baseURL}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      }
    })
  }

  // Get todo statistics
  const getTodoStats = async () => {
    return useFetch<TodoStats>(`${baseURL}/todos/statistics`, {
      key: 'todo-stats',
      headers: {
        'Accept': 'application/json',
      }
    })
  }

  // Get categories
  const getCategories = async () => {
    return useFetch<TodoCategory[]>(`${baseURL}/todo_categories`, {
      key: 'todo-categories',
      headers: {
        'Accept': 'application/json',
      }
    })
  }

  // Create category
  const createCategory = async (data: Partial<TodoCategory>) => {
    return $fetch<TodoCategory>(`${baseURL}/todo_categories`, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
  }

  // Update category
  const updateCategory = async (id: number, data: Partial<TodoCategory>) => {
    return $fetch<TodoCategory>(`${baseURL}/todo_categories/${id}`, {
      method: 'PUT',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
  }

  // Delete category
  const deleteCategory = async (id: number) => {
    return $fetch(`${baseURL}/todo_categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      }
    })
  }

  // Assignment management
  const addAssignments = async (todoId: number, data: { users?: number[], roles?: number[] }) => {
    return $fetch<TodoAssignment[]>(`${baseURL}/todos/${todoId}/assignments`, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
  }

  const updateAssignment = async (todoId: number, assignmentId: number, status: string) => {
    return $fetch<TodoAssignment>(`${baseURL}/todos/${todoId}/assignments/${assignmentId}`, {
      method: 'PUT',
      body: { status },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
  }

  const removeAssignment = async (todoId: number, assignmentId: number) => {
    return $fetch(`${baseURL}/todos/${todoId}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      }
    })
  }

  return {
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
    getTodoStats,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    addAssignments,
    updateAssignment,
    removeAssignment
  }
}

// Composable for TodoList state management
export const useTodoList = () => {
  const todos = ref<TodoList[]>([])
  const currentTodo = ref<TodoList | null>(null)
  const categories = ref<TodoCategory[]>([])
  const stats = ref<TodoStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<TodoFilters>({
    assigned_to: 'me',
    sort_by: 'created_at',
    sort_direction: 'desc'
  })

  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  const {
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
    getTodoStats,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    addAssignments,
    updateAssignment,
    removeAssignment
  } = useTodoApi()

  // Load todos with current filters
  const loadTodos = async (page = 1) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await getTodos(filters.value, page)

      if (data.value) {
        // Handle different response structures
        if (Array.isArray(data.value)) {
          // Direct array response
          todos.value = data.value
          totalPages.value = 1
          totalItems.value = data.value.length
        } else if (data.value.data && Array.isArray(data.value.data)) {
          // Paginated response with data property
          todos.value = data.value.data
          totalPages.value = data.value.meta?.last_page || 1
          totalItems.value = data.value.meta?.total || data.value.data.length
        } else {
          // Unexpected structure
          console.warn('Unexpected API response structure:', data.value)
          todos.value = []
          totalPages.value = 1
          totalItems.value = 0
        }
        currentPage.value = page
      }
    } catch (err) {
      error.value = 'Failed to load todos'
      console.error('Error loading todos:', err)
      todos.value = []
      totalPages.value = 1
      totalItems.value = 0
    } finally {
      loading.value = false
    }
  }

  // Load single todo
  const loadTodo = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await getTodo(id)
      if (data.value) {
        currentTodo.value = data.value
      }
    } catch (err) {
      error.value = 'Failed to load todo'
      console.error('Error loading todo:', err)
    } finally {
      loading.value = false
    }
  }

  // Create new todo
  const addTodo = async (todoData: CreateTodoData) => {
    loading.value = true
    error.value = null

    try {
      const newTodo = await createTodo(todoData)
      todos.value.unshift(newTodo)
      await loadStats() // Refresh stats
      return newTodo
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create todo'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update todo
  const editTodo = async (id: number, todoData: UpdateTodoData) => {
    loading.value = true
    error.value = null

    try {
      const updatedTodo = await updateTodo(id, todoData)

      // Update in lists
      const index = todos.value.findIndex(t => t.id === id)
      if (index !== -1) {
        todos.value[index] = updatedTodo
      }

      if (currentTodo.value?.id === id) {
        currentTodo.value = updatedTodo
      }

      await loadStats() // Refresh stats
      return updatedTodo
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update todo'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete todo
  const removeTodo = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      await deleteTodo(id)

      // Remove from lists
      todos.value = todos.value.filter(t => t.id !== id)
      if (currentTodo.value?.id === id) {
        currentTodo.value = null
      }

      await loadStats() // Refresh stats
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to delete todo'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Load statistics
  const loadStats = async () => {
    try {
      const { data } = await getTodoStats()
      if (data.value) {
        stats.value = data.value
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  // Load categories
  const loadCategories = async () => {
    try {
      const { data } = await getCategories()
      if (data.value) {
        categories.value = data.value
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  // Set filters and reload
  const setFilters = async (newFilters: TodoFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    await loadTodos(1) // Reset to first page
  }

  // Clear filters
  const clearFilters = async () => {
    filters.value = {
      assigned_to: 'me',
      sort_by: 'created_at',
      sort_direction: 'desc'
    }
    await loadTodos(1)
  }

  // Assignment management
  const addTodoAssignments = async (todoId: number, users: number[], roles: number[]) => {
    loading.value = true
    error.value = null

    try {
      const assignments = await addAssignments(todoId, { users, roles })

      // Refresh the todo
      if (currentTodo.value?.id === todoId) {
        await loadTodo(todoId)
      } else {
        const index = todos.value.findIndex(t => t.id === todoId)
        if (index !== -1) {
          await loadTodos(currentPage.value) // Refresh current page
        }
      }

      return assignments
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to add assignments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTodoAssignment = async (todoId: number, assignmentId: number, status: string) => {
    loading.value = true
    error.value = null

    try {
      const assignment = await updateAssignment(todoId, assignmentId, status)

      // Refresh the todo
      if (currentTodo.value?.id === todoId) {
        await loadTodo(todoId)
      } else {
        const index = todos.value.findIndex(t => t.id === todoId)
        if (index !== -1) {
          await loadTodos(currentPage.value) // Refresh current page
        }
      }

      await loadStats() // Refresh stats
      return assignment
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update assignment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeTodoAssignment = async (todoId: number, assignmentId: number) => {
    loading.value = true
    error.value = null

    try {
      await removeAssignment(todoId, assignmentId)

      // Refresh the todo
      if (currentTodo.value?.id === todoId) {
        await loadTodo(todoId)
      } else {
        const index = todos.value.findIndex(t => t.id === todoId)
        if (index !== -1) {
          await loadTodos(currentPage.value) // Refresh current page
        }
      }

      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to remove assignment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize
  onMounted(async () => {
    await Promise.all([
      loadStats(),
      loadCategories(),
      loadTodos()
    ])
  })

  return {
    // State
    todos: readonly(todos),
    currentTodo: readonly(currentTodo),
    categories: readonly(categories),
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalItems: readonly(totalItems),

    // Actions
    loadTodos,
    loadTodo,
    addTodo,
    editTodo,
    removeTodo,
    loadStats,
    loadCategories,
    setFilters,
    clearFilters,
    addTodoAssignments,
    updateTodoAssignment,
    removeTodoAssignment
  }
}