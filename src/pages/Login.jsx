import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useRecaptchaV3 } from '../components/ui/RecaptchaV3Provider';
import { Ship, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail]       = useState(() => localStorage.getItem('jaringlokal_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const { executeRecaptcha } = useRecaptchaV3();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // reCAPTCHA v3 — invisible, tidak perlu interaksi user
    let recaptchaToken = '';
    if (executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha('login');
      } catch {
        // reCAPTCHA gagal → tetap lanjut login (jangan blokir UX)
        console.warn('[Login] reCAPTCHA v3 gagal dieksekusi');
      }
    }

    const result = await login(email, password, rememberMe, recaptchaToken);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else if (result.user?.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Email atau kata sandi salah. Silakan coba lagi.');
    }
  }, [email, password, rememberMe, login, navigate, executeRecaptcha]);

  return (
    <div className="flex-1 flex my-6 max-w-6xl mx-auto w-full rounded-3xl overflow-hidden border border-ocean-100 shadow-sm min-h-[calc(100vh-12rem)]">
      {/* Left — Ocean illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200"
          alt="Suasana laut"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-900/80 via-ocean-800/70 to-ocean-600/60" />
        <div className="absolute inset-0 flex flex-col justify-center items-start p-16 text-white z-10">
          <div className="flex items-center gap-3 mb-10">
            <Ship className="h-10 w-10 text-sand-400" />
            <span className="text-3xl font-extrabold">JaringLokal</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Selamat Datang<br />Kembali!
          </h2>
          <p className="text-ocean-200 text-lg leading-relaxed max-w-sm">
            Masuk untuk melanjutkan berbelanja hasil laut segar langsung dari nelayan pesisir Tuban.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center bg-ocean-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-ocean-900">
              <Ship className="h-8 w-8 text-ocean-600" />
              <span className="text-2xl font-extrabold">JaringLokal</span>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-ocean-100 animate-slide-up">
            <h2 className="text-2xl font-bold text-ocean-900 mb-1">Masuk ke Akun</h2>
            <p className="text-ocean-500 text-sm mb-8">Masukkan email dan kata sandi Anda.</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1.5">Email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="contoh@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 hover:text-ocean-700"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-ocean-700 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-ocean-600 rounded border-ocean-300 focus:ring-ocean-500 cursor-pointer"
                  />
                  <span>Ingat Saya</span>
                </label>
                <Link
                  to={`/forgot-password`}
                  state={{ email }}
                  className="font-medium text-ocean-600 hover:text-ocean-900 hover:underline text-xs sm:text-sm"
                >
                  Lupa Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memproses...
                  </span>
                ) : 'Masuk'}
              </Button>

              {/* reCAPTCHA v3 badge notice */}
              <p className="text-[10px] text-ocean-400 text-center leading-relaxed">
                Dilindungi oleh{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-ocean-600"
                >
                  reCAPTCHA v3
                </a>
                {' '}dari Google.
              </p>
            </form>

            <div className="mt-6 pt-4 border-t border-ocean-100 flex flex-col gap-2 text-center text-sm text-ocean-600">
              <div>
                Belum punya akun?{' '}
                <Link to="/register" className="font-semibold text-ocean-700 hover:text-ocean-900 underline underline-offset-2">
                  Daftar Sekarang
                </Link>
              </div>
              <div className="text-xs text-ocean-500 mt-1">
                Mengalami masalah lain?{' '}
                <Link to="/support" className="font-semibold text-sand-700 hover:text-sand-900 underline">
                  Pusat Bantuan &amp; Tiket Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
