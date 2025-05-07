<template>
  
  {{ props.data }}

  <div class="text-end">
    <Button @click='visibleDialog = true' size="small">
      Pilih Jenis
    </Button>
  </div>

  <Dialog v-model:visible="visibleDialog" modal header="Pilih Transaksi Keluar / Project" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <form @submit.prevent="handleSearch" class="flex mb-3">
      <InputText v-model="forms.search" placeholder="Cari Jenis" class="w-full" />
      <Button type="submit">
        <Icon name="lucide:search" />
      </Button>
    </form>

    <Message v-if="loadingSearch">
      <Icon name="lucide:loader-circle" class="animate-spin" /> Pencarian ...
    </Message>
    
    <div v-if="dataSearch" class="mt-3">

      <DataTable :value="dataSearch.data" size="small" class="text-sm" v-model:selection="selectedRows" sortField="tgl" :sortOrder="-1" paginator :rows="25" :rowsPerPageOptions="[25, 50, 100, 500]" selectionMode="multiple" stripedRows scrollable>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="tgl" header="Tanggal Masuk" :sortable="true" class="align-top whitespace-nowrap">
          <template #body="slotProps">

            <template v-if="slotProps.data.tgl_masuk">
              {{ slotProps.data.tgl_masuk }}
            </template>
            <template v-else>
              {{ slotProps.data.tgl }}
            </template>

          </template>
        </Column>
        <Column field="kategori" header="Kategori" class="align-top">
          <template #body="slotProps">
            
            <Badge v-if="slotProps.data.tgl_masuk" severity="info">
              Masuk
            </Badge>
            <Badge v-else severity="danger">
              Keluar
            </Badge>

          </template>
        </Column>
        <Column field="jenis" header="Jenis" class="align-top">
          <template #body="slotProps">
            {{ slotProps.data.jenis }}
          </template>
        </Column>
        <Column field="nama_web" header="Nama Web" class="align-top">
          <template #body="slotProps">
            {{ slotProps.data.webhost?.nama_web }}
          </template>
        </Column>
        <Column field="deskripsi" header="Deskripsi" class="align-top">
          <template #body="slotProps">
            {{ slotProps.data.deskripsi }}
          </template>
        </Column>
        <Column field="trf" header="Trf" class="align-top">
          <template #body="slotProps">            
            <template v-if="slotProps.data.trf">
              {{ formatMoney(slotProps.data.trf) }}
            </template>
          </template>
        </Column>
        <Column field="dibayar" header="Masuk" class="align-top">
          <template #body="slotProps">            
            <template v-if="slotProps.data.dibayar">
              {{ formatMoney(slotProps.data.dibayar) }}
            </template>
          </template>
        </Column>
        <Column field="keluar" header="Keluar" class="align-top">
          <template #body="slotProps">            
            <template v-if="slotProps.data.jml">
              {{ formatMoney(slotProps.data.jml) }}
            </template>
          </template>
        </Column>
      </DataTable>
      
    </div>

  </Dialog>

</template>

<script setup lang="ts">
const client = useSanctumClient();
const props = defineProps({
  data: {
    type: Object,
    required: false,
  },
});
const emit = defineEmits(['select']);

const visibleDialog = ref(false);

const forms = reactive({
  search: '',
});

// Handle Search Form
const loadingSearch = ref(false);
const dataSearch = ref({} as any);
const handleSearch = async () => {
  loadingSearch.value = true;
  dataSearch.value = [];
  try {
    const response = await client('/api/bank_transaksi_search_jenis/'+forms.search);
    dataSearch.value = response;
  } catch (error) {
    const er = useSanctumError(error);
  }
  loadingSearch.value = false;
}

const selectedRows = ref();
//watch
watch(selectedRows, (newValue, oldValue) => {

  //buat array
  const newArray = newValue.map((item: any) => {
    return {
      id: item.id_transaksi_keluar? item.id_transaksi_keluar : item.id,
      jenis: item.jenis,
    }
  });
  emit('select', newArray);

})
</script>
