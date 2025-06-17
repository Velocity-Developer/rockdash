<template>

  <div v-if="data" class="border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900 rounded p-3 mb-3">

    <div v-if="loadingWmProject" class="my-2">
      <Icon name="lucide:loader-circle" class="animate-spin"/> Memuat data...
    </div>
    <div v-else>
      <div>
        {{ data.jenis }} <a class="hover:underline font-bold" :href="data.webhost.nama_web" target="_blank"> {{ data.webhost.nama_web }} </a>
      </div>
      <div>
        Deadline : {{ formatTanggal(data.tgl_deadline) }}
      </div>
    </div>

  </div>

  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        
    <div>
      <label for="user">User</label>
      <Select v-model="form.user_id" :options="opsiUsers" filter optionValue="value" optionLabel="label" class="w-full" required>
        <template #value="slotProps">
          <div v-if="slotProps.value && UserSelected(slotProps.value)" class="flex items-center">
            <img :alt="UserSelected(slotProps.value).label" :src="UserSelected(slotProps.value).avatar" class="w-8 h-8 rounded-full mr-2" />
            <div>{{ UserSelected(slotProps.value).label }}</div>
          </div>
          <div v-else>
            Pilih User
          </div>
        </template>
        <template #option="slotProps">
          <div class="flex items-center">
              <img :alt="slotProps.option.label" :src="slotProps.option.avatar" class="w-8 h-8 rounded-full mr-2" />
              <div>{{ slotProps.option.label }}</div>
          </div>
        </template>
      </Select>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="date_mulai">Tanggal Mulai</label>
        <DatePicker v-model="form.date_mulai" showTime hourFormat="24" class="w-full" required/>
      </div>
      <div class="flex-1">
        <label for="date_selesai">Tanggal Selesai</label>
        <DatePicker v-model="form.date_selesai" showTime hourFormat="24" class="w-full" :disabled="form.progress < 60"/>
      </div>
    </div>
        
    <div>
      <label for="catatan">Catatan</label>
      <Textarea v-model="form.catatan" class="w-full" />
    </div>

    <div class="flex gap-4 justify-between">
      <div class="flex-1">
        <ProgressBar 
          v-if="form.progress" 
          :value="form.progress??0" 
          class="mb-3"
          :pt="{
            value: {
              class: form.progress > 60 ? 'bg-emerald-500' : 'bg-amber-500'
            }
          }"
        />
        <Button @click="visibleDialog = true" size="small">
          <Icon name="lucide:eye"/> Quality Control
        </Button>
      </div>
      <div class="flex-1 flex justify-end">
        <div>
          <SelectButton 
            v-model="form.status_multi" 
            :options="[{label:'Pending',value:'pending'},{label:'Selesai',value:'selesai'}]" 
            optionValue="value" optionLabel="label" 
            :disabled="form.progress < 60" 
            allowEmpty required
          />
        </div>
      </div>  
    </div>

    <div v-if="errors && errors.value" class="mb-2">
      <Message v-for="error of errors.value" :key="error" severity="warn" class="mt-1">{{ error[0] }}</Message>
    </div>

    <div class="flex justify-end gap-2">
      <Button v-if="wm_project &&wm_project.id_wm_project" @click="confirmDelete(wm_project.id_wm_project)" severity="danger">
        <Icon name="lucide:trash-2"/>
        Hapus
      </Button>
      <Button type="submit" :loading="loadingSubmit">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:save"/>
        Simpan
      </Button>
    </div>

  </form>

  {{ form }}


  <Dialog v-model:visible="visibleDialog" modal header="Sesuaikan dengan paket web." :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <ScrollPanel style="width: 100%; height: 60vh">
        <table class="table-fixed border-collapse">
        <tr v-for="quality of opsiQuality" :key="quality.value" class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">
          <td class="align-top border-b border-gray-100 dark:border-gray-800 p-2">
            <Checkbox v-model="form.qc" :inputId="quality.value" name="quality" :value="quality.label" />
          </td>
          <td class="align-top border-b border-gray-100 dark:border-gray-800 p-2">
            <label :for="quality.value">{{ quality.label }}</label>
          </td>
        </tr>
      </table>
    </ScrollPanel>
    
    <ProgressBar 
        v-if="form.progress" 
        :value="form.progress??0" 
        class="mt-3"
        :pt="{
          value: {
            class: form.progress > 60 ? 'bg-emerald-500' : 'bg-amber-500'
          }
        }"
      />
  </Dialog>

</template>

<script setup lang="ts">
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const toast = useToast();
const client = useSanctumClient();
const props = defineProps(['action','data']);
const action = props.action;
const data = props.data;
const emit = defineEmits(['update']);
const visibleDialog = ref(false);

