import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ClipboardList, LogOut, Ship, Store, Headphones, ArrowLeft } from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard Admin', path: '/admin', icon: LayoutDashboard },
    { name: 'Persetujuan Toko', path: '/admin/stores', icon: Store },
    { name: 'Daftar Produk', path: '/admin/products', icon: Package },
    { name: 'Daftar Transaksi', path: '/admin/orders', icon: ClipboardList },
    { name: 'Tiket Dukungan', path: '/admin/tickets', icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-ocean-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ocean-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-ocean-800">
          <div className="flex items-center">
            <Ship className="h-6 w-6 text-sand-400 mr-2" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
        </div>
        <div className="px-3 pt-4">
          <Link
            to="/dashboard"
            className="flex items-center px-3 py-2.5 rounded-xl bg-sand-500 hover:bg-sand-400 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard Utama
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-ocean-800 text-white font-semibold' 
                    : 'text-ocean-200 hover:bg-ocean-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-ocean-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-ocean-700 flex items-center justify-center mr-3">
              <span className="text-sm font-semibold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-ocean-300">Administrator</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-ocean-200 hover:text-red-400 hover:bg-ocean-800 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-ocean-100 flex items-center justify-between px-4">
          <div className="flex items-center text-ocean-900">
            <Ship className="h-6 w-6 mr-2 text-ocean-600" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-xs font-semibold text-ocean-800 bg-sand-100 hover:bg-sand-200 px-2.5 py-1.5 rounded-lg border border-sand-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Pasar
            </Link>
            <button onClick={logout} className="text-ocean-500 hover:text-red-500 p-1">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
