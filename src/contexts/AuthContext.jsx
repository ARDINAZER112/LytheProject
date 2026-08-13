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

  const login = async (email, password, rememberMe = true) => {
    try {
      // 1. Try querying PostgreSQL Supabase 'users' table
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.warn('Database query error during login, checking local fallback:', error.message);
      }

      if (dbUser) {
        if (dbUser.password === password) {
          const loggedUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone || '',
            role: dbUser.role || 'customer',
          };
          saveUserSession(loggedUser, rememberMe);
          // Log live IP address & location data upon login
          logActivity({ action: 'login', userId: loggedUser.id, userName: loggedUser.name });
          return { success: true, user: loggedUser };
        } else {
          return { success: false, error: 'Kata sandi salah. Silakan periksa kembali.' };
        }
      }

      // If user not found in database, check fallback default admin
      if (email === initialAdmin.email && password === initialAdmin.password) {
        const adminData = { id: 1, name: initialAdmin.name, email: initialAdmin.email, role: 'admin' };
        saveUserSession(adminData, rememberMe);
        // Log live IP address & location data upon login
        logActivity({ action: 'login', userId: adminData.id, userName: adminData.name });
        return { success: true, user: adminData };
      }

      // If account does not exist in PostgreSQL database
      return { 
        success: false, 
        error: 'Akun tidak terdaftar. Silakan buat akun terlebih dahulu melalui halaman Daftar.' 
      };

    } catch (err) {
      console.error('Login process error:', err);
      return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
    }
  };

  const register = async (name, email, password, phone = '', rememberMe = true) => {
    try {
      // 1. Check if email already exists in PostgreSQL
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Email ini sudah terdaftar. Silakan masuk (login).' };
      }

      // 2. Insert new user into PostgreSQL 'users' table
      const newUserObj = {
        name,
        email,
        password,
        phone,
        role: 'customer',
      };

      const { data: insertedUser, error: insertErr } = await supabase
        .from('users')
        .insert([newUserObj])
        .select()
        .single();

      if (insertErr) {
        console.error('Error inserting user to Supabase:', insertErr);
        // Fallback local save if database table is not initialized yet
        const localUser = { id: Date.now(), name, email, phone, role: 'customer' };
        saveUserSession(localUser, rememberMe);
        logActivity({ action: 'register', userId: localUser.id, userName: localUser.name });
        return { success: true, user: localUser };
      }

      const registeredUser = {
        id: insertedUser.id,
        name: insertedUser.name,
        email: insertedUser.email,
        phone: insertedUser.phone || phone,
        role: insertedUser.role,
      };

      saveUserSession(registeredUser, rememberMe);
      // Log live IP address & location data upon registration
      logActivity({ action: 'register', userId: registeredUser.id, userName: registeredUser.name });
      return { success: true, user: registeredUser };

    } catch (err) {
      console.error('Register process error:', err);
      return { success: false, error: 'Gagal mendaftarkan akun. Silakan coba lagi.' };
    }
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
    <AuthContext.Provider value={{ user, authLoading, login, register, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
