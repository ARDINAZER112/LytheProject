import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { ArrowRight, Anchor, TrendingUp, Users, Star, ShoppingCart, Truck, CheckCircle, UserPlus, LogIn, LayoutDashboard } from 'lucide-react';

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
    </div>
  );
}
