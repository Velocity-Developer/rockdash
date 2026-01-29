<template>

  <div v-if="data" class="bg-emerald-700 text-white dark:bg-emerald-900 rounded-lg shadow hover:shadow-lg transition-all p-3 md:p-5 mb-4 md:mb-6">
  
    <div class="grid grid-cols-4 gap-2 text-sm">
      <div class="col-span-4 md:col-span-2 flex items-center gap-2">        
        <span class="bg-white h-6 w-6 flex items-center justify-center text-sm rounded text-blue-700"><Icon name="lucide:globe" /></span>
        <a class="hover:underline" :href="'https://'+data.webhost.nama_web" target="_blank"> {{ data.webhost.nama_web }} </a>
      </div>
      <div class="col-span-4 md:col-span-2 flex items-center gap-2">
        <span class="bg-white h-6 w-6 flex items-center justify-center text-sm rounded text-yellow-600"><Icon name="lucide:tags" /></span>
        <span>{{ data.jenis }}</span>
      </div>
      <div class="col-span-4 md:col-span-2 flex items-center gap-2">
          <span class="bg-white h-6 w-6 flex items-center justify-center text-sm rounded text-red-600"><Icon name="lucide:clock-alert" /></span>
          <span>Deadline : {{ formatTanggal(data.tgl_deadline) }}</span>
      </div>
      <div v-if="csMainProjectInfo?.waktu_plus" class="col-span-4 md:col-span-2 flex items-center gap-2">
        <span class="bg-white h-6 w-6 flex items-center justify-center text-sm rounded text-teal-600"><Icon name="lucide:calendar-plus" /></span>
        <span>Waktu + : {{ csMainProjectInfo?.waktu_plus }} hari</span>
      </div>
    </div>

  </div>

  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        
    <div>
      <label for="user">User</label>
      <Select v-model="form.user_id" :options="opsiUsers" filter optionValue="value" optionLabel="label" class="w-full" required>
        <template #value="slotProps">
          <div v-if="slotProps.value && UserSelected(slotProps.value)" class="flex items-center">
            <img :alt="UserSelected(slotProps.value).label" :src="UserSelected(slotProps.value).avatar" class="w-8 h-8 rounded-full mr-2 object-cover" />
            <div>{{ UserSelected(slotProps.value).label }}</div>
          </div>
          <div v-else>
            Pilih User
          </div>
        </template>
        <template #option="slotProps">
          <div class="flex items-center">
              <img :alt="slotProps.option.label" :src="slotProps.option.avatar" class="w-8 h-8 rounded-full mr-2 object-cover" />
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
        <DatePicker v-model="form.date_selesai" showTime hourFormat="24" class="w-full" :disabled="form.id_karyawan !== 28 && form.progress < 60"/>
      </div>
    </div>
        
    <div>
      <label for="catatan">Catatan</label>
      <Textarea v-model="form.catatan" class="w-full" />
    </div>

    <div class="flex gap-4 justify-between items-end">
      <div class="flex-1" :class="{'!hidden': form.id_karyawan == 28}">
        <ProgressBar 
          v-if="form.progress" 
          :value="form.progress??0" 
          class="mb-3"
          :pt="{
            value: {
              class: form.progress > 60 ? '!bg-emerald-500' : '!bg-amber-500'
            }
          }"
        />
        <Button @click="visibleDialog = true" size="small" class="w-full">
          <Icon name="lucide:square-check"/> Quality Control
        </Button>
      </div>
      <div class="flex-1 flex justify-end">
        <div>          
          <label for="status_project">Status Project</label>
            <Select
              v-model="form.status_project" 
              :options="[
                'Belum dikerjakan',
                'Dalam pengerjaan',
                'Menunggu koreksi',
                'Proses koreksi',
                'Kurang konfirmasi',
                'Selesai'
              ]"
              :disabled="form.id_karyawan !== 28 && form.progress < 60"
              allowEmpty
              class="w-full"
            />
        </div>
      </div>  
    </div>

    <div v-if="errors && errors.value" class="mb-2">
      <Message v-for="error of errors.value" :key="error" severity="warn" class="mt-1">{{ error[0] }}</Message>
    </div>

    <div class="flex justify-end gap-2">

      <Chip v-if="loadingWmProject" size="small">
        <Icon name="lucide:loader-circle" class="animate-spin"/> Memuat data terbaru...
      </Chip>

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

  <Dialog v-model:visible="visibleDialog" modal header="Sesuaikan dengan paket web." :style="{ width: '40rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <ScrollPanel style="width: 100%; height: 60vh" class="py-2">
        <table class="table-fixed border-collapse text-sm">
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
    
    <div class="flex gap-3">
      <div class="flex-1">
        <ProgressBar 
            v-if="form.progress" 
            :value="form.progress??0" 
            class="mt-3"
            :pt="{
              value: {
                class: form.progress > 60 ? '!bg-emerald-500' : '!bg-amber-500'
              }
            }"
          />
      </div> 
      <div class="text-end">
        <Button @click="visibleDialog = false">Selesai</Button>
      </div>
    </div>

  </Dialog>

