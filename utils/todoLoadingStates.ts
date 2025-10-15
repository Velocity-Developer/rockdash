export interface LoadingState {
  loading: boolean
  text?: string
  progress?: number
}

export interface LoadingStates {
  todos: LoadingState
  todo: LoadingState
  createTodo: LoadingState
  updateTodo: LoadingState
  deleteTodo: LoadingState
  assignments: LoadingState
  categories: LoadingState
  stats: LoadingState
  users: LoadingState
  roles: LoadingState
}

export const useTodoLoading = () => {
  const loadingStates = ref<LoadingStates>({
    todos: { loading: false, text: 'Loading todos...' },
    todo: { loading: false, text: 'Loading todo details...' },
    createTodo: { loading: false, text: 'Creating todo...' },
    updateTodo: { loading: false, text: 'Updating todo...' },
    deleteTodo: { loading: false, text: 'Deleting todo...' },
    assignments: { loading: false, text: 'Managing assignments...' },
    categories: { loading: false, text: 'Loading categories...' },
    stats: { loading: false, text: 'Loading statistics...' },
    users: { loading: false, text: 'Loading users...' },
    roles: { loading: false, text: 'Loading roles...' }
  })

  // Generic loading state manager
  const setLoading = (key: keyof LoadingStates, loading: boolean, text?: string, progress?: number) => {
    loadingStates.value[key] = {
      loading,
      text: text || loadingStates.value[key].text,
      progress
    }
  }

  // Specific loading helpers
  const setLoadingTodos = (loading: boolean, text?: string) => setLoading('todos', loading, text)
  const setLoadingTodo = (loading: boolean, text?: string) => setLoading('todo', loading, text)
  const setLoadingCreateTodo = (loading: boolean, text?: string) => setLoading('createTodo', loading, text)
  const setLoadingUpdateTodo = (loading: boolean, text?: string) => setLoading('updateTodo', loading, text)
  const setLoadingDeleteTodo = (loading: boolean, text?: string) => setLoading('deleteTodo', loading, text)
  const setLoadingAssignments = (loading: boolean, text?: string) => setLoading('assignments', loading, text)
  const setLoadingCategories = (loading: boolean, text?: string) => setLoading('categories', loading, text)
  const setLoadingStats = (loading: boolean, text?: string) => setLoading('stats', loading, text)
  const setLoadingUsers = (loading: boolean, text?: string) => setLoading('users', loading, text)
  const setLoadingRoles = (loading: boolean, text?: string) => setLoading('roles', loading, text)

  // Global loading state
  const globalLoading = computed(() => {
    return Object.values(loadingStates.value).some(state => state.loading)
  })

  // Get current loading text
  const currentLoadingText = computed(() => {
    const currentLoading = Object.values(loadingStates.value).find(state => state.loading)
    return currentLoading?.text || ''
  })

  // Get current loading progress
  const currentProgress = computed(() => {
    const currentLoading = Object.values(loadingStates.value).find(state => state.loading && state.progress !== undefined)
    return currentLoading?.progress || 0
  })

  return {
    loadingStates: readonly(loadingStates),
    globalLoading: readonly(globalLoading),
    currentLoadingText: readonly(currentLoadingText),
    currentProgress: readonly(currentProgress),
    setLoading,
    setLoadingTodos,
    setLoadingTodo,
    setLoadingCreateTodo,
    setLoadingUpdateTodo,
    setLoadingDeleteTodo,
    setLoadingAssignments,
    setLoadingCategories,
    setLoadingStats,
    setLoadingUsers,
    setLoadingRoles
  }
}

// Loading overlay composable
export const useLoadingOverlay = () => {
  const overlay = ref<{
    show: boolean
    text: string
    progress?: number
    backdrop?: boolean
  }>({
    show: false,
    text: 'Loading...',
    progress: undefined,
    backdrop: true
  })

  const showOverlay = (text = 'Loading...', progress?: number, backdrop = true) => {
    overlay.value = {
      show: true,
      text,
      progress,
      backdrop
    }
  }

  const hideOverlay = () => {
    overlay.value.show = false
    overlay.value.progress = undefined
  }

  const updateProgress = (progress: number) => {
    overlay.value.progress = progress
  }

  const updateText = (text: string) => {
    overlay.value.text = text
  }

  return {
    overlay: readonly(overlay),
    showOverlay,
    hideOverlay,
    updateProgress,
    updateText
  }
}

// Skeleton loader composable
export const useSkeletonLoader = () => {
  const skeletonItems = ref<number[]>([])
  const skeletonLoading = ref(false)

  const showSkeletons = (count: number) => {
    skeletonItems.value = Array.from({ length: count }, (_, i) => i)
    skeletonLoading.value = true
  }

  const hideSkeletons = () => {
    skeletonItems.value = []
    skeletonLoading.value = false
  }

  return {
    skeletonItems: readonly(skeletonItems),
    skeletonLoading: readonly(skeletonLoading),
    showSkeletons,
    hideSkeletons
  }
}