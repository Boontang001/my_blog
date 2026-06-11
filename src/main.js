import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';
import router from './router';
import App from './App.vue';
import './style.css';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(MotionPlugin);

// เริ่มต้นโหลดเซสชัน Auth ก่อนที่จะ Mount แอปพลิเคชัน ป้องกันหน้ากะพริบ
const authStore = useAuthStore();
authStore.init().then(() => {
  app.mount('#app');
});