const wm_project = ref(data.wm_project as any);

const form = reactive({
  user_id: wm_project.value?.user_id ?? null,
  date_mulai: dayjs().format('YYYY-MM-DD HH:mm') as any,
  date_selesai: '' as any,
  catatan: '',
  status_multi: 'pending',
  qc: '',
  id_cs_main_project: data.id,
  progress: 0,
  id_karyawan: data.raw_dikerjakan?data.raw_dikerjakan[0]:23
});

// Watch agar form terisi saat wm_project ter-update
watch(wm_project, (newVal) => {
  if (newVal) {
    form.user_id = newVal.user_id ?? null;
    form.date_mulai = newVal.date_mulai_formatted ?dayjs(newVal.date_mulai_formatted).format('YYYY-MM-DD HH:mm'): dayjs().format('YYYY-MM-DD HH:mm');
    form.date_selesai = newVal.date_selesai_formatted ?dayjs(newVal.date_selesai_formatted).format('YYYY-MM-DD HH:mm'): '';
    form.catatan = newVal.catatan ?? '';
    form.status_multi = newVal.status_multi ?? 'pending';
    form.qc = newVal.quality_control ?? '';
    form.progress = newVal.progress ?? 0;
  }
}, { immediate: true });

//get opsi
const opsiQuality = ref([] as any);
const opsiUsers = ref([] as any);

const loadingWmProject = ref(false);
onMounted(async () => {
  try {
    const res = await client('/api/data_opsis?keys[]=quality&keys[]=users')
    opsiQuality.value = res.quality;
    opsiUsers.value = res.users;
  } catch (error) {
    console.log(error);
  }

  //ambil data wm_project, jika tidak ada ambil dari cs_main_project
  loadingWmProject.value = true;
  if(!data.wm_project) {
    try {
      const res = await client('/api/cs_main_project/'+data.id)
      if(res.wm_project){
        wm_project.value = res.wm_project??null;
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    //ambil data wm_project, jika ada ambil dari wm_project
    try {
      const res = await client('/api/wm_project/'+data.wm_project.id_wm_project)
      wm_project.value = res;
    } catch (error) {
      console.log(error);
    }
  }
  loadingWmProject.value = false;

})

//handle submit
const errors = reactive({} as any);
const loadingSubmit = ref(false);
const handleSubmit = async () => {
  loadingSubmit.value = true;
  errors.value = {};

  //date
  form.date_mulai = dayjs(form.date_mulai).format('YYYY-MM-DD HH:mm:ss');
  form.date_selesai = form.date_selesai?dayjs(form.date_selesai).format('YYYY-MM-DD HH:mm:ss'):'';

  if(!wm_project.value) {
    try {
      await client('/api/wm_project', {
        method: 'POST',
        body: form
      })
      emit('update');
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Project berhasil diambil',
        life: 3000
      });
    } catch (er) {
      const error = useSanctumError(er);
      errors.value = error.bag;
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Project gagal diambil',
        life: 3000
      });
    }
  } else if(wm_project.value) {
    try {
      await client('/api/wm_project/'+wm_project.value.id_wm_project, {
        method: 'PUT',
        body: form
      })
      emit('update');
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Project berhasil diperbarui',
        life: 3000
      });
    } catch (er) {
      const error = useSanctumError(er);
      errors.value = error.bag;
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Project gagal diperbarui',
        life: 3000
      });
    }
  }

  loadingSubmit.value = false;
}

//watch form.qc
watch(() => form.qc, () => {

  const total = opsiQuality?.value?.length || 0;
  const current = form.qc?.length || 0;

  // Hindari pembagian nol
  const progress = total > 0 ? (current / total) * 100 : 0;
  form.progress = Math.floor(progress * 100) / 100;
})

const confirm = useConfirm();
const confirmDelete = (id: any) => {    
    confirm.require({
        message: 'ini akan mengembalikan project ke belum diambil,dan hapus data pengerjaan',
        header: 'Batalkan ambil project ini?',
        accept: async () => {
            try {              
              const re = await client(`/api/wm_project/${id}`, {
                  method: 'DELETE',
              })
              toast.add({
                severity: 'success',
                summary: 'Berhasil!',
                detail: 'Data berhasil dihapus',
                life: 3000
              });
              //reset wm_project
              wm_project.value = {};
              emit('update')
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

const UserSelected = (id: any) => {
  //get value from opsiUsers
  if(id) {
    const user = opsiUsers.value.find((user: { value: any; }) => user.value === id);
    return user
  } else {
    return false;
  }
}

</script>
