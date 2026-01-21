<template>

  <Card class="mb-4" v-if="dailyChartData && dailyChartData.datasets">
    <template #title>Statistik Harian</template>
    <template #content>
      <Chart type="line" :data="dailyChartData" :options="chartOptions" />
    </template>
  </Card>

  <Card class="mb-4" v-if="statsAlasan.length > 0">
    <template #title>Detail Statistik Alasan</template>
    <template #content> 
      <DataTable 
          :value="statsAlasan" 
          size="small" class="text-xs" 
          stripedRows scrollable
        > 
        <Column field="alasan" header="Alasan">
          <template #body="slotProps">
            {{ slotProps.data.alasan }}
          </template>
        </Column>
        <Column field="count" header="Jumlah">
          <template #body="slotProps">
            {{ slotProps.data.count }}
          </template>
        </Column>
        <Column field="percentage" header="Persentase">
          <template #body="slotProps">
            {{ slotProps.data.percentage }}
          </template>
        </Column>
        <Column field="visual" header="Visual">
          <template #body="slotProps">
             <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-sky-600 h-2.5 rounded-full transition-all duration-300" :style="{ width: slotProps.data.percentage + '%' }"></div>
            </div>
          </template>
        </Column>
        </DataTable>
    </template>
  </Card>

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
      
      <div class="flex justify-end mb-3">
        <Button type="button" label="Tambah" size="small" @click="openDialog('add', null)">
          <Icon name="lucide:circle-plus"/> Tambah
        </Button>
      </div>

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
              {{ slotProps.data.kata_kunci }}
            </template>
          </Column>
          <Column field="action" header="">
            <template #body="slotProps">
              <div class="flex items-center gap-1 justify-end">
                <Button size="small" severity="info" @click="openDialog('edit', slotProps.data)">
                  <Icon name="lucide:pen"/>
                </Button>
                <Button size="small" severity="danger" @click="deleteData(slotProps.data.id)">
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

  <Dialog v-model:visible="visibleDialog" modal :header="actionDialog === 'add' ? 'Tambah' : 'Edit'" :style="{ width: '50vw' }" :breakpoints="{ '1199px': '55vw', '575px': '80vw' }">
    <RekapChatForm :action="actionDialog" :dataRekapChat="dataDialog" @update="getData" />
  </Dialog>

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
const toast = useToast();
const confirm = useConfirm();

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

//delete data
const deleteData = async (id: number) => {
  confirm.require({
    message: 'Apakah Anda yakin ingin menghapus data ini?',
        header: 'Konfirmasi hapus',
        rejectProps: {
            label: 'Batal',
            severity: 'secondary',
        },
        acceptProps: {
            label: 'Hapus',
            severity: 'danger',
        },
        accept: async () => {          
          try {
            await client(`/api/rekap-chat/${id}`,{
              method: 'DELETE',
            });
            getData();
            toast.add({ severity: 'success', summary: 'Success Message', detail: 'Data Berhasil Dihapus', life: 3000 });
          } catch (error) {
            const er = useSanctumError(error);
            errors.value = er;
            toast.add({ severity: 'error', summary: 'Error Message', detail: er, life: 3000 });
          }
        }
  });
}

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

const statsAlasan = computed(() => {
  const data = dataRekapChats.value.data || [];
  if (data.length === 0) return [];

  const total = data.length;
  const counts = data.reduce((acc: any, item: any) => {
    const alasan = item.alasan || '-';
    acc[alasan] = (acc[alasan] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([alasan, count]) => {
    return {
      alasan,
      count: count as number,
      percentage: ((count as number / total) * 100).toFixed(1)
    };
  }).sort((a, b) => b.count - a.count);
});

const dailyChartData = computed(() => {
  const data = dataRekapChats.value.data || [];
  if (data.length === 0) return { labels: [], datasets: [] };

  const counts: Record<string, number> = {};
  data.forEach((item: any) => {
    if (item.chat_pertama) {
      const date = dayjs(item.chat_pertama).format('YYYY-MM-DD');
      counts[date] = (counts[date] || 0) + 1;
    }
  });

  const sortedDates = Object.keys(counts).sort();

  return {
    labels: sortedDates.map(date => dayjs(date).format('DD/MM/YYYY')),
    datasets: [
      {
        label: 'Jumlah Chat',
        data: sortedDates.map(date => counts[date]),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1
      }
    ]
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return `Jumlah: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      },
      title: {
        display: true,
        text: 'Jumlah Chat'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Tanggal'
      }
    }
  }
});

const visibleDialog = ref(false);
const actionDialog = ref('' as string);
const dataDialog = ref({} as any);
const openDialog = (action : string, data : any) => {
  visibleDialog.value = true;
  actionDialog.value = action;
  dataDialog.value = data;
}
</script>
