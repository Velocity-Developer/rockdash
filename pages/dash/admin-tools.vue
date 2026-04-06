<template>

  <Card class="mx-auto max-w-4xl">
    <template #content>

      <div v-if="runLoading || runResult.output" class="bg-gray-900 text-green-600 font-mono mb-6">
          <div v-if="runLoading" class="flex justify-center">
              <ProgressSpinner />
          </div>
          <div class="bg-green-800 text-white px-4 py-1">{{ runResult.exitCode }}</div>
          <div v-html="runResult.output" class="p-4"></div>
      </div>

      <div v-if="dataTools" class="grid grid-cols-2 gap-4">
        <div v-for="tool,i in dataTools" :key="i">

          <Button severity="contrast" class="w-full" @click="runTool(tool)">            
            <div class="flex flex-col items-center justify-center">
              <Icon :name="tool.icon" size="1.5rem" class="mb-1"/>
              <div>{{ tool.name }}</div>
            </div>
          </Button>

        </div>
      </div>

    </template>
  </Card>

</template>

<script setup lang="ts">
definePageMeta({
  title: 'Admin Tools',
  description: 'Admin Tools',
})
const client = useSanctumClient();
const toast = useToast()
const confirm = useConfirm()

const { data: dataTools} = await useAsyncData(
    'admin_tools',
    () => client('/api/dash/admin-tools')
) as any


const runLoading = ref(false)
const runResult = ref({} as any)
const runTool = (item: any) => {
    confirm.require({
        message: `Anda yakin menjalankan "${item.name}" ?`,
        header: 'Jalankan tool',
        accept: async () => {
            try {
              runLoading.value = true
              const res = await client(`/api/dash/admin-tools-run`,{
                method: 'POST',
                params: {
                  key: item.key
                }
              }) as any 
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Tool berhasil dijalankan',
                life: 3000
              });
              runResult.value = res
            } catch (error) {
              console.log(error)
              toast.add({
                severity: 'error',
                summary: 'Gagal menjalankan tool',
                life: 3000
              })
            } finally {
              runLoading.value = false
            }
        },
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Run',
            severity: 'danger',
            outlined: false
        },
        reject: () => {
            //callback to execute when user rejects to delete
        }
    });
}

</script>
