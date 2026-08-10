import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Captcha } from '../components/ui/Captcha';
import { Ship, AlertCircle, ArrowLeft, MailCheck } from 'lucide-react';

// Dedicated "Lupa Kata Sandi" page — separate from Login.jsx so the reset
// flow has its own URL (/forgot-password) and its own CAPTCHA challenge.
export function ForgotPassword() {
  const location = useLocation();
  const [resetEmail, setResetEmail] = useState(location.state?.email || '');
  const [view, setView] = useState('form'); // 'form' | 'check-email'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // CAPTCHA
  const captchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');

  const { requestPasswordReset } = useAuth();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Silakan selesaikan verifikasi CAPTCHA terlebih dahulu.');
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(resetEmail, captchaToken);
    setLoading(false);

    captchaRef.current?.resetCaptcha();
    setCaptchaToken('');

    if (result.success) {
      setView('check-email');
    } else {
      setError(result.error || 'Gagal meminta reset kata sandi.');
    }
  };

  const handleResendReset = async () => {
    if (!captchaToken) {
      setResendMsg('Silakan selesaikan verifikasi CAPTCHA terlebih dahulu.');
      return;
    }
    setResendMsg('');
    setResending(true);
    const result = await requestPasswordReset(resetEmail, captchaToken);
    setResending(false);

    captchaRef.current?.resetCaptcha();
    setCaptchaToken('');

    setResendMsg(result.success ? 'Link reset baru telah dikirim ke email Anda.' : (result.error || 'Gagal mengirim ulang link reset.'));
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
          {view === 'form' && (
            <>
              <Link to="/login" className="flex items-center gap-2 text-ocean-600 hover:text-ocean-900 mb-6 text-sm font-medium">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Masuk
              </Link>
              <h2 className="text-2xl font-bold text-ocean-900 mb-1">Lupa Kata Sandi?</h2>
              <p className="text-ocean-500 text-sm mb-8">Masukkan email yang terdaftar, kami akan mengirimkan link reset kata sandi.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-1.5">Email</label>
                  <Input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => { setResetEmail(e.target.value); setError(''); }}
                    placeholder="contoh@email.com"
                  />
                </div>

                {/* CAPTCHA */}
                <Captcha
                  ref={captchaRef}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken('')}
                />

                <Button type="submit" className="w-full h-12 text-base mt-2" disabled={loading}>
                  {loading ? 'Memproses...' : 'Kirim Link Reset'}
                </Button>
              </form>
            </>
          )}

          {view === 'check-email' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-ocean-100 flex items-center justify-center">
                  <MailCheck className="h-7 w-7 text-ocean-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-ocean-900 mb-1 text-center">Cek Email Anda</h2>
              <p className="text-ocean-500 text-sm mb-8 text-center">
                Kami telah mengirim link reset kata sandi ke <span className="font-semibold">{resetEmail}</span>.
                Klik link tersebut untuk membuat kata sandi baru.
              </p>

              {resendMsg && (
                <p className="text-sm text-center mb-4 text-ocean-600">{resendMsg}</p>
              )}

              <div className="space-y-4">
                {/* CAPTCHA (required again before a resend is allowed) */}
                <Captcha
                  ref={captchaRef}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken('')}
                />

                <Link to="/login">
                  <Button className="w-full h-12 text-base">
                    Kembali ke Halaman Masuk
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={handleResendReset}
                  disabled={resending}
                  className="w-full text-center text-sm font-semibold text-ocean-700 hover:text-ocean-900 hover:underline disabled:opacity-50"
                >
                  {resending ? 'Mengirim ulang...' : 'Tidak menerima email? Kirim ulang'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
