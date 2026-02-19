<template>

  <div v-if="loadingData">    
    <div v-for="i in 10" :key="i" class="mb-2">
      <Skeleton  width="20%" height="20px" class="mb-1 w-full"></Skeleton> 
      <Skeleton  width="100%" height="40px" class="w-full"></Skeleton> 
    </div>
  </div>

  <form v-if="!loadingData" @submit.prevent="handleSubmit" class="relative p-2">
    
      <!-- Informasi Web -->
    <div class="mb-3">
      <div class="flex items-center gap-1 font-bold mb-3 text-xl opacity-50 text-emerald-700">
        <Icon name="lucide:globe" />
        Website
      </div>
    </div>
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
        <label class="mb-1 block" for="kategori_web">Kategori</label>
        <Select name="kategori_web" id="kategori_web" 
        v-model="form.kategori_web" 
        :options="dataOpsi.kategori_web"
        optionValue="value" optionLabel="label"
        filter showClear required editable
        class="w-full" />
      </div>
    </div>
    
    <!-- Informasi Project -->
    <div class="mt-6">
      <div class="flex items-center gap-1 font-bold mb-3 text-xl opacity-50 text-rose-700">
        <Icon name="lucide:briefcase" />
        Project
      </div>
    </div>
    <div class="grid grid-cols-4 gap-4">
      
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

      <div class="col-span-4" :class="!form.dikerjakan_oleh.includes(10) && !form.dikerjakan_oleh.includes(12) ?'opacity-50':''">
        <label class="mb-1 block" for="waktu_plus">Waktu Tambahan (hari)</label>
        <InputNumber id="waktu_plus" name="waktu_plus" v-model="form.waktu_plus" showButtons class="w-full" />
      </div>

    </div>

    <!-- Informasi Klien -->
    <div class="mt-6">
      <div class="flex items-center gap-1 font-bold mb-3 text-xl opacity-50 text-sky-700">
        <Icon name="lucide:users" />
        Informasi Klien
      </div>
    </div>
    <div class="grid grid-cols-4 gap-4">

        <div v-if="selectedCustomer && form.customer_id" class="col-span-4">
          <div class="w-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-1 py-2 rounded mb-1 !flex !items-center !justify-between">
            <div class="text-xs ps-2 text-amber-700 dark:text-amber-300">
              Klien ditemukan
            </div>
            <div>
              <Button 
                severity="danger"
                class="text-sm !py-1 mr-1" 
                @click="selectedCustomer = null;form.customer_id = null"
                v-tooltip="'Hapus Customer terpilih'"
              >
                <Icon name="lucide:trash-2" />
              </Button>
              <Button               
                severity="info"
                class="text-sm !py-1"
                v-tooltip="'Lihat Profil'"
                as="a"
                :href="'/customer/' + form.customer_id" 
                target="_blank" 
              >
                <Icon name="lucide:user" />
            </Button>
            </div>
          </div>
        </div>

        <CsMainProjectCariCustomer 
          v-if="!form.customer_id && form.nama"
          :q="form.nama || form.hp"
          @selectCustomer="selectedSearchCustomer"
          class="col-span-4"
        />
        
        <div class="col-span-4">
          <label class="mb-1 text-sm block" for="email">Nama Klien</label>
          <InputText type="text" id="nama" name="nama" v-model="form.nama" class="w-full" required/>
          <Message v-if="!form.nama && form.email" severity="warn" size="small" class="mt-1">
            Nama Klien wajib diisi, silahkan isi dari biodata pemilik web
          </Message>
        </div> 
        <div class="col-span-2">
          <label class="mb-1 text-sm block" for="email">Email</label>
          <InputText type="text" id="email" name="email" v-model="form.email" class="w-full" />
        </div>          
        <div class="col-span-2">
          <label class="mb-1 text-sm block" for="hp">No. HP</label>
          <InputText type="text" id="hp" name="hp" v-model="form.hp" class="w-full" />
        </div>
        <div class="col-span-2">
          <label class="mb-1 text-sm block" for="wa">No. WA</label>
          <InputText type="text" id="wa" name="wa" v-model="form.wa" class="w-full" />
        </div>
        <div class="col-span-2">
          <label class="mb-1 text-sm block" for="telegram">Telegram</label> 
          <InputText type="text" id="telegram" name="telegram" v-model="form.telegram" class="w-full" />
        </div>          
        <div class="col-span-2">
          <label class="mb-1 text-sm block" for="hpads">HP ads</label>
          <Select name="hpads" id="hpads" 
            v-model="form.hpads" 
            :options="[{label:'Hp Ads',value:'ya'},{label:'Hp Web',value:'tidak'}]" 
            optionValue="value" optionLabel="label"
          class="w-full" />
        </div>
        <div class="col-span-2 ">
          <label class="mb-1 text-sm block" for="saldo">Saldo</label>
          <InputText type="text" id="saldo" name="saldo" v-model="form.saldo" class="w-full" />
        </div>
        <div class="col-span-4">
          <label class="mb-1 text-sm block" for="alamat">Alamat</label>
          <Textarea id="alamat" name="alamat" v-model="form.alamat" class="w-full"/>
        </div>
          
        <Message v-if="!form.customer_id && form.nama" severity="warn" size="small" class="col-span-4 mt-2 mb-1 flex items-center justify-between">
          <Icon name="lucide:info" /> Membuat data klien/Customer baru
        </Message>

    </div>

    <div class="mt-6">
        <div>
          <Message v-for="item in errorSubmit" severity="error" text="true" class="mb-2" closable>
            {{ item[0] }}
          </Message>
        </div>

        <div class="flex items-center justify-end">
          <div class="hidden">
            <label for="create_invoice"> Create Invoice </label>
            <ToggleSwitch v-model="form.create_invoice" />
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
const action = props.action as 'add' | 'edit';
const data = props.data as any;
const lastDataComponent = ref(null as any);
const loadingData = ref(false);

