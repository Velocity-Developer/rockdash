<script setup lang="ts">
definePageMeta({
  title: 'Kelola Quality',
  description: 'Daftar Quality untuk Web Master',
})

const client = useSanctumClient()
const toast = useToast()

const loading = ref(false)
const items = ref<{ id: number; detail: string }[]>([])

const visibleDialog = ref(false)
const actionDialog = ref<'add' | 'edit'>('add')
const loadingSubmit = ref(false)
const errors = ref({} as any)

const form = reactive({
  id: null as number | null,
  detail: '',
})

const dialogTitle = computed(() => {
  return actionDialog.value === 'edit' ? 'Edit Quality' : 'Tambah Quality'
})

const submitLabel = computed(() => {
  return actionDialog.value === 'edit' ? 'Update' : 'Simpan'
})

async function loadQuality() {
  loading.value = true
  try {
    const res = await client('/api/quality') as any
    items.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQuality()
})

function openDialog(action: 'add' | 'edit', row?: any) {
  actionDialog.value = action

  if (action === 'edit' && row) {
    form.id = row.id
    form.detail = row.detail || ''
  } else {
    form.id = null
    form.detail = ''
  }

  errors.value = {}
  visibleDialog.value = true
}

async function handleSubmit() {
  loadingSubmit.value = true
  errors.value = {}

  const payload = {
    detail: form.detail,
  }

  try {
    if (actionDialog.value === 'edit' && form.id) {
      await client(`/api/quality/${form.id}`, {
        method: 'PUT',
        body: payload,
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Quality berhasil diperbarui',
        life: 3000,
      })
    } else {
      await client('/api/quality', {
        method: 'POST',
        body: payload,
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Quality berhasil ditambahkan',
        life: 3000,
      })
    }

    visibleDialog.value = false
    await loadQuality()
  } catch (error) {
    const er = useSanctumError(error)
    errors.value = er.bag || {}
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: er.msg || 'Terjadi kesalahan saat menyimpan data',
      life: 3000,
    })
  } finally {
    loadingSubmit.value = false
  }
}
</script>
<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-lg font-semibold">
        Kelola Quality
      </h1>
      <div class="flex items-center gap-2">
        <Button
          size="small"
          @click="openDialog('add')"
        >
          <Icon name="lucide:plus-circle" /> Tambah
        </Button>
        <Button
          size="small"
          :loading="loading"
          @click="loadQuality"
        >
          <Icon name="lucide:refresh-ccw" /> Refresh
        </Button>
      </div>
    </div>

    <Card>
      <template #content>
        <DataTable
          :value="items"
          size="small"
          stripedRows
          :loading="loading"
          scrollable
          scrollHeight="70vh"
        >
          <Column
            header="#"
            headerStyle="width:3rem"
          >
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="detail" header="Detail" />

          <Column field="act" header="">
            <template #body="slotProps">
              <div class="flex justify-end item-center gap-1">
                <Button
                  size="small"
                  severity="info"
                  @click="openDialog('edit', slotProps.data)"
                >
                  <Icon name="lucide:pen"/>
                </Button>
              </div>
            </template>
          </Column>

        </DataTable>
      </template>
    </Card>

    <Dialog
      v-model:visible="visibleDialog"
      modal
      :header="dialogTitle"
      :style="{ width: '40rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div>
          <label class="text-sm mb-1 block" for="detail">Detail Quality</label>
          <Textarea
            id="detail"
            v-model="form.detail"
            class="w-full"
            placeholder="Nama / detail quality"
            rows="6"
          />
          <Message
            v-if="errors.detail"
            severity="error"
            size="small"
            class="mt-1"
            closable
          >
            {{ Array.isArray(errors.detail) ? errors.detail[0] : errors.detail }}
          </Message>
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            severity="secondary"
            size="small"
            :disabled="loadingSubmit"
            @click="visibleDialog = false"
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="small"
            :loading="loadingSubmit"
          >
            <Icon
              v-if="loadingSubmit"
              name="lucide:loader-circle"
              class="animate-spin mr-1"
            />
            <Icon
              v-else
              name="lucide:save"
              class="mr-1"
            />
            <span>{{ submitLabel }}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped></style>
