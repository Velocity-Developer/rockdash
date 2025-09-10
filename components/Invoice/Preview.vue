<script setup lang="ts">
import { useDayjs } from '#dayjs'
import { formatMoney as money } from '~/utils/formatMoney'

const dayjs = useDayjs()
const props = defineProps<{ id: string | number | null }>()
const emit = defineEmits<{
  edit: [id: string | number]
  print: [id: string | number]
}>()
const client = useSanctumClient()

const { data, status, error, refresh } = await useAsyncData(
  'invoice-preview-' + props.id,
  () => (props.id ? client(`/api/invoice/${props.id}`) : Promise.resolve(null)),
  { watch: [() => props.id] }
) as any

function formatMoney(v?: number) { return money(Number(v || 0)) }
const fmtDMY = (v?: string) => (!v || v === '0000-00-00' ? '-' : dayjs(v).format('DD/MM/YYYY'))

const subtotal = computed(() => Number(data.value?.subtotal ?? 0))
const nominalPajak = computed(() => Number(data.value?.nominal_pajak ?? 0))
const total = computed(() => Number(data.value?.total ?? (subtotal.value + nominalPajak.value)))
</script>

<template>
  <div class="p-2">
    <div v-if="status === 'pending'" class="text-sm opacity-60 py-10 text-center">Memuat preview…</div>
    <div v-else-if="error" class="text-sm text-red-500 py-10 text-center">Gagal memuat data</div>
    <div v-else-if="!data" class="text-sm opacity-60 py-10 text-center">Data tidak tersedia</div>
    <div v-else class="space-y-4">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <div>
            <img v-if="data.unit === 'vcm'" src="/logo-vcm.webp" alt="Logo" style="height: 48px; object-fit: contain;" />
            <img v-else src="/logo-vdi.webp" alt="Logo" style="height: 48px; object-fit: contain;" />
          </div>
          <div class="text-xl font-semibold mt-2">VD {{ data.nomor }}</div>
          <div class="text-xs"><Tag :severity="data.status==='lunas'?'success':(data.status==='batal'?'danger':'warning')">{{ data.status }}</Tag></div>

        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="flex gap-2">
            <Button 
              @click="emit('edit', data.id)"
              severity="secondary"
              size="small"
              :disabled="!data?.id"
            >
            <Icon name="lucide:edit" /> Edit
            </Button>
            <Button 
              @click="emit('print', data.id)"
              severity="contrast"
              size="small"
              :disabled="!data?.id"
            >            
            <Icon name="lucide:printer" /> Print
            </Button>
          </div>
          <div class="text-right text-sm">
            <div>Tanggal: <b>{{ fmtDMY(data.tanggal) }}</b></div>
            <div>Jatuh Tempo: <b>{{ fmtDMY(data.jatuh_tempo || '') }}</b></div>
            <div v-if="data.tanggal_bayar">Dibayar: <b>{{ fmtDMY(data.tanggal_bayar) }}</b></div>
          </div>
        </div>
      </div>

      <!-- Customer -->
      <div class="rounded border p-3">
        <div class="font-medium mb-1">Customer</div>
        <div class="text-sm leading-6">
          <div>{{ data.customer?.nama || '-' }}</div>
          <div class="opacity-80">{{ data.customer?.email || '-' }}</div>
          <div class="opacity-80">{{ data.customer?.hp || '-' }}</div>
          <div class="opacity-80 whitespace-pre-line">{{ data.customer?.alamat || '-' }}</div>
        </div>
      </div>

      <!-- Items -->
      <div class="rounded border">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900">
              <th class="text-left p-2 border">#</th>
              <th class="text-left p-2 border">Item</th>
              <th class="text-right p-2 border">Harga</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in data.items" :key="i">
              <td class="p-2 border">{{ i + 1 }}</td>
              <td class="p-2 border">                
                <span v-if="it.jenis" class="pr-1">
                  {{ it.jenis }} 
                </span>
                <span v-if="it.webhost?.nama_web" class="pr-1">
                  {{ it.webhost?.nama_web }} 
                </span>
                {{ it.nama }}
              </td>
              <td class="p-2 border text-right">{{ formatMoney(it.harga) }}</td>
            </tr>
            <tr v-if="!data.items || !data.items.length">
              <td colspan="5" class="p-4 text-center opacity-60">Tidak ada item</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="rounded border p-3">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div class="font-medium">Subtotal</div>
          <div class="md:col-span-2 text-right">{{ formatMoney(subtotal) }}</div>
          <div class="font-medium">Pajak</div>
          <div class="md:col-span-2 text-right">
            <template v-if="data.pajak">
              {{ formatMoney(nominalPajak) }} ({{ data.nama_pajak }})
            </template>
          </div>
          <div class="font-semibold text-blue-700">Total</div>
          <div class="md:col-span-2 text-xl text-right font-semibold text-blue-700 dark:text-blue-500">{{ formatMoney(total) }}</div>
        </div>
      </div>

      <!-- Note -->
      <div v-if="data.note" class="rounded border p-3 text-sm whitespace-pre-line">
        {{ data.note }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>

