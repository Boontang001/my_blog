<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- Navigation Sidebar -->
    <Sidebar />

    <!-- Main Canvas -->
    <main class="lg:ml-64 flex-1 flex flex-col pt-[66px] lg:pt-0">
      <!-- Header Strip -->
      <header class="w-full bg-surface px-margin-mobile md:px-margin-desktop py-base border-b-2 border-on-background flex justify-between items-center sticky top-[66px] lg:top-0 z-40">
        <div class="flex gap-md overflow-hidden truncate">
          <span class="font-label-sm text-label-sm uppercase text-on-surface-variant">รายงานด่วน: {{ formatDateShort(post?.created_at) }}</span>
          <span class="font-label-sm text-label-sm uppercase text-on-surface-variant hidden md:inline">อ้างอิง: {{ post?.slug }}</span>
        </div>
        <div class="flex items-center gap-sm shrink-0">
          <button @click="router.push('/')" class="font-label-md text-label-md text-primary dark:text-primary-fixed font-bold hover:underline flex items-center gap-xs">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            กลับหน้าแรก
          </button>
        </div>
      </header>

      <!-- Loading / Error States -->
      <div v-if="loading" class="flex-1 flex items-center justify-center p-lg">
        <p class="font-label-md text-label-md text-on-surface-variant">กำลังค้นหาระเบียนรายงานจากคลังเก็บเอกสาร...</p>
      </div>

      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-lg text-center">
        <span class="material-symbols-outlined text-[48px] text-error mb-sm">error</span>
        <h2 class="font-headline-lg text-headline-lg text-on-background mb-xs">ไม่พบเอกสารรายงาน</h2>
        <p class="font-body-md text-body-md text-on-surface-variant mb-md">เอกสารอาจถูกลบ ย้าย หรือไม่มีอยู่จริงในสารบบ</p>
        <button @click="router.push('/')" class="py-sm px-md bg-primary text-on-primary border border-on-background font-label-md text-label-md uppercase font-bold">กลับหน้าแรก</button>
      </div>

      <!-- Article Canvas -->
      <div v-else-if="post" class="max-w-screen-2xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl flex flex-col lg:flex-row gap-gutter grow">
        <!-- Blog Article Content -->
        <article class="flex-1 max-w-3xl overflow-hidden">
          <header class="mb-lg">
            <!-- Tags -->
            <div class="flex flex-wrap gap-sm mb-sm">
              <span 
                v-for="tag in post.tags" 
                :key="tag" 
                class="px-sm py-xs border border-on-background bg-surface-container-high font-label-sm text-label-sm"
              >
                {{ tag }}
              </span>
              <span v-if="!post.tags || post.tags.length === 0" class="px-sm py-xs border border-on-background bg-surface-container-high font-label-sm text-label-sm">
                ทั่วไป
              </span>
            </div>
            
            <h1 class="font-display-lg text-display-lg text-on-background mb-md leading-tight">
              {{ post.title }}
            </h1>
            
            <div class="flex items-center gap-md font-label-md text-label-md text-on-surface-variant border-y border-outline-variant py-sm">
              <span>พิมพ์ครั้งแรกเมื่อ: {{ formatDate(post.created_at) }}</span>
              <button @click="copyLink" class="ml-auto flex items-center gap-xs cursor-pointer hover:text-primary transition-colors">
                <span class="material-symbols-outlined text-[18px]">share</span>
                {{ linkCopied ? 'คัดลอกสำเร็จ!' : 'คัดลอกลิงก์' }}
              </button>
            </div>
          </header>

          <!-- Rendered Markdown Body -->
          <section 
            v-html="renderedContent" 
            class="markdown-body font-body-lg text-body-lg text-on-surface leading-relaxed mb-xl"
          ></section>

          <!-- Article Footer & Likes -->
          <footer class="mt-xl pt-lg border-t-2 border-on-background flex justify-between items-center">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm uppercase">สิ้นสุดบันทึกรายงาน</span>
              <span class="font-label-md text-label-md font-bold text-on-surface-variant font-mono">
                ซีเรียล: {{ post.id.substring(0, 8).toUpperCase() }}-TR-{{ new Date(post.created_at).getFullYear() }}
              </span>
            </div>
            
            <!-- Tactile Like Button -->
            <button 
              @click="toggleLike" 
              class="flex items-center gap-md px-md py-sm bg-surface border-2 border-on-background hard-shadow-sm transition-all hover:bg-surface-container-high"
              :class="{ 'bg-primary text-on-primary pressed': isLiked }"
            >
              <span class="material-symbols-outlined" :class="isLiked ? 'text-on-primary' : 'text-primary'" :style="isLiked ? 'font-variation-settings: \'FILL\' 1' : 'font-variation-settings: \'FILL\' 0'">favorite</span>
              <span class="font-label-md text-label-md font-bold uppercase tracking-tight">
                {{ likeCount }} ถูกใจ
              </span>
            </button>
          </footer>

          <!-- Comments Section component -->
          <CommentSection :postId="post.id" />
        </article>

        <!-- Sidebar: Author Details -->
        <aside class="w-full lg:w-80 flex flex-col gap-gutter shrink-0">
          <div class="border-2 border-on-background bg-surface-container-lowest p-md hard-shadow-sm sticky top-24">
            <div class="flex flex-col items-center mb-md pb-md border-b border-outline-variant text-center">
              <div class="w-24 h-24 border-2 border-primary mb-sm overflow-hidden bg-surface-container">
                <img 
                  :src="post.profiles?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'" 
                  alt="Author Profile" 
                  class="w-full h-full object-cover grayscale" 
                />
              </div>
              <h3 class="font-headline-md text-headline-md text-on-background leading-tight">
                {{ post.profiles?.full_name }}
              </h3>
              <p class="font-label-sm text-label-sm uppercase text-primary dark:text-primary-fixed tracking-widest mt-xs">
                @{{ post.profiles?.username }}
              </p>
            </div>
            
            <div class="space-y-sm">
              <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed text-center lg:text-left">
                ผู้บันทึกรายงานระบบสารสนเทศความน่าเชื่อถือ มุ่งมั่นที่จะรักษาคุณภาพโครงสร้างข้อมูลในยุคเครือข่ายความเร็วสูง
              </p>
              <div class="pt-sm border-t border-outline-variant text-center lg:text-left">
                <p class="font-label-sm text-label-sm mb-xs">
                  ลงทะเบียนเมื่อ: {{ formatJoinedYear(post.profiles?.created_at) }}
                </p>
                <p class="font-label-sm text-label-sm">
                  สถานะสิทธิ์: ผู้แต่ง (Author)
                </p>
              </div>
              <div class="flex justify-center lg:justify-start gap-sm pt-md">
                <a class="w-10 h-10 flex items-center justify-center border border-on-background hover:bg-primary-fixed-dim transition-colors" href="#">
                  <span class="material-symbols-outlined text-[20px]">public</span>
                </a>
                <a class="w-10 h-10 flex items-center justify-center border border-on-background hover:bg-primary-fixed-dim transition-colors" href="#">
                  <span class="material-symbols-outlined text-[20px]">mail</span>
                </a>
                <a class="w-10 h-10 flex items-center justify-center border border-on-background hover:bg-primary-fixed-dim transition-colors" href="#">
                  <span class="material-symbols-outlined text-[20px]">terminal</span>
                </a>
              </div>
            </div>
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
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../services/supabase';
import Sidebar from '../components/Sidebar.vue';
import CommentSection from '../components/CommentSection.vue';
import Footer from '../components/Footer.vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const route = useRoute();
const router = useRouter();

