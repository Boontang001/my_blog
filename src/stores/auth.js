import { defineStore } from 'pinia';
import { auth, googleProvider } from '../services/firebase';
import { supabase } from '../services/supabase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: true,
  }),
  actions: {
    init() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          this.loading = true;
          if (firebaseUser) {
            this.user = firebaseUser;
            await this.syncProfile(firebaseUser);
          } else {
            this.user = null;
            this.profile = null;
          }
          this.loading = false;
          resolve(firebaseUser);
        });
      });
    },
    async syncProfile(firebaseUser) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('firebase_uid', firebaseUser.uid)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          this.profile = data;
        } else {
          // หากไม่มีโปรไฟล์ ให้ทำการสร้างโปรไฟล์ใหม่โดยอัตโนมัติ
          const baseUsername = firebaseUser.email ? firebaseUser.email.split('@')[0] : 'user';
          const uniqueUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 7)}`;
          
          const newProfile = {
            firebase_uid: firebaseUser.uid,
            username: uniqueUsername,
            full_name: firebaseUser.displayName || baseUsername,
            avatar_url: firebaseUser.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'
          };

          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (insertError) throw insertError;
          this.profile = insertedData;
        }
      } catch (err) {
        console.error('Error syncing user profile with Supabase:', err);
      }
    },
    async loginWithGoogle() {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    },
    async loginWithEmail(email, password) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    },
    async registerWithEmail(email, password, fullName) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      const baseUsername = email.split('@')[0];
      const uniqueUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 7)}`;
      const newProfile = {
        firebase_uid: result.user.uid,
        username: uniqueUsername,
        full_name: fullName || baseUsername,
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'
      };
      
      // บันทึก/อัปเดตโปรไฟล์ใน Supabase ทันทีหลังลงทะเบียนสำเร็จ
      await supabase.from('profiles').upsert(newProfile);
      return result.user;
    },
    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email);
    },
    async logout() {
      await firebaseSignOut(auth);
      this.user = null;
      this.profile = null;
    },
    async updateProfile(updates) {
      if (!this.profile) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('firebase_uid', this.profile.firebase_uid)
        .select()
        .single();
        
      if (error) throw error;
      this.profile = data;
    }
  }
});
