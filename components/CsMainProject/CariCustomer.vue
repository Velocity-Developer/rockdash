<template>
  <div>

    <div class="text-end">
      <Button @click="visibleDialog = true" severity="help" size="small">
        Cari Customer <Icon name="lucide:user-search" />
      </Button>
    </div>

    <Dialog v-model:visible="visibleDialog" modal header="Cari Customer" :style="{ width: '45rem' }">
      <form action="" @submit.prevent="submitSearch" class="border rounded-md p-5">
        <div class="flex items-center gap-4 justify-between">
          <InputText v-model="form.q" class="w-full" placeholder="Nama Klien / No. HP"/>        
          <Button type="submit" severity="primary" :loading="loading" class="min-w-[80px]">
            Cari <Icon name="lucide:search" />
          </Button>
        </div>
      </form>

      <div v-if="loading" class="text-center">
        <ProgressSpinner />
      </div>
      <div v-if="!loading && dataSearch.data?.length > 0">
        <Message severity="info" size="small" class="my-2">
          {{ dataSearch.data?.length }} Customer Ditemukan
        </Message>
        <DataTable :value="dataSearch.data" size="small" class="text-xs">
          <Column field="nama" header="Nama" />
          <Column field="hp" header="HP" />
          <Column field="telegram" header="Telegram" />
          <Column field="email" header="Email" />
          <Column field="alamat" header="Alamat" />
          <Column field="act" header="Aksi">
            <template #body="row">
              <Button @click="selectCustomer(row.data)" severity="primary" size="small">
                <Icon name="lucide:check" />
              </Button>
            </template>
          </Column>
        </DataTable>
      </div>

    </Dialog>
    
  </div>

</template>

<script setup lang="ts">
import { Message } from '#components';

const props = defineProps({
  q : {
    type: String,
    default: false,
  },
})
const emit = defineEmits(['selectCustomer']);
const client = useSanctumClient();
const visibleDialog = ref(false);
const form = reactive({
  q: props.q || '',
});

const loading = ref(false);
const dataSearch = ref({} as any);
const submitSearch = async () => {
  if (!form.q) {
    return;
  }
  loading.value = true;
  try {
    const response = await client('api/customer', {
      params: {
        q: form.q
      },
    }) as any
    dataSearch.value = response;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

const selectCustomer = (data: any) => {
  emit('selectCustomer', data);
  visibleDialog.value = false;
}
</script>