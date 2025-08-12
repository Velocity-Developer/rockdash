<template>
  <div class="flex justify-end items-center gap-2 mb-2">
    <Button @click="openFormDialog('add','')" size="small" :loading="loading">
      <Icon name="lucide:plus" />
      Tambah
    </Button>
    <Button @click="getData()" size="small" :loading="loading">
      <Icon name="lucide:refresh-ccw" :class="{ 'animate-spin':loading }" />
      Refresh
    </Button>
  </div>

  <Card>
    <template #content>
      <DataTable 
          :value="data.data" 
          size="small" class="text-sm" 
          selectionMode="multiple" 
          stripedRows scrollable scrollHeight="50vh"
        >
          <Column field="title" header="Judul">
            <template #body="slotProps">
              {{ slotProps.data.title }}
            </template>
          </Column>
          <Column field="description" header="Deskripsi">
            <template #body="slotProps">
              {{ slotProps.data.description }}
            </template>
          </Column>
          <Column field="start" header="Waktu">
            <template #body="slotProps">
              <div class="flex items-center gap-1">
               <Icon name="lucide:clock" />
               <span class="text-xs whitespace-nowrap">{{ formatDate(slotProps.data.start,'DD/MM/YY HH:mm') }}</span>
              </div>
              <div class="text-teal-500 flex items-center gap-1">
                <Icon name="lucide:circle-check" />
                <span class="text-xs whitespace-nowrap">{{ formatDate(slotProps.data.end,'DD/MM/YY HH:mm') }}</span>
              </div>
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="slotProps">
              <JournalBadgeStatus :status="slotProps.data.status" />
            </template>
          </Column>
          <Column field="act" header="">
            <template #body="slotProps">
              <AvatarGroup>
                <Avatar :image="slotProps.data.user?.avatar_url" shape="circle" v-tooltip.left="slotProps.data.user?.name"/>
                <Avatar :label="slotProps.data.journal_category.icon" v-tooltip.left="slotProps.data.journal_category.name" class="bg-indigo-300 hover:animate-pulse" shape="circle" />
                <Avatar shape="circle" class="cursor-pointer bg-sky-300" v-tooltip.left="'Edit'" @click="openFormDialog('edit',slotProps.data)">
                  <Icon name="lucide:pen" mode="svg"/>
                </Avatar>
              </AvatarGroup>              
            </template>
          </Column>
      </DataTable>
    </template>
  </Card>

  <Dialog v-model:visible="visibleFormDialog" modal :header="actionFormDialog === 'add' ? 'Tambah Jurnal' : 'Edit Jurnal'" :style="{ width: '40rem' }">
    <JournalForm :action="actionFormDialog" :item="selectedItem" @update="getData"/>
  </Dialog>

  <DashLoader :loading="loading" />
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Jurnal',
    description: 'Daftar Jurnal',
})
const client = useSanctumClient();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();

const filters = reactive({
  bulan: '',
  user_id: '',
})

const loading = ref(false);
const data = ref({} as any);
const getData = async () => {
    loading.value = true;
    try {
      const res = await client('/api/journal',{
        params: filters,
      }) as any
      data.value = res;
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
}
onMounted(() => {
    getData()
})

const visibleFormDialog = ref(false);
const actionFormDialog = ref('add');
const selectedItem = ref({} as any);
const openFormDialog = (action:string,item:any) => {
  visibleFormDialog.value = true;
  actionFormDialog.value = action;
  if(item) {
    selectedItem.value = item;
  } else {
    selectedItem.value = {};
  }
}
</script>
