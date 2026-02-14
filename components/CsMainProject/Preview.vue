<script setup lang="ts">
const client = useSanctumClient();
const props = defineProps<{ id: number | string }>();

const data = ref(null as any)
const loading = ref(false)
const entries = (obj: any) => Object.entries(obj || {})
const formatValue = (val: any) => {
  if (val === null || val === undefined) return '-'
  if (Array.isArray(val)) return val.map((v) => typeof v === 'object' ? JSON.stringify(v) : v).join(', ')
  if (typeof val === 'object') return JSON.stringify(val)
  return val
}
const rootFields = computed(() => {
  if (!data.value) return {}
  const {
    webhost,
    karyawans,
    transaksi_masuk,
    pm_project,
    wm_project,
    cs_main_project_info,
    ...rest
  } = data.value
  return rest
})

const getData = async () => {
  if(!props.id) return;
  loading.value = true
  try {
    const res = await client('/api/cs_main_project/'+props.id);
    data.value = res;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}

watch(() => props.id, () => {
  getData()
}, { immediate: true })
</script>

<template>
  <div class="text-sm">
    <div v-if="loading">Memuat data...</div>
    <div v-else-if="data">
      <div class="font-semibold">{{ data.jenis }}</div>
      <div class="opacity-70">{{ data.webhost?.nama_web }}</div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="border rounded p-3">
          <div class="font-medium mb-2">Info Utama</div>
          <div class="space-y-1">
            <div v-for="[key, val] in entries(rootFields)" :key="key" class="grid grid-cols-3 gap-2">
              <div class="opacity-70 break-words">{{ key }}</div>
              <div class="col-span-2 break-words">{{ formatValue(val) }}</div>
            </div>
          </div>
        </div>

        <div v-if="data.webhost" class="border rounded p-3">
          <div class="font-medium mb-2">Webhost</div>
          <div class="space-y-1">
            <div v-for="[key, val] in entries(data.webhost)" :key="key" class="grid grid-cols-3 gap-2">
              <div class="opacity-70 break-words">{{ key }}</div>
              <div v-if="key !== 'paket'" class="col-span-2 break-words">{{ formatValue(val) }}</div>
              <div v-else class="col-span-3">
                <div class="mt-1 border rounded p-2">
                  <div class="opacity-70 mb-1">paket</div>
                  <div class="space-y-1">
                    <div v-for="[pkey, pval] in entries(data.webhost.paket)" :key="pkey" class="grid grid-cols-3 gap-2">
                      <div class="opacity-70 break-words">{{ pkey }}</div>
                      <div class="col-span-2 break-words">{{ formatValue(pval) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="data.karyawans && data.karyawans.length" class="mt-4 border rounded p-3">
        <div class="font-medium mb-2">Karyawans</div>
        <div class="space-y-3">
          <div v-for="(kar, idx) in data.karyawans" :key="idx" class="border rounded p-2">
            <div class="font-medium">{{ kar.nama }}</div>
            <div class="space-y-1 mt-1">
              <div v-for="[key, val] in entries(kar)" :key="key" class="grid grid-cols-3 gap-2">
                <div class="opacity-70 break-words">{{ key }}</div>
                <div v-if="key !== 'pivot'" class="col-span-2 break-words">{{ formatValue(val) }}</div>
                <div v-else class="col-span-3">
                  <div class="mt-1 border rounded p-2">
                    <div class="opacity-70 mb-1">pivot</div>
                    <div class="space-y-1">
                      <div v-for="[pkey, pval] in entries(kar.pivot)" :key="pkey" class="grid grid-cols-3 gap-2">
                        <div class="opacity-70 break-words">{{ pkey }}</div>
                        <div class="col-span-2 break-words">{{ formatValue(pval) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="data.transaksi_masuk && data.transaksi_masuk.length" class="mt-4 border rounded p-3">
        <div class="font-medium mb-2">Transaksi Masuk</div>
        <div class="space-y-3">
          <div v-for="(trx, idx) in data.transaksi_masuk" :key="idx" class="border rounded p-2">
            <div class="space-y-1">
              <div v-for="[key, val] in entries(trx)" :key="key" class="grid grid-cols-3 gap-2">
                <div class="opacity-70 break-words">{{ key }}</div>
                <div class="col-span-2 break-words">{{ formatValue(val) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="data.pm_project" class="mt-4 border rounded p-3">
        <div class="font-medium mb-2">PM Project</div>
        <div class="space-y-1">
          <div v-for="[key, val] in entries(data.pm_project)" :key="key" class="grid grid-cols-3 gap-2">
            <div class="opacity-70 break-words">{{ key }}</div>
            <div class="col-span-2 break-words">{{ formatValue(val) }}</div>
          </div>
        </div>
      </div>

      <div v-if="data.wm_project" class="mt-4 border rounded p-3">
        <div class="font-medium mb-2">WM Project</div>
        <div class="space-y-3" v-if="Array.isArray(data.wm_project)">
          <div v-for="(wm, idx) in data.wm_project" :key="idx" class="border rounded p-2">
            <div class="space-y-1">
              <div v-for="[key, val] in entries(wm)" :key="key" class="grid grid-cols-3 gap-2">
                <div class="opacity-70 break-words">{{ key }}</div>
                <div class="col-span-2 break-words">{{ formatValue(val) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="space-y-1">
          <div v-for="[key, val] in entries(data.wm_project)" :key="key" class="grid grid-cols-3 gap-2">
            <div class="opacity-70 break-words">{{ key }}</div>
            <div class="col-span-2 break-words">{{ formatValue(val) }}</div>
          </div>
        </div>
      </div>

      <div v-if="data.cs_main_project_info" class="mt-4 border rounded p-3">
        <div class="font-medium mb-2">Cs Main Project Info</div>
        <div class="space-y-1">
          <div v-for="[key, val] in entries(data.cs_main_project_info)" :key="key" class="grid grid-cols-3 gap-2">
            <div class="opacity-70 break-words">{{ key }}</div>
            <div class="col-span-2 break-words">{{ formatValue(val) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>Data tidak ditemukan</div>
  </div>
</template>

<style scoped></style>
