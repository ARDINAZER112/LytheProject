import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Captcha } from '../components/ui/Captcha';
import { Ship, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';

export function ResetPassword() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'ready' | 'invalid'
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cloudflare Turnstile — gate manusia sebelum password disimpan.
  // Supabase updateUser() tidak menerima captchaToken, jadi ini adalah
  // client-side enforcement: form tidak bisa disubmit tanpa Turnstile lulus.
  const captchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ketika user klik link reset di email, Supabase mendeteksi recovery token
    // di URL dan menembakkan event PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready');
      }
    });

    // Fallback: jika event sudah terjadi sebelum listener dipasang
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus('ready');
    });

    // Jika tidak ada konfirmasi session valid dalam 4 detik → link expired
    const timeout = setTimeout(() => {
      setStatus((current) => (current === 'checking' ? 'invalid' : current));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }
    if (!captchaToken) {
      setError('Silakan selesaikan verifikasi CAPTCHA terlebih dahulu.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(newPassword);
    setLoading(false);

    captchaRef.current?.resetCaptcha();
    setCaptchaToken('');

    if (result.success) {
      await supabase.auth.signOut();
      navigate('/login', { state: { resetSuccess: true } });
    } else {
      setError(result.error || 'Gagal memperbarui kata sandi.');
    }
  };

  return (
    <div className="flex-1 flex my-6 max-w-md mx-auto w-full items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-ocean-900">
            <Ship className="h-8 w-8 text-ocean-600" />
            <span className="text-2xl font-extrabold">JaringLokal</span>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-ocean-100 animate-slide-up">
          {status === 'checking' && (
            <div className="text-center py-6">
              <svg className="animate-spin h-8 w-8 text-ocean-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-ocean-500 text-sm">Memeriksa link reset kata sandi...</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-ocean-900 mb-1">Link Tidak Valid</h2>
              <p className="text-ocean-500 text-sm mb-8">
                Link reset kata sandi ini tidak valid atau sudah kedaluwarsa. Silakan minta link baru.
              </p>
              <Link to="/forgot-password">
                <Button className="w-full h-12 text-base">Minta Link Reset Baru</Button>
              </Link>
            </div>
          )}

          {status === 'ready' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-ocean-100 flex items-center justify-center">
                  <KeyRound className="h-7 w-7 text-ocean-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-ocean-900 mb-1 text-center">Buat Kata Sandi Baru</h2>
              <p className="text-ocean-500 text-sm mb-8 text-center">Buat kata sandi baru untuk akun Anda.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-1.5">Kata Sandi Baru</label>
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                      placeholder="Min. 6 karakter"
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
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-1.5">Konfirmasi Kata Sandi</label>
                  <Input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Ulangi kata sandi baru"
                    className={confirm && confirm !== newPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {confirm && confirm !== newPassword && (
                    <p className="text-red-500 text-xs mt-1">Kata sandi tidak cocok</p>
                  )}
                </div>

                {/* Cloudflare Turnstile — verifikasi manusia sebelum simpan password */}
                <Captcha
                  ref={captchaRef}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken('')}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base mt-2"
                  disabled={loading || !captchaToken}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
