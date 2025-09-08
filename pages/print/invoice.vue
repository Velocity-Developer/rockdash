<script setup lang="ts">
definePageMeta({ title: 'Print Invoice', layout: false })

import { useDayjs } from '#dayjs'
import { formatMoney as money } from '~/utils/formatMoney'

const dayjs = useDayjs()
const route = useRoute()
const client = useSanctumClient()

const id = computed(() => (route.query.id as string) || '')
const autoPrint = computed(() => String(route.query.print || '') === 'true')

const { data, pending, error } = await useAsyncData(
  () => (id.value ? client<any>(`/api/invoice/${id.value}`).then(res => res) : Promise.resolve('')),
  { watch: [id] }
) as any

const unit = computed(() => data.value?.unit || 'vdi')

const fmtDMY = (v?: string) => {
  if (!v || v === '0000-00-00') return '-'
  return dayjs(v).format('DD/MM/YYYY')
}

const total = computed(() => {
  if (data.value && typeof data.value.total !== 'undefined' && data.value.total !== null) {
    return Number(data.value.total)
  }
  const items = data.value?.items || []
  return items.reduce((sum: number, it: any) => sum + (Number(it.harga) || 0), 0)
})

const paidAmount = computed(() => (data.value?.status === 'lunas' ? total.value : 0))
const dueAmount = computed(() => Math.max(total.value - paidAmount.value, 0))
const dueDate = computed(() => {
  const t = data.value?.jatuh_tempo || data.value?.tanggal
  if (!t || t === '0000-00-00') return '-'
  return dayjs(t).add(3, 'day').format('DD/MM/YYYY')
})

function formatMoney(v?: number) { return money(Number(v || 0)) }

function handlePrint() { window.print() }
function goBack() { history.back() }

