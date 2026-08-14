import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Store, CheckCircle2, XCircle, Clock, Search, ShieldCheck, Phone, MapPin, Building2 } from 'lucide-react';

export function Stores() {
  const { stores = [], updateStoreStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || store.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = stores.filter(s => s.status === 'pending').length;
  const approvedCount = stores.filter(s => s.status === 'approved').length;
  const rejectedCount = stores.filter(s => s.status === 'rejected').length;

  const handleApprove = async (storeId, storeName) => {
    const target = stores.find(s => s.id === storeId);
    if (target?.status === 'rejected') {
      alert(`Permohonan toko "${storeName}" telah berstatus Ditolak (Rejected). Status yang telah ditolak tidak dapat diubah menjadi disetujui secara langsung. Pengguna harus mengajukan pendaftaran baru.`);
      return;
    }
    if (window.confirm(`Setujui permohonan toko "${storeName}"? Pengguna akan diberikan hak akses penjual.`)) {
      const res = await updateStoreStatus(storeId, 'approved');
      if (res && res.error) {
        alert(res.error);
      }
    }
  };

  const handleReject = async (storeId, storeName) => {
    if (window.confirm(`Tolak permohonan toko "${storeName}"? Catatan: Setelah ditolak, status terkunci dan pengguna harus mengajukan permohonan baru jika ingin mendaftar kembali.`)) {
      const res = await updateStoreStatus(storeId, 'rejected');
      if (res && res.error) {
        alert(res.error);
      }
    }
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Disetujui
          </span>
        );
      case 'rejected':
        return (
          <div className="inline-flex flex-col">
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">
              <XCircle className="h-3.5 w-3.5 text-red-600" /> Ditolak
            </span>
            <span className="text-[10px] text-red-600 font-medium mt-0.5">Terkunci (Perlu Pengajuan Baru)</span>
          </div>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ocean-900 flex items-center gap-2">
            <Store className="h-7 w-7 text-ocean-600" />
            Persetujuan & Manajemen Toko Penjual
          </h1>
          <p className="text-ocean-500 text-sm mt-0.5">
            Verifikasi permohonan pendaftaran toko baru dan kelola status izin berjualan.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <p className="text-xs text-ocean-500 font-medium">Total Toko</p>
          <p className="text-2xl font-bold text-ocean-900 mt-1">{stores.length}</p>
        </Card>
        <Card className="p-4 bg-amber-50/60 border-amber-200">
          <p className="text-xs text-amber-800 font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Menunggu Persetujuan
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
        </Card>
        <Card className="p-4 bg-emerald-50/60 border-emerald-200">
          <p className="text-xs text-emerald-800 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Toko Disetujui
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{approvedCount}</p>
        </Card>
        <Card className="p-4 bg-red-50/60 border-red-200">
          <p className="text-xs text-red-800 font-medium flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-red-600" /> Permohonan Ditolak
          </p>
          <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-ocean-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
            <Input
              placeholder="Cari nama toko, telepon, alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-ocean-500 font-medium whitespace-nowrap">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-ocean-200 bg-white text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500"
            >
              <option value="all">Semua Status ({stores.length})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="approved">Disetujui ({approvedCount})</option>
              <option value="rejected">Ditolak ({rejectedCount})</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Toko / Usaha</TableHead>
              <TableHead>No. Telepon / WA</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Status Permohonan</TableHead>
              <TableHead className="text-right">Tindakan Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-ocean-100 rounded-xl text-ocean-700 flex-shrink-0 mt-0.5">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-ocean-900">{store.store_name}</div>
                        <div className="text-xs text-ocean-500 line-clamp-1 max-w-xs">{store.description || 'Tanpa deskripsi'}</div>
                        <div className="text-[10px] text-ocean-400 mt-0.5">ID Permohonan: #{store.id} | User ID: #{store.user_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-ocean-800">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-ocean-400" />
                      {store.phone || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-ocean-700">
                    <span className="flex items-center gap-1.5 max-w-xs truncate">
                      <MapPin className="h-3.5 w-3.5 text-ocean-400 flex-shrink-0" />
                      {store.address || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {renderBadge(store.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {store.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(store.id, store.store_name)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 shadow-sm"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(store.id, store.store_name)}
                            className="border-red-300 text-red-700 hover:bg-red-50 text-xs h-8 px-3"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Tolak
                          </Button>
                        </>
                      )}
                      {store.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(store.id, store.store_name)}
                          className="border-red-300 text-red-700 hover:bg-red-50 text-xs h-8 px-3"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Tolak / Cabut Izin
                        </Button>
                      )}
                      {store.status === 'rejected' && (
                        <span className="text-xs text-ocean-400 font-medium italic bg-ocean-50 px-2.5 py-1 rounded-lg border border-ocean-100">
                          Terkunci (Menunggu Pengajuan Baru)
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-ocean-500">
                  <Store className="h-10 w-10 mx-auto text-ocean-200 mb-2" />
                  <p className="font-semibold text-sm">Tidak ada data toko ditemukan.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