const form = reactive({
  id: '',
  jenis: '',
  nama_web: '',
  kategori_web: '',
  paket: '',
  deskripsi: '',
  trf: '',
  tgl_masuk: '',
  tgl_deadline: '',
  biaya: '',
  dibayar: '',
  waktu_plus: null,
  saldo: '',
  hp: '',
  telegram: '',
  hpads: '',
  wa:'',
  email: '',
  dikerjakan_oleh: [],
  id_webhost: '',
  create_invoice: true,
  invoice_id: '',
  customer_id: '',
  nama: '',
  alamat: '',
} as any);

const selectedCustomer = ref({} as any);

//get opsi jenis
const { data: dataOpsi} = await useAsyncData(
    'data_opsi-form-csmainproject',
    () => client('/api/data_opsis?keys[]=paket&keys[]=jenis_project&keys[]=karyawan&keys[]=kategori_web')
) as any

//set data if action is edit
onMounted( async () => {
  if (action == 'edit') {
    
    try {
      loadingData.value = true;
      const res = await client(`/api/cs_main_project/${data.id}`) as any
      form.id = res.id;
      form.jenis = res.jenis;
      form.kategori_web = res.webhost.kategori;
      form.nama_web = res.webhost.nama_web;
      form.paket = res.webhost.paket?.id_paket;
      form.deskripsi = res.deskripsi;
      form.trf = res.trf;
      form.tgl_masuk = res.tgl_masuk;
      form.tgl_deadline = res.tgl_deadline;
      form.biaya = res.biaya;
      form.dibayar = res.dibayar;
      form.saldo = res.webhost.saldo;
      form.hp = res.webhost.hp;
      form.telegram = res.webhost.telegram;
      form.hpads = res.webhost.hpads;
      form.wa = res.webhost.wa;
      form.email = res.webhost.email;
      form.dikerjakan_oleh = res.raw_dikerjakan;
      form.karyawans = res.karyawans;
      form.invoice_id = res.invoice_id || '';
      form.customer_id = res.customer_id || '';
      form.nama = res.webhost.customers?.[0]?.nama || '';
      form.alamat = res.webhost.customers?.[0]?.alamat || '';  
      form.waktu_plus = res.cs_main_project_info?.waktu_plus || ''
    } catch (error) {
      console.log(error);
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Data project gagal diambil',
        life: 3000
      });
    } finally {
      loadingData.value = false;
    } 

  }
})

