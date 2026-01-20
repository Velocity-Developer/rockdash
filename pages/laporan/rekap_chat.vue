<template>

  <Card>
    <template #content>      
      <form class="flex gap-4" action="" method="get" @submit.prevent="submitFilter">
        <div>
          <DatePicker v-model="filters.date_start" placeholder="Dari..." dateFormat="dd/mm/yy" size="small"/>
        </div>
        <div>
          <DatePicker v-model="filters.date_end" placeholder="Sampai..." dateFormat="dd/mm/yy" size="small"/>
        </div>
        <div>
          <InputText v-model="filters.keyword" placeholder="Keyword..." size="small"/>
        </div>
        <div>
          <InputText v-model="filters.no_hp" placeholder="WhatsApp/ID Tidio" size="small"/>
        </div>
        <div>
          <Select v-model="filters.by_alasan" :options="opsiAlasan" showClear placeholder="Alasan..." size="small"/>
        </div>
        <div>
          <Select v-model="filters.pertama_chat" :options="opsiPertamaChat" showClear placeholder="Pertama Chat..." size="small"/>
        </div>
        <div>
          <Button type="submit" label="Filter" size="small">
            <Icon name="lucide:search"/> Filter
          </Button>
        </div>
      </form>
    </template>
  </Card>

  <Card class="my-4">
    <template #content>  
      
      <template v-if="dataRekapChats.data.length > 0">
        <DataTable 
          :value="dataRekapChats.data" 
          size="small" class="text-xs" 
          :loading="loadingData"
          stripedRows scrollable scrollHeight="50vh"
        > 
          <Column field="no" header="#">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>
          <Column field="chat_pertama" header="Chat Pertama">
            <template #body="slotProps">
              {{ slotProps.data.chat_pertama }}
            </template>
          </Column>
          <Column field="whatsapp" header="Chat Terakhir WA/Tidio">
            <template #body="slotProps">
              {{ slotProps.data.whatsapp }}
            </template>
          </Column>
          <Column field="via" header="Pertama Chat">
            <template #body="slotProps">
              {{ slotProps.data.via }}
            </template>
          </Column>
          <Column field="alasan" header="Alasan">
            <template #body="slotProps">
              {{ slotProps.data.alasan }}
            </template>
          </Column>
          <Column field="perangkat" header="Perangkat">
            <template #body="slotProps">
              {{ slotProps.data.perangkat }}
            </template>
          </Column>
          <Column field="detail" header="Detail">
            <template #body="slotProps">
              {{ slotProps.data.detail }}
            </template>
          </Column>
          <Column field="kk" header="Kata Kunci">
            <template #body="slotProps">
              {{ slotProps.data.kk }}
            </template>
          </Column>
          <Column field="action" header="">
            <template #body="slotProps">
              <div class="flex items-center gap-1 justify-end">
                <Button size="small" severity="info">
                  <Icon name="lucide:pen"/>
                </Button>
                <Button size="small" severity="danger">
                  <Icon name="lucide:trash-2"/>
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
        
        <div class="flex justify-between items-center text-xs mt-3">
            <div>
              {{ dataRekapChats.from }} - {{ dataRekapChats.to }} dari {{ dataRekapChats.total }}
            </div>

            <Paginator
                :rows="dataRekapChats.per_page"
                :totalRecords="dataRekapChats.total"
                @page="onPaginate"
                :pt="{
                    root: (event: any) => {
                        const itemForPage =  dataRekapChats.per_page;
                        const currentPage =  filters.page - 1;
                        event.state.d_first = itemForPage * currentPage;
                    },
                }"
            >
            </Paginator>
          </div>
      </template>

    </template>
  </Card>

  <DashLoader :loading="loadingData"/>

</template>

<script setup lang="ts">
  definePageMeta({
    title: 'Rekap Chat',
})
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const route = useRoute();

const dataRekapChats = ref({
  data: [],
}) as any
const loadingData = ref(false);
const filters = reactive({
  date_start: route.query.date_start
    ? dayjs(route.query.date_start as string, 'MM/YY').toDate()
    : dayjs().subtract(1, 'month').toDate(),
  date_end: route.query.date_end
    ? dayjs(route.query.date_end as string, 'MM/YY').toDate()
    : dayjs().toDate(),
  keyword: '',
  by_alasan: '',
  by_perangkat: '',
  pertama_chat: '',
  via: '',
  no_hp: '',
  page: 1,
  tgl_dari: '',
  tgl_sampai: '',
})

// Fungsi untuk mengubah params filters menjadi query URL route
const router = useRouter();
function updateRouteParams() {
  router.push({
    query: {
      ...Object.fromEntries(
        Object.entries(filters).map(([k, v]) => [
          k,
          v instanceof Date ? dayjs(v).format('YYYY-MM-DD') : v
        ])
      )
    },
  });
}

const errors = ref('' as any);
const getData = async () => {
  loadingData.value = true;

  filters.tgl_dari = dayjs(filters.date_start).format('YYYY-MM-DD')
  filters.tgl_sampai = dayjs(filters.date_end).format('YYYY-MM-DD')

  try {
    const response = await client('/api/rekap-chat',{
      params: filters,
    }) as any
    dataRekapChats.value = response;
  } catch (error) {
    const er = useSanctumError(error);
    errors.value = er;
  } finally {
    loadingData.value = false;
  }
}
const onPaginate = (event: { page: number }) => {
    filters.page = event.page + 1;
    updateRouteParams()
    getData()
};

const submitFilter = async () => {
  getData();
  updateRouteParams();
}
onMounted(() => {
  getData();
})

const opsiAlasan = ref([
  '-',
  'Pembayaran',
  'Tempat',
  'Kemahalan',
  'Konsep',
  'Salah Sambung',
  'No Respon - Blm Kirim Form',
  'No Respon - Kirim Form',
  'No Respon - Kirim Data',
  'Lain - lain',
  'Sudah Order'
])
const opsiPertamaChat = ref([
  '-', 'Whatsapp', 'Whatsapp 2', 'Whatsapp 3', 'Whatsapp 4', 'Whatsapp 5', 'Tidio Chat', 'Tidio Chat 2', 'Tidio Chat 3', 'Telegram', 'Telegram 2'
])
</script>
