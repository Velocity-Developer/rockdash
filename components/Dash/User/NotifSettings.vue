<template>

  <div v-if="!status.telegram_id">
    <Message severity="error" class="mt-1">
      Telegram ID anda belum ada
    </Message>

    <div class="mt-1 mb-2 bg-gray-100 p-3 rounded">
      <Button as="a" href="https://t.me/userinfobot" target="_blank" class="mb-1">
        Dapatkan di @userinfobot
      </Button>
      <img src="https://i.imgur.com/KfPrhfJ.jpeg" alt="Telegram" class="w-50">
    </div>
    
    <form @submit.prevent="handleSubmit" class="flex justify-between gap-1 bg-gray-500 text-white p-2 rounded-md">
      <InputText v-model="telegramId" placeholder="Masukkan Telegram ID" class="w-full"/>
      <Button type="submit">
        <Icon name="lucide:save" />
      </Button>
    </form>
  </div>

  <div class="mt-1" v-else>
    <Button severity="info" @click="handleTestNotif" class="group">
      <Icon name="lucide:megaphone" class="group-hover:animate-bounce"/> Tes Notifikasi
    </Button>

    <Message severity="success" class="mt-2">
      Telegram ID: {{ status.telegram_id }}
    </Message>
    <Message severity="warn" class="mt-3">
      Jika tes notifikasi belum berhasil,
      <br> silahkan buka 
      <br>
      <Button severity="contrast" as="a" href="https://t.me/NewVDnetbot" target="_blank" size="small">
        @NewVDnetbot
      </Button>
      <br><br>
      lalu klik 'Start' atau kirim pesan '/start', lalu coba kembali tes notifikasi
    </Message>
  </div>

</template>

<script setup lang="ts">
const { start, finish } = useLoadingIndicator()
const status = ref({
    telegram_id: '',
    webhook_url: '',
} as any);
const telegramId = ref('')
const client = useSanctumClient();
const isLoading = ref(false)
const toast = useToast();

//get status notifikasi user login
const getStatus = async () => {
    try {
        const res = await client('api/telegram/status') as any
        status.value = res
        telegramId.value = res.telegram_id
    } catch (error) {
        console.log(error);
    }
}

//on mounted
onMounted(() => {
    getStatus()
})

const handleSubmit = async () => {
    start()
    try {
      const res = await client(`/api/telegram/update`, {
        method: 'POST',
        body: {
          telegram_id: telegramId.value,
        }
      }) as any
      getStatus()

      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Data Telegram berhasil diupdate',
        life: 3000
      });
    } catch (error) {
      console.log(error);
    } finally {
      finish()
    }
}

//test notifikasi user login
const handleTestNotif = async () => {
  start()
  try {
    await client(`/api/telegram/test_notif_user`) as any
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Test notifikasi berhasil dikirim',
      life: 3000
    });
  } catch (error) {
    console.log(error);
  } finally {
    finish()
  }
}
</script>