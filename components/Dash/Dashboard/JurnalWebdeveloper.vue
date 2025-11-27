<template>
  <Card>
    <template #header>
      <div class="px-4 py-2 flex items-center gap-1 font-bold">
        <Icon name="lucide:file-check-2" />
        Jurnal terbaru
      </div>
    </template>
    <template #content>
      <div>
        
        <DataTable :value="data.data" :loading="loading">
          <Column field="title" header="Judul"></Column>
          <Column field="description" header="Desk.">
            <template #body="slotProps">
              <div v-html="sanitizeHtml(slotProps.data.description)"></div>
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
          <Column field="start" header="Waktu" :sortable="true" style="width: 200px">
            <template #body="slotProps">
              <div class="flex flex-col gap-1 text-xs">
                <div class="flex items-center gap-1">
                  <Icon name="lucide:clock"/>
                  <div>{{ formatDate(slotProps.data.start,'DD/MM/YY HH:mm') }}</div>
                </div>
                <div v-if="slotProps.data.end" class="flex items-center gap-1 text-green-500">
                  <Icon name="lucide:circle-check"/>
                  {{ formatDate(slotProps.data.end,'DD/MM/YY HH:mm') }}
                </div>
              </div>
            </template>
          </Column>
        </DataTable>

      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
const client = useSanctumClient();
import { useDayjs } from '#dayjs'
const dayjs = useDayjs()

const filters = reactive({
  date_start: dayjs().startOf('month').format('YYYY-MM-DD'),
  date_end: dayjs().format('YYYY-MM-DD'),
  role: '',
  user_id: '',
  page: 1,
  pagination: false,
  order: 'asc',
  status: 'ongoing',
}) as any

const loading = ref(false);
const data = ref({} as any);
const getData = async () => {
  try {
      const res = await client('/api/journal',{
        params: filters,
      }) as any
      data.value = res;
      
      // categoryStats sekarang sudah dihitung di backend
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
}

onMounted(() => {
  getData();
})

// Fungsi sanitization HTML custom tanpa library eksternal
const sanitizeHtml = (html: string) => {
  if (!html) return '';
  
  // Hapus tag berbahaya lengkap dengan isinya
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
  html = html.replace(/<embed[^>]*>/gi, '');
  html = html.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');
  html = html.replace(/<input[^>]*>/gi, '');
  html = html.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '');
  
  // Hapus event handlers berbahaya dan javascript:
  html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/javascript:[^"']*["']/gi, '');
  html = html.replace(/javascript:/gi, '');
  
  // Tag yang diizinkan
  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'code', 'pre', 'blockquote'];
  
  // Atribut yang diizinkan
  const allowedAttrs = ['href', 'title', 'target', 'rel', 'class', 'style'];
  
  // Proses setiap tag yang diizinkan untuk membersihkan atributnya
  allowedTags.forEach(tag => {
    const tagRegex = new RegExp(`<${tag}([^>]*)>([\s\S]*?)<\/${tag}>`, 'gi');
    html = html.replace(tagRegex, (match, attrs, content) => {
      // Bersihkan atribut
      const cleanAttrs = attrs.replace(/\w+\s*=\s*["'][^"']*["']/gi, (attrMatch) => {
        const attrName = attrMatch.split('=')[0].trim();
        if (allowedAttrs.includes(attrName.toLowerCase())) {
          return attrMatch;
        }
        return '';
      });
      
      // Hapus spasi ekstra di awal atribut
      const finalAttrs = cleanAttrs.replace(/^\s+/, '');
      return `<${tag}${finalAttrs}>${content}</${tag}>`;
    });
    
    // Handle self-closing tags
    const selfClosingRegex = new RegExp(`<${tag}([^>]*)\s*\/?>`, 'gi');
    html = html.replace(selfClosingRegex, (match, attrs) => {
      const cleanAttrs = attrs.replace(/\w+\s*=\s*["'][^"']*["']/gi, (attrMatch) => {
        const attrName = attrMatch.split('=')[0].trim();
        if (allowedAttrs.includes(attrName.toLowerCase())) {
          return attrMatch;
        }
        return '';
      });
      
      const finalAttrs = cleanAttrs.replace(/^\s+/, '');
      return finalAttrs ? `<${tag}${finalAttrs} />` : `<${tag} />`;
    });
  });
  
  // Hapus tag yang tidak diizinkan (tapi pertahankan isinya)
  const disallowedTagRegex = new RegExp('<\\/ ?([^>\\s]+)([^>]*)>([\\s\\S]*?)(<\\/?\\1[^>]*>|$)', 'gi');
  html = html.replace(disallowedTagRegex, (match, tagName, attrs, content, nextTag) => {
    if (!allowedTags.includes(tagName.toLowerCase())) {
      return content; // Hapus tag tapi pertahankan isinya
    }
    return match;
  });
  
  return html;
}
</script>