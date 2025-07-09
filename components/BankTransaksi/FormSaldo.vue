<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="bulan">Bulan</label>
      <DatePicker v-model="form.bulan" dateFormat="yy-mm" class="w-full"/>
    </div>
    <div class="mb-3">
      <label for="bank">Bank</label>
      <Select v-model="form.bank" :options="dataBank" optionValue="value" optionLabel="label" class="w-full"/>
    </div>
    <div class="mb-3">
      <label for="nominal">Nominal</label>
      <InputNumber v-model="form.nominal" class="w-full"/>
    </div>
    <div class="text-end">
      <Button type="submit" :loading="loadingSubmit">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:save"/>
        Simpan
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const toast = useToast();
const client = useSanctumClient();
const props = defineProps({
  bulan: {
    type: String,
    required: false,
  },
  bank : {
    type: String,
    required: false,
  }
});
const emit = defineEmits(['update']);

//get opsi bank
const { data: dataBank,status: statusDataBank} = await useAsyncData(
    'data_opsi-bank',
    () => client('/api/data_opsi/bank')
) as any

//get default data
onMounted(async () => {
  if(props.bulan && props.bank) {
    try {
      const res = await client('/api/saldo_bank',{
        method: 'GET',
        params: {
          bulan: props.bulan,
          bank: props.bank
        }
      }) as any
      form.nominal = res.nominal?res.nominal:0;
    } catch (error) {
      console.log(error);
    }
  }
})

const form = reactive({
  bulan: props.bulan?props.bulan:dayjs().format('YY-MM'),
  bank: props.bank?props.bank:'',
  nominal: 0,
} as any)

//handle submit
const errors = reactive({} as any);
const loadingSubmit = ref(false);
const handleSubmit = async () => {
  loadingSubmit.value = true;
  errors.value = {};

  try {
    const res = await client('/api/saldo_bank',{
      method: 'POST',
      body: form
    })
    toast.add({      
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Saldo Awal Bank Berhasil Disimpan',
      life: 3000
    })
    emit('update')
  } catch (error) {
    const er = useSanctumError(error);
    errors.value = er.bag;
    console.log(error);
    
    toast.add({      
      severity: 'error',
      summary: 'Gagal!',
      detail: er.msg ? er.msg : 'Terjadi kesalahan saat menyimpan data',
      life: 3000
    })
  }

  loadingSubmit.value = false;

}
</script>
