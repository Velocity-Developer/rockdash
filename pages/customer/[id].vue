<template>
  <div class="w-full space-y-4">

    <div class="mb-5">
      <Button @click="$router.go(-1)" size="small" severity="secondary" class="shadow-md">
        <Icon name="lucide:arrow-left" /> Kembali
      </Button>
    </div>

    <Card>
      <template #content>
        <div v-if="data">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-lg font-bold mb-4">Informasi Customer</h3>
              <div class="space-y-2">
                <div>
                  <span class="font-semibold">Nama:</span> {{ data.nama }}
                </div>
                <div>
                  <span class="font-semibold">Email:</span> {{ data.email || '-' }}
                </div>
                <div>
                  <span class="font-semibold">No. HP:</span> {{ data.hp || '-' }}
                </div>
                <div>
                  <span class="font-semibold">Alamat:</span> {{ data.alamat || '-' }}
                </div>
                <div>
                  <span class="font-semibold">Tanggal Dibuat:</span> {{ formatTanggal(data.created_at) }}
                </div>
                <div>
                  <span class="font-semibold">Terakhir Diperbarui:</span> {{ formatTanggal(data.updated_at) }}
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-bold mb-4">Aksi</h3>
              <div class="flex flex-wrap gap-2">
                <Button @click="openDialog('edit', data)" severity="info" size="small">
                  <Icon name="lucide:pencil" /> Edit
                </Button>
                <Button @click="confirmDelete(data.id)" severity="danger" size="small">
                  <Icon name="lucide:trash-2" /> Hapus
                </Button>
              </div>
            </div>
          </div>

        </div>
        
        <div v-else-if="pending" class="flex justify-center items-center h-64">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Loading" />
        </div>
        
        <div v-else-if="error" class="flex justify-center items-center h-64">
          <Message severity="error">
            Terjadi kesalahan saat memuat data customer
          </Message>
        </div>
      </template>
    </Card>

    <Card>
      <template #content>
        <CustomerTableInvoice :customerId="customer_id" v-if="customer_id"/>
      </template>
    </Card>

    <Dialog v-model:visible="visibleDialog" modal :header="actionDialog=='add'?'Tambah Customer':'Edit Customer'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <CustomerForm :action="actionDialog" :data="dataDialog" @update="refresh()" />
    </Dialog>

    <DashLoader :loading="isLoadingDash"/>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Detail Customer',
  description: 'Detail Informasi Customer',
})

import { useDayjs } from '#dayjs'
import { formatMoney } from '~/utils/formatMoney'
import { formatDate } from '~/utils/formatDate'
const dayjs = useDayjs()
const route = useRoute();
const client = useSanctumClient();
const customer_id = computed(() => route.params.id) as any

const { data, pending, error, refresh } = await useAsyncData(
  `customer-${route.params.id}`,
  () => client(`/api/customer/${route.params.id}`)
) as any

//watch status
const isLoadingDash = ref(false)
watch(pending, (newValue, oldValue) => {
  if(newValue == false) {
    isLoadingDash.value = false;
  } else {
    isLoadingDash.value = true;
  }
})

const visibleDialog = ref(false);
const actionDialog = ref('add');
const dataDialog = ref({});
const openDialog = async (action: string, data = {}) => {
  visibleDialog.value = true;
  actionDialog.value = action;
  dataDialog.value = data;
}

const toast = useToast();
const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'Anda yakin hapus data ini?',
        header: 'Hapus Data',
        accept: async () => {
            try {              
              const re = await client(`/api/customer/${id}`, {
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

// Format tanggal
function formatTanggal(tanggal: string) {
  return formatDate(tanggal, 'DD/MM/YYYY');
}
</script>