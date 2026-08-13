import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  ArrowRight, Anchor, TrendingUp, Users, Star, ShoppingCart, 
  Truck, CheckCircle, UserPlus, LogIn, LayoutDashboard, 
  Headphones, MessageSquare, Mail, Phone, Clock, LifeBuoy, Send, X, CheckCircle2
} from 'lucide-react';

// ── Stats counter data ──────────────────────────────────────
const stats = [
  { value: '240+',   label: 'Nelayan Bermitra' },
  { value: '10.000', label: 'kg Terjual / Bulan' },
  { value: '98%',    label: 'Kepuasan Pembeli' },
];

// ── Why choose us ───────────────────────────────────────────
const features = [
  { icon: Anchor,    title: 'Tangkapan Harian',   color: 'ocean', desc: 'Produk dari perahu ke tangan Anda di hari yang sama — tanpa cold-chain yang panjang.' },
  { icon: TrendingUp,title: 'Harga Adil',         color: 'sand',  desc: 'Memotong tengkulak sehingga nelayan lebih untung dan pembeli dapat harga lebih murah.' },
  { icon: Users,     title: 'UMKM Berdaya',       color: 'ocean', desc: 'Membantu istri nelayan memasarkan olahan terasi, ikan asap, dan kerupuk ke pasar digital.' },
];

// ── How it works ────────────────────────────────────────────
const steps = [
  { icon: ShoppingCart, step: '01', title: 'Pilih Produk',      desc: 'Masuk ke dashboard untuk menelusuri hasil laut segar dan olahan UMKM.' },
  { icon: CheckCircle,  step: '02', title: 'Konfirmasi Pesanan', desc: 'Sistem kami menghubungkan pesanan langsung ke nelayan atau pengolah terdekat.' },
  { icon: Truck,        step: '03', title: 'Kirim & Terima',    desc: 'Produk dikemas dan dikirim dalam hitungan jam — kesegaran terjamin.' },
];

// ── Testimonials ────────────────────────────────────────────
const testimonials = [
  { name: 'Pak Budi Santoso',   role: 'Pemilik Resto Laut Biru',     text: 'Sejak pakai JaringLokal, biaya belanja ikan turun 30% dan kesegaran lebih terjaga. Sangat membantu!', rating: 5 },
  { name: 'Ibu Sari Nelayan',   role: 'Pengrajin Terasi, Tuban',     text: 'Produk terasi saya kini bisa dijual ke seluruh kota. Pendapatan meningkat 2x lipat dari sebelumnya.', rating: 5 },
  { name: 'Chef Anisa Rahma',   role: 'Head Chef Hotel Grand Pesisir',text: 'Kualitas produk konsisten dan pengiriman selalu tepat waktu. Kami tidak pernah kecewa!', rating: 5 },
];

