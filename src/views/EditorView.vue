<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- Navigation Sidebar -->
    <Sidebar />

    <!-- Main Canvas -->
    <main class="lg:ml-64 flex-1 flex flex-col pt-[66px] lg:pt-0">
      <!-- Header Strip -->
      <header class="w-full bg-surface px-margin-mobile md:px-margin-desktop py-base border-b-2 border-on-background flex justify-between items-center sticky top-[66px] lg:top-0 z-40">
        <div class="flex gap-md overflow-hidden truncate">
          <span class="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {{ isEditing ? 'แก้ไขระเบียนรายงาน' : 'เขียนรายงานฉบับใหม่' }}
          </span>
        </div>
        <div class="flex items-center gap-sm shrink-0">
          <button 
            @click="savePost" 
            :disabled="saving || !title.trim() || !content.trim()"
            class="px-md py-sm bg-primary text-on-primary border border-on-background font-label-sm text-label-sm uppercase hover:bg-primary-fixed hover:text-primary transition-all font-bold active:scale-95 disabled:opacity-50"
          >
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกรายงาน' }}
          </button>
        </div>
      </header>

      <!-- Form & Live Preview Split Pane -->
      <div class="flex-1 flex flex-col xl:flex-row divide-y-2 xl:divide-y-0 xl:divide-x-2 divide-on-background">
        <!-- Editor Input Form (Left/Top Pane) -->
        <div class="w-full xl:w-1/2 p-md md:p-lg space-y-md bg-surface overflow-y-auto">
          <span class="font-label-sm text-label-sm uppercase bg-primary text-on-primary px-sm py-xs mb-sm inline-block border border-on-background">
            โครงสร้างเนื้อหา
          </span>

          <!-- Title Input -->
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">หัวข้อรายงาน (Title)</label>
            <input 
              type="text" 
              v-model="title" 
              @input="handleTitleInput"
              placeholder="สถาปัตยกรรมแห่งความน่าเชื่อถือ..." 
              class="w-full p-xs bg-surface text-on-background border border-on-background font-headline-md text-headline-md focus:ring-0 focus:border-primary"
              required
            />
          </div>

          <!-- Slug & Status Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-sm">
            <!-- Slug -->
            <div>
              <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">ลิงก์บทความ (Slug - URL Friendly)</label>
              <input 
                type="text" 
                v-model="slug" 
                placeholder="trust-architectures" 
                class="w-full p-xs bg-surface text-on-background border border-on-background font-label-sm text-[11px] font-mono focus:ring-0 focus:border-primary lowercase"
                required
              />
            </div>
            <!-- Status selection -->
            <div>
              <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">สถานะของรายงาน (Status)</label>
              <select 
                v-model="status" 
                class="w-full p-xs bg-surface text-on-background border border-on-background font-label-sm text-label-sm focus:ring-0 focus:border-primary"
              >
                <option value="draft">ฉบับร่าง (Draft)</option>
                <option value="published">เผยแพร่ทันที (Published)</option>
              </select>
            </div>
          </div>

          <!-- Cover Image Upload -->
          <div class="border border-on-background bg-surface-container-low p-sm">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-sm">รูปภาพหน้าปกรายงาน (Cover Image)</label>
            
            <div class="flex flex-col sm:flex-row gap-sm items-start">
              <!-- Thumbnail preview -->
              <div class="w-full sm:w-1/3 aspect-video bg-surface-container-highest border border-on-background overflow-hidden relative shrink-0">
                <img 
                  :src="coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'" 
                  class="w-full h-full object-cover grayscale" 
                />
                <div v-if="uploading" class="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <span class="font-label-sm text-[10px] text-on-background blink font-mono">UPLOADING...</span>
                </div>
              </div>

              <div class="grow space-y-xs w-full">
                <input 
                  type="file" 
                  ref="imageInput" 
                  @change="handleImageUpload" 
                  accept="image/*" 
                  class="hidden" 
                />
                <button 
                  type="button" 
                  @click="$refs.imageInput.click()" 
                  :disabled="uploading"
                  class="w-full py-xs border border-on-background text-on-surface bg-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors font-bold disabled:opacity-50"
                >
                  เลือกภาพหน้าปก (.JPG, .PNG)
                </button>
                <p class="font-label-sm text-[10px] text-on-surface-variant italic">
                  * อัปโหลดไปยัง Cloudinary CDN โดยตรง และย่อขนาดเพื่อแสดงผลความเร็วสูง
                </p>
                <div v-if="coverImage" class="pt-sm">
                  <button 
                    type="button" 
                    @click="coverImage = ''" 
                    class="text-error font-label-sm text-[11px] underline hover:text-red-700"
                  >
                    ลบรูปภาพหน้าปกออก
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags Input -->
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">หมวดหมู่และคำค้น (Tags - แยกด้วยเครื่องหมายลูกน้ำจุลภาค ,)</label>
            <input 
              type="text" 
              v-model="tagsString" 
              placeholder="สังคมวิทยา, วิทยาการคำนวณ, ออกแบบ" 
              class="w-full p-xs bg-surface text-on-background border border-on-background font-body-md text-body-md focus:ring-0 focus:border-primary"
            />
          </div>

          <!-- Summary Input -->
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">คำย่อสรุปของเอกสาร (Summary)</label>
            <textarea 
              v-model="summary" 
              placeholder="ย่อรายละเอียดหัวข้อใน 2-3 บรรทัด..." 
              rows="2"
              class="w-full p-xs bg-surface text-on-background border border-on-background font-body-md text-body-md focus:ring-0 focus:border-primary resize-none"
            ></textarea>
          </div>

          <!-- Content (Markdown Editor) -->
          <div class="flex-1 flex flex-col">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">เนื้อหาเขียนด้วย Markdown (Content)</label>
            <textarea 
              v-model="content" 
              placeholder="# หัวข้อย่อย&#10;พิมพ์เนื้อหารายงานของคุณที่นี่..." 
              rows="12"
              class="w-full p-xs bg-surface text-on-background border border-on-background font-mono text-body-md focus:ring-0 focus:border-primary resize-y grow min-h-[300px]"
              required
            ></textarea>
          </div>
        </div>

        <!-- Live Preview Panel (Right/Bottom Pane) -->
        <div class="w-full xl:w-1/2 p-md md:p-lg bg-surface-container-low overflow-y-auto max-h-[85vh] xl:max-h-[unset]">
          <span class="font-label-sm text-label-sm uppercase bg-primary text-on-primary px-sm py-xs mb-md inline-block border border-on-background">
            แผงตรวจสอบการแสดงผลจริง (Live Preview)
          </span>

          <article class="max-w-3xl mt-sm bg-surface p-md md:p-lg border border-on-background hard-shadow-sm">
            <header class="mb-md">
              <!-- Render Mock Tags -->
              <div class="flex flex-wrap gap-sm mb-sm">
                <span 
                  v-for="tag in parsedTags" 
                  :key="tag" 
                  class="px-xs py-0.5 border border-on-background bg-surface-container-high font-label-sm text-[11px]"
                >
                  {{ tag }}
                </span>
                <span v-if="parsedTags.length === 0" class="px-xs py-0.5 border border-on-background bg-surface-container-high font-label-sm text-[11px]">
                  ทั่วไป
                </span>
              </div>

              <h1 class="font-display-lg text-display-lg text-on-background mb-sm leading-tight break-words">
                {{ title || 'หัวข้อบทความรายงาน' }}
              </h1>

              <p class="font-label-sm text-label-sm text-on-surface-variant font-mono border-y border-outline-variant py-xs">
                ผู้สร้าง: @{{ authStore.profile?.username || 'user' }} / สถานะ: {{ status.toUpperCase() }}
              </p>
            </header>

            <!-- Rendered markdown preview -->
            <section 
              v-html="renderedPreview" 
              class="markdown-body font-body-md text-body-md text-on-surface leading-relaxed"
            ></section>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { supabase } from '../services/supabase';
