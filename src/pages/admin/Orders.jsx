import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, ChevronDown, ChevronUp, Package, MessageSquare, ShieldCheck } from 'lucide-react';

const STATUS_OPTIONS = ['Menunggu Pembayaran Escrow', 'Dana Ditahan di Escrow Admin', 'Pesanan Dikirim', 'Selesai', 'Dibatalkan'];
const ALL_TABS       = ['Semua', 'Aktif', 'Selesai', 'Dibatalkan'];

const statusBadge = {
  'Selesai':                      'bg-green-100 text-green-700',
  'Pesanan Dikirim':              'bg-blue-100 text-blue-700',
  'Dikirim':                      'bg-blue-100 text-blue-700',
  'Dana Ditahan di Escrow Admin': 'bg-emerald-100 text-emerald-800 font-bold',
  'Diproses':                     'bg-purple-100 text-purple-700',
  'Dibatalkan':                   'bg-red-100 text-red-700',
  'Dibatalkan (Refund)':          'bg-red-100 text-red-700',
  'Menunggu Pembayaran Escrow':   'bg-yellow-100 text-yellow-800',
  'Menunggu Konfirmasi':          'bg-yellow-100 text-yellow-700',
};

const tabFilter = {
  'Semua':     () => true,
  'Aktif':     o => o.status !== 'Selesai' && o.status !== 'Dibatalkan' && o.status !== 'Dibatalkan (Refund)',
  'Selesai':   o => o.status === 'Selesai',
  'Dibatalkan':o => o.status === 'Dibatalkan' || o.status === 'Dibatalkan (Refund)',
};

export function Orders() {
  const { orders, updateOrderStatus } = useData();
  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState('Semua');
  const [expanded,  setExpanded]  = useState(null); // order id

  const filtered = orders
    .filter(tabFilter[activeTab])
    .filter(o =>
      (o.userName || o.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search) ||
      (o.store_name || '').toLowerCase().includes(search.toLowerCase())
    );

  const tabCounts = {
    'Semua':     orders.length,
    'Aktif':     orders.filter(tabFilter['Aktif']).length,
    'Selesai':   orders.filter(tabFilter['Selesai']).length,
    'Dibatalkan':orders.filter(tabFilter['Dibatalkan']).length,
  };

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ocean-900 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-ocean-600" />
          Daftar Transaksi &amp; Escrow Rekening Bersama
        </h1>
        <p className="text-ocean-500 text-sm mt-0.5">Kelola pesanan masuk, pantau status dana rekening bersama, dan mediasi ruang chat transaksi.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {ALL_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-ocean-600 text-white shadow-sm'
                : 'bg-white border border-ocean-200 text-ocean-600 hover:bg-ocean-50'
            }`}
          >
            {tab}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-ocean-500 text-white' : 'bg-ocean-100 text-ocean-600'}`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
        <Input
          placeholder="Cari nama pelanggan, toko, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>ID Pesanan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Toko</TableHead>
              <TableHead>Total (Rp)</TableHead>
              <TableHead>Status Escrow</TableHead>
              <TableHead className="text-right">Aksi &amp; Chat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map(order => (
                <>
                  {/* ── Main row ── */}
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <TableCell>
                      <button className="text-ocean-400 hover:text-ocean-700 transition-colors">
                        {expanded === order.id
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="font-mono font-medium text-ocean-700">
                      #{order.id.toString().slice(-6)}
                    </TableCell>
                    <TableCell className="text-sm text-ocean-600">
                      {new Date(order.date || order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-700 font-bold text-xs flex-shrink-0">
                          {(order.userName || order.user_name || 'U').charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-ocean-900">{order.userName || order.user_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-ocean-700 font-medium">
                      {order.store_name || 'Toko Mitra Nelayan'}
                    </TableCell>
                    <TableCell className="font-semibold text-ocean-900">
                      {Number(order.totalAmount || order.total_amount).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()} className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/order-chat/${order.id}`}>
                          <Button size="sm" className="h-8 text-xs bg-ocean-600 hover:bg-ocean-700 text-white flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat Escrow
                          </Button>
                        </Link>
                        <select
                          className="text-xs border border-ocean-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-ocean-500 text-ocean-700"
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* ── Expanded detail ── */}
                  {expanded === order.id && (
                    <TableRow key={`${order.id}-detail`}>
                      <TableCell colSpan={8} className="bg-ocean-50/60 py-0">
                        <div className="py-4 px-6 animate-slide-down">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-semibold text-ocean-600 uppercase tracking-wider">Rincian Item Pesanan</p>
                            <Link to={`/order-chat/${order.id}`}>
                              <span className="text-xs text-ocean-600 hover:text-ocean-800 font-bold flex items-center gap-1 underline">
                                <MessageSquare className="h-3.5 w-3.5 text-ocean-500" />
                                Buka Ruang Chat Transaksi 3 Pihak (Escrow Room) →
                              </span>
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-ocean-100">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-ocean-900 truncate">{item.name}</p>
                                  <p className="text-xs text-ocean-400">{item.quantity} {item.unit || 'kg'} × Rp {Number(item.price).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-sm font-bold text-ocean-800 flex-shrink-0">
                                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-ocean-100">
                            <span className="text-xs text-ocean-500">
                              Status Rekening Bersama: <strong className="text-ocean-800">{order.escrow_status || 'pending_payment'}</strong>
                            </span>
                            <div className="text-sm font-bold text-ocean-900">
                              Total: Rp {Number(order.totalAmount || order.total_amount).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="text-center py-12 flex flex-col items-center">
                    <Package className="h-12 w-12 text-ocean-200 mb-3" />
                    <p className="text-ocean-500 font-medium">Tidak ada pesanan ditemukan</p>
                    <p className="text-ocean-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-ocean-400 text-center mt-4">
          Menampilkan {filtered.length} dari {orders.length} pesanan · Klik baris untuk melihat detail
        </p>
      )}
    </div>
  );
}
