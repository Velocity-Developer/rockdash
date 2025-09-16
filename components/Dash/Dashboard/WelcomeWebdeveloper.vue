<template>  
  <Card class="shadow-sm">
    <template #content>
      <div class="grid grid-cols-12">
        <div class="lg:col-span-9 md:col-span-7 sm:col-span-12 col-span-12">
          <div class="flex items-center gap-3 mb-8">
              <div>
                <Avatar 
                  :image="useConfig.config.user?.avatar_url" 
                  shape="circle"        
                  :pt="{
                    image: (options) => ({
                        class: [
                            '!object-cover',
                        ]
                    })
                  }"
                />
              </div>
              <div class="font-bold text-zinc-800 dark:text-white">
                Selamat Datang, {{ useConfig.config.user?.name }} !!
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="border-r border-gray-200 pr-6">
                <div class="text-2xl md:text-3xl text-zinc-900 dark:text-white">
                  {{ projectThisMonth }}
                </div>
                <div class="text-sm dark:text-zinc-400">Project bulan ini</div>
              </div>
              <div>
                <div class="text-2xl md:text-3xl text-zinc-900 dark:text-white">
                  {{performThisMonth}}%
                </div>
                <div class="text-sm dark:text-zinc-400">Kenaikan Performa</div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-3 md:col-span-5 sm:col-span-12 col-span-12 text-end">
            <img src="/charts.webp" alt="Image" class="w-full max-w-[180px] mx-auto md:ml-auto md:mr-0 md:mt-[-1em]" />
          </div>
        </div>
    </template>
  </Card>

</template>

<script setup lang="ts">
const useConfig = useConfigStore()
const client = useSanctumClient();

const projectThisMonth = ref(0);
const performThisMonth = ref(0)

//tunggu 1 detik
setTimeout( async () => {

  //ambil data dari api
  try {
    const res = await client('/api/dashboard/welcome_webdeveloper') as any
    projectThisMonth.value = res.total_project_bulanini
    performThisMonth.value = res.perform
  } catch(eror){
    const er = useSanctumError(eror)
  }

}, 1000)

</script>
