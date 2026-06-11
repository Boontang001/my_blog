<template>
  <!-- Mobile Header Navbar -->
  <header class="lg:hidden w-full bg-surface border-b-2 border-on-background p-sm flex justify-between items-center fixed top-0 left-0 z-50">
    <div class="flex flex-col">
      <h1 class="font-headline-md text-headline-md text-primary leading-none">ARCHIVE</h1>
      <span class="font-label-sm text-label-sm text-on-surface-variant">EST. 1984</span>
    </div>
    <div class="flex items-center gap-sm">
      <button @click="toggleTheme" class="w-10 h-10 flex items-center justify-center border border-on-background bg-surface-container hover:bg-surface-container-high transition-colors">
        <span class="material-symbols-outlined text-[20px]">{{ themeStore.darkMode ? 'light_mode' : 'dark_mode' }}</span>
      </button>
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="w-10 h-10 flex items-center justify-center border-2 border-on-background bg-primary text-on-primary">
        <span class="material-symbols-outlined">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
      </button>
    </div>
  </header>

  <!-- Mobile Dropdown Navigation Menu -->
  <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 top-[66px] bg-background z-40 border-b-2 border-on-background p-md flex flex-col gap-md">
    <nav class="flex flex-col gap-sm">
      <router-link to="/" @click="mobileMenuOpen = false" class="nav-item-mobile" active-class="active">
        <span class="material-symbols-outlined">home</span>
        <span class="font-label-md text-label-md">หน้าแรก</span>
      </router-link>
      <router-link v-if="authStore.user" to="/dashboard" @click="mobileMenuOpen = false" class="nav-item-mobile" active-class="active">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="font-label-md text-label-md">แดชบอร์ด</span>
      </router-link>
      <router-link v-if="!authStore.user" to="/login" @click="mobileMenuOpen = false" class="nav-item-mobile" active-class="active">
        <span class="material-symbols-outlined">login</span>
        <span class="font-label-md text-label-md">เข้าสู่ระบบ</span>
      </router-link>
      <button v-if="authStore.user" @click="handleLogout" class="nav-item-mobile text-left w-full text-error">
        <span class="material-symbols-outlined text-error">logout</span>
        <span class="font-label-md text-label-md text-error">ออกจากระบบ</span>
      </button>
    </nav>
    <router-link to="/editor" @click="mobileMenuOpen = false" class="w-full text-center py-md bg-primary text-on-primary border-2 border-on-background font-label-md text-label-md uppercase tracking-widest hard-shadow-sm block">
      เขียนบันทึกใหม่
    </router-link>
  </div>

  <!-- Desktop Sidebar -->
  <aside class="lg:flex hidden h-screen w-64 fixed left-0 top-0 bg-surface-container dark:bg-surface-container-low border-r-2 border-on-background dark:border-on-surface-variant hard-shadow-primary flex-col p-base gap-sm z-50">
    <div class="mb-md px-sm">
      <p class="font-label-sm text-label-sm text-on-surface-variant">บรรณาธิการบริหาร</p>
      <h1 class="font-headline-md text-headline-md text-primary dark:text-primary-fixed leading-tight">ARCHIVE REPORTS</h1>
      <p class="font-label-sm text-label-sm text-on-surface-variant mt-xs">ก่อตั้ง 1984 | เล่มที่ 42</p>
    </div>

    <!-- User Profile Section in Sidebar -->
    <div v-if="authStore.user && authStore.profile" class="mb-sm p-sm border border-on-background bg-surface-container-lowest flex items-center gap-sm">
      <img :src="authStore.profile.avatar_url" alt="User avatar" class="w-10 h-10 border border-on-background object-cover bg-surface-container" />
      <div class="overflow-hidden">
        <p class="font-label-sm text-label-sm font-bold truncate leading-tight">{{ authStore.profile.full_name }}</p>
        <p class="font-label-sm text-[10px] text-on-surface-variant leading-none">@{{ authStore.profile.username }}</p>
      </div>
    </div>

    <!-- Navigation links -->
    <nav class="flex flex-col grow gap-xs">
      <router-link to="/" class="nav-item" active-class="active">
        <span class="material-symbols-outlined">home</span>
        <span class="font-label-md text-label-md">หน้าแรก</span>
      </router-link>
      
      <router-link v-if="authStore.user" to="/dashboard" class="nav-item" active-class="active">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="font-label-md text-label-md">แดชบอร์ด</span>
      </router-link>

      <router-link v-if="!authStore.user" to="/login" class="nav-item" active-class="active">
        <span class="material-symbols-outlined">login</span>
        <span class="font-label-md text-label-md">เข้าสู่ระบบ</span>
      </router-link>

      <button v-if="authStore.user" @click="handleLogout" class="nav-item text-left w-full hover:bg-red-50 hover:text-red-700 transition-all border-b border-outline-variant">
        <span class="material-symbols-outlined text-red-600">logout</span>
        <span class="font-label-md text-label-md text-red-600">ออกจากระบบ</span>
      </button>

      <!-- Theme Toggle -->
      <button @click="toggleTheme" class="nav-item text-left w-full mt-2">
        <span class="material-symbols-outlined">{{ themeStore.darkMode ? 'light_mode' : 'dark_mode' }}</span>
        <span class="font-label-md text-label-md">{{ themeStore.darkMode ? 'ธีมสว่าง' : 'ธีมมืด' }}</span>
      </button>
    </nav>

    <!-- Write New Post Button -->
    <router-link to="/editor" class="mt-auto w-full py-md bg-primary text-on-primary border-2 border-on-background font-label-md text-label-md uppercase tracking-widest hard-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all block text-center">
      เขียนบันทึกใหม่
    </router-link>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

const mobileMenuOpen = ref(false);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    mobileMenuOpen.value = false;
    router.push('/');
  } catch (err) {
    console.error('Logout error:', err);
  }
};
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: var(--color-on-surface-variant, #414846);
  border-bottom: 1px solid var(--color-outline-variant, #c1c8c4);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: var(--color-primary-fixed-dim, #abcec2);
  color: var(--color-on-primary-fixed, #002019);
}

.nav-item.active {
  color: var(--color-on-primary, #ffffff);
  background-color: var(--color-primary, #02241d);
  font-weight: 700;
  border: 2px solid var(--color-on-background, #1b1c1c);
  transform: translate(2px, 2px);
  box-shadow: none;
}

.nav-item-mobile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-on-background, #1b1c1c);
  background-color: var(--color-surface, #fcf9f8);
  transition: all 0.2s ease;
}

.nav-item-mobile.active {
  color: var(--color-on-primary, #ffffff);
  background-color: var(--color-primary, #02241d);
  font-weight: 700;
}
</style>
