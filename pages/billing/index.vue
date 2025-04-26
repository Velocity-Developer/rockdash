<template>
  
  <Card>
    <template #content>
      
      <div class="w-full flex justify-end md:justify-between items-center text-xs mb-5">
          <div class="hidden md:block">
            <div>Tgl Masuk</div>
            <div class="flex items-center justify-end gap-2 mt-1">
              <DatePicker v-model="filters.tgl_masuk_start" placeholder="Dari" size="small"/>
              <DatePicker v-model="filters.tgl_masuk_end" placeholder="Sampai" size="small"/>
            </div>
        </div>
        <div class="flex items-center justify-between md:justify-end gap-1 w-full">
          <div class="flex items-center justify-end gap-1">
            Per Page : 
            <InputNumber v-model="filters.per_page" placeholder="per Page" size="small" class="w-10 rounded overflow-hidden border"/>
          </div>
          <Button @click="visibleDrawerFilter = true" size="small">
            <Icon name="lucide:filter" /> Filter
          </Button>
        </div>
      </div>

      <div v-if="status == 'pending'" class="flex items-center justify-end gap-2">
        <Icon name="lucide:loader-circle" mode="svg" class="animate-spin"/>
        Memuat data...
      </div>

      <DataTable :value="data.data" size="small" class="text-xs" v-model:selection="selectedRows" stripedRows resizableColumns scrollable>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="jenis" header="Jenis"></Column>
        <Column field="webhost.nama_web" header="Nama Web"></Column>
        <Column field="webhost.paket.paket" header="Paket"></Column>
        <Column field="deskripsi" header="Deskripsi">
          <template #body="slotProps">
            <div class="max-w-[200px] whitespace-normal">
              {{ slotProps.data.deskripsi }}
            </div>
          </template>
        </Column>
        <Column field="trf" header="Trf">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.trf) }}
          </template>
        </Column>
        <Column field="tgl_masuk" header="Masuk Tgl">        
          <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_masuk) }}
          </template>
        </Column>
        <Column field="tgl_deadline" header="Deadline Tgl">       
          <template #body="slotProps">
              {{ formatTanggal(slotProps.data.tgl_deadline) }}
          </template>
        </Column>
        <Column field="biaya" header="Total Biaya">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.biaya) }}
          </template>
        </Column>
        <Column field="dibayar" header="Dibayar">
          <template #body="slotProps">
              {{ formatMoney(slotProps.data.dibayar) }}
          </template>
        </Column>
        <Column field="kurang" header="Kurang">
          <template #body="slotProps">
              {{ slotProps.data.lunas }}
          </template>
        </Column>
        <Column field="saldo" header="Saldo"></Column>
        <Column field="webhost.hp" header="HP"></Column>
        <Column field="webhost.telegram" header="Telegram"></Column>
        <Column field="webhost.hpads" header="HP Ads"></Column>
        <Column field="webhost.wa" header="WA"></Column>
        <Column field="webhost.email" header="Email"></Column>
        <Column field="dikerjakan_oleh" header="Dikerjakan"></Column>
      </DataTable>

      <div class="flex justify-between text-xs mt-3">
        <div>
          {{ data.from }} - {{ data.to }} dari {{ data.total }}
        </div>

        <Paginator
            :rows="data.per_page"
            :totalRecords="data.total"
            @page="onPaginate"
            :pt="{
                root: (event: any) => {
                    const itemForPage =  data.per_page;
                    const currentPage =  page - 1;
                    event.state.d_first = itemForPage * currentPage;
                },
            }"
        >
        </Paginator>
      </div>

    
    </template>    
  </Card>

  <Drawer v-model:visible="visibleDrawerFilter" header="Filters" position="right">
    <form @submit.prevent="filterSubmit">
      <div class="mb-3">
        <label class="mb-1 block text-sm">Tanggal Masuk</label>
          <DatePicker v-model="filters.tgl_masuk_start" placeholder="Dari" class="w-full mb-1" size="small"/>
          <DatePicker v-model="filters.tgl_masuk_end" placeholder="Sampai" class="w-full" size="small"/>
        </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_nama_web">Nama Web</label>
        <InputText v-model="filters.nama_web" id="filters_nama_web" class="w-full" placeholder="Nama Web" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_paket">Paket</label>
        <InputText v-model="filters.paket" id="filters_paket" class="w-full" placeholder="Paket" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_jenis">Jenis</label>
        <InputText v-model="filters.jenis" id="filters_jenis" class="w-full" placeholder="Jenis" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_deskripsi">Deskripsi</label>
        <InputText v-model="filters.deskripsi" id="filters_deskripsi" class="w-full" placeholder="Deskripsi" size="small"/>
      </div>
      <div class="mb-3">  
        <label class="mb-1 block text-sm" for="filters_trf">Trf</label>
        <InputText v-model="filters.trf" id="filters_trf" class="w-full" placeholder="Trf" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_hp">HP</label> 
        <InputText v-model="filters.hp" id="filters_hp" class="w-full" placeholder="HP" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_telegram">Telegram</label>
        <InputText v-model="filters.telegram" id="filters_telegram" class="w-full" placeholder="Telegram" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_hpads">HP Ads</label>
        <InputText v-model="filters.hpads" id="filters_hpads" class="w-full" placeholder="HP Ads" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_wa">WA</label>
        <InputText v-model="filters.wa" id="filters_wa" class="w-full" placeholder="WA" size="small"/>
      </div>
      <div class="mb-3">
        <label class="mb-1 block text-sm" for="filters_email">Email</label>
        <InputText v-model="filters.email" id="filters_email" class="w-full" placeholder="Email" size="small"/>
      </div>
      
      <div class="text-end">
        <Button type="submit" size="small" class="w-full">
          <Icon name="lucide:filter" /> Filter
        </Button>
      </div>
    </form>
  </Drawer>

</template>

<script setup lang="ts">
definePageMeta({
    title: 'Billing',
    description: 'Daftar Project',
})
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const route = useRoute();
const page = ref(route.query.page ? Number(route.query.page) : 1);
const client = useSanctumClient();

const filters = reactive({
    per_page: 150,
    page: page.value,
    tgl_masuk_start: '' as any,
    tgl_masuk_end: '' as any,
    nama_web: '',
    paket: '',
    jenis: '',
    deskripsi: '',
    trf: '',
    hp: '',
    telegram: '',
    hpads: '',
    wa: '',
    email: '',
} as any);

const { data, status, error, refresh } = await useAsyncData(
    'billing-page-'+page.value,
    () => client('/api/billing',{
        params: filters
    })
)
const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1; 
    refresh()
    navigateTo('/billing?page='+page.value)
};

//watch filters.tgl_masuk_start dan filters.tgl_masuk_end
watch([filters.tgl_masuk_start,filters.tgl_masuk_end,filters.per_page], () => {
    //ubah format date dayjs
    filters.tgl_masuk_start = filters.tgl_masuk_start?dayjs(filters.tgl_masuk_start).format('YYYY-MM-DD'):'';
    filters.tgl_masuk_end = filters.tgl_masuk_end?dayjs(filters.tgl_masuk_end).format('YYYY-MM-DD'):'';
    // Object.assign(filters, route.query);
    refresh()
})

const selectedRows = ref();

const visibleDrawerFilter = ref(false);
const filterSubmit = async () => {
    visibleDrawerFilter.value = false;
    Object.assign(filters, route.query);
    refresh()
}

</script>
