<script setup lang="ts">
definePageMeta({
  title: 'Print Invoice',
  layout: false,
})

const route = useRoute()
const client = useSanctumClient()

const id = computed(() => (route.query.id as string) || '')

const { data, pending, error } = await useAsyncData(
  () => (id.value ? client<any>(`/api/invoice/${id.value}`).then(res => res) : Promise.resolve('')),
  { watch: [id] }
) as any

function formatTanggal(value?: string) {
  if (!value || value === '0000-00-00') return '-'
  const [y, m, d] = value.split('-')
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  return `${d} ${bulan[Number(m) - 1]} ${y}`
}

function formatMoney(value?: number) {
  if (value === null || value === undefined || value === 0) return '-'
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
  return `Rp ${formatted}`
}

const total = computed(() => {
  const items = data.value?.items || []
  return items.reduce((sum: number, it: any) => sum + (Number(it.harga) || 0), 0)
})

function handlePrint() {
  window.print()
}

function goBack() {
  history.back()
}
</script>

<template>
  <div class="min-h-screen bg-white text-black p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6 print:hidden">
        <div class="text-sm opacity-70">Print Invoice</div>
        <div class="flex gap-2">
          <Button size="small" @click="goBack"><Icon name="lucide:arrow-left" /> Kembali</Button>
          <Button size="small" severity="success" @click="handlePrint"><Icon name="lucide:printer" /> Print</Button>
        </div>
      </div>

      <div v-if="!id" class="text-center py-20 text-gray-500">
        ID invoice tidak ditemukan di query (?id=)
      </div>

      <div v-else-if="pending" class="text-center py-20 text-gray-500">
        Memuat data invoice...
      </div>

      <div v-else-if="error" class="text-center py-20 text-red-500">
        Gagal memuat data invoice
      </div>

      <div v-else-if="!data" class="text-center py-20 text-gray-500">
        Data tidak tersedia
      </div>

      <div v-else class="border border-gray-200 rounded-md p-6 print:border-0">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-semibold">INVOICE</h1>
            <div class="text-sm mt-1">Nomor: <span class="font-mono">{{ data.nomor }}</span></div>
            <div class="text-sm">Tanggal: {{ formatTanggal(data.tanggal) }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm">Status:</div>
            <div class="px-2 py-1 rounded text-xs inline-block"
                 :class="{
                   'bg-green-100 text-green-700': data.status==='paid',
                   'bg-yellow-100 text-yellow-700': data.status==='pending',
                   'bg-red-100 text-red-700': data.status==='canceled'
                 }">
              {{ (data.status || '').toUpperCase() }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <div class="text-xs uppercase tracking-wide text-gray-500">Ditagihkan Kepada</div>
            <div class="mt-1">
              <div class="font-medium">{{ data.nama }}</div>
              <div class="text-sm text-gray-600">Unit: {{ data.unit }}</div>
              <div class="text-sm text-gray-600" v-if="data.webhost">Webhost: {{ data.webhost?.nama_web }}</div>
            </div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wide text-gray-500">Informasi Pembayaran</div>
            <div class="mt-1 text-sm text-gray-700">
              <div>Tanggal Bayar: {{ formatTanggal(data.tanggal_bayar) }}</div>
              <div>Metode: -</div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="text-left p-3 text-sm font-medium border border-gray-200">Item</th>
                <th class="text-left p-3 text-sm font-medium border border-gray-200">Jenis</th>
                <th class="text-right p-3 text-sm font-medium border border-gray-200">Harga</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in data.items" :key="idx" class="hover:bg-gray-50">
                <td class="p-3 border border-gray-200">
                  <div class="font-medium">{{ item.nama }}</div>
                </td>
                <td class="p-3 border border-gray-200 text-sm text-gray-600">{{ item.jenis }}</td>
                <td class="p-3 border border-gray-200 text-right">{{ formatMoney(item.harga) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="p-3 border border-gray-200 text-right font-semibold">Total</td>
                <td class="p-3 border border-gray-200 text-right font-semibold">{{ formatMoney(total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="data.note" class="mt-6">
          <div class="text-xs uppercase tracking-wide text-gray-500">Catatan</div>
          <div class="mt-1 whitespace-pre-line text-sm">{{ data.note }}</div>
        </div>

        <div class="mt-10 text-sm text-gray-500">
          Terima kasih.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .print\:hidden { display: none !important; }
}
</style>
