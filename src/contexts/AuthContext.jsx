import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/activityLogger';

const AuthContext = createContext();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: ambil profil user dari public.users berdasarkan auth.users id
// ─────────────────────────────────────────────────────────────────────────────
async function fetchProfile(authUserId) {
  if (!authUserId) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, role')
    .eq('id', authUserId)
    .maybeSingle();

  if (error) {
    console.warn('[AuthContext] fetchProfile error:', error.message);
    return null;
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthProvider — menggunakan Supabase Auth resmi (bcrypt otomatis)
// ─────────────────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Sync state dari Supabase Auth session (termasuk setelah page refresh)
  useEffect(() => {
    // Ambil session awal
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile || { id: session.user.id, email: session.user.email, role: 'customer' });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    // Listen perubahan auth state (login, logout, token refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setUser(profile || { id: session.user.id, email: session.user.email, role: 'customer' });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        // PASSWORD_RECOVERY ditangani di ResetPassword.jsx
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ───────────────────────────────────────────────────────────────
  // LOGIN — Supabase Auth signInWithPassword (bcrypt otomatis)
  // captchaToken: reCAPTCHA v3 token dari frontend (opsional,
  // Supabase tidak memvalidasinya di signInWithPassword, dipakai
  // sebagai sinyal client-side saja untuk keperluan logging).
  // ───────────────────────────────────────────────────────────────
  const login = async (email, password, rememberMe = true) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Pesan error Supabase → terjemahkan ke Bahasa Indonesia
        const msg = mapAuthError(error.message);
        return { success: false, error: msg };
      }

      const profile = await fetchProfile(data.user.id);
      const loggedUser = profile || {
        id: data.user.id,
        email: data.user.email,
        role: 'customer',
      };

      // Simpan email untuk "Remember Me" (Supabase session sudah persist otomatis)
      if (rememberMe) {
        localStorage.setItem('jaringlokal_remembered_email', email);
      }

      // Log aktivitas
      logActivity({ action: 'login', userId: loggedUser.id, userName: loggedUser.name || email });

      return { success: true, user: loggedUser };
    } catch (err) {
      console.error('[AuthContext] login error:', err);
      return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
    }
  };

  // ───────────────────────────────────────────────────────────────
  // REGISTER — Supabase Auth signUp (password di-hash bcrypt otomatis)
  // Profil user (name, phone, role) disimpan ke public.users via
  // database trigger handle_new_user() yang dipasang di SQL schema.
  // ───────────────────────────────────────────────────────────────
  const register = async (name, email, password, phone = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            // user_metadata — dipakai oleh trigger untuk isi public.users
            name,
            phone,
            role: 'customer',
          },
        },
      });

      if (error) {
        return { success: false, error: mapAuthError(error.message) };
      }

      // signUp berhasil — user mungkin perlu konfirmasi email
      // Jika Supabase email confirmation dimatikan, session langsung aktif
      const authUser = data.user;
      if (!authUser) {
        return {
          success: false,
          error: 'Pendaftaran gagal. Pastikan email valid dan coba lagi.',
        };
      }

      // Upsert profil ke public.users (trigger handle_new_user juga akan mencoba ini,
      // tapi kita lakukan manual untuk memastikan name & phone langsung ada)
      await supabase.from('users').upsert({
        id: authUser.id,
        name,
        email: authUser.email,
        phone,
        role: 'customer',
      }, { onConflict: 'id' });

      const newUser = { id: authUser.id, name, email: authUser.email, phone, role: 'customer' };
      logActivity({ action: 'register', userId: newUser.id, userName: name });

      return { success: true, user: newUser };
    } catch (err) {
      console.error('[AuthContext] register error:', err);
      return { success: false, error: 'Gagal mendaftarkan akun. Silakan coba lagi.' };
    }
  };

  // ───────────────────────────────────────────────────────────────
  // FORGOT PASSWORD — Supabase resetPasswordForEmail
  // captchaToken: Cloudflare Turnstile token (Supabase mendukung natively)
  // ───────────────────────────────────────────────────────────────
  const requestPasswordReset = async (email, captchaToken) => {
    try {
      const options = {
        redirectTo: `${window.location.origin}/reset-password`,
      };

      // Supabase Auth mendukung Turnstile captchaToken di sini
      if (captchaToken) {
        options.captchaToken = captchaToken;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        options
      );

      if (error) {
        return { success: false, error: mapAuthError(error.message) };
      }

      return { success: true };
    } catch (err) {
      console.error('[AuthContext] requestPasswordReset error:', err);
      return { success: false, error: 'Terjadi kesalahan saat meminta reset kata sandi.' };
    }
  };

  // ───────────────────────────────────────────────────────────────
  // UPDATE PASSWORD — Supabase updateUser (dipakai di ResetPassword.jsx)
  // ───────────────────────────────────────────────────────────────
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: mapAuthError(error.message) };
      }
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] updatePassword error:', err);
      return { success: false, error: 'Gagal memperbarui kata sandi.' };
    }
  };

  // ───────────────────────────────────────────────────────────────
  // UPDATE ROLE — update public.users (admin operation)
  // ───────────────────────────────────────────────────────────────
  const updateUserRole = async (newRole) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id);

      if (!error) {
        setUser((prev) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error('[AuthContext] updateUserRole error:', err);
    }
  };

  // ───────────────────────────────────────────────────────────────
  // LOGOUT — Supabase signOut
  // ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Bersihkan sisa storage lama (backwards compat)
    localStorage.removeItem('jaringlokal_user');
    sessionStorage.removeItem('jaringlokal_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      login,
      register,
      logout,
      updateUserRole,
      requestPasswordReset,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: terjemahkan pesan error Supabase Auth ke Bahasa Indonesia
// ─────────────────────────────────────────────────────────────────────────────
function mapAuthError(message = '') {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Email atau kata sandi salah. Silakan periksa kembali.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk (login).';
  }
  if (m.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Silakan cek kotak masuk email Anda.';
  }
  if (m.includes('password should be at least')) {
    return 'Kata sandi minimal 6 karakter.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Silakan tunggu beberapa saat dan coba lagi.';
  }
  if (m.includes('captcha')) {
    return 'Verifikasi CAPTCHA gagal. Silakan coba lagi.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  }
  // Fallback: kembalikan pesan asli
  return message || 'Terjadi kesalahan. Silakan coba lagi.';
}
