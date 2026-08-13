import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Store, Building2, MapPin, Phone, FileText, CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export function SellerRegister() {
  const { user } = useAuth();
  const { registerStore, getStoreForUser } = useData();
  const navigate = useNavigate();

  const existingStore = getStoreForUser(user?.id);

  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    address: '',
    phone: user?.phone || '',
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
        setSuccessMsg('Pendaftaran toko berhasil dikirim! Permohonan Anda kini menunggu persetujuan dari Admin.');
      } else {
        setError(res.error || 'Gagal mengirimkan pendaftaran toko.');
      }
    } catch (err) {
      setLoading(false);
      setError('Terjadi kesalahan saat pendaftaran toko: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Disetujui (Approved)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="h-4 w-4 text-red-600" />
            Ditolak (Rejected)
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="h-4 w-4 text-amber-600" />
            Menunggu Persetujuan Admin (Pending)
          </span>
        );
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
              <h1 className="text-2xl md:text-3xl font-extrabold">Pendaftaran & Status Toko Penjual</h1>
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
          ) : existingStore ? (
            <div className="space-y-6">
              {/* Status Header Alert */}
              {existingStore.status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-2xl">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-6 w-6 text-amber-600 flex-shrink-0" />
                      <h3 className="text-lg font-bold">Permohonan Toko Sedang Ditinjau</h3>
                    </div>
                    {getStatusBadge(existingStore.status)}
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed mb-4">
                    Permohonan pendaftaran toko Anda telah tersimpan dan sedang menunggu peninjauan serta persetujuan dari administrator sistem. Setelah disetujui, Anda akan mendapatkan hak akses penuh untuk menjual produk di marketplace.
                  </p>
                  <div className="p-3 bg-amber-100/60 rounded-xl text-xs text-amber-800 font-medium">
                    Catatan: Selama permohonan masih dalam status diproses (pending), Anda tidak dapat mengajukan pendaftaran baru.
                  </div>
                </div>
              )}

              {existingStore.status === 'approved' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-2xl text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-2" />
                  <div className="mb-2">{getStatusBadge(existingStore.status)}</div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-1">Selamat! Toko Anda Telah Disetujui</h3>
                  <p className="text-sm text-emerald-700 mb-6">
                    Aplikasi pendaftaran toko Anda telah diverifikasi dan disetujui oleh admin. Anda sekarang memiliki akses penuh untuk berjualan.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link to="/seller/dashboard">
                      <Button variant="primary" className="px-6">Buka Dashboard Penjual</Button>
                    </Link>
                    <Link to="/catalog">
                      <Button variant="outline">Lihat Katalog Marketplace</Button>
                    </Link>
                  </div>
                </div>
              )}

              {existingStore.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 text-red-900 p-6 rounded-2xl">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                      <h3 className="text-lg font-bold">Permohonan Toko Ditolak</h3>
                    </div>
                    {getStatusBadge(existingStore.status)}
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed mb-4">
                    Mohon maaf, permohonan pendaftaran toko Anda belum dapat disetujui oleh Administrator saat ini. Silakan hubungi tim dukungan kami untuk informasi lebih lanjut.
                  </p>
                  <Link to="/contact">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                      Hubungi Tim Layanan Mitra
                    </Button>
                  </Link>
                </div>
              )}

              {/* Application Details Summary */}
              <div className="bg-ocean-50/70 border border-ocean-100 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-ocean-900 uppercase tracking-wider border-b border-ocean-100 pb-2">
                  Detail Permohonan Pendaftaran Toko
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-ocean-500 block text-xs">Nama Toko</span>
                    <span className="font-semibold text-ocean-900">{existingStore.store_name}</span>
                  </div>
                  <div>
                    <span className="text-ocean-500 block text-xs">Status Saat Ini</span>
                    <span className="font-semibold capitalize text-ocean-900">{existingStore.status}</span>
                  </div>
                  <div>
                    <span className="text-ocean-500 block text-xs">No. WhatsApp / Telepon Usaha</span>
                    <span className="font-semibold text-ocean-900">{existingStore.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-ocean-500 block text-xs">Alamat Toko</span>
                    <span className="font-semibold text-ocean-900">{existingStore.address || '-'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-ocean-500 block text-xs">Deskripsi Toko</span>
                    <span className="text-ocean-800">{existingStore.description || '-'}</span>
                  </div>
                </div>
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

              <div className="p-4 bg-ocean-50 border border-ocean-100 rounded-xl text-xs text-ocean-600 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-ocean-500 flex-shrink-0 mt-0.5" />
                <span>
                  Setelah mengajukan formulir, permohonan Anda akan disetujui secara manual oleh Admin (status: Pending). Akses berjualan akan aktif setelah mendapat persetujuan admin.
                </span>
              </div>

              <div className="pt-4 border-t border-ocean-100 flex items-center justify-end gap-3">
                <Link to="/catalog">
                  <Button type="button" variant="outline">Batal</Button>
                </Link>
                <Button type="submit" disabled={loading} className="px-6 h-11 text-base">
                  {loading ? 'Mengirimkan Permohonan...' : 'Kirim Permohonan Pendaftaran Toko'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
