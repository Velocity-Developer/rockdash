export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface StatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  nextStatuses?: TodoStatus[]
}

export interface PriorityConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  weight: number
}

export const TodoStatuses: Record<TodoStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: 'pi pi-clock',
    nextStatuses: ['in_progress', 'completed', 'cancelled']
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: 'pi pi-spin pi-spinner',
    nextStatuses: ['completed', 'cancelled', 'pending']
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: 'pi pi-check-circle',
    nextStatuses: []
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: 'pi pi-times-circle',
    nextStatuses: ['pending', 'in_progress']
  }
}

export const TodoPriorities: Record<TodoPriority, PriorityConfig> = {
  low: {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: 'pi pi-arrow-down',
    weight: 1
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: 'pi pi-minus',
    weight: 2
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: 'pi pi-arrow-up',
    weight: 3
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: 'pi pi-exclamation-triangle',
    weight: 4
  }
}

// Date utilities
export const DateUtils = {
  // Format date for display
  formatDate: (date: string | Date | null | undefined): string => {
    if (!date) return '-'

    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  },

  // Format datetime for display
  formatDateTime: (date: string | Date | null | undefined): string => {
    if (!date) return '-'

    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  // Format relative time
  formatRelativeTime: (date: string | Date | null | undefined): string => {
    if (!date) return '-'

    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return DateUtils.formatDate(date)
    }
  },

  // Check if date is overdue
  isOverdue: (date: string | Date | null | undefined): boolean => {
    if (!date) return false

    const d = new Date(date)
    if (isNaN(d.getTime())) return false

    const now = new Date()
    return d.getTime() < now.getTime()
  },

  // Check if date is due soon (within 3 days)
  isDueSoon: (date: string | Date | null | undefined): boolean => {
    if (!date) return false

    const d = new Date(date)
    if (isNaN(d.getTime())) return false

    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))

    return d.getTime() >= now.getTime() && d.getTime() <= threeDaysFromNow.getTime()
  },

  // Format date for input (YYYY-MM-DD)
  formatForInput: (date: string | Date | null | undefined): string => {
    if (!date) return ''

    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return d.toISOString().split('T')[0]
  }
}

// Status utilities
export const StatusUtils = {
  // Get status configuration
  getStatusConfig: (status: TodoStatus): StatusConfig => {
    return TodoStatuses[status] || TodoStatuses.pending
  },

  // Get status label
  getStatusLabel: (status: TodoStatus): string => {
    return TodoStatuses[status]?.label || status
  },

  // Get status color classes
  getStatusColors: (status: TodoStatus): { color: string, bg: string, border: string } => {
    const config = TodoStatuses[status] || TodoStatuses.pending
    return {
      color: config.color,
      bg: config.bgColor,
      border: config.borderColor
    }
  },

  // Get status icon
  getStatusIcon: (status: TodoStatus): string => {
    return TodoStatuses[status]?.icon || 'pi pi-question-circle'
  },

  // Check if status is completed
  isCompleted: (status: TodoStatus): boolean => {
    return status === 'completed'
  },

  // Check if status is active (not cancelled or completed)
  isActive: (status: TodoStatus): boolean => {
    return status !== 'completed' && status !== 'cancelled'
  },

  // Get next available statuses
  getNextStatuses: (status: TodoStatus): TodoStatus[] => {
    return TodoStatuses[status]?.nextStatuses || []
  }
}

// Priority utilities
export const PriorityUtils = {
  // Get priority configuration
  getPriorityConfig: (priority: TodoPriority): PriorityConfig => {
    return TodoPriorities[priority] || TodoPriorities.medium
  },

  // Get priority label
  getPriorityLabel: (priority: TodoPriority): string => {
    return TodoPriorities[priority]?.label || priority
  },

  // Get priority color classes
  getPriorityColors: (priority: TodoPriority): { color: string, bg: string, border: string } => {
    const config = TodoPriorities[priority] || TodoPriorities.medium
    return {
      color: config.color,
      bg: config.bgColor,
      border: config.borderColor
    }
  },

  // Get priority icon
  getPriorityIcon: (priority: TodoPriority): string => {
    return TodoPriorities[priority]?.icon || 'pi pi-minus'
  },

  // Get priority weight for sorting
  getPriorityWeight: (priority: TodoPriority): number => {
    return TodoPriorities[priority]?.weight || 2
  },

  // Sort by priority (higher weight first)
  sortByPriority: <T extends { priority: TodoPriority }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      const weightA = PriorityUtils.getPriorityWeight(a.priority)
      const weightB = PriorityUtils.getPriorityWeight(b.priority)
      return weightB - weightA // Higher priority first
    })
  }
}

// Text utilities
export const TextUtils = {
  // Truncate text
  truncate: (text: string | null | undefined, maxLength: number = 50): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  },

  // Strip HTML tags
  stripHtml: (html: string | null | undefined): string => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '')
  },

  // Highlight search term
  highlightSearch: (text: string | null | undefined, searchTerm: string): string => {
    if (!text || !searchTerm) return text || ''

    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  },

  // Get initials from name
  getInitials: (name: string | null | undefined, maxLength: number = 2): string => {
    if (!name) return ''

    const parts = name.trim().split(' ')
    if (parts.length === 1) {
      return parts[0].substring(0, maxLength).toUpperCase()
    }

    return parts
      .slice(0, maxLength)
      .map(part => part.charAt(0).toUpperCase())
      .join('')
  }
}

// Validation utilities
export const ValidationUtils = {
  // Validate email
  isValidEmail: (email: string | null | undefined): boolean => {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Validate URL
  isValidUrl: (url: string | null | undefined): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Validate todo title
  isValidTodoTitle: (title: string | null | undefined): boolean => {
    if (!title) return false
    return title.trim().length >= 3 && title.trim().length <= 255
  },

  // Validate priority
  isValidPriority: (priority: string): priority is TodoPriority => {
    return ['low', 'medium', 'high', 'urgent'].includes(priority)
  },

  // Validate status
  isValidStatus: (status: string): status is TodoStatus => {
    return ['pending', 'in_progress', 'completed', 'cancelled'].includes(status)
  }
}

// Color utilities
export const ColorUtils = {
  // Generate avatar background color based on name
  generateAvatarColor: (name: string | null | undefined): string => {
    if (!name) return '#6B7280' // Default gray

    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
      '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
      '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
      '#EC4899', '#F43F5E'
    ]

    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const index = Math.abs(hash) % colors.length
    return colors[index]
  },

  // Get contrasting text color
  getContrastColor: (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }
}