const post = ref(null);
const loading = ref(true);
const error = ref(null);

// Likes Local implementation
const isLiked = ref(false);
const likeCount = ref(128); // default starting like count
const linkCopied = ref(false);

const renderedContent = computed(() => {
  if (!post.value?.content) return '';
  const rawHtml = marked(post.value.content);
  return DOMPurify.sanitize(rawHtml);
});

const fetchPostDetail = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: fetchErr } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        cover_image,
        created_at,
        slug,
        author_id,
        profiles (
          firebase_uid,
          username,
          full_name,
          avatar_url,
          created_at
        ),
        post_tags (
          tags (
            name
          )
        )
      `)
      .eq('slug', route.params.slug)
      .eq('status', 'published')
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!data) {
      error.value = 'Post not found';
      return;
    }

    const mappedTags = data.post_tags
      ? data.post_tags.map(pt => pt.tags?.name).filter(Boolean)
      : [];

    post.value = {
      ...data,
      tags: mappedTags
    };

    // Load like status
    const likedKey = `liked_${post.value.id}`;
    isLiked.value = localStorage.getItem(likedKey) === 'true';
    likeCount.value = isLiked.value ? 129 : 128;

  } catch (err) {
    console.error('Error fetching post details:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const toggleLike = () => {
  if (!post.value) return;
  
  isLiked.value = !isLiked.value;
  const likedKey = `liked_${post.value.id}`;
  localStorage.setItem(likedKey, isLiked.value ? 'true' : 'false');
  likeCount.value = isLiked.value ? 129 : 128;
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  linkCopied.value = true;
  setTimeout(() => {
    linkCopied.value = false;
  }, 2000);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear() % 100}`;
};

const formatJoinedYear = (dateString) => {
  if (!dateString) return '1984';
  const date = new Date(dateString);
  return date.getFullYear();
};

onMounted(() => {
  fetchPostDetail();
});
</script>

<style>
/* Markdown styles matching Retro broadsheet theme */
.markdown-body {
  word-wrap: break-word;
}
.markdown-body p {
  margin-bottom: 1.25rem;
}
.markdown-body h2 {
  font-family: 'Source Serif 4', 'Sarabun', serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary, #02241d);
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.markdown-body h3 {
  font-family: 'Source Serif 4', 'Sarabun', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-on-background, #1b1c1c);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
.markdown-body blockquote {
  border-left: 4px solid var(--color-primary, #02241d);
  background-color: var(--color-surface-container-low, #f6f3f2);
  padding: 1rem;
  font-style: italic;
  margin: 1.5rem 0;
}
.markdown-body ul {
  list-style-type: square;
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}
.markdown-body ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}
.markdown-body li {
  margin-bottom: 0.5rem;
}
.markdown-body pre {
  background-color: var(--color-on-background, #1b1c1c);
  color: var(--color-surface-bright, #fcf9f8);
  padding: 1rem;
  overflow-x: auto;
  border: 1px solid var(--color-outline, #717975);
  font-family: 'Courier Prime', monospace;
  margin: 1.5rem 0;
}
.markdown-body img {
  border: 1px solid var(--color-on-background, #1b1c1c);
  filter: grayscale(100%);
  margin: 1.5rem auto;
  max-width: 100%;
}
</style>
