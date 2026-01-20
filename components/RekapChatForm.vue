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

onMounted(() => {
  //jika action edit
  if (props.action === 'edit') {
    forms.id = props.dataRekapChat.id || ''
    forms.chat_pertama = props.dataRekapChat.chat_pertama || ''
    forms.whatsapp = props.dataRekapChat.whatsapp || ''
    forms.via = props.dataRekapChat.via || ''
    forms.alasan = props.dataRekapChat.alasan || ''
    forms.perangkat = props.dataRekapChat.perangkat || ''
    forms.detail = props.dataRekapChat.detail || ''
    forms.kata_kunci = props.dataRekapChat.kata_kunci || ''
    forms.tanggal_followup = props.dataRekapChat.tanggal_followup || ''
    forms.status_followup = props.dataRekapChat.status_followup || ''
  }
})
</script>
