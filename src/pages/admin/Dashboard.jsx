import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Plus, ClipboardList, TrendingUp, ArrowLeft, Store } from 'lucide-react';

// Status badge config
const statusBadge = {
  'Selesai':             'bg-green-100 text-green-700',
  'Dikirim':             'bg-blue-100 text-blue-700',
  'Diproses':            'bg-purple-100 text-purple-700',
  'Dibatalkan':          'bg-red-100 text-red-700',
  'Menunggu Konfirmasi': 'bg-yellow-100 text-yellow-700',
};

// Generate last 7 days labels + revenue
function getLast7Days(orders) {
  const days = [];
  const safeOrders = orders || [];
  for (let i = 6; i >= 0; i--) {
    const d   = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    const rev = safeOrders
      .filter(o => o?.date && typeof o.date === 'string' && o.date.startsWith(dateStr) && (o.status === 'Selesai' || o.status === 'Pesanan Dikirim'))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    days.push({ key, rev });
  }
  return days;
}

export function Dashboard() {
  const { orders = [], products = [], stores = [] } = useData();

  const safeOrders   = orders || [];
  const safeProducts = products || [];
  const safeStores   = stores || [];
  const approvedStores = safeStores.filter(s => s.status === 'approved').length;

  const totalRevenue   = safeOrders.filter(o => o.status === 'Selesai' || o.status === 'Pesanan Dikirim').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const activeOrders   = safeOrders.filter(o => o.status !== 'Selesai' && o.status !== 'Dibatalkan').length;
  const totalOrders    = safeOrders.length;
  const lowStock       = safeProducts.filter(p => p.stock < 10).length;

  const chartDays  = getLast7Days(safeOrders);
  const maxRevenue = Math.max(...chartDays.map(d => d.rev), 1);

  // Top products by order frequency
  const productFreq = {};
  safeOrders.forEach(o => {
    (o?.items || []).forEach(item => {
      if (item?.name) {
        productFreq[item.name] = (productFreq[item.name] || 0) + (item.quantity || 1);
      }
    });
  });
  const topProducts = Object.entries(productFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ocean-900">Ringkasan Bisnis</h1>
          <p className="text-ocean-500 text-sm">Selamat datang kembali di Admin Panel JaringLokal.</p>
        </div>
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm bg-sand-500 hover:bg-sand-400 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Ke Dashboard Utama
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-sm bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Produk
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm bg-white border border-ocean-200 text-ocean-700 px-4 py-2 rounded-lg hover:bg-ocean-50 transition-colors font-medium"
          >
            <ClipboardList className="h-4 w-4" /> Lihat Pesanan
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          {
            title: 'Total Pendapatan', icon: DollarSign,
            value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
            sub: 'Dari pesanan selesai & dikirim', iconColor: 'text-green-500', bg: 'bg-green-50',
          },
          {
            title: 'Pesanan Aktif', icon: ShoppingBag,
            value: activeOrders,
            sub: `Dari total ${totalOrders} pesanan`, iconColor: 'text-blue-500', bg: 'bg-blue-50',
          },
          {
            title: 'Toko Mitra Aktif', icon: Store,
            value: approvedStores,
            sub: `Dari ${safeStores.length} total toko terdaftar`, iconColor: 'text-ocean-500', bg: 'bg-ocean-50',
          },
          {
            title: 'Stok Rendah', icon: AlertTriangle,
            value: lowStock,
            sub: 'Produk dengan stok < 10', iconColor: 'text-red-500', bg: 'bg-red-50',
          },
        ].map(({ title, icon: Icon, value, sub, iconColor, bg }) => (
          <Card key={title} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-ocean-600 mb-1">{title}</p>
                <div className="text-2xl font-bold text-ocean-900">{value}</div>
                <p className="text-xs text-ocean-400 mt-1">{sub}</p>
              </div>
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ocean-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-ocean-900">Pendapatan 7 Hari Terakhir</h2>
              <p className="text-xs text-ocean-400 mt-0.5">Berdasarkan pesanan Selesai & Dikirim</p>
            </div>
            <TrendingUp className="h-5 w-5 text-ocean-400" />
          </div>
          <div className="flex items-end gap-2 h-40">
            {chartDays.map(({ key, rev }) => {
              const pct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '120px' }}>
                    <div
                      className="w-full bg-ocean-600 rounded-t-md transition-all duration-500 hover:bg-ocean-500 cursor-default"
                      style={{ height: `${pct}%`, minHeight: pct > 0 ? '6px' : '2px' }}
                      title={`Rp ${rev.toLocaleString('id-ID')}`}
                    />
                    {rev > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] text-ocean-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-ocean-50 px-1 py-0.5 rounded">
                        {(rev / 1000).toFixed(0)}K
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-ocean-400 font-medium">{key}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-ocean-900 mb-5">Produk Terlaris</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map(([name, qty], idx) => {
                const maxQty = topProducts[0][1];
                const pct    = (qty / maxQty) * 100;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ocean-700 font-medium truncate mr-2">{idx + 1}. {name}</span>
                      <span className="text-ocean-500 flex-shrink-0">{qty} {products.find(p => p.name === name)?.unit || 'kg'}</span>
                    </div>
                    <div className="h-1.5 bg-ocean-100 rounded-full">
                      <div
                        className="h-full bg-sand-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-ocean-400 text-sm text-center py-8">Belum ada data penjualan.</p>
          )}
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-ocean-900">Pesanan Terbaru</h2>
          <Link to="/admin/orders" className="text-xs text-ocean-500 hover:text-ocean-700 font-medium">
            Lihat Semua →
          </Link>
        </div>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-ocean-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-700 font-bold text-sm flex-shrink-0">
                    {(order.userName || order.user_name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-ocean-900 text-sm">{order.userName || order.user_name || 'Pembeli'}</p>
                    <p className="text-xs text-ocean-400">
                      {new Date(order.date || order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {(order.items || []).length} item
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ocean-900 text-sm">Rp {Number(order.totalAmount || order.total_amount || 0).toLocaleString('id-ID')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ocean-400 text-sm text-center py-10">Belum ada pesanan masuk.</p>
        )}
      </div>
    </div>
  );
}
