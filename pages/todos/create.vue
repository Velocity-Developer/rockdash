<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Buat Todo Baru</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Buat tugas baru dan assign ke user atau role</p>
      </div>
      <Button
        @click="navigateTo('/todos')"
        outlined
        severity="secondary"
      >
        <Icon name="lucide:arrow-left" />
        Kembali
      </Button>
    </div>

    <!-- Form Card -->
    <Card>
      <template #content>
        <TodoForm
          action="create"
          @success="handleSuccess"
          @cancel="handleCancel"
        />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Buat Todo Baru',
  description: 'Buat tugas baru dan assign ke user atau role',
})

const router = useRouter()
const toast = useToast()

const handleSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Todo berhasil dibuat',
    life: 3000
  })

  router.push('/todos')
}

const handleCancel = () => {
  router.push('/todos')
}
</script>