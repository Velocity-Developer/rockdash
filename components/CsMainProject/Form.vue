<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-4 gap-4">

      <div class="col-span-4">
        <label class="mb-1 block" for="nama_web">Nama Web</label>
        <InputText id="nama_web" name="nama_web" v-model="form.nama_web" class="w-full" />
        
        <div v-if="loadingSearchWebhost" class="mt-2 opacity-50">
          <Icon name="lucide:loader" class="animate-spin"/> mencari..
        </div>
        <div v-if="search_webhost && search_webhost.length > 0" class="p-4 bg-amber-100 dark:bg-yellow-950 mt-2 rounded">
          <div class="text-sm">Web ditemukan</div>
          <Select name="webhost" id="webhost" 
            v-if="search_webhost && search_webhost.length > 0"
            v-model="form.id_webhost"
            :options="search_webhost"
            optionValue="id_webhost" optionLabel="nama_web"
            showClear size="small"
            class="w-full" />
        </div>

      </div>

      <div class="col-span-4">
        <InvoiceSelectSearch :search="keySearchInvoice" @invoice-selected="handleInvoiceSelected"/>
      </div>

      <div class="col-start-1 col-end-3">
        <label class="mb-1 block" for="jenis">Jenis</label>
        <Select name="jenis" id="jenis" 
        v-model="form.jenis" 
        :options="dataOpsi.jenis_project" 
        filter showClear
        class="w-full" />
      </div>
      <div class="col-start-3 col-end-5">
        <label class="mb-1 block" for="paket">Paket</label>
        <Select name="paket" id="paket" v-model="form.paket"
          :options="dataOpsi.paket"        
          optionValue="value" optionLabel="label"
          filter showClear
        class="w-full" />
      </div>

      <div class="col-span-4 md:col-start-1 md:col-end-3">
        <label class="mb-1 block" for="deskripsi">Deskripsi</label>
        <Textarea id="deskripsi" name="deskripsi" v-model="form.deskripsi" class="w-full"></Textarea>
      </div>
      <div class="col-span-4 md:col-start-3 md:col-end-5">
        <label class="mb-1 block" for="trf">Trf</label>
        <InputNumber id="trf" name="trf" v-model="form.trf" class="w-full" />
      </div>

      <div class="col-start-1 col-end-3">
        <label class="mb-1 block" for="tgl_masuk">Tanggal Masuk</label>
        <DatePicker id="tgl_masuk" v-model="form.tgl_masuk" dateFormat="yy-mm-dd" class="w-full"/>
      </div>
      <div class="col-start-3 col-end-5">
        <label class="mb-1 block" for="tgl_deadline">Tanggal Deadline</label>
        <DatePicker id="tgl_deadline" v-model="form.tgl_deadline" dateFormat="yy-mm-dd" class="w-full"/>
      </div>

      <div class="col-start-1 col-end-3">
        <label class="mb-1 block" for="biaya">Biaya</label>
        <InputNumber id="biaya" name="biaya" v-model="form.biaya" class="w-full" />
      </div>
      <div class="col-start-3 col-end-5">
        <label class="mb-1 block" for="dibayar">Dibayar</label>
        <InputNumber id="dibayar" name="dibayar" v-model="form.dibayar" class="w-full" />
      </div>

      <div class="col-start-1 col-end-3">
        <label class="mb-1 block" for="hp">No. HP</label>
        <InputText type="text" id="hp" name="hp" v-model="form.hp" class="w-full" />
      </div>
      <div class="col-start-3 col-end-5">
        <label class="mb-1 block" for="telegram">Telegram</label> 
        <InputText type="text" id="telegram" name="telegram" v-model="form.telegram" class="w-full" />
      </div>

      <div class="col-start-1 col-end-3">
        <label class="mb-1 block" for="hpads">HP ads</label>
        <Select name="hpads" id="hpads" 
          v-model="form.hpads" 
          :options="[{label:'Hp Ads',value:'ya'},{label:'Hp Web',value:'tidak'}]" 
          optionValue="value" optionLabel="label"
        class="w-full" />
      </div>
      <div class="col-start-3 col-end-5">
        <label class="mb-1 block" for="wa">No. WA</label>
        <InputText type="text" id="wa" name="wa" v-model="form.wa" class="w-full" />
      </div>

      <div class="col-start-1 col-end-3">
        <label class="mb-1 block" for="saldo">Saldo</label>
        <InputText type="text" id="saldo" name="saldo" v-model="form.saldo" class="w-full" />
      </div>
      <div class="col-start-3 col-end-5">
        <label class="mb-1 block" for="email">Email</label>
        <Textarea id="email" name="deskripsi" v-model="form.email" class="w-full"></Textarea>
      </div>

      <div class="col-span-4">
        <label class="mb-1 block" for="dikerjakan_oleh">Di Kerjakan Oleh</label>
        
        <MultiSelect name="dikerjakan_oleh" id="dikerjakan_oleh" v-model="form.dikerjakan_oleh" 
          :options="[
            {label:'Support (yuda)',value:28},
            {label:'Lainnya (eko)',value:23},
            {label:'Web Custom',value:12},
            {label:'Web Biasa',value:10}
          ]" 
          optionValue="value" optionLabel="label"
          filter showClear
        class="w-full" />

      </div>

      <div class="col-span-4 text-right">

        <div>
          <Message v-for="item in errorSubmit" severity="error" text="true" class="mb-2" closable>
            {{ item[0] }}
          </Message>
        </div>

        <Button type="submit" :loading="loadingSubmit">
          <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
          <Icon v-else name="lucide:save"/>
          Simpan
        </Button>
      </div>
    </div>
  </form>

  <div v-if="action == 'add'">
    <CsMainProjectLastData ref="lastDataComponent" />
  </div>

