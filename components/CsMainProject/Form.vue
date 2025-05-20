<template>
  <form @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-3">
      <div>
        <label class="mb-1 block" for="jenis">Jenis</label>
        <InputText type="text" name="jenis" id="jenis" v-model="form.jenis" class="w-full" />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const client = useSanctumClient();

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
  cs_main_project_id: '',
  transaksi_keluar_id: '',
});

const handleSubmit = async () => {
  try {
    const response = await client('/api/bank_transaksi', {
      method: 'POST',
      body: form,
    });
    console.log(response);
  } catch (error) {
    const er = useSanctumError(error);
    console.log(er);
  }
}
</script>
