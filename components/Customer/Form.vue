<script setup lang="ts">
const props = defineProps({
  action: {
    type: String,
    default: 'add'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update'])

const client = useSanctumClient();
const toast = useToast();

const formData = reactive({
  nama: props.data.nama || '',
  email: props.data.email || '',
  hp: props.data.hp || '',
  alamat: props.data.alamat || '',
})

const isSubmitting = ref(false)

const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    if (props.action === 'add') {
      await client('/api/customer', {
        method: 'POST',
        body: formData
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Customer berhasil ditambahkan',
        life: 3000
      });
    } else {
      await client(`/api/customer/${props.data.id}`, {
        method: 'PUT',
        body: formData
      })
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Customer berhasil diperbarui',
        life: 3000
      });
    }
    
    emit('update')
  } catch (error) {
    const er = useSanctumError(error)
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: er.msg ? er.msg : 'Terjadi kesalahan saat menyimpan data',
      life: 3000
    });
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when action changes
watch(() => props.action, () => {
  if (props.action === 'add') {
    formData.nama = ''
    formData.email = ''
    formData.hp = ''
    formData.alamat = ''
  }
})

// Update form when data changes
watch(() => props.data, () => {
  if (props.action === 'edit') {
    formData.nama = props.data.nama || ''
    formData.email = props.data.email || ''
    formData.hp = props.data.hp || ''
    formData.alamat = props.data.alamat || ''
  }
}, { deep: true })
</script>

<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="col-span-2">
        <label for="nama" class="block text-sm font-medium mb-1">Nama *</label>
        <InputText 
          id="nama" 
          v-model="formData.nama" 
          placeholder="Masukkan nama customer" 
          class="w-full" 
          :class="{ 'p-invalid': !formData.nama }"
          required
        />
      </div>
      
      <div class="col-span-2 md:col-span-1">
        <label for="email" class="block text-sm font-medium mb-1">Email</label>
        <InputText 
          id="email" 
          v-model="formData.email" 
          placeholder="customer@example.com" 
          class="w-full" 
          type="email"
        />
      </div>
      
      <div class="col-span-2 md:col-span-1">
        <label for="hp" class="block text-sm font-medium mb-1">No. HP</label>
        <InputText 
          id="hp" 
          v-model="formData.hp" 
          placeholder="08123456789" 
          class="w-full" 
        />
      </div>
      
      <div class="col-span-2">
        <label for="alamat" class="block text-sm font-medium mb-1">Alamat</label>
        <Textarea 
          id="alamat" 
          v-model="formData.alamat" 
          placeholder="Masukkan alamat customer" 
          class="w-full" 
          rows="3"
        />
      </div>
    </div>
    
    <div class="flex justify-end gap-2 mt-6">
      <Button 
        type="submit" 
        :label="action === 'add' ? 'Tambah' : 'Perbarui'" 
        :loading="isSubmitting"
        class="shadow-md"
      />
    </div>
  </form>
</template>