import { uploadImage } from '../services/cloudinary';
import Sidebar from '../components/Sidebar.vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Form Fields
const title = ref('');
const slug = ref('');
const summary = ref('');
const content = ref('');
const coverImage = ref('');
const status = ref('draft');
const tagsString = ref('');

const saving = ref(false);
const uploading = ref(false);
const isEditing = ref(false);
const postId = ref(null);

const parsedTags = computed(() => {
  return tagsString.value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
});

const renderedPreview = computed(() => {
  if (!content.value.trim()) {
    return '<p class="italic text-outline">ไม่มีข้อมูลเนื้อหาบันทึก...</p>';
  }
  const rawHtml = marked(content.value);
  return DOMPurify.sanitize(rawHtml);
});

// Auto slugify helper
const handleTitleInput = () => {
  if (isEditing.value) return; // Don't auto-slugify title if we are modifying an existing post
  slug.value = title.value
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    uploading.value = true;
    const secureUrl = await uploadImage(file);
    coverImage.value = secureUrl;
  } catch (err) {
    console.error('Image upload failed:', err);
    alert('อัปโหลดรูปภาพหน้าปกขัดข้อง: ' + err.message);
  } finally {
    uploading.value = false;
  }
};

const fetchPostForEditing = async () => {
  const id = route.params.id;
  if (!id) return;

  isEditing.value = true;
  postId.value = id;

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        summary,
        content,
        cover_image,
        status,
        author_id,
        post_tags (
          tags (
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Safety check: only author can edit
    if (data.author_id !== authStore.user.id) {
      alert('คุณไม่มีสิทธิ์ในการเข้าถึงและแก้ไขเอกสารรายงานฉบับนี้');
      router.push('/dashboard');
      return;
    }

    title.value = data.title;
    slug.value = data.slug;
    summary.value = data.summary || '';
    content.value = data.content;
    coverImage.value = data.cover_image || '';
    status.value = data.status;
    
    const mappedTags = data.post_tags
      ? data.post_tags.map(pt => pt.tags?.name).filter(Boolean)
      : [];
    tagsString.value = mappedTags.join(', ');

  } catch (err) {
    console.error('Error fetching post for editing:', err);
    alert('ดึงข้อมูลเอกสารรายงานล้มเหลว: ' + err.message);
    router.push('/dashboard');
  }
};

const savePost = async () => {
  if (!title.value.trim() || !content.value.trim() || saving.value) return;

  try {
    saving.value = true;
    
    const cleanSlug = slug.value.trim().toLowerCase().replace(/\s+/g, '-');
    
    const postData = {
      title: title.value.trim(),
      slug: cleanSlug,
      summary: summary.value.trim(),
      content: content.value.trim(),
      cover_image: coverImage.value,
      status: status.value,
      author_id: authStore.user.id,
      updated_at: new Date().toISOString()
    };

    let savedPostId = postId.value;

    if (isEditing.value) {
      // Update
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId.value);
        
      if (error) throw error;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();
        
      if (error) throw error;
      savedPostId = data.id;
    }

    // Save/Sync Tags relational mappings
    await syncTags(savedPostId);

    alert('บันทึกรายงานของคุณเรียบร้อยแล้ว!');
    router.push('/dashboard');

  } catch (err) {
    console.error('Error saving post:', err);
    let message = err.message;
    if (err.code === '23505') {
      message = 'ชื่อลิงก์บทความ (Slug) นี้มีผู้ใช้งานแล้ว กรุณากรอกชื่อสลักลิงก์ใหม่';
    }
    alert('บันทึกเอกสารขัดข้อง: ' + message);
  } finally {
    saving.value = false;
  }
};

