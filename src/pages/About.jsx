import { Link } from 'react-router-dom';
import { Target, Lightbulb, Heart, ArrowRight } from 'lucide-react';

const impactStats = [
  { value: '240+', label: 'Nelayan & UMKM Bermitra' },
  { value: '12',   label: 'Desa Pesisir Terjangkau' },
  { value: '30%',  label: 'Kenaikan Pendapatan Nelayan' },
  { value: '2x',   label: 'Lebih Cepat dari Distribusi Konvensional' },
];

const missionPoints = [
  { icon: Target,    title: 'Mempersingkat Rantai Pasok', desc: 'Menghilangkan 3–5 lapisan perantara sehingga harga lebih adil untuk nelayan dan pembeli.' },
  { icon: Lightbulb, title: 'Digitalisasi UMKM Pesisir',  desc: 'Mengubah catatan buku menjadi sistem CRUDS digital — pencatatan stok harian menjadi akurat dan real-time.' },
  { icon: Heart,     title: 'Berdampak Sosial Nyata',     desc: 'Memberdayakan perempuan pesisir (pengrajin terasi & ikan asap) dengan pasar yang jauh lebih luas.' },
];

const team = [
  { name: 'Ardinazer',      role: 'Product Designer & Frontend', initials: 'AR', color: 'bg-ocean-600' },
  { name: 'Tim Developer',  role: 'Backend & System Architecture',initials: 'TD', color: 'bg-sand-500' },
  { name: 'Mitra Nelayan',  role: 'Community Advisor',           initials: 'MN', color: 'bg-ocean-400' },
];

const timeline = [
  { year: '2024', event: 'Riset lapangan: wawancara 50 nelayan dan 20 pembeli di pesisir Tuban.' },
  { year: '2025', event: 'Desain sistem distribusi digital & prototype awal diuji bersama UMKM lokal.' },
  { year: '2026', event: 'Peluncuran JaringLokal di WDC 2026 dengan tema "UMKM GOES DIGITAL".' },
];

export function About() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative bg-ocean-900 text-white py-28 px-4 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516108139536-bc21fbcc1013?auto=format&fit=crop&q=80&w=1600"
            alt="Nelayan di laut"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/80 to-ocean-900" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <p className="text-sand-400 font-semibold text-sm uppercase tracking-wider mb-4">WDC 2026 · UMKM GOES DIGITAL</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Tentang <span className="text-sand-400">JaringLokal</span>
          </h1>
          <p className="text-xl text-ocean-200 leading-relaxed">
            Platform distribusi digital hasil laut yang diciptakan untuk memutus rantai pasok panjang dan memberdayakan ekonomi masyarakat pesisir Indonesia.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 fill-ocean-50">
            <path d="M0,30 C300,60 900,0 1200,30 L1200,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="py-16 bg-ocean-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger">
            {impactStats.map(({ value, label }) => (
              <div key={label} className="text-center p-6 bg-white rounded-2xl border border-ocean-100 shadow-sm card-hover animate-slide-up">
                <div className="text-4xl font-extrabold text-ocean-600 mb-2">{value}</div>
                <div className="text-ocean-600 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION & STORY ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1516108139536-bc21fbcc1013?auto=format&fit=crop&q=80&w=800"
                alt="Nelayan lokal bekerja"
                className="rounded-2xl shadow-xl w-full h-[420px] object-cover"
              />
            </div>
            <div>
              <p className="text-sand-600 font-semibold text-sm uppercase tracking-wider mb-3">Kisah Kami</p>
              <h2 className="text-3xl md:text-4xl font-bold text-ocean-900 mb-6">Lahir dari Kepedulian Nyata</h2>
              <div className="space-y-5 text-ocean-700 leading-relaxed">
                <p>
                  Tema <strong>"UMKM GOES DIGITAL"</strong> pada WDC 2026 menjadi inspirasi lahirnya JaringLokal. Selama ini, nelayan dan pembuat olahan hasil laut pesisir Tuban terpaksa menjual produk mereka ke tengkulak dengan harga sangat murah.
                </p>
                <p>
                  Di sisi lain, konsumen restoran maupun rumah tangga membayar harga tinggi untuk hasil laut yang sudah melewati 3–5 lapisan perantara, menurun kesegarannya, dan menyusut kualitasnya.
                </p>
                <p>
                  JaringLokal hadir sebagai jembatan digital: <strong>dari perahu langsung ke meja Anda</strong> — dengan sistem manajemen stok real-time, transaksi transparan, dan pengiriman yang terstruktur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION POINTS ── */}
      <section className="py-20 bg-ocean-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sand-600 font-semibold text-sm uppercase tracking-wider mb-3">Pilar Misi</p>
            <h2 className="text-3xl md:text-4xl font-bold text-ocean-900">Tiga Misi Utama Kami</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
            {missionPoints.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-8 rounded-2xl border border-ocean-100 shadow-sm card-hover animate-slide-up">
                <div className="w-14 h-14 bg-ocean-100 rounded-2xl flex items-center justify-center mb-5 text-ocean-600">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-ocean-900 mb-3">{title}</h3>
                <p className="text-ocean-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-20 bg-ocean-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-sand-400 font-semibold text-sm uppercase tracking-wider mb-3">Perjalanan</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Dari Riset ke Produk</h2>
          </div>
          <div className="space-y-0">
            {timeline.map(({ year, event }, idx) => (
              <div key={year} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-sand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                    {year.slice(2)}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 bg-ocean-700 flex-1 my-2" style={{ minHeight: '3rem' }} />
                  )}
                </div>
                <div className="pb-10">
                  <div className="text-sand-400 font-bold text-sm mb-1">{year}</div>
                  <p className="text-ocean-200 leading-relaxed">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sand-600 font-semibold text-sm uppercase tracking-wider mb-3">Tim Kami</p>
            <h2 className="text-3xl md:text-4xl font-bold text-ocean-900">Di Balik JaringLokal</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8 stagger">
            {team.map(({ name, role, initials, color }) => (
              <div key={name} className="text-center animate-slide-up">
                <div className={`w-24 h-24 rounded-full ${color} flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg`}>
                  {initials}
                </div>
                <div className="font-semibold text-ocean-900">{name}</div>
                <div className="text-ocean-500 text-sm mt-1">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-gradient-to-r from-ocean-700 to-ocean-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bergabunglah dengan Gerakan Ini</h2>
          <p className="text-ocean-100 mb-8 max-w-lg mx-auto">Apakah Anda nelayan, pengolah hasil laut, atau pembeli — ada tempat untuk Anda di JaringLokal.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-ocean-700 font-semibold px-8 py-3 rounded-xl hover:bg-ocean-50 transition-colors shadow-lg"
          >
            Mulai Sekarang <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
