<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- Navigation Sidebar -->
    <Sidebar />

    <!-- Main Canvas -->
    <main class="lg:ml-64 flex-1 flex flex-col justify-center items-center p-md pt-[90px] lg:pt-md">
      <div class="w-full max-w-md bg-surface border-2 border-on-background p-lg hard-shadow-md relative">
        <!-- Badge -->
        <span class="font-label-sm text-label-sm uppercase bg-primary text-on-primary px-sm py-xs mb-sm inline-block absolute -top-3.5 left-6 border border-on-background">
          {{ isRecovering ? 'กู้คืนรหัสผ่าน' : isRegistering ? 'ลงทะเบียนใหม่' : 'เข้าสู่ระบบเครือข่าย' }}
        </span>

        <!-- Header -->
        <div class="text-center mb-lg mt-sm">
          <h2 class="font-headline-lg text-headline-lg text-primary leading-tight">ARCHIVE REPORTS</h2>
          <p class="font-label-sm text-label-sm text-on-surface-variant">ศูนย์บริการลงบันทึกข้อมูลส่วนบุคคล</p>
        </div>

        <!-- Feedback Alert Messages -->
        <div v-if="errorMsg" class="border border-error bg-error-container text-on-error-container p-sm mb-md font-body-md text-body-md">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="border border-primary bg-primary-fixed text-on-primary-fixed p-sm mb-md font-body-md text-body-md">
          {{ successMsg }}
        </div>

        <!-- Form fields -->
        <form @submit.prevent="handleSubmit" class="space-y-md">
          <!-- Full Name (Only when registering) -->
          <div v-if="isRegistering">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">ชื่อ-นามสกุลจริง</label>
            <input 
              type="text" 
              v-model="fullName" 
              placeholder="สมชาย รักเรียน" 
              class="w-full p-xs bg-surface text-on-background border border-on-background font-body-md text-body-md placeholder:text-outline focus:ring-0 focus:border-primary"
              required
            />
          </div>

          <!-- Email -->
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">ที่อยู่อีเมลผู้ใช้</label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="USER@DOMAIN.COM" 
              class="w-full p-xs bg-surface text-on-background border border-on-background font-body-md text-body-md placeholder:text-outline focus:ring-0 focus:border-primary uppercase"
              required
            />
          </div>

          <!-- Password (Not when recovering) -->
          <div v-if="!isRecovering">
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-xs">รหัสผ่านเข้าใช้งาน</label>
            <input 
              type="password" 
              v-model="password" 
              placeholder="••••••••" 
              class="w-full p-xs bg-surface text-on-background border border-on-background font-body-md text-body-md placeholder:text-outline focus:ring-0 focus:border-primary"
              required
              minlength="6"
            />
          </div>

          <!-- Action buttons -->
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-sm bg-primary text-on-primary border border-on-background font-label-md text-label-md uppercase font-bold hard-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 disabled:opacity-50"
          >
            {{ loading ? 'โปรดรอสักครู่...' : isRecovering ? 'ส่งลิงก์รีเซ็ตรหัสผ่าน' : isRegistering ? 'ยืนยันลงทะเบียน' : 'เข้าสู่ระบบด้วยอีเมล' }}
          </button>
        </form>

        <!-- Google OAuth Social Login (Only in login/register screens) -->
        <div v-if="!isRecovering" class="mt-md pt-md border-t border-outline-variant space-y-md">
          <button 
            @click="handleGoogleLogin" 
            :disabled="loading"
            class="w-full py-sm bg-surface text-on-surface border border-on-background font-label-sm text-label-sm uppercase font-bold flex items-center justify-center gap-sm hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <!-- Google Minimal Icon -->
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.84-2.46 2.4l3.19 2.47c1.86-1.72 2.93-4.25 2.93-7.23z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.19-2.47c-.88.6-2 .95-3.24.95-3.11 0-5.74-2.1-6.68-4.92L3.54 19.5c2 3.97 6.1 6.64 10.78 6.64z"/>
              <path fill="#FBBC05" d="M5.32 14.65c-.24-.73-.38-1.5-.38-2.3 0-.8.14-1.57.38-2.3L2.04 7.5c-.84 1.68-1.32 3.56-1.32 5.5s.48 3.82 1.32 5.5l3.28-2.55z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.22 2.67 1.22 6.64l3.28 2.55c.94-2.82 3.57-4.92 6.68-4.92z"/>
            </svg>
            เชื่อมต่อผ่าน GOOGLE ACCOUNT
          </button>
        </div>

        <!-- Toggles -->
        <div class="mt-md text-center font-label-sm text-[11px] text-on-surface-variant space-y-sm">
          <!-- Toggle Register / Login -->
          <div v-if="!isRecovering">
            <span v-if="isRegistering">
              มีบัญชีผู้ใช้งานอยู่แล้วใช่หรือไม่? 
              <button @click="toggleMode" class="text-primary font-bold hover:underline">คลิกเพื่อเข้าสู่ระบบ</button>
            </span>
            <span v-else>
              ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่? 
              <button @click="toggleMode" class="text-primary font-bold hover:underline">สมัครสมาชิกที่นี่</button>
            </span>
          </div>
          
          <!-- Toggle Password Reset -->
          <div>
            <button v-if="!isRecovering" @click="isRecovering = true; errorMsg = ''; successMsg = ''" class="text-on-surface-variant hover:text-primary transition-colors underline">
              ลืมรหัสผ่านใช้งานใช่หรือไม่?
            </button>
            <button v-else @click="isRecovering = false; errorMsg = ''; successMsg = ''" class="text-primary font-bold hover:underline">
              กลับสู่หน้าล็อกอิน
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const fullName = ref('');
const isRegistering = ref(false);
const isRecovering = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);

const toggleMode = () => {
  isRegistering.value = !isRegistering.value;
  errorMsg.value = '';
  successMsg.value = '';
};

const handleGoogleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    await authStore.loginWithGoogle();
    const redirectTo = route.query.redirect || '/dashboard';
    router.push(redirectTo);
  } catch (err) {
    console.error(err);
    errorMsg.value = 'การเข้าสู่ระบบผ่าน Google ล้มเหลว: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    if (isRecovering.value) {
      // Password reset
      await authStore.resetPassword(email.value);
      successMsg.value = 'ลิงก์การกู้คืนรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว โปรดตรวจสอบกล่องข้อความขาเข้า';
      email.value = '';
    } else if (isRegistering.value) {
      // Registration
      if (!fullName.value.trim()) {
        throw new Error('กรุณากรอกชื่อ-นามสกุลจริง');
      }
      await authStore.registerWithEmail(email.value, password.value, fullName.value.trim());
      const redirectTo = route.query.redirect || '/dashboard';
      router.push(redirectTo);
    } else {
      // Login
      await authStore.loginWithEmail(email.value, password.value);
      const redirectTo = route.query.redirect || '/dashboard';
      router.push(redirectTo);
    }
  } catch (err) {
    console.error(err);
    let message = err.message;
    if (err.code === 'auth/invalid-credential') {
      message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    } else if (err.code === 'auth/email-already-in-use') {
      message = 'ที่อยู่อีเมลนี้ถูกใช้สมัครสมาชิกไปแล้ว';
    } else if (err.code === 'auth/weak-password') {
      message = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป';
    }
    errorMsg.value = message;
  } finally {
    loading.value = false;
  }
};
</script>
