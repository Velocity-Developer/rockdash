<template>
  <form @submit.prevent="handleSubmit">

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
      <div>
        <label class="block mb-1">Bank</label>
        <Select 
          v-model="forms.bank" 
          :options="dataBank" 
          optionValue="value"
          optionLabel="label"
          class="w-full"
        />
      </div>
      <div>
        <label class="block mb-1">Tanggal</label>
        <DatePicker v-model="forms.tgl" dateFormat="yy-mm-dd" class="w-full"/>
        <Message v-if="errors.value?.tgl" severity="warn" class="mt-1">{{ errors.value.tgl[0] }}</Message>
      </div>
      
      <div>
        <label class="block mb-1">Nominal</label>
        <InputNumber v-model="forms.nominal" class="w-full" :minFractionDigits="2" />
      </div>
      <div>
        <label class="block mb-1">Jenis Transaksi</label>
        <Select 
          v-model="forms.jenis_transaksi" 
          :options="[{value: 'masuk', label: 'Masuk'},{value: 'keluar', label: 'Keluar'}]" 
          optionValue="value"
          optionLabel="label"
          class="w-full"
        />
        <Message v-if="errors.value?.jenis_transaksi" severity="warn" class="mt-1">{{ errors.value.jenis_transaksi[0] }}</Message>
      </div>

    </div>
    
    
    <div class="mb-3">
      <label class="block mb-1">Jenis</label>
      <BankTransaksiSelectJenis :data="props.data" @select="handleSelectJenis"/>
    </div>
    <div class="mb-3">
      <label class="block mb-1">Keterangan Bank</label>
      <Textarea v-model="forms.keterangan_bank" class="w-full"/>
      <Message v-if="errors.value?.keterangan_bank" severity="warn" class="mt-1">{{ errors.value.keterangan_bank[0] }}</Message>
    </div>
 
    <div class="text-end">
      <Button type="submit" severity="primary" :loading="loadingSubmit">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:save"/>
        Simpan
      </Button>
    </div>

  </form>
</template>

<script setup lang="ts">
const toast = useToast();
const client = useSanctumClient();
const props = defineProps({
  action: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: false,
  },
  bank : {
    type: String,
    required: false,
  }
});
const emit = defineEmits(['update']);

import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

//get opsi bank
const { data: dataBank,status: statusDataBank} = await useAsyncData(
    'data_opsi-bank',
    () => client('/api/data_opsi/bank')
) as any

const forms = reactive({
  bank: props.bank?props.bank:'',
  tgl: props.data?props.data.tgl:'',
  jenis: props.data?props.data.jenis:'',
  jenis_transaksi: props.data?props.data.jenis_transaksi:'masuk',
  nominal: props.data?props.data.nominal:'0',
  keterangan_bank: props.data?props.data.keterangan_bank:'',
  id: props.data?props.data.id:'',
  jenis_array: props.data?props.data.jenis_array:[],
  newjenis_array: props.data?props.data.newjenis_array:[],
})

//handle select jenis
const handleSelectJenis = (data : any) => {
  //buat array baru dari data
  let array = [];
  for(let i = 0; i < data.length; i++) {
    array.push(data[i].id);
  }
  forms.newjenis_array = array;
}

//handle submit
const errors = reactive({} as any);
const loadingSubmit = ref(false);
const handleSubmit = async () => {
  loadingSubmit.value = true;
  errors.value = {};

  //ubah tgl
  forms.tgl = dayjs(forms.tgl).format('YYYY-MM-DD');

  if(props.action == 'add') {
    try {
      await client('/api/bank_transaksi',{
        method: 'POST',
        body: forms
      })
      emit('update');
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Transaksi berhasil ditambahkan',
        life: 3000
      });
    } catch (er) {
      const error = useSanctumError(er);
      errors.value = error.bag;
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Transaksi gagal ditambahkan',
        life: 3000
      });
    }
  } else {
    try {
      await client('/api/bank_transaksi/'+forms.id,{
        method: 'PUT',
        body: forms
      })
      emit('update');
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Transaksi berhasil diperbarui',
        life: 3000
      });
    } catch (er) {
      const error = useSanctumError(er);
      errors.value = error.bag;
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Transaksi gagal disimpan',
        life: 3000
      });
    } 
  }
  loadingSubmit.value = false;
}

</script>
