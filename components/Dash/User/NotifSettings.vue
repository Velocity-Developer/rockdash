<template>

  <div>
    Telegram ID: {{ status.telegram_id }}
  </div>

  <div v-if="!status.telegram_id" class="mt-2">
    <Message severity="warn" class="mb-2">
      Anda belum mengaktifkan notifikasi Telegram.
    </Message>
    <div>
      <Button as="a" :href="status.webhook_url" target="_blank">
        Aktifkan Notifikasi
      </Button>
    </div>
  </div>

</template>

<script setup lang="ts">
const client = useSanctumClient();
const status = ref({
    telegram_id: '',
    webhook_url: '',
} as any);

//get status notifikasi user login
const getStatus = async () => {
    try {
        const res = await client('api/telegram/status') as any
        status.value = res
    } catch (error) {
        console.log(error);
    }
}

//on mounted
onMounted(() => {
    getStatus()
})
</script>