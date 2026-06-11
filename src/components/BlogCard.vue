<template>
  <div class="border-2 border-on-background bg-surface p-md hard-shadow-md group transition-all">
    <div class="flex flex-col md:flex-row gap-md">
      <!-- Post Image -->
      <router-link :to="'/post/' + post.slug" class="w-full md:w-1/3 aspect-video md:aspect-square bg-surface-container border border-on-background overflow-hidden shrink-0">
        <img 
          :src="post.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'" 
          :alt="post.title" 
          class="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-300"
        />
      </router-link>

      <!-- Post Content -->
      <div class="flex flex-col justify-between py-xs grow">
        <div>
          <!-- Tags / Categories -->
          <div class="flex flex-wrap gap-sm mb-xs">
            <span 
              v-for="tag in post.tags" 
              :key="tag" 
              class="font-label-sm text-label-sm text-on-primary-fixed-variant bg-primary-fixed px-xs border border-on-background"
            >
              {{ tag }}
            </span>
            <span 
              v-if="!post.tags || post.tags.length === 0" 
              class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-xs border border-on-background"
            >
              ทั่วไป
            </span>
          </div>

          <!-- Title -->
          <h3 class="font-headline-lg text-headline-lg text-on-background mb-sm group-hover:text-primary transition-colors leading-tight">
            <router-link :to="'/post/' + post.slug">{{ post.title }}</router-link>
          </h3>

          <!-- Summary -->
          <p class="font-body-md text-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
            {{ post.summary || 'ไม่มีเนื้อหาย่อสำหรับรายงานฉบับนี้...' }}
          </p>
        </div>

        <!-- Metadata -->
        <div class="flex items-center justify-between gap-md font-label-sm text-label-sm text-on-surface-variant mt-md pt-sm border-t border-outline-variant">
          <div class="flex items-center gap-md">
            <span>{{ formatDate(post.created_at) }}</span>
            <span>โดย {{ post.profiles?.full_name || 'ผู้เขียนนิรนาม' }}</span>
          </div>
          
          <router-link :to="'/post/' + post.slug" class="flex items-center gap-xs font-bold text-primary dark:text-primary-fixed group-hover:translate-x-1 transition-transform">
            อ่านบันทึก
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>
