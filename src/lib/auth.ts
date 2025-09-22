import { supabase } from './supabase';
import { Admin } from '@/types/booking';

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser(): Promise<Admin | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // In a real app, you'd fetch admin details from your admin table
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
      email: user.email || '',
    };
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  },
};