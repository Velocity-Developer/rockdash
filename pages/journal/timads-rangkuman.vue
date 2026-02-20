<script setup lang="ts">
definePageMeta({
    title: 'Rangkuman Jurnal Tim Ads',
    description: 'Rangkuman Jurnal Tim Ads',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();
const route = useRoute();
const router = useRouter();

const filters = reactive({
  month: route.query.month ? dayjs(String(route.query.month)).toDate() : dayjs().startOf('month').toDate(),
  user_id: route.query.user_id ? Number(route.query.user_id) : null,
})

const { data : dataAnalytics, status, refresh } = await useAsyncData('rangkuman_timads', () => 
  client("/api/journal_timads_rangkuman",{
    params: {
      month: dayjs(filters.month).format('YYYY-MM'),
      user_id: filters.user_id,
    },
  }) as any
) as any

</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    
    <div class="col-span-4 flex justify-end items-center gap-2">
      <Select 
        v-if="isPermissions('timsupport-journal-perform-tim')"  
        v-model="filters.user_id" 
        :options="dataAnalytics.users_ads" 
        size="small" 
        placeholder="Pilih User" 
        optionLabel="name"
        optionValue="id" showClear
      />
      <DatePicker view="month" size="small" dateFormat="mm/yy" v-model="filters.month" />
      <Button size="small" @click="refresh()">
        <Icon name="lucide:refresh-cw" :class="status=='pending'?'animate-spin':''"/> Refresh
      </Button>
    </div>

    <Card class="col-span-4 md:col-span-2">
        <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:headset" />
            <span class="text-sm">Total Berdasarkan Kategori</span>
          </div>
        </template>
        <template #content>

          <table class="table-fixed w-full">
            <thead class="text-left">
              <th class="p-2 bg-gray-100 dark:bg-gray-800">Kategori</th>
              <th class="p-2 bg-gray-100 dark:bg-gray-800">Total</th>
            </thead>
            <tbody>
              <tr v-for="item in dataAnalytics.by_category">
                <td class="p-2 border-t">
                  {{ item.journal_category.name }}
                </td>
                <td class="p-2 border-t">
                  {{ item.total }}
                </td>
              </tr>
            </tbody>
          </table>

        </template>
      </Card>

    <Card class="col-span-4 md:col-span-2">
       <template #header>
          <div class="flex pt-4 px-4 justify-start items-center gap-2">
            <Icon name="lucide:chart-column-stacked" />
            <span class="text-sm">Grafik Total Kategori</span>
          </div>
        </template>
        <template #content>
            <div class="h-[400px] p-2">
            </div>
        </template>
    </Card>

  </div>
</template>

<style scoped></style>
