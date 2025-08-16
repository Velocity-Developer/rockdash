<template>

  <div class="overflow-auto h-[80vh]  my-5">
    <table class="w-full">

      <thead class="sticky top-0 z-20 bg-indigo-100 dark:bg-indigo-700">
        <tr>
          <th v-for="day in dates" class="border p-2 min-w-20 font-normal border-indigo-200 dark:border-indigo-600">
            <div class="text-lg font-bold">
              {{ dayjs(day).format('D') }}
            </div>
            <div class="font-normal text-xs flex justify-center items-center">
              {{ dayjs(day).format('dddd') }} / {{ dayjs(day).format('MMM') }}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="journal in props.data" :key="(journal as { id: string | number }).id">
          <td v-for="day in dates" class="border-x border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 min-w-20 text-normal">

            <div
              v-if="JournalInDate(journal, day) != 'out'"
              @click="openPreviewDialog(journal)"
              class="shadow-sm py-1 px-2 cursor-pointer relative z-1 h-[2em] min-w-[7rem]"
              :class="[
                {'opacity-0': JournalInDate(journal, day) == 'out'},
                {'rounded-l-lg mr-[-10px]': JournalInDate(journal, day) == 'start_date'},
                {'rounded-r-lg ml-[-10px]': JournalInDate(journal, day) == 'end_date'},
                {'mx-[-10px]': JournalInDate(journal, day) == 'middle_date'},
                {'rounded-lg': JournalInDate(journal, day) == 'one_day'},
                getBgClass((journal as { id: string | number }).id)         
              ]"
            >
              <div
              class="flex items-center gap-1"
              :class="[
                {'opacity-0': JournalInDate(journal, day) == 'middle_date' || JournalInDate(journal, day) == 'end_date' },
                {'absolute top-0 bottom-0 left-0 px-2 z-10': JournalInDate(journal, day) == 'start_date'},
                {'!w-[7rem]': JournalInDate(journal, day) == 'middle_date' || JournalInDate(journal, day) == 'end_date'}
              ]"
              v-tooltip.top="(journal as { title: string }).title"
              >
                <div>
                   {{ (journal as { journal_category: { icon: string } }).journal_category.icon }}
                </div>
                <div
                  class="truncate"
                  :class="[
                    // {'w-[12rem]': JournalTotalDays(journal) > 1 && JournalInDate(journal, day) == 'start_date'},
                    {'w-[7rem]': JournalTotalDays(journal) <= 1 },
                    {'w-[7rem]': JournalTotalDays(journal) < 1 && JournalInDate(journal, day) == 'middle_date'},
                  ]"
                  :style="JournalTotalDays(journal) > 1 && JournalInDate(journal, day) == 'start_date' 
                  ? { width: (JournalTotalDays(journal) * 6) + 'rem' } 
                  : {}"
                >
                    {{ (journal as { title: string }).title }}
                </div>
              </div>

            </div>

          </td>
        </tr>
      </tbody>
    </table>
  </div>


</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const props = defineProps({
  data: {
    type: Array,
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

const emit = defineEmits(['openPreviewDialog'])
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

// Fungsi untuk ambil warna berdasarkan index
const getBgClass = (index: any) => {

  // Array warna Tailwind
  const bgColors = [
    "bg-pink-200 dark:bg-pink-800",
    "bg-emerald-200 dark:bg-emerald-800",
    "bg-blue-200 dark:bg-blue-800",
    "bg-amber-200 dark:bg-amber-800",
    "bg-teal-200 dark:bg-teal-800",
    "bg-indigo-200 dark:bg-indigo-800",
    "bg-orange-200 dark:bg-orange-800"
  ];

  return bgColors[index % bgColors.length];
};


</script>