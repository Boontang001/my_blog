<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- Navigation Sidebar -->
    <Sidebar />

    <!-- Main Canvas -->
    <main class="lg:ml-64 flex-1 flex flex-col pt-[66px] lg:pt-0">
      <!-- Header Strip -->
      <header class="w-full bg-surface px-margin-mobile md:px-margin-desktop py-base border-b-2 border-on-background flex justify-between items-center sticky top-[66px] lg:top-0 z-40">
        <div class="flex gap-md overflow-hidden truncate">
          <span class="font-label-sm text-label-sm uppercase text-on-surface-variant">ระบบจัดเก็บเอกสารกลาง</span>
          <span class="font-label-sm text-label-sm uppercase text-on-surface-variant hidden md:inline">สถานะ: ออนไลน์</span>
        </div>
        <div class="flex items-center gap-sm shrink-0">
          <span class="font-label-md text-label-md text-primary dark:text-primary-fixed font-bold">ติดตามข้อมูล</span>
          <span class="material-symbols-outlined text-primary dark:text-primary-fixed">rss_feed</span>
        </div>
      </header>

      <!-- Welcome Banner -->
      <div class="max-w-screen-2xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-xl">
        <div class="border-2 border-on-background bg-primary-fixed text-on-primary-fixed p-md md:p-lg mb-xl hard-shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div class="max-w-xl">
            <span class="font-label-sm text-label-sm uppercase bg-primary text-on-primary px-sm py-xs mb-sm inline-block">แถลงการณ์ระบบ</span>
            <h2 class="font-display-lg text-display-lg text-primary mb-sm leading-tight">
              ยินดีต้อนรับสู่พื้นที่แลกเปลี่ยนทางความคิด
            </h2>
            <p class="font-body-lg text-body-lg text-on-primary-fixed-variant leading-relaxed">
              เราเชื่อในสุนทรียศาสตร์แห่งเครื่องจักร ระบบตารางทางคณิตศาสตร์ และความโปร่งใสของโครงสร้างข้อมูล ร่วมบันทึกและอ่านรายงานในยุคเครือข่ายดิจิทัลไปกับเรา
            </p>
          </div>
          <div class="grid grid-cols-2 gap-sm w-full md:w-auto shrink-0">
            <div class="border border-on-background bg-surface p-sm min-w-[120px] text-center hard-shadow-sm">
              <p class="font-label-sm text-label-sm text-on-surface-variant">บทความทั้งหมด</p>
              <p class="font-headline-lg text-headline-lg text-primary">{{ postsCount }}</p>
            </div>
            <div class="border border-on-background bg-surface p-sm min-w-[120px] text-center hard-shadow-sm">
              <p class="font-label-sm text-label-sm text-on-surface-variant">หมวดหมู่</p>
              <p class="font-headline-lg text-headline-lg text-primary">{{ tags.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Layout -->
      <div class="max-w-screen-2xl mx-auto w-full px-margin-mobile md:px-margin-desktop pb-xl flex flex-col lg:flex-row gap-gutter grow">
        <!-- Main Blog Posts List -->
        <section class="flex-1 space-y-lg">
          <div class="flex justify-between items-center border-b-2 border-on-background pb-xs">
            <h2 class="font-headline-lg text-headline-lg uppercase text-on-background leading-none">
              {{ selectedTag ? `รายงานหมวดหมู่: ${selectedTag}` : 'รายงานเด่นล่าสุด' }}
            </h2>
            <button 
              v-if="selectedTag" 
              @click="selectTag(null)" 
              class="font-label-sm text-label-sm text-primary dark:text-primary-fixed hover:underline flex items-center gap-xs"
            >
              แสดงทั้งหมด <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
            <span v-else class="font-label-md text-label-md text-on-surface-variant">เรียงตามวันที่ล่าสุด</span>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-xl border border-dashed border-outline bg-surface-container-low">
            <span class="font-label-md text-label-md text-on-surface-variant">กำลังดึงข้อมูลรายงานจากสารบบกลาง...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredPosts.length === 0" class="text-center py-xl border-2 border-on-background bg-surface p-lg">
            <h3 class="font-headline-md text-headline-md text-on-background mb-sm">ไม่พบเอกสารบันทึก</h3>
            <p class="font-body-md text-body-md text-on-surface-variant mb-md">ยังไม่มีบทความที่เผยแพร่ในหมวดหมู่นี้</p>
            <router-link to="/editor" class="inline-block py-sm px-md bg-primary text-on-primary border border-on-background font-label-md text-label-md uppercase font-bold hard-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              เริ่มเขียนบันทึกแรก
            </router-link>
          </div>

          <!-- Posts List -->
          <div v-else class="space-y-lg">
            <BlogCard 
              v-for="post in filteredPosts" 
              :key="post.id" 
              :post="post" 
            />
          </div>
        </section>

        <!-- Right Side Information Column -->
        <aside class="w-full lg:w-80 flex flex-col gap-gutter shrink-0">
          <!-- Category list -->
          <div class="border-2 border-on-background bg-surface-container-lowest p-md hard-shadow-sm">
            <h3 class="font-label-md text-label-md font-bold mb-md border-b border-on-background pb-xs uppercase tracking-wider">
              ดัชนีแยกหมวดหมู่
            </h3>
            <ul class="space-y-xs font-label-md text-label-md">
              <li>
                <button 
                  @click="selectTag(null)"
                  class="flex justify-between items-center w-full p-xs hover:bg-primary-fixed-dim transition-colors text-left"
                  :class="{ 'bg-primary-fixed-dim text-primary font-bold': selectedTag === null }"
                >
                  <span>/ รายงานทั้งหมด</span>
                  <span class="bg-surface-container-high px-xs border border-on-background font-mono">{{ posts.length }}</span>
                </button>
              </li>
              <li v-for="tag in tags" :key="tag.id">
                <button 
                  @click="selectTag(tag.name)"
                  class="flex justify-between items-center w-full p-xs hover:bg-primary-fixed-dim transition-colors text-left"
                  :class="{ 'bg-primary-fixed-dim text-primary font-bold': selectedTag === tag.name }"
                >
                  <span>/ {{ tag.name }}</span>
                  <span class="bg-surface-container-high px-xs border border-on-background font-mono">{{ getTagCount(tag.name) }}</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Newsletter Signup (Tactile Mockup) -->
          <div class="border-2 border-on-background bg-tertiary-container p-md text-tertiary-fixed">
            <h4 class="font-label-md text-label-md font-bold mb-sm border-b border-on-tertiary-container pb-xs uppercase">
              รับจดหมายข่าวฉบับพิมพ์
            </h4>
            <p class="font-body-md text-body-md mb-md text-surface-container leading-tight">
              ลงทะเบียนเพื่อรับรายงานสรุปประจำสัปดาห์ ส่งตรงถึงเครื่องโทรพิมพ์หรือกล่องข้อความของคุณ
            </p>
            <input 
              type="email" 
              v-model="newsletterEmail" 
              placeholder="YOUR_EMAIL@DOMAIN.COM" 
              class="w-full p-xs mb-sm bg-surface text-on-background border border-on-background font-label-sm text-label-sm placeholder:text-outline focus:ring-0 focus:border-primary uppercase" 
            />
            <button 
              @click="subscribeNewsletter"
              class="w-full py-sm bg-surface text-primary border border-on-background font-label-sm text-label-sm uppercase hover:bg-primary-fixed transition-colors font-bold"
            >
              สมัครสมาชิก
            </button>
          </div>
        </aside>
      </div>

      <!-- Footer component -->
      <Footer />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import BlogCard from '../components/BlogCard.vue';
import Footer from '../components/Footer.vue';
import { supabase } from '../services/supabase';

const posts = ref([]);
const tags = ref([]);
const loading = ref(true);
const selectedTag = ref(null);
const newsletterEmail = ref('');

// Fetch posts count
const postsCount = computed(() => posts.value.length);

// Filter posts by selected tag
const filteredPosts = computed(() => {
  if (!selectedTag.value) return posts.value;
  return posts.value.filter(post => post.tags && post.tags.includes(selectedTag.value));
});

// Fetch posts and tags
const fetchInitialData = async () => {
  try {
    loading.value = true;
    
    // Fetch all published posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        summary,
        cover_image,
        created_at,
        status,
        profiles (
          full_name,
          avatar_url,
          username
        ),
        post_tags (
          tags (
            id,
            name
          )
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    // Transform post tags array
    posts.value = (postsData || []).map(post => {
      const mappedTags = post.post_tags
        ? post.post_tags.map(pt => pt.tags?.name).filter(Boolean)
        : [];
      return {
        ...post,
        tags: mappedTags
      };
    });

    // Fetch all tags
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) throw tagsError;
    tags.value = tagsData || [];

  } catch (err) {
    console.error('Error fetching HomeView data:', err);
  } finally {
    loading.value = false;
  }
};

const getTagCount = (tagName) => {
  return posts.value.filter(post => post.tags && post.tags.includes(tagName)).length;
};

const selectTag = (tagName) => {
  selectedTag.value = tagName;
};

const subscribeNewsletter = () => {
  if (!newsletterEmail.value || !newsletterEmail.value.includes('@')) {
    alert('กรุณากรอกอีเมลที่ถูกต้อง');
    return;
  }
  alert(`ระบบทำการบันทึกข้อมูลอีเมล ${newsletterEmail.value} ของคุณแล้ว! จดหมายข่าวพิมพ์ระบบโทรเลขจะส่งตรงถึงคุณเร็วๆ นี้`);
  newsletterEmail.value = '';
};

onMounted(() => {
  fetchInitialData();
});
</script>
