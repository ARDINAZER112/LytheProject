import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { QRCodeModal } from '../components/ui/QRCodeModal';
import { ToastContainer, useToast } from '../components/ui/Toast';
import { Store, Plus, Edit, Trash2, Search, Package, ShieldCheck, ArrowLeft, ShoppingBag, QrCode } from 'lucide-react';

export function SellerDashboard() {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, stores, getStoreForUser } = useData();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const userStore = getStoreForUser(user?.id);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrModalConfig, setQrModalConfig] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    value: '',
    type: 'store',
  });

  const handleShareStoreQR = () => {
    const name = userStore?.store_name || 'Toko Penjual Saya';
    const address = userStore?.address || 'Tuban, Jawa Timur';
    const url = `${window.location.origin}/dashboard?store=${encodeURIComponent(name)}`;
    setQrModalConfig({
      isOpen: true,
      title: name,
      subtitle: address,
      value: url,
      type: 'store',
    });
  };

  const handleShareProductQR = (product) => {
    const url = `${window.location.origin}/catalog?product=${product.id || encodeURIComponent(product.name)}`;
    setQrModalConfig({
      isOpen: true,
      title: product.name,
      subtitle: `${product.store_name || userStore?.store_name || 'Toko Penjual'} • Rp ${Number(product.price).toLocaleString('id-ID')}/${product.unit || 'kg'}`,
      value: url,
      type: 'product',
    });
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Tangkapan Segar',
    stock: '',
    unit: 'kg',
    image: '',
  });

  // Filter products that belong to this seller's store
  const sellerProducts = products.filter(p => {
    if (userStore) {
      return p.store_id === userStore.id || p.store_name === userStore.store_name;
    }
    // Fallback match by store_name if store_id not assigned
    return true;
  });

  const filteredProducts = sellerProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'Tangkapan Segar',
      stock: '',
      unit: 'kg',
      image: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      unit: product.unit || 'kg',
      image: product.image || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      price: parseInt(formData.price, 10) || 0,
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 0,
      unit: formData.unit || 'kg',
      image: formData.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400',
      store_id: userStore?.id || null,
      store_name: userStore?.store_name || 'Toko Saya',
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      addToast(`Produk "${formData.name}" berhasil diperbarui!`, 'success');
    } else {
      addProduct(payload);
      addToast(`Produk baru "${formData.name}" berhasil ditambahkan ke katalog toko Anda!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      deleteProduct(id);
      addToast(`Produk "${name}" telah dihapus.`, 'info');
    }
  };

  if (!user || user.role !== 'seller' || !userStore || userStore.status !== 'approved') {
    const isPending = userStore?.status === 'pending';
    const isRejected = userStore?.status === 'rejected';

    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <Store className="h-16 w-16 text-ocean-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-ocean-900 mb-2">
          {isPending ? 'Permohonan Toko Dalam Peninjauan' : isRejected ? 'Permohonan Toko Ditolak' : 'Akses Khusus Penjual Terdaftar'}
        </h2>
        <p className="text-ocean-600 text-sm mb-6 leading-relaxed">
          {isPending 
            ? 'Permohonan pendaftaran toko Anda saat ini sedang menunggu persetujuan dari Admin. Anda akan diberikan akses berjualan setelah aplikasi disetujui.'
            : isRejected
            ? 'Mohon maaf, aplikasi pendaftaran toko Anda telah ditolak oleh admin. Silakan periksa status permohonan Anda.'
            : 'Hanya akun penjual yang telah disetujui oleh admin yang dapat mengakses Dashboard Penjual.'}
        </p>
        <Link to="/register-seller">
          <Button className="px-6">
            {userStore ? 'Lihat Status Pendaftaran Toko' : 'Daftar Sebagai Penjual'}
          </Button>
        </Link>
      </div>
    );
  }

  const totalStock = sellerProducts.reduce((acc, p) => acc + (p.stock || 0), 0);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Top bar & navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-ocean-500 mb-1">
            <Link to="/catalog" className="hover:text-ocean-700 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Katalog Utama
            </Link>
            <span>/</span>
            <span className="font-semibold text-ocean-700">Dashboard Penjual</span>
          </div>
          <h1 className="text-3xl font-extrabold text-ocean-900 flex items-center gap-3">
            <Store className="h-8 w-8 text-ocean-600" />
            {userStore?.store_name || 'Toko Penjual Saya'}
          </h1>
          <p className="text-ocean-600 text-sm mt-1">
            Kelola inventori dan katalog produk hasil laut untuk toko Anda.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={handleShareStoreQR} className="flex items-center gap-2 border-sand-400 text-sand-700 hover:bg-sand-50">
            <QrCode className="h-4 w-4 text-sand-600" /> QR Code Toko
          </Button>
          <Link to="/catalog">
            <Button variant="outline" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Lihat Pasar
            </Button>
          </Link>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Tambah Produk Baru
          </Button>
        </div>
      </div>

      {/* Store Banner / Card */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-700 text-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-emerald-400/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Toko Disetujui & Aktif
            </div>
            <h2 className="text-xl font-bold">{userStore?.store_name || 'Toko Penjual'}</h2>
            <p className="text-ocean-200 text-sm mt-1">{userStore?.description || 'Toko penyedia hasil laut berkualitas tinggi.'}</p>
            <p className="text-ocean-300 text-xs mt-2">📍 {userStore?.address || 'Tuban, Jawa Timur'} | 📞 {userStore?.phone || 'Aktif'}</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10">
            <div className="text-xs text-ocean-200 uppercase font-semibold">Total Produk Katalog</div>
            <div className="text-3xl font-extrabold text-white mt-1">{sellerProducts.length}</div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10 flex flex-col items-center justify-center">
            <button
              onClick={handleShareStoreQR}
              className="w-full h-full flex flex-col items-center justify-center gap-1 text-sand-300 hover:text-white transition-colors"
              title="Klik untuk tampilkan QR Toko"
            >
              <QrCode className="h-6 w-6 text-sand-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Tampilkan QR Toko</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-ocean-100 overflow-hidden">
        <div className="p-4 border-b border-ocean-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
            <Input
              placeholder="Cari produk toko Anda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <p className="text-xs text-ocean-500">
            Menampilkan <span className="font-bold text-ocean-700">{filteredProducts.length}</span> dari {sellerProducts.length} produk toko
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga Satuan</TableHead>
              <TableHead>Stok Tersedia</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-ocean-100" />
                      <div>
                        <div className="font-semibold text-ocean-900">{product.name}</div>
                        <div className="text-xs text-ocean-400">ID: #{product.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="bg-ocean-100 text-ocean-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-sand-600">
                    Rp {product.price.toLocaleString('id-ID')} / {product.unit || 'kg'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} {product.unit || 'kg'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleShareProductQR(product)} title="Bagikan Kode QR Produk">
                        <QrCode className="h-4 w-4 text-sand-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(product)} title="Edit Produk">
                        <Edit className="h-4 w-4 text-ocean-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-red-50 text-red-500" onClick={() => handleDelete(product.id, product.name)} title="Hapus Produk">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-ocean-500">
                  <Package className="h-12 w-12 mx-auto text-ocean-200 mb-2" />
                  <p className="font-semibold">Belum ada produk di toko Anda.</p>
                  <p className="text-xs text-ocean-400 mt-1 mb-4">Klik tombol di bawah ini untuk menambahkan produk jualan Anda.</p>
                  <Button size="sm" onClick={openAddModal}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah Produk Pertama
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Produk Toko" : "Tambah Produk Baru ke Toko"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ocean-800 mb-1">Nama Produk</label>
            <Input
              required
              placeholder="Cth: Cumi-cumi Segar Tangkapan Pagi"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-ocean-800"
              >
                <option value="Tangkapan Segar">Tangkapan Segar</option>
                <option value="Olahan">Olahan</option>
                <option value="Bumbu & Pelengkap">Bumbu & Pelengkap</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-1">Satuan Produk</label>
              <Input
                required
                placeholder="kg / ekor / bungkus"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-1">Harga (Rp)</label>
              <Input
                required
                type="number"
                min="0"
                placeholder="60000"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-800 mb-1">Jumlah Stok</label>
              <Input
                required
                type="number"
                min="0"
                placeholder="25"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-800 mb-1">URL Foto Produk (Opsional)</label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-ocean-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan Produk</Button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <QRCodeModal
        isOpen={qrModalConfig.isOpen}
        onClose={() => setQrModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={qrModalConfig.title}
        subtitle={qrModalConfig.subtitle}
        value={qrModalConfig.value}
        type={qrModalConfig.type}
      />
    </div>
  );
}
