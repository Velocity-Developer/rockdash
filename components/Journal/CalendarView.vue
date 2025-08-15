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
          class="min-h-[140px] border-r border-b border-gray-200 last:border-r-0 p-2 bg-white hover:bg-gray-50 flex flex-col"
          :class="{
            'bg-gray-50 text-gray-400': !day.isCurrentMonth,
            'bg-blue-50': day.isToday
          }"
        >
          <!-- Date Number -->
          <div class="text-sm font-medium mb-2 flex-shrink-0" :class="{ 'text-blue-600': day.isToday }">
            {{ day.date }}
          </div>

          <!-- Journal Events -->
          <div class="flex-1 flex flex-col gap-1">
            <div 
              v-for="journal in day.journals" 
              :key="(journal as { id: string | number }).id"
              class="text-xs p-2 cursor-pointer shadow-sm transition-all hover:shadow-md flex-shrink-0"
              :class="[getJournalColor((journal as { journal_category?: { name: string } })?.journal_category?.name ?? ''), getJournalSpanClass(journal, day.fullDate)]"
              @click="openPreviewDialog(journal)"
              :title="getJournalTooltip(journal, day.fullDate)"
            >
              <div class="flex items-center gap-1 mb-1">
                <span class="text-xs flex-shrink-0">{{ (journal as { journal_category?: { icon: string } }).journal_category?.icon }}</span>
                <span class="truncate font-medium">{{ (journal as { title: string }).title }}</span>
                <span v-if="isJournalOngoing(journal)" class="text-xs ml-1 flex-shrink-0">🔄</span>
              </div>
              <div class="text-xs opacity-80 font-medium">
                {{ getJournalTimeDisplay(journal, day.fullDate) }}
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
    const startDate = dayjs(journal.start).format('YYYY-MM-DD')
    const endDate = journal.end ? dayjs(journal.end).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
    
    // Check if the date falls within the journal's date range
    return (dayjs(date).isAfter(startDate) || dayjs(date).isSame(startDate)) && (dayjs(date).isBefore(endDate) || dayjs(date).isSame(endDate))
  }).sort((a: any, b: any) => {
    // Sort by start time (earliest first)
    return dayjs(a.start).isBefore(dayjs(b.start)) ? -1 : 1
  })
}

const getJournalColor = (categoryName: string) => {
  const colors = {
    'Development': 'bg-blue-100 text-blue-900 border-blue-300',
    'Meeting': 'bg-green-100 text-green-900 border-green-300',
    'Bug Fix': 'bg-red-100 text-red-900 border-red-300',
    'Research': 'bg-purple-100 text-purple-900 border-purple-300',
    'Testing': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'Documentation': 'bg-gray-100 text-gray-900 border-gray-300',
    'Review': 'bg-indigo-100 text-indigo-900 border-indigo-300'
  }
  return colors[categoryName as keyof typeof colors] || 'bg-gray-100 text-gray-900'
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

const getJournalSpanClass = (journal: any, currentDate: string) => {
  const startDate = dayjs(journal.start).format('YYYY-MM-DD')
  const endDate = journal.end ? dayjs(journal.end).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  
  if (startDate === endDate) return ''
  
  if (currentDate === startDate) return 'border-l-2 border-y-2 border-blue-500 rounded-l-md mr-[-10px]'
  if (currentDate === endDate) return 'border-r-2 border-y-2 border-blue-500 rounded-r-md ml-[-10px]'
  return 'border-y-2 border-blue-500 mx-[-10px]'
}

const isJournalOngoing = (journal: any) => {
  return !journal.end
}

const getJournalTooltip = (journal: any, currentDate: string) => {
  const startDate = dayjs(journal.start).format('YYYY-MM-DD')
  const endDate = journal.end ? dayjs(journal.end).format('YYYY-MM-DD') : 'Ongoing'
  
  if (startDate === currentDate) {
    return `${journal.title} (Start: ${formatTime(journal.start)}${journal.end ? ' - End: ' + endDate : ' - Ongoing'})`
  }
  
  return `${journal.title} (${startDate} - ${endDate})`
}

const getJournalTimeDisplay = (journal: any, currentDate: string) => {
  const startDate = dayjs(journal.start).format('YYYY-MM-DD')
  const endDate = journal.end ? dayjs(journal.end).format('YYYY-MM-DD') : null
  
  if (currentDate === startDate) {
    return formatTime(journal.start) + (journal.end && endDate === startDate ? ` - ${formatTime(journal.end)}` : '')
  }
  
  if (endDate && currentDate === endDate) {
    return `End: ${formatTime(journal.end)}`
  }
  
  return 'Continuing...'
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
