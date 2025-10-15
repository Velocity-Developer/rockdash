export interface TodoError {
  message: string
  code?: string
  status?: number
  details?: any
}

export interface ValidationError {
  field: string
  message: string
  rule?: string
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

export const TodoErrorHandler = {
  // Parse error from different sources
  parseError: (error: any): TodoError => {
    // Handle Nuxt/fetch errors
    if (error?.data) {
      return {
        message: error.data.message || 'An error occurred',
        code: error.data.code,
        status: error.statusCode || error.status,
        details: error.data.errors || error.data
      }
    }

    // Handle fetch/API errors
    if (error?.response?.data) {
      const response = error.response.data
      return {
        message: response.message || 'API request failed',
        code: response.code,
        status: error.response.status,
        details: response.errors || response
      }
    }

    // Handle network errors
    if (error?.name === 'FetchError' || error?.message?.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        details: error.message
      }
    }

    // Handle timeout errors
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return {
        message: 'Request timeout. Please try again.',
        code: 'TIMEOUT_ERROR',
        details: error.message
      }
    }

    // Handle validation errors (Laravel style)
    if (error?.status === 422 && error?.data?.errors) {
      const validationErrors = Object.entries(error.data.errors).map(([field, messages]) => ({
        field,
        message: Array.isArray(messages) ? messages[0] : messages
      }))

      return {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        status: 422,
        details: validationErrors
      }
    }

    // Handle authentication errors
    if (error?.status === 401 || error?.response?.status === 401) {
      return {
        message: 'Authentication required. Please login again.',
        code: 'AUTH_ERROR',
        status: 401
      }
    }

    // Handle authorization errors
    if (error?.status === 403 || error?.response?.status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        code: 'PERMISSION_ERROR',
        status: 403
      }
    }

    // Handle not found errors
    if (error?.status === 404 || error?.response?.status === 404) {
      return {
        message: 'The requested resource was not found.',
        code: 'NOT_FOUND',
        status: 404
      }
    }

    // Handle server errors
    if (error?.status >= 500 || error?.response?.status >= 500) {
      return {
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
        status: error?.status || error?.response?.status || 500
      }
    }

    // Default error handling
    return {
      message: error?.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    }
  },

  // Get user-friendly error messages
  getErrorMessage: (error: TodoError): string => {
    // Check for validation errors first
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      const firstError = Array.isArray(error.details) ? error.details[0] : error.details
      return firstError?.message || error.message
    }

    // Common error messages
    const errorMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
      'TIMEOUT_ERROR': 'Request timed out. Please try again.',
      'AUTH_ERROR': 'Your session has expired. Please login again.',
      'PERMISSION_ERROR': 'You don\'t have permission to perform this action.',
      'NOT_FOUND': 'The requested todo or resource was not found.',
      'SERVER_ERROR': 'Server is currently unavailable. Please try again later.',
      'VALIDATION_ERROR': 'Please check the form for errors and try again.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    }

    return errorMessages[error.code || ''] || error.message
  },

  // Extract validation errors for form display
  getValidationErrors: (error: TodoError): Record<string, string> => {
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      const errors: Record<string, string> = {}

      if (Array.isArray(error.details)) {
        error.details.forEach((validationError: ValidationError) => {
          errors[validationError.field] = validationError.message
        })
      }

      return errors
    }

    return {}
  },

  // Check if error is recoverable
  isRecoverable: (error: TodoError): boolean => {
    const recoverableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR'
    ]

    return recoverableCodes.includes(error.code || '') || (error.status && error.status >= 500)
  },

  // Check if error requires re-authentication
  requiresReauth: (error: TodoError): boolean => {
    return error.code === 'AUTH_ERROR' || error.status === 401
  },

  // Check if error is permission related
  isPermissionError: (error: TodoError): boolean => {
    return error.code === 'PERMISSION_ERROR' || error.status === 403
  }
}

// Composable for error handling
export const useTodoError = () => {
  const error = ref<TodoError | null>(null)
  const showError = ref(false)
  const errorTimeout = ref<NodeJS.Timeout>()

  // Set error and auto-hide after timeout
  const setError = (err: any, autoHide = true) => {
    error.value = TodoErrorHandler.parseError(err)
    showError.value = true

    if (autoHide) {
      clearTimeout(errorTimeout.value)
      errorTimeout.value = setTimeout(() => {
        clearError()
      }, 5000) // Auto-hide after 5 seconds
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
    showError.value = false
    clearTimeout(errorTimeout.value)
  }

  // Get user-friendly error message
  const errorMessage = computed(() => {
    return error.value ? TodoErrorHandler.getErrorMessage(error.value) : ''
  })

  // Get validation errors for forms
  const validationErrors = computed(() => {
    return error.value ? TodoErrorHandler.getValidationErrors(error.value) : {}
  })

  // Check if error requires re-authentication
  const needsReauth = computed(() => {
    return error.value ? TodoErrorHandler.requiresReauth(error.value) : false
  })

  // Check if error is permission related
  const hasPermissionError = computed(() => {
    return error.value ? TodoErrorHandler.isPermissionError(error.value) : false
  })

  // Check if error is recoverable
  const isRecoverable = computed(() => {
    return error.value ? TodoErrorHandler.isRecoverable(error.value) : false
  })

  // Handle API call with error catching
  const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      clearError()
      return await apiCall()
    } catch (err) {
      setError(err)
      return null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    clearTimeout(errorTimeout.value)
  })

  return {
    error: readonly(error),
    showError: readonly(showError),
    errorMessage,
    validationErrors,
    needsReauth,
    hasPermissionError,
    isRecoverable,
    setError,
    clearError,
    handleApiCall
  }
}

// Toast notification composable
export const useTodoToast = () => {
  const toast = ref<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }>({
    show: false,
    message: '',
    type: 'info',
    duration: 3000
  })

  const toastTimeout = ref<NodeJS.Timeout>()

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    toast.value = {
      show: true,
      message,
      type,
      duration
    }

    clearTimeout(toastTimeout.value)
    toastTimeout.value = setTimeout(() => {
      hideToast()
    }, duration)
  }

  const hideToast = () => {
    toast.value.show = false
    clearTimeout(toastTimeout.value)
  }

  // Convenience methods
  const showSuccess = (message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }

  const showError = (message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }

  const showWarning = (message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }

  const showInfo = (message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    clearTimeout(toastTimeout.value)
  })

  return {
    toast: readonly(toast),
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}