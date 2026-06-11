<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- Navigation Sidebar -->
    <Sidebar />

    <!-- Main Canvas -->
    <main class="lg:ml-64 flex-1 flex flex-col pt-[66px] lg:pt-0">
      <!-- Header Strip -->
      <header class="w-full bg-surface px-margin-mobile md:px-margin-desktop py-base border-b-2 border-on-background flex justify-between items-center sticky top-[66px] lg:top-0 z-40">
        <div class="flex gap-md overflow-hidden truncate">
          <span class="font-label-sm text-label-sm uppercase text-on-surface-variant">แดชบอร์ดจัดการข้อมูล</span>
          <span class="font-label-sm text-label-sm uppercase text-on-surface-variant hidden md:inline">ผู้ใช้งาน: @{{ authStore.profile?.username }}</span>
        </div>
        <div class="flex items-center gap-sm shrink-0">
          <router-link to="/editor" class="font-label-md text-label-md text-primary dark:text-primary-fixed font-bold hover:underline flex items-center gap-xs">
            <span class="material-symbols-outlined text-[16px]">edit</span>
            เขียนบทความใหม่
          </router-link>
        </div>
      </header>

      <div class="max-w-screen-2xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl flex flex-col xl:flex-row gap-gutter grow">
        
        <!-- Main Panel: Blog Posts Management -->
        <section class="flex-1 space-y-lg">
          <div class="border-b-2 border-on-background pb-xs flex justify-between items-center">
            <h2 class="font-headline-lg text-headline-lg uppercase text-on-background leading-none">
              บันทึกรายงานของคุณ
            </h2>
            <div class="flex border border-on-background font-label-sm text-label-sm">
              <button 
                @click="currentTab = 'all'" 
                class="px-sm py-xs transition-colors"
                :class="currentTab === 'all' ? 'bg-primary text-on-primary' : 'bg-surface hover:bg-surface-container-high'"
              >
                ทั้งหมด ({{ posts.length }})
              </button>
              <button 
                @click="currentTab = 'published'" 
                class="px-sm py-xs border-l border-on-background transition-colors"
                :class="currentTab === 'published' ? 'bg-primary text-on-primary' : 'bg-surface hover:bg-surface-container-high'"
              >
                เผยแพร่แล้ว ({{ publishedPosts.length }})
              </button>
              <button 
                @click="currentTab = 'draft'" 
                class="px-sm py-xs border-l border-on-background transition-colors"
                :class="currentTab === 'draft' ? 'bg-primary text-on-primary' : 'bg-surface hover:bg-surface-container-high'"
              >
                ฉบับร่าง ({{ draftPosts.length }})
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-xl border border-dashed border-outline bg-surface-container-low">
            <span class="font-label-md text-label-md text-on-surface-variant">กำลังดึงระเบียนรายงานของคุณ...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredPosts.length === 0" class="text-center py-xl border-2 border-on-background bg-surface p-lg">
            <h3 class="font-headline-md text-headline-md text-on-background mb-sm">ไม่พบบันทึกรายงาน</h3>
            <p class="font-body-md text-body-md text-on-surface-variant mb-md">คุณยังไม่มีบทความในหมวดหมู่นี้</p>
            <router-link to="/editor" class="inline-block py-sm px-md bg-primary text-on-primary border border-on-background font-label-md text-label-md uppercase font-bold hard-shadow-sm">
              สร้างบทความแรก
            </router-link>
          </div>

          <!-- Posts Management Table/List -->
          <div v-else class="space-y-sm">
            <div 
              v-for="post in filteredPosts" 
              :key="post.id" 
              class="border border-on-background bg-surface p-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-md hover:bg-surface-container-low transition-colors"
            >
              <div class="flex items-center gap-sm overflow-hidden grow">
                <!-- Cover Image Thumbnail -->
                <div class="w-16 h-16 border border-on-background bg-surface-container overflow-hidden shrink-0 hidden md:block">
                  <img :src="post.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'" class="w-full h-full object-cover grayscale" />
                </div>
                <!-- Title & Date -->
                <div class="min-w-0">
                  <h3 class="font-headline-md text-headline-md text-on-background truncate leading-tight">
                    <router-link :to="'/post/' + post.slug" class="hover:underline" :class="{ 'opacity-60': post.status === 'draft' }">
                      {{ post.title }}
                    </router-link>
                  </h3>
                  <div class="flex gap-md font-label-sm text-[11px] text-on-surface-variant mt-xs font-mono">
                    <span>สร้างเมื่อ: {{ formatDate(post.created_at) }}</span>
                    <span 
                      class="px-xs border border-on-background uppercase"
                      :class="post.status === 'published' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'"
                    >
                      {{ post.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Tactile Actions Menu -->
              <div class="flex items-center gap-xs shrink-0 w-full md:w-auto justify-end border-t border-dashed border-outline-variant pt-sm md:pt-0 md:border-none">
                <!-- Status Toggle -->
                <button 
                  @click="togglePublish(post)" 
                  class="px-xs py-1 border border-on-background font-label-sm text-[11px] uppercase hover:bg-primary-fixed-dim transition-colors"
                  :title="post.status === 'published' ? 'เปลี่ยนเป็นฉบับร่าง' : 'เผยแพร่สู่สาธารณะ'"
                >
                  {{ post.status === 'published' ? 'ซ่อน' : 'เผยแพร่' }}
                </button>
                <!-- Edit -->
                <router-link 
                  :to="'/editor/' + post.id" 
                  class="px-xs py-1 border border-on-background bg-surface text-on-surface hover:bg-surface-container-high font-label-sm text-[11px] uppercase transition-colors block text-center"
                >
                  แก้ไข
                </router-link>
                <!-- Delete -->
                <button 
                  @click="deletePost(post.id)" 
                  class="px-xs py-1 border border-error text-error hover:bg-red-50 font-label-sm text-[11px] uppercase transition-colors"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Sidebar Panel: Profile Settings -->
        <aside class="w-full xl:w-80 flex flex-col gap-gutter shrink-0">
          <div class="border-2 border-on-background bg-surface-container-lowest p-md hard-shadow-sm relative">
            <span class="font-label-sm text-label-sm uppercase bg-primary text-on-primary px-sm py-xs mb-sm inline-block absolute -top-3.5 left-6 border border-on-background">
              ตั้งค่าโปรไฟล์ผู้เขียน
            </span>

            <div class="mt-sm space-y-md">
              <!-- Avatar Upload with Preview -->
              <div class="flex flex-col items-center gap-sm pb-sm border-b border-outline-variant">
                <div class="w-24 h-24 border-2 border-primary overflow-hidden bg-surface-container relative group">
                  <img :src="profileForm.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'" class="w-full h-full object-cover grayscale" />
                  
                  <!-- Uploading Overlay -->
                  <div v-if="avatarUploading" class="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span class="font-label-sm text-[10px] text-on-background blink">UPLOADING...</span>
                  </div>
                </div>

                <!-- Hidden Input -->
                <input 
                  type="file" 
                  ref="avatarInput" 
                  @change="handleAvatarUpload" 
                  accept="image/*" 
                  class="hidden" 
                />
                
                <button 
                  @click="$refs.avatarInput.click()" 
                  :disabled="avatarUploading"
                  class="px-sm py-xs border border-on-background text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors font-bold disabled:opacity-50"
                >
                  อัปโหลดรูปภาพใหม่
                </button>
              </div>

              <!-- Profile Form Inputs -->
              <form @submit.prevent="updateProfile" class="space-y-sm">
                <!-- User ID (Monospaced display) -->
                <div>
                  <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">เลขไอดีสมาชิก (Supabase UID)</label>
                  <input 
                    type="text" 
                    :value="authStore.user?.id" 
                    disabled 
                    class="w-full p-xs bg-surface-container text-on-surface-variant border border-outline-variant font-label-sm text-[11px] font-mono select-all"
                  />
                </div>

                <!-- Username -->
                <div>
                  <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">ชื่อผู้ใช้ (Username)</label>
                  <input 
                    type="text" 
                    v-model="profileForm.username" 
                    placeholder="oat_digital" 
                    class="w-full p-xs bg-surface text-on-background border border-on-background font-body-md text-body-md focus:ring-0 focus:border-primary font-mono lowercase"
                    required
                  />
                </div>

                <!-- Full Name -->
                <div>
                  <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">ชื่อนามปากกา (Display Name)</label>
                  <input 
                    type="text" 
                    v-model="profileForm.full_name" 
                    placeholder="ธนกร บุญตั้ง" 
                    class="w-full p-xs bg-surface text-on-background border border-on-background font-body-md text-body-md focus:ring-0 focus:border-primary"
                    required
                  />
                </div>

                <!-- Save Changes Button -->
                <button 
                  type="submit" 
                  :disabled="profileUpdating"
                  class="w-full py-sm bg-primary text-on-primary border border-on-background font-label-sm text-label-sm uppercase font-bold hover:bg-primary-fixed hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                >
                  {{ profileUpdating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
                </button>
              </form>
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
import { useAuthStore } from '../stores/auth';
import { supabase } from '../services/supabase';
import { uploadImage } from '../services/cloudinary';
import Sidebar from '../components/Sidebar.vue';
import Footer from '../components/Footer.vue';

const authStore = useAuthStore();
const posts = ref([]);
const loading = ref(true);
const currentTab = ref('all');

// Form States
const profileForm = ref({
  username: '',
  full_name: '',
  avatar_url: ''
});
const avatarUploading = ref(false);
const profileUpdating = ref(false);

const publishedPosts = computed(() => posts.value.filter(p => p.status === 'published'));
const draftPosts = computed(() => posts.value.filter(p => p.status === 'draft'));

const filteredPosts = computed(() => {
  if (currentTab.value === 'published') return publishedPosts.value;
  if (currentTab.value === 'draft') return draftPosts.value;
  return posts.value;
});

const fetchUserPosts = async () => {
  if (!authStore.user) return;
  
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, summary, cover_image, status, created_at')
      .eq('author_id', authStore.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    posts.value = data || [];
  } catch (err) {
    console.error('Error fetching user posts:', err);
  } finally {
    loading.value = false;
  }
};

const togglePublish = async (post) => {
  const newStatus = post.status === 'published' ? 'draft' : 'published';
  try {
    const { error } = await supabase
      .from('posts')
      .update({ status: newStatus })
      .eq('id', post.id);

    if (error) throw error;
    post.status = newStatus;
  } catch (err) {
    console.error('Error toggling status:', err);
    alert('ไม่สามารถเปลี่ยนสถานะเผยแพร่ได้: ' + err.message);
  }
};

const deletePost = async (postId) => {
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเอกสารรายงานฉบับนี้อย่างถาวร? ข้อมูลความคิดเห็นทั้งหมดที่เชื่อมโยงจะถูกลบไปด้วย')) return;
  
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    posts.value = posts.value.filter(p => p.id !== postId);
  } catch (err) {
    console.error('Error deleting post:', err);
    alert('ไม่สามารถลบเอกสารได้: ' + err.message);
  }
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    avatarUploading.value = true;
    const secureUrl = await uploadImage(file);
    profileForm.value.avatar_url = secureUrl;
    
    // อัปเดตตาราง profiles ใน Supabase ทันที
    await authStore.updateProfile({ avatar_url: secureUrl });
    alert('อัปเดตรูปโปรไฟล์สำเร็จแล้ว!');
  } catch (err) {
    console.error('Avatar upload failed:', err);
    alert('ไม่สามารถอัปโหลดรูปภาพได้: ' + err.message);
  } finally {
    avatarUploading.value = false;
  }
};

const updateProfile = async () => {
  try {
    profileUpdating.value = true;
    
    // Validate unique username locally or handle DB error
    await authStore.updateProfile({
      username: profileForm.value.username.trim().toLowerCase(),
      full_name: profileForm.value.full_name.trim()
    });
    
    alert('บันทึกข้อมูลโปรไฟล์ของคุณเรียบร้อยแล้ว!');
  } catch (err) {
    console.error('Update profile error:', err);
    let message = err.message;
    if (err.code === '23505') {
      message = 'ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้ใหม่';
    }
    alert('การอัปเดตล้มเหลว: ' + message);
  } finally {
    profileUpdating.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' ' + date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(async () => {
  await fetchUserPosts();
  if (authStore.profile) {
    profileForm.value = {
      username: authStore.profile.username,
      full_name: authStore.profile.full_name,
      avatar_url: authStore.profile.avatar_url
    };
  }
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
