<template>
  <Card class="border-none shadow-lg">
    <template #content>
      
      <!-- Calendar Grid -->
      <div class="overflow-auto max-h-[75vh] bg-gray-50 dark:bg-zinc-900/50 scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-zinc-800 scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600 scrollbar-thumb-rounded hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-500">
        <table class="w-full calendar-table">
          <!-- Day Headers -->
          <thead class="sticky top-0 z-30 bg-white dark:bg-zinc-900 shadow-sm">
            <tr>
              <th
                v-for="(day, index) in dates"
                :key="index"
                class="border border-gray-200 dark:border-zinc-700 p-1 w-16 min-w-16 font-semibold transition-all duration-200 md:w-14 md:min-w-14 md:p-1 sm:w-12 sm:min-w-12 sm:p-0.5"
                :class="{
                  'bg-indigo-50 dark:bg-indigo-900/30': isToday(day),
                  'bg-gray-50 dark:bg-zinc-800': !isToday(day)
                }"
              >
                <div class="text-center">
                  <div class="font-bold text-sm md:text-sm sm:text-xs" :class="{
                    'text-indigo-600 dark:text-indigo-400': isToday(day),
                    'text-gray-700 dark:text-gray-300': !isToday(day)
                  }">
                    {{ dayjs(day).format('D') }}
                  </div>
                  <div class="font-medium text-gray-600 dark:text-gray-400 uppercase text-[10px] md:text-[10px] sm:text-[9px]">
                    {{ dayjs(day).format('ddd') }}
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Task Rows -->
          <tbody class="bg-white dark:bg-zinc-900">
            <tr
              v-for="(journal, journalIndex) in props.data"
              :key="(journal as { id: string | number }).id"
              class="calendar-row hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <!-- Task Cells -->
              <td
                v-for="(day, dayIndex) in dates"
                :key="dayIndex"
                class="border border-gray-100 dark:border-zinc-800 p-1 w-16 min-w-16 relative align-top transition-colors duration-150 md:w-14 md:min-w-14 md:p-0.5 sm:w-12 sm:min-w-12 sm:p-0.5"
                :class="{
                  'bg-indigo-50/30 dark:bg-indigo-900/10': isToday(day),
                  'bg-white dark:bg-zinc-900': !isToday(day)
                }"
              >
                <div
                  v-if="JournalInDate(journal, day) != 'out'"
                  @click="openPreviewDialog(journal)"
                  class="cursor-pointer relative group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg min-h-[1.75rem] md:min-h-[1.5rem] sm:min-h-[1.25rem] backdrop-blur-sm border border-white/20 hover:-translate-y-0.5"
                  :class="[
                    getTaskClasses(journal, day),
                    getBgClass(journal)
                  ]"
                >
                  <!-- Task Content -->
                  <div
                    class="flex items-center gap-1 p-1 min-h-[1.75rem] md:min-h-[1.5rem] md:p-0.5 md:gap-0.5 sm:min-h-[1.25rem] sm:p-0.5"
                    :class="getTaskContentClasses(journal, day)"
                  >
                    <!-- Task Icon -->
                    <div class="task-icon flex-shrink-0">
                      <span
                        v-if="journal?.journal_category?.icon"
                        class="noto-emoji text-xs md:text-[10px]"
                        :class="getIconOpacity(journal, day)"
                      >
                        {{ journal.journal_category.icon || '✔' }}
                      </span>
                      <i
                        v-else
                        class="pi pi-calendar text-[10px] text-white/80"
                        :class="getIconOpacity(journal, day)"
                      ></i>
                    </div>

                    <!-- Task Title -->
                    <div
                      class="task-title flex-1 min-w-0"
                      :class="getTitleClasses(journal, day)"
                      :style="getTitleStyle(journal, day)"
                    >
                      <div class="font-medium text-xs text-gray-800 dark:text-white truncate md:text-[12px]"
                           v-tooltip.top="(journal as { title: string }).title">
                          {{ purifyHtml((journal as { title: string }).title,30) }}
                      </div>
                    </div>

                    <!-- Task Actions -->
                    <div v-if="JournalInDate(journal, day) === 'start_date'"
                         class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 sm:hidden">
                      <Button
                        icon="pi pi-ellipsis-h"
                        size="small"
                        severity="secondary"
                        text
                        rounded
                        class="w-6 h-6 text-xs"
                        @click.stop="$emit('taskOptions', journal)"
                      />
                    </div>
                  </div>

                  <!-- Duration Indicator -->
                  <div
                    v-if="JournalVisibleDays(journal) > 1 && JournalInDate(journal, day) === 'start_date'"
                    class="duration-indicator absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const props = defineProps({
  data: {
    type: Object,
    default: () => []
  },
  start: {
    type: String,
    default: ''
  },
  end: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['openPreviewDialog', 'previousPeriod', 'nextPeriod', 'today', 'taskOptions'])