export function Home() {
  const { user } = useAuth();
  const { createTicket } = useData();
  const [showChatModal, setShowChatModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    category: 'Pertanyaan Umum',
    subject: '',
    message: ''
  });
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createTicket(ticketForm);
    setIsSubmitting(false);
    if (res?.success) {
      setSubmittedTicket(res.ticket);
    }
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setTicketForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      category: 'Pertanyaan Umum',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=2000"
            alt="Suasana laut nelayan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/75 via-ocean-900/65 to-ocean-900/85" />
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-20 fill-ocean-50">
            <path d="M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,80 L0,80 Z" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-sand-300 text-sm font-medium px-4 py-1.5 rounded-full border border-white/20 mb-8">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Platform Digital Hasil Laut & UMKM Pesisir
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Menghubungkan Laut{' '}
            <span className="text-sand-400">Langsung ke Meja Anda</span>
          </h1>
          <p className="text-lg md:text-xl text-ocean-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            JaringLokal memberdayakan nelayan dan UMKM pesisir dengan memotong jalur distribusi — menghadirkan hasil laut segar berkualitas premium, langsung dari perahu ke dapur Anda.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold h-14 px-8 bg-sand-500 hover:bg-sand-400 text-white border-none shadow-xl shadow-sand-900/30 flex items-center gap-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Buka Dashboard Pasar
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-base font-semibold h-14 px-8 bg-sand-500 hover:bg-sand-400 text-white border-none shadow-xl shadow-sand-900/30 flex items-center gap-2"
                  >
                    <LogIn className="h-5 w-5" />
                    Masuk ke Akun
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base font-semibold h-14 px-8 border-white/60 text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <UserPlus className="h-5 w-5" />
                    Daftar Akun Baru
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-ocean-600 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 stagger">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center animate-count-up">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-ocean-200 text-sm md:text-base">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY JARINGLOKAL ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sand-600 font-semibold text-sm uppercase tracking-wider mb-2">Keunggulan Kami</p>
            <h2 className="text-3xl md:text-4xl font-bold text-ocean-900 mb-4">Mengapa Memilih JaringLokal?</h2>
            <p className="text-ocean-600 max-w-2xl mx-auto">Kami membangun ekosistem digital untuk meningkatkan kesejahteraan masyarakat pesisir Tuban dan sekitarnya.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
            {features.map(({ icon: Icon, title, color, desc }) => (
              <div
                key={title}
                className="text-center p-8 rounded-2xl border border-ocean-100 card-hover animate-slide-up"
              >
                <div className={`w-16 h-16 bg-${color}-100 text-${color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-ocean-900 mb-3">{title}</h3>
                <p className="text-ocean-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-ocean-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-ocean-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-sand-400 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <p className="text-sand-400 font-semibold text-sm uppercase tracking-wider mb-2">Cara Kerja</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sangat Mudah Digunakan</h2>
            <p className="text-ocean-300 max-w-xl mx-auto">Dari tangkapan nelayan ke meja makan Anda hanya dalam 3 langkah sederhana.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-ocean-700 via-sand-500 to-ocean-700 z-0" />
            {steps.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative z-10 text-center">
                <div className="w-24 h-24 bg-ocean-800 rounded-full flex flex-col items-center justify-center mx-auto mb-6 border-2 border-ocean-700 shadow-lg shadow-ocean-900/50">
                  <Icon className="h-8 w-8 text-sand-400" />
                </div>
                <div className="text-sand-400 text-xs font-bold uppercase tracking-widest mb-2">Langkah {step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-ocean-300 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-ocean-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sand-600 font-semibold text-sm uppercase tracking-wider mb-2">Testimoni</p>
            <h2 className="text-3xl md:text-4xl font-bold text-ocean-900">Apa Kata Mereka?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="bg-white p-8 rounded-2xl border border-ocean-100 shadow-sm card-hover animate-slide-up">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-sand-400 text-sand-400" />
                  ))}
                </div>
                <p className="text-ocean-700 leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ocean-600 flex items-center justify-center text-white font-bold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-ocean-900 text-sm">{name}</div>
                    <div className="text-ocean-500 text-xs">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISITOR SUPPORT & LIVE ADMIN CHAT SECTION ── */}
      <section className="py-16 bg-white border-t border-b border-ocean-100">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <Headphones className="w-96 h-96 text-white" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 bg-sand-500/20 text-sand-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-sand-400/30">
                  <LifeBuoy className="h-4 w-4 text-sand-400" />
                  Pusat Layanan Bantuan & Dukungan Pengunjung
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  Butuh Bantuan, Kendala Akun, atau Pengaduan?
                </h2>
                <p className="text-ocean-200 text-base leading-relaxed max-w-xl">
                  Tim Administrator JaringLokal siap melayani pertanyaan Anda — termasuk kendala lupa password, bantuan pendaftaran toko, hingga pengaduan transaksi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-sm text-ocean-100">
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="p-2.5 bg-sand-500/20 rounded-xl text-sand-300">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-ocean-300">Hotline / WhatsApp</div>
                      <div className="font-bold text-white">+62 812-3456-7890</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="p-2.5 bg-ocean-500/20 rounded-xl text-ocean-300">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-ocean-300">Email Resmi Admin</div>
                      <div className="font-bold text-white">bantuan@jaringlokal.id</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-ocean-300">Jam Operasional</div>
                      <div className="font-bold text-white">08:00 - 20:00 WIB</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-300">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-ocean-300">Respon Balasan Admin</div>
                      <div className="font-bold text-white">Sistem Tiket Live Chat</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center lg:items-end space-y-4">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6 text-center w-full max-w-md shadow-xl">
                  <MessageSquare className="h-12 w-12 text-sand-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-xl font-bold text-white mb-1">Chat Langsung Administrator</h3>
                  <p className="text-xs text-ocean-200 mb-5">Kirimkan pertanyaan atau laporan Anda melalui metode tiket interaktif.</p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowChatModal(true)}
                      size="lg"
                      className="w-full bg-sand-500 hover:bg-sand-400 text-white font-bold h-12 text-sm shadow-lg shadow-sand-900/40 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat / Buat Tiket Dukungan
                    </Button>
                    <Link to="/support" className="block text-xs text-ocean-200 hover:text-white underline pt-1">
                      Lihat Daftar Tiket Saya yang Sudah Ada →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-gradient-to-r from-ocean-700 to-ocean-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Siap Memesan Hasil Laut Segar?</h2>
          <p className="text-ocean-100 mb-8 max-w-xl mx-auto">Daftar sekarang dan dapatkan akses ke produk dari nelayan & UMKM pengolah lokal Tuban.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-ocean-700 hover:bg-ocean-50 font-semibold h-14 px-8">
                  Buka Dashboard Pasar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-ocean-700 hover:bg-ocean-50 font-semibold h-14 px-8">
                    Daftar Akun Baru
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    Masuk ke Akun
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── LANDING PAGE LIVE SUPPORT CHAT MODAL ── */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-ocean-100 animate-slide-up relative">
            <div className="bg-ocean-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sand-500 rounded-xl text-white">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Chat Support Administrator</h3>
                  <p className="text-xs text-ocean-200">Layanan tiket pertanyaan & pengaduan pengunjung</p>
                </div>
              </div>
              <button
                onClick={() => { setShowChatModal(false); resetForm(); }}
                className="text-ocean-300 hover:text-white p-1 rounded-lg hover:bg-ocean-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {submittedTicket ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h4 className="text-xl font-bold text-ocean-900">Tiket Dukungan Terkirim!</h4>
                  <div className="bg-ocean-50 p-4 rounded-2xl border border-ocean-100 text-left text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-ocean-500">Kode Tiket:</span>
                      <span className="font-bold text-ocean-900 bg-sand-100 text-sand-800 px-2 py-0.5 rounded">{submittedTicket.ticket_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ocean-500">Kategori:</span>
                      <span className="font-semibold text-ocean-800">{submittedTicket.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ocean-500">Status:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">Terbuka</span>
                    </div>
                  </div>
                  <p className="text-xs text-ocean-600 leading-relaxed">
                    Tiket Anda telah masuk ke panel Admin. Anda dapat memantau percakapan dan balasan admin kapan saja di halaman Support.
                  </p>
                  <div className="pt-2 flex gap-3">
                    <Button
                      onClick={() => { setShowChatModal(false); resetForm(); }}
                      variant="outline"
                      className="flex-1"
                    >
                      Tutup
                    </Button>
                    <Link to="/support" className="flex-1">
                      <Button className="w-full bg-ocean-600">
                        Buka Portal Support →
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Nama Lengkap / Visitor</label>
                    <Input
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      placeholder="Masukkan nama Anda"
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ocean-700 mb-1">Email Kontak</label>
                      <Input
                        type="email"
                        required
                        value={ticketForm.email}
                        onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                        placeholder="email@contoh.com"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ocean-700 mb-1">No. WhatsApp / Telepon</label>
                      <Input
                        type="tel"
                        value={ticketForm.phone}
                        onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                        placeholder="0812..."
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Kategori Masalah / Pertanyaan</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full h-10 px-3 text-sm rounded-xl border border-ocean-200 bg-white text-ocean-900 font-medium focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                      <option value="Lupa Password / Reset Password">Lupa Password / Reset Password</option>
                      <option value="Kendala Transaksi & Pembayaran">Kendala Transaksi & Pembayaran</option>
                      <option value="Pengaduan Layanan & Produk">Pengaduan Layanan & Produk</option>
                      <option value="Pendaftaran Toko & Penjual">Pendaftaran Toko & Penjual</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Subjek Tiket</label>
                    <Input
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      placeholder="Contoh: Lupa password akun / Pertanyaan pengiriman"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Pesan / Detail Masalah</label>
                    <textarea
                      required
                      rows={3}
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      placeholder="Tuliskan pertanyaan atau kendala yang Anda alami secara detail..."
                      className="w-full p-3 text-sm rounded-xl border border-ocean-200 bg-white text-ocean-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-sm font-semibold bg-sand-500 hover:bg-sand-400 text-white flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Mengirim Tiket...' : 'Kirim Tiket Support ke Admin'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
