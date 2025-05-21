<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-4 gap-4">

      <div class="col-span-4">
        <label class="mb-1 block" for="nama_web">Nama Web</label>
        <InputText id="nama_web" name="nama_web" v-model="form.nama_web" class="w-full" />
      </div>

      <div class="col-start-1 col-end-3">
        <label class="mb-1 block" for="jenis">Jenis</label>
        <Select name="jenis" id="jenis" v-model="form.jenis" :options="dataJenisProject" class="w-full" />
      </div>
      <div class="col-start-3 col-end-5">
        <label class="mb-1 block" for="paket">Paket</label>
        <InputText id="paket" name="paket" v-model="form.paket" class="w-full" />
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
        <InputText type="email" id="email" name="email" v-model="form.email" class="w-full" />
      </div>

      <div class="col-span-4">
        <label class="mb-1 block" for="dikerjakan_oleh">Di Kerjakan Oleh</label>
        <div class="flex gap-1">
          <div class="bg-zinc-200 dark:bg-zinc-700 p-2 rounded w-full">
            <template v-if="form.karyawans">
              <template v-for="(item,i) in form.karyawans">
                <Chip class="!font-normal">{{ item.nama }} ({{ item.pivot.porsi }})</Chip>
              </template>
            </template>
          </div>
          <Button type="button" @click="form.dikerjakan_oleh = ''">
            <Icon name="lucide:user-plus"/> Pilih
          </Button>
        </div>
      </div>

      <div class="col-span-4 text-right">
        <Button type="submit" :loading="loadingSubmit">
          <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
          <Icon v-else name="lucide:save"/>
          Simpan
        </Button>
      </div>
    </div>
  </form>

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
  dikerjakan_oleh: '',
} as any);

//get opsi jenis
const { data: dataJenisProject} = await useAsyncData(
    'data_opsi-jenis_project',
    () => client('/api/data_opsi/jenis_project')
)

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
  }
  console.log('data-edit',data);
})

const loadingSubmit = ref(false);
const handleSubmit = async () => {
  loadingSubmit.value = true;

  //ubah tgl
  form.tgl_masuk = form.tgl_masuk?dayjs(form.tgl_masuk).format('YYYY-MM-DD'):'';
  form.tgl_deadline = form.tgl_deadline?dayjs(form.tgl_deadline).format('YYYY-MM-DD'):'';

  console.log('form',form);

  // try {

  //   if (action == 'edit') {
  //     const response = await client(`/api/cs_main_project/${form.id}`, {
  //       method: 'PUT',
  //       body: form,
  //     });
  //   } else {
  //     const response = await client('/api/cs_main_project', {
  //       method: 'POST',
  //       body: form,
  //     });
  //   }
    
  //   emit('update');
  //   toast.add({
  //     severity: 'success',
  //     summary: 'Berhasil!',
  //     detail: 'Data berhasil disimpan',
  //     life: 3000
  //   });
    
  // } catch (error) {
  //   const er = useSanctumError(error);
  //   console.log(er);
  // }
  loadingSubmit.value = false;
}
</script>
