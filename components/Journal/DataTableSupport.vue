<script setup lang="ts">
const props = defineProps({
    category_id: {
        type: Number,
        default: null,
    },
    month: {
        type: Date,
        default: null,
    },
    user_id: {
        type: Number,
        default: '',
    },
});
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()
const client = useSanctumClient();
const page = ref(1);

const { data, status, refresh } = await useAsyncData('rincian_journal_timsupport'+props.category_id+props.month+props.user_id+page.value, () => 
  client("/api/journal",{
    params: {
      journal_category_id: props.category_id,
      date_start: dayjs(props.month).startOf('month').format('YYYY-MM-DD'),
      date_end: dayjs(props.month).endOf('month').format('YYYY-MM-DD'),
      user_id: props.user_id,
      page: page.value,
      per_page: 100,
      status: 'completed',
      role: 'support',
    },
  }) as any
) as any

const onPaginate = (event: { page: number }) => {
    page.value = event.page + 1;
    refresh()
};
</script>

<template>

  <div v-if="data.data?.length > 0">
    <DataTable :value="data.data" stripedRows scrollable scrollHeight="70vh" responsiveLayout="scroll" size="small" class="text-sm" :loading="status === 'pending'">
      <Column field="no" header="No">
        <template #body="slotProps">
          {{ data.from + slotProps.index }}
        </template>
      </Column>
      <Column field="journal_category" header="Kategori" :sortable="false">
          <template #body="slotProps">            
            {{ slotProps.data.journal_category?.name }}
          </template>
        </Column>
        <Column field="hp" header="Hp" :sortable="false">
          <template #body="slotProps">            
            <template v-if="slotProps.data.detail_support?.hp">
              {{ slotProps.data.detail_support?.hp }}
            </template>
          </template>
        </Column>
        <Column field="wa" header="WA"  class="hidden md:table-cell">
          <template #body="slotProps">           
            <template v-if="slotProps.data.detail_support?.wa">
              {{ slotProps.data.detail_support?.wa }}
            </template>
          </template>
        </Column>
        <Column field="webhost.nama_web" header="Web" :sortable="false">
          <template #body="slotProps">           
            <template v-if="slotProps.data.webhost?.nama_web">
              {{ slotProps.data.webhost?.nama_web }}
            </template>
          </template>
        </Column>
        <Column field="start" header="Masuk" :sortable="false">
          <template #body="slotProps">           
            <template v-if="slotProps.data.start">
              {{ formatDate(slotProps.data.start,'DD/MM/YY HH:mm') }}
            </template>
          </template>
        </Column>
        <Column field="end" header="Selesai" :sortable="false">
          <template #body="slotProps">
            <template v-if="slotProps.data.end">
              {{ formatDate(slotProps.data.end,'DD/MM/YY HH:mm') }}
            </template>
          </template>
        </Column>
        <Column field="description" header="Detail" class="hidden md:table-cell">
          <template #body="slotProps">         
            <div class="truncate text-xs w-[150px]" v-tooltip="purifyHtml(slotProps.data.description)">
              {{ purifyHtml(slotProps.data.description, 30) }}
            </div>  
          </template>
        </Column>        
        <Column field="biaya" header="Biaya" :sortable="false">
          <template #body="slotProps">           
              <template v-if="slotProps.data.detail_support?.biaya">
                {{ formatMoney(slotProps.data.detail_support?.biaya,'Rp',0) }}
                <div class="text-xs text-green-500" v-if="slotProps.data.detail_support?.tanggal_bayar" v-tooltip="'Sudah dibayar'">
                  <Icon name="lucide:circle-check" class="opacity-50"/> {{ formatDate(slotProps.data.detail_support?.tanggal_bayar,'DD/MM/YY HH:mm') }}
                </div>
              </template>
              <template v-else>
                <Icon name="lucide:circle-x" class="opacity-50"/>
              </template>
          </template>
        </Column>
        <Column field="status" header="Status" :sortable="false">
          <template #body="slotProps">
              <JournalBadgeStatus :status="slotProps.data.status" />
          </template>
        </Column>
        <Column field="user.name" header="User" style="width: 60px">
          <template #body="slotProps">
            <div class="flex justify-center">
              <Avatar
                :image="slotProps.data.user?.avatar_url"
                shape="circle"
                size="small"
                class="w-8 h-8"
                v-tooltip.top="slotProps.data.user?.name"
              />
            </div>
          </template>
        </Column>
    </DataTable>  
    
    <div v-if="data.data?.length > 0" class="flex flex-col md:flex-row justify-center md:justify-between md:items-center text-xs">
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

  </div>

  <div v-if="data && data.data?.length === 0">
    <div class="flex justify-center items-center min-h-[50vh]">
      <Icon name="lucide:alert-triangle" class="w-8 h-8 text-yellow-500"/>
      <div class="text-yellow-500 ml-2">
        Tidak ada data
      </div>
    </div>
  </div>

</template>

<style scoped></style>