const errorSubmit = ref({} as any)
const loadingSubmit = ref(false);
const handleSubmit = async () => {
  loadingSubmit.value = true;
  errorSubmit.value = {};

  //ubah tgl
  form.tgl_masuk = form.tgl_masuk?dayjs(form.tgl_masuk).format('YYYY-MM-DD'):'';
  form.tgl_deadline = form.tgl_deadline?dayjs(form.tgl_deadline).format('YYYY-MM-DD'):'';

  //hapus http:// dan https:// dari form.nama_web
  if (form.nama_web) {
    form.nama_web = form.nama_web.replace(/^https?:\/\//, '');
  }

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
const search_webhost = ref([] as any);
const loadingSearchWebhost = ref(false);
watch(() => form.nama_web, async (val) => {
  //bersihkan dari http:// atau https://
  if (val) {
    form.nama_web = val.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  }

  //cari webhost berdasarkan nama dan karakter lebih dari 3
  if (form.nama_web && form.nama_web.length > 3) {
    loadingSearchWebhost.value = true;
    try {
      const response = await client(`/api/webhost_search/${form.nama_web}`) as any
      search_webhost.value = response;
      //jika response.length == 1, auto select
      if (response.length == 1) {
        form.id_webhost = response[0].id_webhost;
        form.kategori_web = response[0].kategori||'';
      }
    } catch (error) {
      console.log(error);
      search_webhost.value = {};
      form.id_webhost = '';
    }
    loadingSearchWebhost.value = false;
  } else {
    search_webhost.value = [];
    form.id_webhost = '';
  }
})

const selectedWebhost = ref({} as any);
//watch form.id_webhost
watch(() => form.id_webhost, async (val) => {
  selectedCustomer.value = {};
  //ambilkan data webhost
  if(val) {
    try {
      const res = await client(`/api/webhost/${val}`) as any;
      selectedWebhost.value = res;

      //set data ke form
      form.paket = selectedWebhost.value.paket?.id_paket;
      form.hp = selectedWebhost.value.hp;
      form.telegram = selectedWebhost.value.telegram;
      form.hpads = selectedWebhost.value.hpads;
      form.wa = selectedWebhost.value.wa;
      form.email = selectedWebhost.value.email;
      form.saldo = selectedWebhost.value.saldo;
      
      //if response.customer
      if(res.customers && res.customers.length > 0) {
        form.customer_id = res.customers[0].id;
        form.hp = res.customers[0].hp;
        form.wa = res.customers[0].wa;
        form.email = res.customers[0].email;
        form.nama = res.customers[0].nama;
        form.telegram = res.customers[0].telegram;
        form.saldo = res.customers[0].saldo;
        form.hpads = res.customers[0].hpads;
        form.alamat = res.customers[0].alamat;
        selectedCustomer.value = res.customers[0];
      }

    } catch (error) {
      console.log(error);
    }
  }
})

//selectedSearchCustomer  
const selectedSearchCustomer = (data: any) => {
  selectedCustomer.value = data;
  form.customer_id = data.id;
  form.hp = data.hp;
  form.wa = data.wa;
  form.email = data.email;
  form.nama = data.nama;
  form.telegram = data.telegram;
  form.saldo = data.saldo;
  form.hpads = data.hpads;
  form.alamat = data.alamat;
  console.log(data);
}

</script>