const openPreviewDialog = (journal: any) => {
  emit('openPreviewDialog', journal)
}

const currentDate = ref(dayjs())
const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const dates = computed(() => {
  const arr = [];
  let current = new Date(props.start);
  while (current <= new Date(props.end)) {
    arr.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return arr;
});

//check jika Journal ada dalam dates, berdasarkan start and end
const JournalInDate = (journal: any, date: Date) => {
  const the_date = dayjs(date).local().format('YYYY-MM-DD')
  const start = dayjs(journal.start).local().format('YYYY-MM-DD')
  const end = journal.end?dayjs(journal.end).local().format('YYYY-MM-DD'):dayjs().local().format('YYYY-MM-DD')

  //jika the_date = start : start_date
  if(the_date == start && the_date != end) {
    return 'start_date'
  } else if(the_date == end && the_date != start) {
    return 'end_date'
  } else if(start < the_date && end > the_date) {
    return 'middle_date'
  } else if(the_date == start && the_date == end) {
    return 'one_day'
  } else {
    return 'out'
  }

}

//hitung hari
const JournalTotalDays = (journal: any) => {
  const start = dayjs(journal.start).local();
  const end = journal.end ? dayjs(journal.end).local() : dayjs().local();

  // hitung selisih hari (termasuk start)
  const diffDays = end.diff(start, "day") + 1;

  return diffDays;
};

// hitung hari yang visible dalam calendar view
const JournalVisibleDays = (journal: any) => {
  const journalStart = dayjs(journal.start).local();
  const journalEnd = journal.end ? dayjs(journal.end).local() : dayjs().local();
  const calendarStart = dayjs(props.start).local();
  const calendarEnd = dayjs(props.end).local();

  // tentukan start dan end yang benar-benar visible
  const visibleStart = journalStart.isAfter(calendarStart) ? journalStart : calendarStart;
  const visibleEnd = journalEnd.isBefore(calendarEnd) ? journalEnd : calendarEnd;

  // hitung selisih hari visible (termasuk start)
  const visibleDays = visibleEnd.diff(visibleStart, "day") + 1;

  return Math.max(1, visibleDays); // minimal 1 hari
};

// Fungsi untuk ambil warna berdasarkan status
const getBgClass = (journal: any) => {
  // Default color if no status
  const defaultColor = "bg-gray-200 dark:bg-gray-700";

  // Map status to colors
  const statusColors: Record<string, string> = {
    // Status common untuk task/journal
    'pending': 'bg-yellow-200 dark:bg-yellow-800',
    'draft': 'bg-gray-200 dark:bg-gray-700',
    'open': 'bg-blue-200 dark:bg-blue-800',
    'in_progress': 'bg-amber-200 dark:bg-amber-800',
    'progress': 'bg-amber-200 dark:bg-amber-800',
    'review': 'bg-purple-200 dark:bg-purple-800',
    'testing': 'bg-indigo-200 dark:bg-indigo-800',
    'completed': 'bg-emerald-200 dark:bg-emerald-800',
    'done': 'bg-emerald-200 dark:bg-emerald-800',
    'closed': 'bg-gray-300 dark:bg-gray-600',
    'cancelled': 'bg-red-200 dark:bg-red-800',
    'canceled': 'bg-red-200 dark:bg-red-800',
    'rejected': 'bg-red-300 dark:bg-red-900',
    'approved': 'bg-green-200 dark:bg-green-800',
    'active': 'bg-teal-200 dark:bg-teal-800',
    'inactive': 'bg-gray-200 dark:bg-gray-700',
    'suspended': 'bg-orange-200 dark:bg-orange-800',

    // Financial status
    'unpaid': 'bg-red-200 dark:bg-red-800',
    'paid': 'bg-emerald-200 dark:bg-emerald-800',
    'partial': 'bg-amber-200 dark:bg-amber-800',
    'overdue': 'bg-red-300 dark:bg-red-900',

    // Priority status
    'low': 'bg-gray-200 dark:bg-gray-700',
    'medium': 'bg-blue-200 dark:bg-blue-800',
    'high': 'bg-orange-200 dark:bg-orange-800',
    'urgent': 'bg-red-200 dark:bg-red-800',
    'critical': 'bg-red-300 dark:bg-red-900'
  };

  // Check various possible status fields
  const statusFields = [
    journal.status,
    journal.journal_status,
    journal.state,
    journal.payment_status,
    journal.priority,
    journal.task_status,
    journal.approval_status
  ];

  // Find the first non-null status
  const status = statusFields.find(field =>
    field && typeof field === 'string' && field.trim() !== ''
  );

  // Return the color for the status, or default
  if (status && statusColors[status.toLowerCase()]) {
    return statusColors[status.toLowerCase()];
  }

  // Fallback: use category-based coloring if no status
  if (journal.journal_category?.name) {
    const categoryColors: Record<string, string> = {
      'income': 'bg-emerald-200 dark:bg-emerald-800',
      'expense': 'bg-red-200 dark:bg-red-800',
      'project': 'bg-blue-200 dark:bg-blue-800',
      'maintenance': 'bg-orange-200 dark:bg-orange-800',
      'support': 'bg-purple-200 dark:bg-purple-800',
      'development': 'bg-indigo-200 dark:bg-indigo-800'
    };

    const categoryName = journal.journal_category.name.toLowerCase();
    return categoryColors[categoryName] || defaultColor;
  }

  return defaultColor;
};

// New utility methods for enhanced calendar
const formatCalendarPeriod = () => {
  if (dates.value.length === 0) return '';

  const start = dayjs(dates.value[0]);
  const end = dayjs(dates.value[dates.value.length - 1]);

  if (start.isSame(end, 'month')) {
    return start.format('MMMM YYYY');
  } else {
    return `${start.format('MMM')} - ${end.format('MMM YYYY')}`;
  }
};

const isToday = (date: Date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

const getTaskClasses = (journal: any, date: Date) => {
  const dateStatus = JournalInDate(journal, date);
  const baseClasses = [
    'border',
    'border-white/20',
    'backdrop-blur-sm'
  ];

  switch (dateStatus) {
    case 'start_date':
      return [
        ...baseClasses,
        'rounded-l-lg',
        'mr-[-8px]',
        'z-10'
      ];
    case 'end_date':
      return [
        ...baseClasses,
        'rounded-r-lg',
        'ml-[-8px]',
        'z-10'
      ];
    case 'middle_date':
      return [
        ...baseClasses,
        'mx-[-8px]',
        'rounded-none'
      ];
    case 'one_day':
      return [
        ...baseClasses,
        'rounded-lg'
      ];
    default:
      return [];
  }
};

const getTaskContentClasses = (journal: any, date: Date) => {
  const dateStatus = JournalInDate(journal, date);

  return {
    'opacity-100': dateStatus === 'start_date' || dateStatus === 'one_day',
    'opacity-0': dateStatus === 'middle_date' || dateStatus === 'end_date',
    'absolute top-0 left-0 right-0 bottom-0 z-20': dateStatus === 'start_date' || dateStatus === 'one_day',
    'absolute top-0 left-0 right-0': dateStatus === 'middle_date'
  };
};

const getIconOpacity = (journal: any, date: Date) => {
  const dateStatus = JournalInDate(journal, date);
  return {
    'opacity-100': dateStatus === 'start_date' || dateStatus === 'one_day',
    'opacity-0': dateStatus === 'middle_date' || dateStatus === 'end_date'
  };
};

const getTitleClasses = (journal: any, date: Date) => {
  const dateStatus = JournalInDate(journal, date);

  return {
    'opacity-100': dateStatus === 'start_date' || dateStatus === 'one_day',
    'opacity-0': dateStatus === 'middle_date' || dateStatus === 'end_date',
    'w-16': JournalVisibleDays(journal) <= 1 || (JournalVisibleDays(journal) < 1 && dateStatus === 'middle_date')
  };
};

const getTitleStyle = (journal: any, date: Date) => {
  const dateStatus = JournalInDate(journal, date);

  if (JournalVisibleDays(journal) > 1 && dateStatus === 'start_date') {
    return { width: (JournalVisibleDays(journal) * 4) + 'rem' };
  }
  return {};
};

const showTaskMetadata = (journal: any, date: Date) => {
  const dateStatus = JournalInDate(journal, date);
  return dateStatus === 'start_date' || dateStatus === 'one_day';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};


</script>

