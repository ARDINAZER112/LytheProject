import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Ship, ShoppingCart, User as UserIcon, LogOut, Menu, X, LayoutDashboard, Store, UserPlus } from 'lucide-react';

export function UserLayout() {
  const { user, logout } = useAuth();
  const { cart } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const cartCount = (cart || []).reduce((t, item) => t + (item?.quantity || 0), 0);

  const navLinks = (user && !isAuthPage) ? [
    { to: '/dashboard',  label: 'Dashboard Pasar',  end: false },
    { to: '/statistics', label: 'Statistik',        end: false },
    { to: '/contact',    label: 'Kontak Mitra',     end: false },
    { to: '/about',      label: 'Tentang Kami',     end: false },
  ] : [
    { to: '/',          label: 'Beranda',          end: true },
    { to: '/statistics', label: 'Statistik',        end: false },
    { to: '/contact',    label: 'Kontak Mitra',     end: false },
    { to: '/about',      label: 'Tentang Kami',     end: false },
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-ocean-600 font-semibold' : 'text-ocean-800 hover:text-ocean-500'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive ? 'bg-ocean-100 text-ocean-700' : 'text-ocean-700 hover:bg-ocean-50'
    }`;

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 w-full glass border-b border-ocean-100/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2 text-ocean-900">
            <Ship className="h-6 w-6 text-ocean-600" />
            <span className="text-xl font-bold tracking-tight">JaringLokal</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <Link
              to="/cart"
              onClick={handleCartClick}
              className="relative text-ocean-800 hover:text-ocean-500 transition-colors p-1"
              title={!user ? "Masuk untuk melihat keranjang" : "Keranjang Belanja"}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && user && (
                <span className="absolute -top-1 -right-1 bg-sand-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Seller Action Button */}
            {user?.role === 'seller' ? (
              <Link
                to="/seller/dashboard"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-sand-700 bg-sand-100 hover:bg-sand-200 border border-sand-300 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Store className="h-4 w-4 text-sand-600" />
                Toko Saya
              </Link>
            ) : (
              <Link
                to="/register-seller"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-ocean-700 bg-ocean-100 hover:bg-ocean-200 border border-ocean-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Store className="h-4 w-4 text-ocean-600" />
                Daftar Penjual
              </Link>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-xs font-medium text-ocean-500 bg-ocean-100 px-2 py-1 rounded-full hover:bg-ocean-200 transition-colors">
                    <LayoutDashboard className="h-3 w-3" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm font-medium text-ocean-700">
                  <div className="w-7 h-7 rounded-full bg-ocean-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:inline">{user?.name || 'Pengguna'}</span>
                  {user?.role === 'seller' && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Penjual</span>
                  )}
                </div>
                <button onClick={logout} className="text-ocean-400 hover:text-red-500 transition-colors" title="Keluar">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold border border-ocean-300 text-ocean-800 px-3.5 py-2 rounded-lg hover:bg-ocean-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-ocean-600 text-white px-3.5 py-2 rounded-lg hover:bg-ocean-700 transition-colors shadow-sm flex items-center gap-1"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-ocean-700 hover:bg-ocean-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-ocean-100 px-4 pb-4 animate-slide-down">
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 pt-3 border-t border-ocean-100 space-y-2">
              {user?.role === 'seller' ? (
                <Link
                  to="/seller/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sand-800 bg-sand-100 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <Store className="h-4 w-4 text-sand-600" />
                  Dashboard Toko Saya
                </Link>
              ) : (
                <Link
                  to="/register-seller"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ocean-700 bg-ocean-100 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <Store className="h-4 w-4 text-ocean-600" />
                  Buka Toko / Daftar Penjual
                </Link>
              )}

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-ocean-700">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.name}</span>
                    <span className="text-xs text-ocean-400">({user.role})</span>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ocean-600 hover:bg-ocean-50 rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 text-center bg-ocean-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center border border-ocean-300 text-ocean-700 py-2 rounded-lg text-sm font-medium hover:bg-ocean-50 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-ocean-900 text-ocean-50 pt-14 pb-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Ship className="h-6 w-6 text-sand-400" />
              <span className="text-xl font-bold">JaringLokal</span>
            </div>
            <p className="text-ocean-300 text-sm leading-relaxed max-w-xs">
              Memutus rantai distribusi yang panjang, memberdayakan UMKM pesisir, dan menghadirkan hasil laut segar langsung ke tangan Anda.
            </p>
            <div className="flex gap-3 mt-5">
              {['FB', 'IG', 'WA'].map(s => (
                <span key={s} className="w-9 h-9 rounded-full bg-ocean-800 flex items-center justify-center text-xs font-bold text-ocean-300 hover:bg-ocean-700 cursor-pointer transition-colors">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sand-400 text-sm uppercase tracking-wider">Tautan</h4>
            <ul className="space-y-2 text-sm text-ocean-300">
              {navLinks.map(({ to, label }) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sand-400 text-sm uppercase tracking-wider">Kontak</h4>
            <ul className="space-y-2 text-sm text-ocean-300">
              <li>Jl. Pesisir Utara No.45, Tuban</li>
              <li>halo@jaringlokal.id</li>
              <li>+62 812 3456 7890</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-10 pt-6 border-t border-ocean-800 text-xs text-ocean-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} JaringLokal. WDC 2026 Prototype.</span>
          <span>Dibuat dengan ❤ untuk UMKM Pesisir Indonesia</span>
        </div>
      </footer>
    </div>
  );
}
