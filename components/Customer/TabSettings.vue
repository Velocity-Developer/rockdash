<template>
  <Card>
    <template #content>
      <CustomerForm :action="'edit'" :data="data" @update="refresh()" />

      <hr class="my-3">

      <div class="bg-red-50 dark:bg-red-600 p-3 md:p-5 rounded-md">
        <h3 class="text-red-700 dark:text-red-200 font-bold mb-3">
          Hapus Akun Customer
        </h3>
        <p class="text-sm">
          Peringatan!, Ini akan menghapus semua data customer dan transaksi yang terkait.
        </p>
        <div class="text-end mt-2">
          <Button @click="confirmDelete()" severity="danger">
            <Icon name="lucide:trash-2" /> Hapus Customer
          </Button>
        </div>  
      </div>

    </template>
  </Card>
</template>

<script setup lang="ts">
const props = defineProps({
  customerId: {
    type: String,
    required: true
  }
})
const client = useSanctumClient();
const toast = useToast();
const confirm = useConfirm();

const { data, pending, error, refresh } = await useAsyncData(
  `customer-${props.customerId}`,
  () => client(`/api/customer/${props.customerId}`)
) as any

const confirmDelete = () => {    
    confirm.require({
        message: 'Anda yakin hapus data ini?',
        header: 'Hapus Data',
        accept: async () => {
            try {              
              const re = await client(`/api/customer/${props.customerId}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              // Redirect ke halaman customer setelah hapus
              navigateTo('/customer')
            } catch (error) {
                const er = useSanctumError(error)                 
                toast.add({
                    severity: 'error',
                    summary: 'Gagal!',
                    detail: er.msg ? er.msg : 'Terjadi kesalahan saat menghapus data',
                    life: 3000
                });
            }
        },
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Hapus',
            severity: 'danger',
            outlined: false
        },
        reject: () => {
            //callback to execute when user rejects to delete
        }
    });
}
</script>
