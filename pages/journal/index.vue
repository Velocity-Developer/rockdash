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

  <div>
    {{ data }}
  </div>

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
