<template>
  <div>
    Page: laporan/grafik_transaksi_prive
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Grafik Transaksi Prive',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()
</script>
