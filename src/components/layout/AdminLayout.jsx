import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ClipboardList, LogOut, Ship } from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Daftar Produk', path: '/admin/products', icon: Package },
    { name: 'Daftar Transaksi', path: '/admin/orders', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-ocean-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ocean-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-ocean-800">
          <Ship className="h-6 w-6 text-sand-400 mr-2" />
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-ocean-800 text-white' 
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
            <Ship className="h-6 w-6 mr-2" />
            <span className="font-bold">Admin Panel</span>
          </div>
          <button onClick={logout} className="text-ocean-500 hover:text-red-500">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
