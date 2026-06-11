<template>
  <div class="mt-xl border-t-2 border-on-background pt-lg">
    <h3 class="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
      <span class="material-symbols-outlined text-primary">forum</span>
      ความคิดเห็นใต้บทความ ({{ comments.length }})
    </h3>

    <!-- Write Comment Form -->
    <div v-if="authStore.user" class="border-2 border-on-background bg-surface-container-low p-md mb-lg">
      <p class="font-label-sm text-label-sm text-on-surface-variant mb-xs">เขียนข้อความแสดงความเห็น</p>
      <div class="relative">
        <textarea
          v-model="newComment"
          placeholder="พิมพ์ข้อความของคุณที่นี่..."
          rows="3"
          class="w-full p-sm bg-surface text-on-background border border-on-background font-body-md text-body-md placeholder:text-outline focus:ring-0 focus:border-primary resize-none"
          required
        ></textarea>
      </div>
      <div class="flex justify-between items-center mt-sm">
        <span class="font-label-sm text-label-sm text-on-surface-variant">ล็อกอินเป็น: {{ authStore.profile?.full_name }}</span>
        <button
          @click="submitComment"
          :disabled="submitting || !newComment.trim()"
          class="px-md py-sm bg-primary text-on-primary border border-on-background font-label-sm text-label-sm uppercase hover:bg-primary-fixed hover:text-primary transition-all font-bold active:scale-95 disabled:opacity-50"
        >
          {{ submitting ? 'กำลังส่ง...' : 'ส่งความเห็น' }}
        </button>
      </div>
    </div>
    
    <div v-else class="border-2 border-dashed border-outline bg-surface-container-low p-md mb-lg text-center">
      <p class="font-body-md text-body-md text-on-surface-variant">
        กรุณา <router-link to="/login" class="text-primary font-bold hover:underline">เข้าสู่ระบบ</router-link> เพื่อแสดงความคิดเห็นในบทความนี้
      </p>
    </div>

    <!-- Comments List -->
    <div v-if="loading" class="text-center py-md">
      <p class="font-label-sm text-label-sm text-on-surface-variant">กำลังโหลดความคิดเห็น...</p>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-md border border-outline-variant bg-surface-container-lowest">
      <p class="font-label-sm text-label-sm text-on-surface-variant">ยังไม่มีใครแสดงความคิดเห็นในขณะนี้</p>
    </div>

    <div v-else class="space-y-sm">
      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="border border-on-background bg-surface-container-lowest p-sm flex gap-sm relative hover:bg-surface-container-low transition-colors"
      >
        <!-- Author Avatar -->
        <img 
          :src="comment.profiles?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'" 
          alt="Avatar" 
          class="w-10 h-10 border border-on-background object-cover bg-surface-container shrink-0" 
        />
        
        <div class="grow overflow-hidden">
          <div class="flex flex-wrap items-center gap-xs md:gap-sm mb-xs">
            <span class="font-label-sm text-label-sm font-bold text-on-background">{{ comment.profiles?.full_name }}</span>
            <span class="font-label-sm text-[10px] text-on-surface-variant">@{{ comment.profiles?.username }}</span>
            <span class="font-label-sm text-[10px] text-on-surface-variant font-mono">/ {{ formatTime(comment.created_at) }}</span>
          </div>
          
          <p class="font-body-md text-body-md text-on-background break-words whitespace-pre-wrap leading-relaxed">{{ comment.content }}</p>
        </div>

        <!-- Delete Button (Only for comment creator) -->
        <button 
          v-if="authStore.user && authStore.user.id === comment.author_id" 
          @click="deleteComment(comment.id)" 
          class="text-error hover:bg-red-50 p-xs border border-transparent hover:border-error transition-all absolute top-2 right-2 flex items-center justify-center active:scale-90"
          title="ลบความคิดเห็น"
        >
          <span class="material-symbols-outlined text-[16px] text-red-600">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  postId: {
    type: String,
    required: true
  }
});

const authStore = useAuthStore();
const comments = ref([]);
const newComment = ref('');
const loading = ref(true);
const submitting = ref(false);

const fetchComments = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('post_id', props.postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    comments.value = data || [];
  } catch (err) {
    console.error('Error fetching comments:', err);
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim() || submitting.value) return;
  
  try {
    submitting.value = true;
    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: props.postId,
        author_id: authStore.user.id,
        content: newComment.value.trim()
      });

    if (error) throw error;
    newComment.value = '';
    await fetchComments();
  } catch (err) {
    console.error('Error submitting comment:', err);
    alert('ไม่สามารถส่งความคิดเห็นได้ในขณะนี้: ' + err.message);
  } finally {
    submitting.value = false;
  }
};

const deleteComment = async (commentId) => {
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบความคิดเห็นนี้?')) return;
  
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    await fetchComments();
  } catch (err) {
    console.error('Error deleting comment:', err);
    alert('ไม่สามารถลบความคิดเห็นได้: ' + err.message);
  }
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleDateString('th-TH', {
    month: 'short',
    day: 'numeric'
  }) + ' ' + date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchComments();
});
</script>
