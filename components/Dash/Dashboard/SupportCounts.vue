<script setup lang="ts">
const emit = defineEmits(['update']);
const client = useSanctumClient();

const { data } = await useAsyncData(
  'dashboard-analytic-support-dashboard_counts',
  () => client('/api/dashboard/analytic/support/dashboard_counts')
) as any
</script>

<template>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

      <Card class="dark:bg-zinc-800 h-full">
          <template #content>
            <div class="flex items-center md:justify-between gap-2">
              <span class="w-12 h-12 p-2 bg-blue-500 dark:bg-blue-800 text-white rounded flex justify-center items-center">
                <Icon name="lucide:briefcase-business" class="w-6 h-6"/>
              </span>
              <div class="text-xs md:text-sm opacity-70">
                Projek update belum dikerjakan
              </div>
            </div>
            <div class="mt-5 text-3xl font-bold text-right">
              {{ data.projek_belum_dikerjakan }}
            </div>
          </template>
      </Card>

      <Card class="dark:bg-zinc-800 h-full">
          <template #content>
            <div class="flex items-center md:justify-between gap-2">
              <span class="w-12 h-12 p-2 bg-emerald-500 dark:bg-emerald-800 text-white rounded flex justify-center items-center">
                <Icon name="lucide:folder-check" class="w-6 h-6"/>
              </span>
              <div class="text-xs md:text-sm opacity-70">
                Projek update selesai bulan ini
              </div>
            </div>
            <div class="mt-5 text-3xl font-bold text-right">
              {{ data.projek_dikerjakan_bulan }}
            </div>
          </template>
      </Card>

      <Card class="dark:bg-zinc-800 h-full">
          <template #content>
            <div class="flex items-center md:justify-between gap-2">
              <span class="w-12 h-12 p-2 bg-pink-500 dark:bg-pink-800 text-white rounded flex justify-center items-center">
                <Icon name="lucide:hammer" class="w-6 h-6"/>
              </span>
              <div class="text-xs md:text-sm opacity-70">
                Projek update pending bulan ini
              </div>
            </div>
            <div class="mt-5 text-3xl font-bold text-right">
              {{ data.projek_pending_bulan }}
            </div>
          </template>
      </Card>

      <Card class="dark:bg-zinc-800 h-full">
          <template #content>
            <div class="flex items-center md:justify-between gap-2">
              <span class="w-12 h-12 p-2 bg-amber-500 dark:bg-amber-800 text-white rounded flex justify-center items-center">
                <Icon name="lucide:hammer" class="w-6 h-6"/>
              </span>
              <div class="text-xs md:text-sm opacity-70">
                jurnal hari ini
              </div>
            </div>
            <div class="mt-5 text-3xl font-bold text-right">
              {{ data.jurnal_hari_ini }}
            </div>
          </template>
      </Card>

  </div>
    
</template>

<style scoped></style>
