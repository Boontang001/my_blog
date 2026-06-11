import { defineStore } from 'pinia';
import { supabase } from '../services/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: true,
  }),
  actions: {
    init() {
      return new Promise((resolve) => {
        // ติดตามการเปลี่ยนแปลงสถานะ Auth ของ Supabase
        supabase.auth.onAuthStateChange(async (event, session) => {
          this.loading = true;
          if (session?.user) {
            this.user = session.user;
            await this.syncProfile(session.user);
          } else {
            this.user = null;
            this.profile = null;
          }
          this.loading = false;
          resolve(session?.user || null);
        });
      });
    },
    async syncProfile(supabaseUser) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('firebase_uid', supabaseUser.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          this.profile = data;
        } else {
          // หากไม่มีโปรไฟล์ ให้ทำการสร้างโปรไฟล์ใหม่โดยอัตโนมัติ
          const baseUsername = supabaseUser.email ? supabaseUser.email.split('@')[0] : 'user';
          const uniqueUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 7)}`;
          
          const newProfile = {
            firebase_uid: supabaseUser.id,
            username: uniqueUsername,
            full_name: supabaseUser.user_metadata?.full_name || baseUsername,
            avatar_url: supabaseUser.user_metadata?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
      return data;
    },
    async loginWithEmail(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      this.user = data.user;
      return data.user;
    },
    async registerWithEmail(email, password, fullName) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      
      if (data.user) {
        const baseUsername = email.split('@')[0];
        const uniqueUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 7)}`;
        const newProfile = {
          firebase_uid: data.user.id,
          username: uniqueUsername,
          full_name: fullName || baseUsername,
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0IOVook00TNgIuxQdAv7gsnk-aotJHGIaIqde27qnPEbOIdLS28tGkHSlCXRv757znCBST9inPwd0NWyJM3ShV8ZMZfgE2uCSLWq_OaHjoSZHY_D_IdOOxto32gxpW-zHl9gHkm6wFHRquti0hBPlw9_1JiYyHbnAJgbL1KDrfX_4pPwHEXhHSuiVE5fTyGGYmuQzoc_Ole67lI8xXrIZV13YgFyDVKMWtnwAuJBOWBBHVn9-ZpTpJoO_wMmx8kYJS792KBiPAhk'
        };
        
        await supabase.from('profiles').upsert(newProfile);
      }
      return data.user;
    },
    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login'
      });
      if (error) throw error;
    },
    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
