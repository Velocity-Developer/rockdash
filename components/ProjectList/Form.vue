<template>

  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    
    <div>
      <label for="webmaster">Webmaster</label>
      <Select v-model="form.webmaster" :options="opsiWebmaster" optionValue="value" optionLabel="label" class="w-full" required/>
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label for="date_mulai">Tanggal Mulai</label>
        <DatePicker v-model="form.date_mulai" showTime hourFormat="24" date-format="yy-mm-dd" class="w-full" required/>
      </div>
      <div class="flex-1">
        <label for="date_selesai">Tanggal Selesai</label>
        <DatePicker v-model="form.date_selesai" showTime hourFormat="24" date-format="yy-mm-dd" class="w-full" :disabled="form.progress < 60"/>
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

    <div class="text-end">
      <Button type="submit" :loading="loadingSubmit">
        <Icon v-if="loadingSubmit" name="lucide:loader-circle" class="animate-spin"/>
        <Icon v-else name="lucide:save"/>
        Simpan
      </Button>
    </div>

  </form>

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
    {{ form.progress }}
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

  <div v-if="loadingWmProject" class="my-2">
    <Icon name="lucide:loader-circle" class="animate-spin"/> Memuat data...
  </div>

  <pre>
    {{ wm_project }}
  </pre>

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

const wm_project = ref({} as any);
const form = reactive({
  webmaster: '',
  date_mulai: dayjs().format('YYYY/MM/DD HH:mm') as any,
  date_selesai: '' as any,
  catatan: '',
  status_multi: 'pending',
  qc: '',
  id_cs_main_project: data.id_cs_main_project,
  progress: 0
});

// Watch agar form terisi saat wm_project ter-update
watch(wm_project, (newVal) => {
  if (newVal) {
    form.webmaster = newVal.webmaster ?? '';
    form.date_mulai = newVal.date_mulai_formatted ?? dayjs().format('YYYY/MM/DD HH:mm');
    form.date_selesai = newVal.date_selesai_formatted ?? '';
    form.catatan = newVal.catatan ?? '';
    form.status_multi = newVal.status_multi ?? 'pending';
    form.qc = newVal.quality_control ?? '';
    form.progress = newVal.progress ?? 0;
  }
}, { immediate: true });

//get opsi webmaster
const opsiWebmaster = ref([] as any);
const opsiQuality = ref([] as any);

const loadingWmProject = ref(false);
onMounted(async () => {
  try {
    const res = await client('/api/data_opsis?keys[]=webmaster&keys[]=quality')
    opsiWebmaster.value = res.webmaster;
    opsiQuality.value = res.quality;
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
        detail: 'Project berhasil diubah',
        life: 3000
      });
    } catch (er) {
      const error = useSanctumError(er);
      errors.value = error.bag;
      toast.add({
        severity: 'error',
        summary: 'Gagal!',
        detail: 'Project gagal diubah',
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
</script>
