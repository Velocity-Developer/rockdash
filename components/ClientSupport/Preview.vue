<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
})
</script>

<template>
  <div v-if="props.data" class="space-y-4">
    <div class="text-sm">
      {{ props.data?.tanggal }}
    </div>

    <div class="overflow-x-auto">
      <table class="table-auto w-full text-xs">
        <thead>
          <tr>
            <th class="px-4 py-2 border text-left">No</th>
            <th class="px-4 py-2 border text-left">Nama Web</th>
            <th class="px-4 py-2 border text-left">Jenis</th>
          </tr>
        </thead>
        <tbody>

          <template v-if="props.data?.revisi_1">
            <tr>
              <td class="px-4 py-2 border font-bold" colspan="3">Revisi 1</td>
            </tr>
            <tr v-for="(item, index) in props.data?.revisi_1" :key="index">
              <td class="px-4 py-2 border">{{ index + 1 }}</td>
              <td class="px-4 py-2 border">{{ item.nama_web }}</td>
              <td class="px-4 py-2 border">{{ item.jenis }}</td>
            </tr>
          </template>
          <template v-if="props.data?.perbaikan_revisi_1">
            <tr>
              <td class="px-4 py-2 border font-bold" colspan="3">Perbaikan Revisi 1</td>
            </tr>
            <tr v-for="(item, index) in props.data?.perbaikan_revisi_1" :key="index">
              <td class="px-4 py-2 border">{{ index + 1 }}</td>
              <td class="px-4 py-2 border">{{ item.nama_web }}</td>
              <td class="px-4 py-2 border">{{ item.jenis }}</td>
            </tr>
          </template>
          <template v-if="props.data?.revisi_2">
            <tr>
              <td class="px-4 py-2 border font-bold" colspan="3">Revisi 2</td>
            </tr>
            <tr v-for="(item, index) in props.data?.revisi_2" :key="index">
              <td class="px-4 py-2 border">{{ index + 1 }}</td>
              <td class="px-4 py-2 border">{{ item.nama_web }}</td>
              <td class="px-4 py-2 border">{{ item.jenis }}</td>
            </tr>
          </template>
          <template v-if="props.data?.perbaikan_revisi_2">
            <tr>
              <td class="px-4 py-2 border font-bold" colspan="3">Perbaikan Revisi 2</td>
            </tr>
            <tr v-for="(item, index) in props.data?.perbaikan_revisi_2" :key="index">
              <td class="px-4 py-2 border">{{ index + 1 }}</td>
              <td class="px-4 py-2 border">{{ item.nama_web }}</td>
              <td class="px-4 py-2 border">{{ item.jenis }}</td>
            </tr>
          </template>
          <template v-if="props.data?.tanya_jawab">
            <tr>
              <td class="px-4 py-2 border font-bold" colspan="3">Tanya Jawab</td>
            </tr>
            <tr v-for="(item, index) in props.data?.tanya_jawab" :key="index">
              <td class="px-4 py-2 border">{{ index + 1 }}</td>
              <td class="px-4 py-2 border">{{ item.nama_web }}</td>
              <td class="px-4 py-2 border"> </td>
            </tr>
          </template>
          <template v-if="props.data?.update_web">
            <tr>
              <td class="px-4 py-2 border font-bold" colspan="3">Update Web</td>
            </tr>
            <tr v-for="(item, index) in props.data?.update_web" :key="index">
              <td class="px-4 py-2 border">{{ index + 1 }}</td>
              <td class="px-4 py-2 border">{{ item.nama_web }}</td>
              <td class="px-4 py-2 border"> </td>
            </tr>
          </template>

        </tbody>
      </table>
    </div>
    

  </div>
</template>

<style scoped></style>
