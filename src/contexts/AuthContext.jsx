import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/activityLogger';

const AuthContext = createContext();

const initialAdmin = {
  id: 1,
  name: 'Admin JaringLokal',
  email: 'admin@jaringlokal.com',
  password: 'admin123',
  role: 'admin',
};

const getSavedUser = () => {
  try {
    const localUser = localStorage.getItem('jaringlokal_user');
    if (localUser && localUser !== 'undefined') {
      return JSON.parse(localUser);
    }
    const sessionUser = sessionStorage.getItem('jaringlokal_user');
    if (sessionUser && sessionUser !== 'undefined') {
      return JSON.parse(sessionUser);
    }
  } catch (e) {
    console.error('Failed to parse saved user from storage:', e);
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Synchronize initial state and end auth loading flag
    const currentUser = getSavedUser();
    setUser(currentUser);
    setAuthLoading(false);
  }, []);

  const saveUserSession = (userData, rememberMe = true) => {
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem('jaringlokal_user', JSON.stringify(userData));
      localStorage.setItem('jaringlokal_remembered_email', userData.email);
      sessionStorage.removeItem('jaringlokal_user');
    } else {
      sessionStorage.setItem('jaringlokal_user', JSON.stringify(userData));
      localStorage.removeItem('jaringlokal_user');
    }
  };

  const login = async (email, password, rememberMe = true, captchaToken) => {
    try {
      // 0. Fallback default admin (demo account, not a real Supabase Auth user)
      if (email === initialAdmin.email && password === initialAdmin.password) {
        const adminData = { id: 1, name: initialAdmin.name, email: initialAdmin.email, role: 'admin' };
        saveUserSession(adminData, rememberMe);
        logActivity({ action: 'login', userId: adminData.id, userName: adminData.name });
        return { success: true, user: adminData };
      }

      // 1. Authenticate against Supabase Auth (handles password hashing/verification)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email belum dikonfirmasi. Silakan cek email Anda dan klik link konfirmasi terlebih dahulu.',
            requireEmailConfirmation: true,
          };
        }
        return { success: false, error: 'Email atau kata sandi salah. Silakan periksa kembali.' };
      }

      // 2. Fetch profile data (name, role, app-level id) linked to this auth user
      const { data: dbUser, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile lookup error during login:', profileError.message);
      }

      if (!dbUser) {
        return {
          success: false,
          error: 'Akun terverifikasi, tapi profil tidak ditemukan. Hubungi admin.',
        };
      }

      const loggedUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role || 'customer',
      };
      saveUserSession(loggedUser, rememberMe);
      logActivity({ action: 'login', userId: loggedUser.id, userName: loggedUser.name });
      return { success: true, user: loggedUser };

    } catch (err) {
      console.error('Login process error:', err);
      return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
    }
  };

  const register = async (name, email, password, captchaToken) => {
    try {
      // 1. Check if email already exists in our profile table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Email ini sudah terdaftar. Silakan masuk (login).' };
      }

      // 2. Create the real Supabase Auth user. This is what actually triggers
      //    Supabase to send the verification email — a plain table insert
      //    never does, which was the root cause of OTP emails never arriving.
      //    emailRedirectTo controls where the "Confirm your email" link in
      //    that email sends the user back to.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
          ...(captchaToken ? { captchaToken } : {}),
        },
      });

      if (authError) {
        console.error('Supabase Auth signUp error:', authError);
        return { success: false, error: authError.message || 'Gagal mendaftarkan akun.' };
      }

      if (!authData.user) {
        return { success: false, error: 'Gagal mendaftarkan akun. Silakan coba lagi.' };
      }

      // 3. Create the profile row linked to the new auth user via auth_id.
      const { data: insertedUser, error: insertErr } = await supabase
        .from('users')
        .insert([{ name, email, role: 'customer', auth_id: authData.user.id }])
        .select()
        .single();

      if (insertErr) {
        console.error('Error inserting user profile to Supabase:', insertErr);
        return {
          success: false,
          error: 'Akun berhasil dibuat di sistem autentikasi, tapi gagal menyimpan profil. Hubungi admin.',
        };
      }

      const registeredUser = {
        id: insertedUser.id,
        name: insertedUser.name,
        email: insertedUser.email,
        role: insertedUser.role,
      };

      // We do NOT save a local session here — the account is only usable
      // after the person clicks the confirmation link in their email, then
      // logs in normally with their email + password.
      return { success: true, requireEmailConfirmation: true, user: registeredUser };

    } catch (err) {
      console.error('Register process error:', err);
      return { success: false, error: 'Gagal mendaftarkan akun. Silakan coba lagi.' };
    }
  };

  // Resend the "confirm your email" link (type='signup') or the password
  // reset OTP (type='recovery' — handled by requestPasswordReset instead).
  const resendConfirmationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Resend confirmation email error:', err);
      return { success: false, error: err.message || 'Gagal mengirim ulang email konfirmasi.' };
    }
  };

  const requestPasswordReset = async (email, captchaToken) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        ...(captchaToken ? { captchaToken } : {}),
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Request reset password error:', err);
      return { success: false, error: err.message || 'Gagal mengirim email reset kata sandi.' };
    }
  };

  // Kept for other potential uses, but the reset-password flow now uses the
  // emailed confirmation link (handled by ResetPassword.jsx) instead of a
  // manually-entered OTP code.
  const verifyOTP = async (email, otp, type = 'recovery') => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type });
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (err) {
      console.error('Verify OTP error:', err);
      return { success: false, error: err.message || 'Kode OTP tidak valid.' };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Update password error:', err);
      return { success: false, error: err.message || 'Gagal memperbarui kata sandi.' };
    }
  };

  const finalizeLogin = (userData, rememberMe = true) => {
    saveUserSession(userData, rememberMe);
    logActivity({ action: 'login_verified', userId: userData.id, userName: userData.name });
  };

  const updateUserRole = async (newRole) => {
    if (!user) return;

    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    
    if (localStorage.getItem('jaringlokal_user')) {
      localStorage.setItem('jaringlokal_user', JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem('jaringlokal_user')) {
      sessionStorage.setItem('jaringlokal_user', JSON.stringify(updatedUser));
    }

    try {
      if (user.id) {
        await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Failed to update user role in database:', err);
    }
  };

  const logout = () => {
    setUser(null);
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
      verifyOTP,
      resendConfirmationEmail,
      updatePassword,
      finalizeLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
