<template>

  <form @submit.prevent="submitForm">

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2 flex flex-col">
          <label for="nama_web" class="text-sm font-medium mb-1">Nama Web</label>
          <InputText v-model="form.nama_web" id="nama_web" class="w-full" :placeholder="'Nama Web'" />
        </div>

        <div class="flex flex-col">
          <label for="id_paket" class="text-sm font-medium mb-1">Paket</label>
          <Select v-model="form.id_paket" id="id_paket" class="w-full" :options="dataOpsi.paket" optionLabel="label" optionValue="value" />
        </div>

        <div class="flex flex-col">
          <label for="tgl_mulai" class="text-sm font-medium mb-1">Tanggal Mulai</label>
          <DatePicker v-model="form.tgl_mulai" dateFormat="dd-mm-yy" id="tgl_mulai" class="w-full"/>
        </div>
        
        <div class="flex flex-col">
          <label for="hp" class="text-sm font-medium mb-1">HP</label>
          <InputText v-model="form.hp" id="hp" class="w-full" :placeholder="'HP'" />
        </div>
        
        <div class="flex flex-col">
          <label for="kategori" class="text-sm font-medium mb-1">Kategori</label>
          <Select name="kategori" id="kategori" 
            v-model="form.kategori" 
            :options="dataOpsi.kategori_web"
            optionValue="value" optionLabel="label"
            filter showClear required editable
            class="w-full" />
        </div>

        <div class="flex flex-col">
          <label for="hpads" class="text-sm font-medium mb-1">HP Ads</label>
          <InputText v-model="form.hpads" id="hpads" class="w-full" :placeholder="'HP Ads'" />
        </div>
        <div class="flex flex-col">
          <label for="email" class="text-sm font-medium mb-1">Email</label>
          <InputText v-model="form.email" id="email" class="w-full" :placeholder="'Email'" />
        </div>
        <div class="flex flex-col">
          <label for="via" class="text-sm font-medium mb-1">Via</label>
          <InputText v-model="form.via" id="via" class="w-full" :placeholder="'Via'" />
        </div>    
        <div class="flex flex-col">
          <label for="telegram" class="text-sm font-medium mb-1">Telegram</label>
          <InputText v-model="form.telegram" id="telegram" class="w-full" :placeholder="'Telegram'" />
        </div>
    </div>

    <hr class="mb-4 mt-6">
    <div class="flex items-center justify-end gap-1">      
      <Button type="button" :loading="loadingDeleted" @click="confirmDelete(form.id)" severity="danger">
        <Icon v-if="loadingDeleted" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:trash-2"/>
        Hapus
      </Button>
      <Button type="submit" :loading="loadingSubmit">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:save"/>
        Simpan
      </Button>
    </div>      

  </form>

</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const { start, finish } = useLoadingIndicator()
const emit = defineEmits(['update','delete']);
const client = useSanctumClient();
const toast = useToast();
const confirm = useConfirm()
const props = defineProps({
  action: {
    type: String,
    default: 'add'
  },
  id: {
    type: Number,
    default: 0
  }
})

const form = reactive({
  id: props.id,
  nama_web: '',
  id_paket: null as number | null,
  tgl_mulai: null as Date | null,
  hp: '',
  telegram: '',
  hpads: '',
  wa: '',
  email: '',
  kategori: '',
  via: '',
})

const errors = ref('' as any)
const loadingSubmit = ref(false)
const submitForm = async () => {
  loadingSubmit.value = true
  errors.value = ''

  const payload = ref({
    ...form
  }) as any
  payload.value.tgl_mulai = payload.value.tgl_mulai?dayjs(payload.value.tgl_mulai).format('YYYY-MM-DD').toString():null

  try {
    start()
    if (props.action === 'add') {
      await client('/api/webhost', {
        method: 'POST',
        body: payload.value
      })
      toast.add({
          severity: 'success',
          summary: 'Sukses!',
          detail: 'Data webhost berhasil ditambahkan',
          life: 3000
        });
      emit('update')
    } else if (props.action === 'edit') {
      await client(`/api/webhost/${props.id}`, {
        method: 'PUT',
        body: payload.value
      })
      toast.add({
          severity: 'success',
          summary: 'Sukses!',
          detail: 'Data webhost berhasil diupdate',
          life: 3000
        });
      emit('update')
    }
  } catch (error) {  
    console.log(error);
    const er = useSanctumError(error)
    errors.value = er.bag as any
    toast.add({
      severity: 'error',
      summary: 'Gagal!',
      detail: 'Webhost gagal diupdate',
      life: 3000
    });
  } finally {
    loadingSubmit.value = false 
    finish()
  }
}

onMounted(async () => {
  if (props.action === 'edit') {
    const res = await client(`/api/webhost/${props.id}`,{
      params: {
        with: 'paket'
      }
    }) as any

    form.nama_web = res?.nama_web || ''
    form.id_paket = res.id_paket?Number(res.id_paket):null
    form.tgl_mulai = res.tgl_mulai?dayjs(res.tgl_mulai as string).toDate():null
    form.hp = res?.hp || ''
    form.telegram = res?.telegram || ''
    form.hpads = res?.hpads || ''
    form.wa = res?.wa || ''
    form.email = res?.email || ''
    form.kategori = res?.kategori || ''
    form.via = res?.via || ''

  }
})

const { data: dataOpsi} = await useAsyncData(
    'data_opsi-form-webhost',
    () => client('/api/data_opsis?keys[]=paket&keys[]=jenis_project&keys[]=kategori_web')
) as any

const loadingDeleted = ref(false)
const confirmDelete = async (id: number) => {
    confirm.require({
        message: 'Anda yakin hapus data webhost ini?',
        header: 'Hapus data',
        accept: async () => {
            try {
              loadingDeleted.value = true
              await client(`/api/webhost/${props.id}`,
              {method: 'DELETE'})    
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data webhost berhasil dihapus',
                life: 3000
              });
              emit('delete')
            } catch (error) {
              console.log(error)
              toast.add({
                severity: 'error',
                summary: 'Gagal menghapus data webhost',
                life: 3000
              })
            } finally {
              loadingDeleted.value = false
            }
        },
        rejectProps: {
            label: 'Batal',
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