// Auto print when ?print=true and data is loaded
const printed = ref(false)
watch(
  () => ({ ready: !!data.value, auto: autoPrint.value }),
  (s) => {
    if (s.ready && s.auto && !printed.value) {
      printed.value = true
      setTimeout(() => window.print(), 200)
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-black p-4 md:p-8">
    
    <div class="max-w-[900px] mx-auto">
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

      <div v-else-if="pending" class="text-center py-20 text-gray-500">Memuat data invoice…</div>

      <div v-else-if="error" class="text-center py-20 text-red-500">
        Gagal memuat data invoice
      </div>

      <div v-else-if="!data" class="text-center py-20 text-gray-500">
        Data tidak tersedia
      </div>

      <div v-else class="border border-gray-200 shadow bg-white">
        <!-- Header row -->
        <div class="grid grid-cols-12 bg-blue-100 p-2">
          <div class="col-span-7 p-3 flex items-center gap-3">
            <img v-if="unit === 'vcm'" src="/logo-vcm.webp" alt="Logo" class="h-12 object-contain" />
            <img v-else src="/logo-vdi.webp" alt="Logo" class="h-12 object-contain" />
          </div>
          <div class="col-span-5">
            <table class="w-full">
              <tbody>
                <tr>
                  <td class="p-1 text-sm w-1/2">Nomor Invoice:</td>
                  <td class="p-1 text-sm text-right font-semibold">VD{{ data.nomor }}</td>
                </tr>
                <tr>
                  <td class="p-1 text-sm">Jatuh Tempo:</td>
                  <td class="p-1 text-sm text-right">{{ dueDate }}</td>
                </tr>
                <tr>
                  <td class="p-1 text-sm">Tanggal Invoice:</td>
                  <td class="p-1 text-sm text-right">{{ fmtDMY(data.tanggal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bill to / from -->
        <div class="grid grid-cols-12 mx-5">
          <div class="col-span-7 py-3 pr-3">
            <div class="font-semibold mb-1">Tagihan kepada:</div>
            <div class="text-sm leading-5">
              <div class="font-medium">{{ data.customer.nama }}</div>
              <div class="whitespace-pre-line max-w-[250px]">{{ data.customer.alamat }}</div>
            </div>
          </div>
          <div class="col-span-5 py-3 pr-3">
            <div class="font-semibold mb-1">Tagihan dari :</div>
            <div class="text-sm leading-5">
              <div class="font-medium">Velocity Developer Indonesia</div>
              <div>Kebonagung RT 04 / RW 01 Jarum, Bayat,</div>
              <div>Klaten, Jawa Tengah</div>
              <div class="mt-1">Bantuanvdc@gmail.com</div>
            </div>
          </div>
        </div>

        <!-- Items table -->
        <div class="border-t border-gray-400 mx-5">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-blue-300/80">
                <th class="border border-gray-400 p-2 text-left w-10 text-sm">No</th>
                <th class="border border-gray-400 p-2 text-left text-sm">Nama Pekerjaan</th>
                <th class="border border-gray-400 p-2 text-right w-40 text-sm">Harga</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in data.items" :key="idx">
                <td class="border border-gray-400 p-2 text-sm">{{ idx + 1 }}</td>
                <td class="border border-gray-400 p-2">
                  <template v-if="item.jenis">{{ item.jenis }}</template>
                  <template v-if="item.website">{{ item.website }}</template>
                  {{ item.nama }}
                </td>
                <td class="border border-gray-400 p-2 text-right">{{ formatMoney(item.harga,'',0) }}</td>
              </tr>
              <tr v-for="pad in Math.max(0, 3 - (data.items?.length || 0))" :key="'pad'+pad">
                <td class="border border-gray-400 p-2">&nbsp;</td>
                <td class="border border-gray-400 p-2">&nbsp;</td>
                <td class="border border-gray-400 p-2">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary area -->
        <div class="grid grid-cols-12">
          <div class="col-span-7 p-4 text-sm">
            <div class="mb-6">
              <span class="align-top">Dibayar tanggal:</span>
              <span class="ml-2 px-10 py-1 bg-blue-300/70 inline-block">{{ fmtDMY(data.tanggal_bayar) }}</span>
            </div>

            <div class="mt-8">
              <div class="font-semibold mb-1">Pembayaran ditransfer ke :</div>
              <div v-if="unit === 'vcm'">
                <div>CV. Velocity Cyber Media</div>
                <div>BCA : 0301545834</div>
              </div>
              <div v-else>
                <div>CV. Velocity Developer Indonesia</div>
                <div>BCA : 0301545796</div>
              </div>
            </div>

            <div class="mt-10">
              <div class="font-semibold">Terms & Conditions:</div>
              <a href="https://velocitydeveloper.com/syarat-dan-ketentuan/" class="text-blue-700">velocitydeveloper.com/syarat-dan-ketentuan/</a>
            </div>
          </div>
          <div class="col-span-5 p-4 relative">
            <table class="w-full border border-gray-400">
              <tbody>
                <tr>
                  <td class="p-2 text-sm border-b border-gray-400">Sub Total</td>
                  <td class="p-2 text-right border-b border-gray-400">{{ formatMoney(total) }}</td>
                </tr>
                <tr>
                  <td class="p-2 font-semibold border-b border-gray-400">TOTAL</td>
                  <td class="p-2 text-right font-semibold border-b border-gray-400">{{ formatMoney(total) }}</td>
                </tr>
                <tr>
                  <td class="p-2 text-sm border-b border-gray-400">Dibayar</td>
                  <td class="p-2 text-right border-b border-gray-400">{{ formatMoney(paidAmount) }}</td>
                </tr>
                <tr>
                  <td class="p-2 text-sm">Terhutang</td>
                  <td class="p-2 text-right">{{ formatMoney(dueAmount) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="mt-6">
              <div class="bg-blue-400 text-white font-semibold text-center py-2" :class="{'bg-green-600 py-5': data.status === 'lunas'}">
                {{ data.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS' }}
              </div>
            </div>

            <!-- STEMPEL -->
            <div v-if="data.status === 'lunas'">
              <div class="absolute bottom-0 left-[-150px]">                
                  <img v-if="unit === 'vcm'" src="/stempel-vcm.webp" alt="Logo" class="w-[220px] object-contain" />
                  <img v-else src="/stempel-vdi.webp" alt="Logo" class="w-[220px] object-contain" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print { .print\:hidden { display: none !important; } }
</style>
