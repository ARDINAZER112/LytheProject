import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Ship, Eye, EyeOff, AlertCircle, CheckCircle, Phone } from 'lucide-react';

export function Register() {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();
  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6)  return { level: 'Lemah',  color: 'bg-red-400',    width: 'w-1/3' };
    if (password.length < 10) return { level: 'Sedang', color: 'bg-sand-400',   width: 'w-2/3' };
    return                          { level: 'Kuat',   color: 'bg-green-500',   width: 'w-full' };
  };
  const strength = passwordStrength();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    const result = await register(name, email, password, phone);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Gagal mendaftar. Silakan coba lagi.');
    }
  }, [name, email, password, confirm, phone, register, navigate]);

  return (
    <div className="flex-1 flex my-6 max-w-6xl mx-auto w-full rounded-3xl overflow-hidden border border-ocean-100 shadow-sm min-h-[calc(100vh-12rem)]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1200"
          alt="Produk laut segar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-900/80 via-ocean-800/70 to-sand-800/50" />
        <div className="absolute inset-0 flex flex-col justify-center items-start p-16 text-white z-10">
          <div className="flex items-center gap-3 mb-10">
            <Ship className="h-10 w-10 text-sand-400" />
            <span className="text-3xl font-extrabold">JaringLokal</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Bergabung<br />Bersama Kami!</h2>
          <p className="text-ocean-200 text-lg leading-relaxed max-w-sm">
            Daftarkan diri dan dapatkan akses ke hasil laut segar dari ratusan nelayan lokal setiap harinya.
          </p>
          <div className="mt-10 space-y-4">
            {[
              'Akses katalog produk segar harian',
              'Harga langsung dari nelayan',
              'Pengiriman cepat ke lokasi Anda',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-ocean-100">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
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
            <h2 className="text-2xl font-bold text-ocean-900 mb-1">Buat Akun Baru</h2>
            <p className="text-ocean-500 text-sm mb-8">Isi formulir di bawah untuk bergabung.</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1.5">Nama Lengkap</label>
                <Input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Budi Santoso" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1.5">Email</label>
                <Input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="budi@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-ocean-500" />
                  No. Handphone / WhatsApp
                </label>
                <Input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="081234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Min. 6 karakter"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 hover:text-ocean-700">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-ocean-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className="text-xs text-ocean-500 mt-1">Kekuatan: <span className="font-medium">{strength.level}</span></p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1.5">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Input
                    type={showConf ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Ulangi kata sandi"
                    className={`pr-10 ${confirm && confirm !== password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 hover:text-ocean-700">
                    {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p className="text-red-500 text-xs mt-1">Kata sandi tidak cocok</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Mendaftarkan...
                  </span>
                ) : 'Daftar Sekarang'}
              </Button>


            </form>

            <div className="mt-6 text-center text-sm text-ocean-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-ocean-700 hover:text-ocean-900 underline underline-offset-2">
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
