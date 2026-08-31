import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit, Trash2, Search, Store } from 'lucide-react';

const UNIT_OPTIONS = ['kg', 'ekor', 'bungkus', 'botol', 'pack', 'lainnya'];
const CATEGORY_OPTIONS = ['Tangkapan Segar', 'Olahan', 'Bumbu & Pelengkap', 'Lainnya'];

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct, stores = [] } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Tangkapan Segar', stock: '', image: '',
    unit: 'kg', store_name: '',
  });

  const approvedStores = (stores || []).filter(s => s.status === 'approved');

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.store_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '', price: '', category: 'Tangkapan Segar', stock: '', image: '',
      unit: 'kg', store_name: approvedStores[0]?.store_name || '',
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
      image: product.image || '',
      unit: product.unit || 'kg',
      store_name: product.store_name || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedStore = approvedStores.find(s => s.store_name === formData.store_name);
    const payload = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      unit: formData.unit || 'kg',
      image: formData.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400',
      store_name: formData.store_name,
      store_id: selectedStore?.id || null,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ocean-900">Manajemen Inventori</h1>
          <p className="text-ocean-500 text-sm mt-0.5">{products.length} produk terdaftar di semua toko mitra.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-ocean-100 overflow-hidden">
        <div className="p-4 border-b border-ocean-100 flex items-center gap-2">
          <Search className="h-5 w-5 text-ocean-400" />
          <Input 
            placeholder="Cari berdasarkan nama, kategori, atau nama toko..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md border-none shadow-none focus-visible:ring-0 px-0"
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Toko Pemilik</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <div className="font-semibold text-ocean-900">{product.name}</div>
                        <div className="text-xs text-ocean-400">Rp {Number(product.price).toLocaleString('id-ID')} / {product.unit || 'kg'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-ocean-700">
                      <Store className="h-3.5 w-3.5 text-ocean-400" />
                      {product.store_name || <span className="text-ocean-300 italic">Tanpa toko</span>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="bg-ocean-50 text-ocean-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-sand-600">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stock} {product.unit || 'kg'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-ocean-500">
                  Tidak ada produk ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-1">Nama Produk</label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Cth: Cumi Segar Tangkapan Pagi" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-1">Toko Pemilik Produk</label>
            <select
              value={formData.store_name}
              onChange={e => setFormData({...formData, store_name: e.target.value})}
              className="w-full px-3 py-2 text-sm rounded-xl border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-ocean-800"
            >
              <option value="">-- Pilih Toko --</option>
              {approvedStores.map(s => (
                <option key={s.id} value={s.store_name}>{s.store_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 text-sm rounded-xl border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-ocean-800"
              >
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-1">Satuan</label>
              <select
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                className="w-full px-3 py-2 text-sm rounded-xl border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-ocean-800"
              >
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-1">Harga (Rp)</label>
              <Input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="60000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-1">Jumlah Stok</label>
              <Input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="25" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-1">URL Gambar (Opsional)</label>
            <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://images.unsplash.com/..." />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-ocean-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan Produk</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
