<template>
  <form @submit.prevent="submitForm" class="space-y-4">

    <div>
      <label class="text-sm mb-1" for="chat_pertama">Chat Pertama</label>
      <InputText class="w-full" id="chat_pertama" v-model="forms.chat_pertama" />
    </div>
    <div>
      <label class="text-sm mb-1" for="whatsapp">Chat terakhir: WhatsApp/Tidio</label>
      <InputText class="w-full" id="whatsapp" v-model="forms.whatsapp" />
    </div>
    <div>
      <label class="text-sm mb-1" for="via">Pertama kali chat</label>
      <Select class="w-full" id="via" v-model="forms.via" :options="opsiPertamaChat" />
    </div>
    <div>
      <label class="text-sm mb-1" for="alasan">Alasan</label>
      <Select class="w-full" id="alasan" v-model="forms.alasan" :options="opsiAlasan" />
    </div>
    <div>
      <label class="text-sm mb-1" for="perangkat">Perangkat</label>
      <Select class="w-full" id="perangkat" v-model="forms.perangkat" :options="['-', 'Pc', 'Mobile']" />
    </div>
    <div>
      <label class="text-sm mb-1" for="detail">Detail</label>
      <Textarea class="w-full" id="detail" v-model="forms.detail" />
    </div>
    <div>
      <label class="text-sm mb-1" for="kata_kunci">Kata Kunci</label>
      <InputText class="w-full" id="kata_kunci" v-model="forms.kata_kunci" />
    </div>

    <div class="flex justify-end">
      <Button type="submit" :loading="loading">
        <Icon name="lucide:save" /> Simpan
      </Button>
    </div>

  </form>
</template>

<script setup lang="ts">
const props = defineProps({
  action: {
    type: String,
    default: ''
  },
  dataRekapChat: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['update']);

const client = useSanctumClient();
const toast = useToast();

const forms = reactive({
  id: '',
  chat_pertama: '',
  whatsapp: '',
  via: '',
  alasan: '',
  perangkat: '',
  detail: '',
  kata_kunci: '',
  tanggal_followup: '',
  status_followup: '',
})

const loading = ref(false);
const submitForm = async () => {
  loading.value = true;
  try {
    if (props.action === 'add') {
      await client('/api/rekap-chat', {
        method: 'POST',
        body: forms
      })
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil ditambahkan', life: 3000 });
    } else if (props.action === 'edit') {
      await client(`/api/rekap-chat/${forms.id}`, {
        method: 'PUT',
        body: forms
      })
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil diperbarui', life: 3000 });
    }
    emit('update');
  } catch (error) {
    const er = useSanctumError(error);
    toast.add({ severity: 'error', summary: 'Gagal', detail: er.msg || 'Terjadi kesalahan', life: 3000 });
  } finally {
    loading.value = false;
  }
}

const opsiAlasan = ref([
  '-',
  'Pembayaran',
  'Tempat',
  'Kemahalan',
  'Konsep',
  'Salah Sambung',
  'No Respon - Blm Kirim Form',
  'No Respon - Kirim Form',
  'No Respon - Kirim Data',
  'Lain - lain',
  'Sudah Order'
])
const opsiPertamaChat = ref([
  '-', 'Whatsapp', 'Whatsapp 2', 'Whatsapp 3', 'Whatsapp 4', 'Whatsapp 5', 'Tidio Chat', 'Tidio Chat 2', 'Tidio Chat 3', 'Telegram', 'Telegram 2'
])

watch(() => props.dataRekapChat, (val) => {
  if (props.action === 'edit' && val) {
    forms.id = val.id || ''
    forms.chat_pertama = val.chat_pertama || ''
    forms.whatsapp = val.whatsapp || ''
    forms.via = val.via || ''
    forms.alasan = val.alasan || ''
    forms.perangkat = val.perangkat || ''
    forms.detail = val.detail || ''
    forms.kata_kunci = val.kata_kunci || ''
    forms.tanggal_followup = val.tanggal_followup || ''
    forms.status_followup = val.status_followup || ''
  } else {
    forms.id = ''
    forms.chat_pertama = ''
    forms.whatsapp = ''
    forms.via = ''
    forms.alasan = ''
    forms.perangkat = ''
    forms.detail = ''
    forms.kata_kunci = ''
    forms.tanggal_followup = ''
    forms.status_followup = ''
  }
}, { immediate: true })
</script>
