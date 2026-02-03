<template>
  <Card>
    <template #header>
      <div class="px-4 py-2 flex items-center gap-1 font-bold">
        <Icon name="lucide:file-check-2" />
        Jurnal terbaru
      </div>
    </template>
    <template #content>
      <div>
        
        <DataTable :value="data.data" class="text-xs" :loading="loading">
          <Column field="title" header="Judul"></Column>
          <Column field="description" header="Desk.">
            <template #body="slotProps">
              <div v-html="purifyHtml(slotProps.data.description)"></div>
            </template>
          </Column>
          <Column field="user.name" header="User" style="width: 60px">
            <template #body="slotProps">
              <div class="flex justify-center">
                <Avatar 
                  :image="slotProps.data.user?.avatar_url" 
                  shape="circle" 
                  size="small" 
                  class="w-8 h-8" 
                  v-tooltip.top="slotProps.data.user?.name"
                />
              </div>
            </template>
          </Column>
          <Column field="start" header="Waktu" :sortable="true" style="width: 200px">
            <template #body="slotProps">
              <div class="flex flex-col gap-1 text-xs">
                <div class="flex items-center gap-1">
                  <Icon name="lucide:clock"/>
                  <div>{{ formatDate(slotProps.data.start,'DD/MM/YY HH:mm') }}</div>
                </div>
                <div v-if="slotProps.data.end" class="flex items-center gap-1 text-green-500">
                  <Icon name="lucide:circle-check"/>
                  {{ formatDate(slotProps.data.end,'DD/MM/YY HH:mm') }}
                </div>
              </div>
            </template>
          </Column>
        </DataTable>

      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const filters = reactive({
  date_start: dayjs().startOf('month').format('YYYY-MM-DD'),
  date_end: dayjs().format('YYYY-MM-DD'),
  role: 'webdeveloper',
  user_id: '',
  page: 1,
  pagination: false,
  order: 'asc',
  status: 'ongoing',
}) as any

const loading = ref(false);
const data = ref({} as any);
const getData = async () => {
  try {
      const res = await client('/api/journal',{
        params: filters,
      }) as any
      data.value = res;
      
      // categoryStats sekarang sudah dihitung di backend
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
}

onMounted(() => {
  getData();
})

</script>