const syncTags = async (postUuid) => {
  const enteredTags = parsedTags.value;

  try {
    const tagIds = [];
    
    // 1. Resolve and insert missing tags
    for (const tagName of enteredTags) {
      const cleanTagName = tagName.trim();
      let { data: tag, error: fetchErr } = await supabase
        .from('tags')
        .select('*')
        .eq('name', cleanTagName)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!tag) {
        // Insert new tag
        const { data: newTag, error: insertErr } = await supabase
          .from('tags')
          .insert({ name: cleanTagName })
          .select()
          .single();

        if (insertErr) throw insertErr;
        tag = newTag;
      }
      
      if (tag) tagIds.push(tag.id);
    }

    // 2. Clear old post tag associations
    const { error: deleteErr } = await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', postUuid);

    if (deleteErr) throw deleteErr;

    // 3. Re-insert new tag relations
    if (tagIds.length > 0) {
      const relations = tagIds.map(tagId => ({
        post_id: postUuid,
        tag_id: tagId
      }));

      const { error: relationErr } = await supabase
        .from('post_tags')
        .insert(relations);

      if (relationErr) throw relationErr;
    }

  } catch (err) {
    console.error('Error syncing tags:', err);
  }
};

onMounted(() => {
  fetchPostForEditing();
});
</script>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.blink {
  animation: blink 1.5s infinite;
}
</style>
