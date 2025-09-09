<script setup lang="ts">
definePageMeta({ title: 'Print Invoice', layout: false })

import { useDayjs } from '#dayjs'
import { formatMoney as money } from '~/utils/formatMoney'
import printJS from 'print-js'

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

function handlePrint() { 
  printJS({
    printable: 'page-print',
    type: 'html',
    targetStyles: ['*']
  }) 
}
function goBack() { history.back() }

// Auto print when ?print=true and data is loaded
const printed = ref(false)
watch(
  () => ({ ready: !!data.value, auto: autoPrint.value }),
  (s) => {
    if (s.ready && s.auto && !printed.value) {
      printed.value = true
      setTimeout(() => {
        printJS({
          printable: 'page-print',
          type: 'html',
          targetStyles: ['*']
        })
      }, 200)
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>

  <div style="min-height: 100vh; background-color: #f3f4f6; color: black; padding: 16px;">
     
    <div style="max-width: 210mm; margin: 0 auto;">

      <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <div style="font-size: 14px; opacity: 0.7;">Print Invoice</div>
        <div style="display: flex; gap: 8px;">
          <Button size="small" @click="goBack"><Icon name="lucide:arrow-left" /> Kembali</Button>
          <Button size="small" severity="success" @click="handlePrint"><Icon name="lucide:printer" /> Print</Button>
        </div>
      </div>

      <div v-if="!id" style="text-align: center; padding: 80px 0; color: #6b7280;">
        ID invoice tidak ditemukan di query (?id=)
      </div>

      <div v-else-if="pending" style="text-align: center; padding: 80px 0; color: #6b7280;">Memuat data invoice…</div>

      <div v-else-if="error" style="text-align: center; padding: 80px 0; color: #ef4444;">
        Gagal memuat data invoice
      </div>

      <div v-else-if="!data" style="text-align: center; padding: 80px 0; color: #6b7280;">
        Data tidak tersedia
      </div>

      <div v-else style="border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); background-color: white;">
                
        <div id="page-print" style="width: 210mm;background-color: #ffffff;border: 2px solid #f4f4f4;">
          <table style="width: 100%;table-layout: fixed;font-size: 12px;">
            <tbody>
              <tr style="background-color: #dbeafe;">
                <td style="padding:10px 20px; text-align: center;">
                  <img v-if="unit === 'vcm'" src="/logo-vcm.webp" alt="Logo" style="height: 48px; object-fit: contain;" />
                  <img v-else src="/logo-vdi.webp" alt="Logo" style="height: 48px; object-fit: contain;" />
                </td>
                <td style="padding:10px 20px;text-align:right;font-size: 14px;">
                  <table style="width: 100%;">
                    <tbody>
                      <tr>
                        <td style="padding: 1px 4px; width: 50%;">Nomor Invoice:</td>
                        <td style="padding: 1px 4px; text-align: right; font-weight: 600;">{{ data.nomor }}</td>
                      </tr>
                      <tr>
                        <td style="padding: 1px 4px;">Jatuh Tempo:</td>
                        <td style="padding: 1px 4px; text-align: right;">{{ dueDate }}</td>
                      </tr>
                      <tr>
                        <td style="padding: 1px 4px;">Tanggal Invoice:</td>
                        <td style="padding: 1px 4px; text-align: right;">{{ fmtDMY(data.tanggal) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr style="background-color: #ffffff;">
                <td style="padding: 20px;vertical-align: top;">
                  <div><strong>Tagihan kepada :</strong></div>
                  <div>
                    {{ data.customer.nama }}
                  </div>
                  <div>
                    {{ data.customer.alamat }}
                  </div>
                </td>
                <td style="padding: 20px;text-align:right;width:42%">
                  <div><strong>Tagihan dari :</strong></div>
                  <div>                    
                    <template v-if="unit === 'vcm'">
                      Velocity Cyber Media
                    </template>
                    <template v-else>
                      Velocity Developer Indonesia
                    </template>
                    <br>
                    Kebonagung RT 04 / RW 01 Jarum, Bayat, <br>
                    Klaten, Jawa Tengah <br>
                    bantuanvdc@gmail.com
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 5px 20px;">
                   <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #bfdbfe;">
                          <th style="border: 1px solid #9ca3af; padding: 8px; text-align: left; width: 40px; font-size: 14px;">No</th>
                          <th style="border: 1px solid #9ca3af; padding: 8px; text-align: left; font-size: 14px;">Nama Pekerjaan</th>
                          <th style="border: 1px solid #9ca3af; padding: 8px; text-align: right; width: 160px; font-size: 14px;">Harga</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, idx) in data.items" :key="idx">
                          <td style="border: 1px solid #9ca3af; padding: 8px; font-size: 14px;">{{ idx + 1 }}</td>
                          <td style="border: 1px solid #9ca3af; padding: 8px;">
                            <template v-if="item.jenis">{{ item.jenis }}</template>
                            <template v-if="item.website">{{ item.website }}</template>
                            {{ item.nama }}
                          </td>
                          <td style="border: 1px solid #9ca3af; padding: 8px; text-align: right;">{{ formatMoney(item.harga,'',0) }}</td>
                        </tr>
                        <tr v-for="pad in Math.max(0, 3 - (data.items?.length || 0))" :key="'pad'+pad">
                          <td style="border: 1px solid #9ca3af; padding: 8px;">&nbsp;</td>
                          <td style="border: 1px solid #9ca3af; padding: 8px;">&nbsp;</td>
                          <td style="border: 1px solid #9ca3af; padding: 8px;">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px;vertical-align: top;">

                  <div style="padding: 10px;border: 1px solid #9ca3af;margin-bottom: 20px;">
                    <div style="font-weight: 600;">Note :</div> 
                    <div style="font-style: italic;opacity:0.75;">{{ data.note }}</div>
                  </div>

                  <div class="print-payment-date" style="margin-bottom: 20px;">
                    <span style="vertical-align: top;">Dibayar tanggal:</span>
                    <span style="margin-left: 8px; padding: 4px 40px; background-color: rgba(147, 197, 253, 0.7); display: inline-block;">{{ fmtDMY(data.tanggal_bayar) }}</span>
                  </div>

                  <div style="margin-top: 20px;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Pembayaran ditransfer ke :</div>
                    <div v-if="unit === 'vcm'">
                      <div>CV. Velocity Cyber Media</div>
                      <div>BCA : 0301545834</div>
                    </div>
                    <div v-else>
                      <div>CV. Velocity Developer Indonesia</div>
                      <div>BCA : 0301545796</div>
                    </div>
                  </div>

                  <div style="margin-top: 40px;">
                    <div style="font-weight: 600;">Terms & Conditions:</div>
                    <a href="https://velocitydeveloper.com/syarat-dan-ketentuan/" style="color: #1d4ed8;">velocitydeveloper.com/syarat-dan-ketentuan/</a>
                  </div>
                </td>
                <td style="padding: 20px;position: relative;vertical-align: top;">
                  
                  <table class="print-summary-table" style="width: 100%; border: 1px solid #9ca3af;">
                    <tbody>
                      <tr>
                        <td style="padding: 8px; font-size: 14px; border-bottom: 1px solid #9ca3af;">Sub Total</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #9ca3af;">{{ formatMoney(data.subtotal) }}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; font-size: 14px; border-bottom: 1px solid #9ca3af;">Pajak</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #9ca3af;">{{formatMoney(data.nominal_pajak)}} ({{ data.pajak }}%)</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; font-weight: 600; border-bottom: 1px solid #9ca3af;">TOTAL</td>
                        <td style="padding: 8px; text-align: right; font-weight: 600; border-bottom: 1px solid #9ca3af;">{{ formatMoney(total) }}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; font-size: 14px; border-bottom: 1px solid #9ca3af;">Dibayar</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #9ca3af;">{{ formatMoney(paidAmount) }}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; font-size: 14px;">Terhutang</td>
                        <td style="padding: 8px; text-align: right;">{{ formatMoney(dueAmount) }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style="margin-top: 24px;">
                    <div class="print-status" style="background-color: #60a5fa; color: white; font-weight: 600; text-align: center; padding: 8px;" :style="data.status === 'lunas' ? 'background-color: #16a34a; padding: 10px 8px;font-size: 18px' : ''">
                      {{ data.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS' }}
                    </div>
                  </div>

                  <!-- STEMPEL -->
                  <div v-if="data.status === 'lunas'">
                    <div class="print-stempel" style="position: absolute; bottom: 0; left: -120px;">                
                      <img v-if="unit === 'vcm'" src="/stempel-vcm.webp" alt="Logo" style="width: 220px; object-fit: contain;" />
                      <img v-else src="/stempel-vdi.webp" alt="Logo" style="width: 220px; object-fit: contain;" />
                    </div>
                  </div>

                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print { display: none !important; }
  
  /* Page setup with minimal margins */
  @page {
    size: A4;
    margin: 1mm;
  }
  
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Container styling for print */
  div[style*="min-height: 100vh"] {
    min-height: auto !important;
    background: white !important;
    padding: 0 !important;
  }
  
  div[style*="max-width: 900px"] {
    max-width: 100% !important;
    margin: 0 !important;
  }
  
  /* Main print container */
  #page-print {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    font-size: 11px !important;
    line-height: 1.2 !important;
  }
  
  /* Header section - compact */
  .print-header {
    padding: 4px 6px !important;
  }
  
  .print-header img {
    height: 30px !important;
  }
    
  /* Bill to/from section - reduced spacing */
  .print-billing {
    margin: 0 6px !important;
    padding: 6px 0 !important;
  }
  
  .print-billing div[style*="font-weight: 600"] {
    font-size: 10px !important;
    margin-bottom: 2px !important;
  }
  
  .print-billing div[style*="font-size: 14px"] {
    font-size: 9px !important;
    line-height: 1.2 !important;
  }
    
  /* Summary section - optimized spacing */
  .print-summary {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .print-summary-left {
    padding: 6px 8px !important;
    font-size: 9px !important;
  }
  
  .print-summary-left div[style*="font-weight: 600"] {
    font-size: 9px !important;
    margin-bottom: 1px !important;
  }
  
  .print-summary-right {
    padding: 6px 8px !important;
  }
  
  .print-summary-table {
    font-size: 9px !important;
  }
  
  
  /* Status badge */
  .print-status {
    margin-top: 6px !important;
    padding: 4px !important;
    font-size: 10px !important;
  }
  
  /* Stempel positioning - adjusted */
  .print-stempel {
    left: -80px !important;
    bottom: 5px !important;
  }
  
  .print-stempel img {
    width: 120px !important;
  }
  
  /* Payment date styling */
  .print-payment-date {
    margin-bottom: 6px !important;
  }
  
  .print-payment-date span:last-child {
    padding: 1px 6px !important;
    font-size: 9px !important;
  }
}
</style>