</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const toast = useToast();
const client = useSanctumClient();
const emit = defineEmits(['update']);
const props = defineProps(['action','data']);
const action = props.action;
const data = props.data;
const lastDataComponent = ref(null as any);

const form = reactive({
  id: '',
  jenis: '',
  nama_web: '',
  paket: '',
  deskripsi: '',
  trf: '',
  tgl_masuk: '',
  tgl_deadline: '',
  biaya: '',
  dibayar: '',
  saldo: '',
  hp: '',
  telegram: '',
  hpads: '',
  wa:'',
  email: '',
  dikerjakan_oleh: [],
  id_webhost: '',
  invoice_id: '',
  customer_id: '',
} as any);

//get opsi jenis
const { data: dataOpsi} = await useAsyncData(
    'data_opsi-form-csmainproject',
    () => client('/api/data_opsis?keys[]=paket&keys[]=jenis_project&keys[]=karyawan')
) as any

//set data if action is edit
onMounted(() => {
  if (action == 'edit') {
    form.id = data.id;
    form.jenis = data.jenis;
    form.nama_web = data.webhost.nama_web;
    form.paket = data.webhost.paket?.id_paket;
    form.deskripsi = data.deskripsi;
    form.trf = data.trf;
    form.tgl_masuk = data.tgl_masuk;
    form.tgl_deadline = data.tgl_deadline;
    form.biaya = data.biaya;
    form.dibayar = data.dibayar;
    form.saldo = data.webhost.saldo;
    form.hp = data.webhost.hp;
    form.telegram = data.webhost.telegram;
    form.hpads = data.webhost.hpads;
    form.wa = data.webhost.wa;
    form.email = data.webhost.email;
    form.dikerjakan_oleh = data.raw_dikerjakan;
    form.karyawans = data.karyawans;
    form.invoice_id = data.invoice_id || '';
    form.customer_id = data.customer_id || '';
  }
})

// Handler untuk invoice yang dipilih
const handleInvoiceSelected = (invoiceData: { 
  id: number, 
  customer_id: number, 
  customer_hp: string, 
  customer_email: string, 
  customer_nama: string,
  total_invoice: number,
  jenis_project: string[],
}) => {
  form.invoice_id = invoiceData.id || '';
  form.customer_id = invoiceData.customer_id || '';
  // form.hp = invoiceData.customer_hp;
  form.email = invoiceData.customer_email || '';
  // form.wa = invoiceData.customer_hp || '';
  // form.dibayar = invoiceData.total_invoice || '';
  
  //set jenis project
  if(invoiceData.jenis_project?.length > 0) 
    form.jenis = invoiceData.jenis_project[0] || '';
  else
    form.jenis = '';
  
}

const errorSubmit = ref({} as any)
const loadingSubmit = ref(false);
const handleSubmit = async () => {
  loadingSubmit.value = true;
  errorSubmit.value = {};

  //ubah tgl
  form.tgl_masuk = form.tgl_masuk?dayjs(form.tgl_masuk).format('YYYY-MM-DD'):'';
  form.tgl_deadline = form.tgl_deadline?dayjs(form.tgl_deadline).format('YYYY-MM-DD'):'';

  try {

    if (action == 'edit') {
      const response = await client(`/api/cs_main_project/${form.id}`, {
        method: 'PUT',
        body: form,
      });
    } else {
      const response = await client('/api/cs_main_project', {
        method: 'POST',
        body: form,
      });
    }
    
    emit('update');
    
    // Refresh LastData component if it exists
    if (lastDataComponent.value && lastDataComponent.value.getData) {
      lastDataComponent.value.getData();
    }
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Data berhasil disimpan',
      life: 3000
    });
    
  } catch (error) {

    const er = useSanctumError(error);
    errorSubmit.value = er.bag;
    console.log(er);
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: 'Data gagal disimpan',
      life: 3000
    });
  }

  loadingSubmit.value = false;
}

//watch form.nama_web
const search_webhost = ref({} as any);
const loadingSearchWebhost = ref(false);
watch(() => form.nama_web, async (val) => {
  //cari webhost berdasarkan nama dan karakter lebih dari 3
  if (val && val.length > 3) {
    loadingSearchWebhost.value = true;
    try {
      const response = await client(`/api/webhost_search/${val}`);
      search_webhost.value = response;
    } catch (error) {
      console.log(error);
      search_webhost.value = {};
      form.id_webhost = '';
    }
    loadingSearchWebhost.value = false;
  } else {
    search_webhost.value = {};
    form.id_webhost = '';
  }
})

const selectedWebhost = ref({} as any);
//watch form.id_webhost
watch(() => form.id_webhost, async (val) => {
  //ambilkan data webhost
  if(val) {
    try {
      const res = await client(`/api/webhost/${val}`);
      selectedWebhost.value = res;

      //set data ke form
      form.paket = selectedWebhost.value.paket?.id_paket;
      form.hp = selectedWebhost.value.hp;
      form.telegram = selectedWebhost.value.telegram;
      form.hpads = selectedWebhost.value.hpads;
      form.wa = selectedWebhost.value.wa;
      form.email = selectedWebhost.value.email;
      form.saldo = selectedWebhost.value.saldo;

    } catch (error) {
      console.log(error);
    }
  }
})

//search Invoice by key
const keySearchInvoice = computed(() => {
  return {
    nama_web: form.nama_web,
    hp: form.hp,
  }
});


</script>
