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
</script>
