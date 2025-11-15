<template>

  <div>
    <ul v-if="dataJenis && dataJenis.length > 0" class="border rounded-lg">
      <li v-for="(item,index) in dataJenis" class="border-b p-2 flex flex-col md:flex-row md:justify-between">
        <div>
          <div class="text-xs font-bold">
            <span class="mr-1" v-if="item.tgl">{{ item.tgl }}</span>
            <span class="mr-1" v-else>{{ item.tgl_masuk }}</span>

            <Badge v-if="item.kategori == 'keluar'" size="small" severity="danger">{{ item.kategori }}</Badge>
            <Badge v-if="item.kategori == 'masuk'" size="small" severity="info">{{ item.kategori }}</Badge>

          </div>
          <div class="text-sm italic">
            {{ item.jenis }}
          </div>
        </div>
        <div class="text-sm font-bold pt-1 text-end">
          {{ formatMoney(item.nominal) }}        
        </div>
      </li>
    </ul>
    <Message v-else severity="info">
      Belum ada data transaksi dipilih
    </Message>
  </div>
  
  <div class="text-end mt-3">
    <Button @click='openPilihJenis()' severity="info" size="small">
      <Icon name="lucide:plus" /> Pilih Jenis
    </Button>
  </div>

  <Dialog v-model:visible="visibleDial" modal header="Pilih Transaksi Keluar / Project" :style="{ width: '70rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
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

      <DataTable 
        :value="dataSearch.data" 
        size="small" class="text-sm xl:text-xs" 
        v-model:selection="selectedRows" 
        sortField="tgl" :sortOrder="-1" 
        paginator :rows="25" :rowsPerPageOptions="[50, 100, 250, 500]" 
        selectionMode="multiple" 
        stripedRows scrollable scrollHeight="50vh"
        :rowClass="getRowClass"
      >

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
            
            <Badge v-if="slotProps.data.tgl_masuk" severity="info" size="small">
              Masuk
            </Badge>
            <Badge v-else severity="danger" size="small">
              Keluar
            </Badge>

          </template>
        </Column>
        <Column field="invoices" header="Invoice" class="align-top">
          <template #body="slotProps">
            {{ slotProps.data.invoices?.map((item: { nomor: any; }) => item.nomor).join(', ') || '-' }}
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

      <div class="text-end pt-3">
        <Button @click="visibleDial = false" type="button">          
          <Icon name="lucide:arrow-down" /> Pilih Jenis ({{ countSelectedRows }})
        </Button>
      </div>
      
    </div>

  </Dialog>

</template>

<script setup lang="ts">
const client = useSanctumClient();
const props = defineProps(['data']);
const emit = defineEmits(['select']);

const visibleDial = ref(false);

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

const dataJenis = ref({} as any);
//onmount
onMounted( () => {

  //buat array baru gabungan dari props.data..cs_main_project dan props.data.transaksi_keluar
  const newArray = [];
  if(props.data.cs_main_project){
    for(let i = 0; i < props.data.cs_main_project.length; i++) {
      newArray.push({
        id: 'masuk-'+props.data.cs_main_project[i].id,
        id_transaksi_keluar: null,
        id_cs_main_project: props.data.cs_main_project[i].id,
        jenis: props.data.cs_main_project[i].jenis+', '+props.data.cs_main_project[i].webhost.nama_web,
        tgl: props.data.cs_main_project[i].tgl_masuk,
        kategori: 'masuk',
        nominal: props.data.cs_main_project[i].dibayar,
      })
    }
  }
  if(props.data.transaksi_keluar){
    for(let i = 0; i < props.data.transaksi_keluar.length; i++) {
      newArray.push({
        id:'keluar-'+props.data.transaksi_keluar[i].id,
        id_transaksi_keluar: props.data.transaksi_keluar[i].id,
        id_cs_main_project: null,
        jenis: props.data.transaksi_keluar[i].jenis,
        tgl: props.data.transaksi_keluar[i].tgl,
        kategori:'keluar',
        nominal: props.data.transaksi_keluar[i].jml,
      });
    }
  }
  dataJenis.value = newArray;
})

//watch
const selectedRows = ref();
const countSelectedRows = ref(0);
watch(selectedRows, (newValue, oldValue) => {

  //buat array
  const newArray = newValue.map((item: any) => {
    return {
      id: item.id_transaksi_keluar? 'keluar-'+item.id_transaksi_keluar : 'masuk-'+item.id,
      id_transaksi_keluar: item.id_transaksi_keluar,
      id_cs_main_project: item.id,
      jenis: item.tgl?item.jenis:item.jenis+', '+item.webhost.nama_web,
      tanggal: item.tgl?item.tgl:item.tgl_masuk,
      kategori: item.tgl_masuk?'masuk':'keluar',
      nominal: item.dibayar?item.dibayar:item.jml,
    }
  });
  countSelectedRows.value = newArray.length;
  dataJenis.value = newArray;
  emit('select', newArray);

})

//pilin jenis
const openPilihJenis = async () => {
  visibleDial.value = true; 
  
  //jika dataSearch kosong
  // if(!dataSearch){
    //ambil 20 data terakhir
    try {
      const response = await client('/api/bank_transaksi_last_transaksi');
      dataSearch.value = response; 
    } catch (error) {
      const er = useSanctumError(error);
    }
  // }
}

function getRowClass(data: any) {
  if (data.bank && Array.isArray(data.bank) && data.bank.length === 0) {
    return '!bg-amber-100 dark:!bg-amber-800';
  } else {
    return '';
  }
}
</script>