</template>

<script setup lang="ts">
const useConfig = useConfigStore()
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const toast = useToast();
const client = useSanctumClient();
const props = defineProps(['action','data','jenis_project']);
const action = props.action;
const data = props.data;
const emit = defineEmits(['update']);
const visibleDialog = ref(false);

const wm_project = ref(data.wm_project as any);
const csMainProjectInfo = ref({} as any);

const form = reactive({
  user_id: wm_project.value?.user_id ?? useConfig.config.user.id,
  date_mulai: dayjs().format('YYYY-MM-DD HH:mm') as any,
  date_selesai: '' as any,
  catatan: '',
  status_multi: 'pending',
  qc: '',
  id_cs_main_project: data.id,
  progress: 0,
  id_karyawan: data.raw_dikerjakan?data.raw_dikerjakan[0]:23,
  status_project: 'Belum dikerjakan',
  jenis_project: props.jenis_project,
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
    form.status_project = newVal.status_project ?? 'Belum dikerjakan';
  }
}, { immediate: true });

//get opsi
const opsiQuality = ref([] as any);
const opsiUsers = ref([] as any);

const loadingWmProject = ref(false);
onMounted(async () => {
  try {
    const res = await client('/api/data_opsis?keys[]=quality&keys[]=users') as any
    opsiQuality.value = res.quality;
    opsiUsers.value = res.users;
  } catch (error) {
    console.log(error);
  }

  //ambil data wm_project, jika tidak ada ambil dari cs_main_project
  loadingWmProject.value = true;
  if(!data.wm_project) {
    try {
      const res = await client('/api/cs_main_project/'+data.id) as any
      if(res.wm_project){
        wm_project.value = res.wm_project??null;
      }
      if(res.cs_main_project_info){
        csMainProjectInfo.value = res.cs_main_project_info??null
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
      const res = await client('/api/wm_project', {
        method: 'POST',
        body: form
      }) as any
      emit('update');
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Project berhasil diambil',
        life: 3000
      });
      form.status_project = res.status_project
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
      const res = await client('/api/wm_project/'+wm_project.value.id_wm_project, {
        method: 'PUT',
        body: form
      }) as any
      emit('update');
      toast.add({
        severity: 'success',
        summary: 'Berhasil!',
        detail: 'Project berhasil diperbarui',
        life: 3000
      });
      form.status_project = res.status_project
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
  
  //jika form.date_selesai tidak kosong, dan form.progress > 60
  if(form.date_selesai && form.progress > 60 && form.status_project === 'Dalam pengerjaan' || form.status_project === 'Belum dikerjakan') {
    form.status_project = 'Menunggu koreksi'      
  }
})

//watch form.qc dan form.date_selesai
watch(() => form.date_selesai, (newVal, oldVal) => {
  const previousStatus = form.status_project;


  // Pastikan kondisi:
  // 1. form.date_selesai tidak kosong
  // 2. form.progress > 60
  // 3. status sebelumnya adalah 'Dalam pengerjaan'
  if (!oldVal && newVal && form.progress > 60 && previousStatus === 'Dalam pengerjaan' || previousStatus === 'Belum dikerjakan') {
    form.status_project = 'Menunggu koreksi';
  }
});

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
