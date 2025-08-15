<template>
  <div class="calendar-view">
    <!-- Calendar Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">{{ currentMonthYear }}</h2>
      <div class="flex gap-2">
        <Button @click="previousMonth" size="small" outlined>
          <Icon name="lucide:chevron-left" />
        </Button>
        <Button @click="nextMonth" size="small" outlined>
          <Icon name="lucide:chevron-right" />
        </Button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid border border-gray-200 rounded-lg overflow-hidden">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 bg-gray-50">
        <div v-for="day in daysOfWeek" :key="day" class="p-2 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-1 bg-white hover:bg-gray-50"
          :class="{
            'bg-gray-50 text-gray-400': !day.isCurrentMonth,
            'bg-blue-50': day.isToday
          }"
        >
          <!-- Date Number -->
          <div class="text-sm font-medium mb-1" :class="{ 'text-blue-600': day.isToday }">
            {{ day.date }}
          </div>

          <!-- Journal Events -->
          <div class="space-y-1">
            <div 
              v-for="journal in day.journals" 
              :key="(journal as { id: string | number }).id"
              class="text-xs p-1 rounded cursor-pointer truncate"
              :class="getJournalColor((journal as { journal_category?: { name: string } })?.journal_category?.name ?? '')"
              @click="openPreviewDialog(journal)"
              :title="(journal as { title: string }).title"
            >
              <div class="flex items-center gap-1">
                <span class="text-xs">{{ (journal as { journal_category?: { icon: string } }).journal_category?.icon }}</span>
                <span class="truncate">{{ (journal as { title: string }).title }}</span>
              </div>
              <div class="text-xs opacity-75">
                {{ formatTime((journal as { start: string }).start) }}
                <span v-if="(journal as { end: string }).end"> - {{ formatTime((journal as { end: string }).end) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'

const dayjs = useDayjs()

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['openPreviewDialog'])

const currentDate = ref(dayjs())
const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const currentMonthYear = computed(() => {
  return currentDate.value.format('MMMM YYYY')
})

const calendarDays = computed(() => {
  const startOfMonth = currentDate.value.startOf('month')
  const endOfMonth = currentDate.value.endOf('month')
  const startOfCalendar = startOfMonth.startOf('week')
  const endOfCalendar = endOfMonth.endOf('week')
  
  const days = []
  let current = startOfCalendar
  
  while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
    const dayData = {
      date: current.date(),
      fullDate: current.format('YYYY-MM-DD'),
      isCurrentMonth: current.isSame(currentDate.value, 'month'),
      isToday: current.isSame(dayjs(), 'day'),
      journals: getJournalsForDate(current.format('YYYY-MM-DD'))
    }
    days.push(dayData)
    current = current.add(1, 'day')
  }
  
  return days
})

const getJournalsForDate = (date: string) => {
  return props.data.filter((journal: any) => {
    const journalDate = dayjs(journal.start).format('YYYY-MM-DD')
    return journalDate === date
  })
}

const getJournalColor = (categoryName: string) => {
  const colors = {
    'Development': 'bg-blue-200 text-blue-800',
    'Meeting': 'bg-green-200 text-green-800',
    'Bug Fix': 'bg-red-200 text-red-800',
    'Research': 'bg-purple-200 text-purple-800',
    'Testing': 'bg-yellow-200 text-yellow-800',
    'Documentation': 'bg-gray-200 text-gray-800',
    'Review': 'bg-indigo-200 text-indigo-800'
  }
  return colors[categoryName as keyof typeof colors] || 'bg-gray-200 text-gray-800'
}

const formatTime = (datetime: string) => {
  return dayjs(datetime).format('HH:mm')
}

const previousMonth = () => {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month')
}

const openPreviewDialog = (journal: any) => {
  emit('openPreviewDialog', journal)
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
}

.calendar-view {
  @apply w-full;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-grid {
    font-size: 0.75rem;
  }
  
  .min-h-\[120px\] {
    min-height: 80px;
  }
}
</style>
