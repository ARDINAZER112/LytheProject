import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Store, Building2, MapPin, Phone, FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export function SellerRegister() {
  const { user } = useAuth();
  const { registerStore, getStoreForUser } = useData();
  const navigate = useNavigate();

  const existingStore = getStoreForUser(user?.id);

  const [formData, setFormData] = useState({
    store_name: existingStore?.store_name || '',
    description: existingStore?.description || '',
    address: existingStore?.address || '',
    phone: existingStore?.phone || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!user) {
      setError('Anda harus masuk (login) terlebih dahulu untuk mendaftar sebagai penjual.');
      return;
    }

    if (!formData.store_name.trim()) {
      setError('Nama toko wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerStore(formData);
      setLoading(false);

      if (res.success) {
        setSuccessMsg('Pendaftaran toko berhasil tersimpan! Akun Anda kini aktif sebagai Penjual.');
        setTimeout(() => {
          navigate('/seller/dashboard');
        }, 1500);
      } else {
        setError(res.error || 'Gagal menyukai pendaftaran toko.');
      }
    } catch (err) {
      setLoading(false);
      setError('Terjadi kesalahan saat pendaftaran toko: ' + err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-6">
        <Link to="/catalog" className="inline-flex items-center text-sm font-medium text-ocean-600 hover:text-ocean-800 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Pasar Nelayan
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-ocean-100 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-ocean-800 via-ocean-700 to-ocean-900 p-8 text-white relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <Store className="h-8 w-8 text-sand-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Formulir Pendaftaran Penjual</h1>
              <p className="text-ocean-200 text-sm">Buka toko Anda dan pasarkan hasil laut segar langsung ke konsumen.</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {!user ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-center">
              <AlertCircle className="h-10 w-10 mx-auto text-amber-500 mb-2" />
              <h3 className="text-lg font-bold mb-1">Silakan Masuk Terlebih Dahulu</h3>
              <p className="text-sm mb-4">Anda perlu memiliki akun dan masuk ke sistem untuk dapat mendaftarkan toko penjual.</p>
              <Link to="/login">
                <Button>Masuk ke Akun Anda</Button>
              </Link>
            </div>
          ) : user.role === 'seller' && existingStore ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-2" />
              <h3 className="text-xl font-bold mb-1">Toko Anda Sudah Terdaftar & Disetujui!</h3>
              <p className="text-sm text-emerald-700 mb-4">
                Nama Toko: <strong className="font-semibold">{existingStore.store_name}</strong>
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/seller/dashboard">
                  <Button variant="primary">Buka Dashboard Penjual</Button>
                </Link>
                <Link to="/catalog">
                  <Button variant="outline">Lihat Katalog Marketplace</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form fields */}
              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-ocean-500" />
                  Nama Toko / Usaha Penjual <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Cth: Toko Nelayan Bahari Pak Bambang"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="h-11"
                />
                <p className="text-xs text-ocean-400 mt-1">Nama ini akan ditampilkan pada katalog produk Anda.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-800 mb-1.5 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-ocean-500" />
                  Deskripsi Singkat Toko
                </label>
                <textarea
                  rows={3}
                  placeholder="Cth: Penyedia tangkapan ikan segar, udang, dan cumi langsung dari kapal nelayan pesisir Tuban."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-ocean-500" />
                    Alamat / Lokasi Usaha
                  </label>
                  <Input
                    placeholder="Cth: Jl. Pesisir Utara No. 12, Tuban"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-1.5 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-ocean-500" />
                    No. WhatsApp / Telepon Usaha
                  </label>
                  <Input
                    placeholder="Cth: 081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-ocean-100 flex items-center justify-end gap-3">
                <Link to="/catalog">
                  <Button type="button" variant="outline">Batal</Button>
                </Link>
                <Button type="submit" disabled={loading} className="px-6 h-11 text-base">
                  {loading ? 'Menyimpan & Menyetujui...' : 'Daftar & Minta Persetujuan Toko'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
