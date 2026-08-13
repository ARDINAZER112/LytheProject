import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ToastContainer, useToast } from '../components/ui/Toast';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import { QRCodeModal } from '../components/ui/QRCodeModal';
import {
  Search,
  ShoppingCart,
  Store,
  Package,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
  CheckCircle,
  ShoppingBag,
  UserCheck,
  Building2,
  ArrowRight,
  MapPin,
  Sparkles,
  Filter,
  QrCode
} from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Terbaru',        value: 'default' },
  { label: 'Harga Termurah', value: 'price-asc' },
  { label: 'Harga Termahal', value: 'price-desc' },
  { label: 'Stok Terbanyak', value: 'stock-desc' },
];

export function UserDashboard() {
  const { user } = useAuth();
  const { products, stores, cart, orders, addToCart, loading } = useData();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm]         = useState('');
  const [filterCategory, setFilterCategory]  = useState('Semua');
  const [selectedStore, setSelectedStore]     = useState('Semua Toko');
  const [sort, setSort]                     = useState('default');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [modalQty, setModalQty]             = useState(1);
  const [qrModalConfig, setQrModalConfig]   = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    value: '',
    type: 'product',
  });

  const handleShareStoreQR = (e, storeName, address) => {
    e.stopPropagation();
    const url = `${window.location.origin}/dashboard?store=${encodeURIComponent(storeName)}`;
    setQrModalConfig({
      isOpen: true,
      title: storeName,
      subtitle: address || 'Toko Nelayan & UMKM Pesisir Tuban',
      value: url,
      type: 'store',
    });
  };

  const handleShareProductQR = (e, product) => {
    e.stopPropagation();
    const url = `${window.location.origin}/catalog?product=${product.id || encodeURIComponent(product.name)}`;
    setQrModalConfig({
      isOpen: true,
      title: product.name,
      subtitle: `${product.store_name || 'Toko Nelayan'} • Rp ${Number(product.price).toLocaleString('id-ID')}/${product.unit || 'kg'}`,
      value: url,
      type: 'product',
    });
  };

  if (loading) {
    return <SkeletonDashboard />;
  }

  const cartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Filter stores: strictly ONLY approved stores appear in the showcase and marketplace
  const approvedStores = (stores || []).filter(s => s.status === 'approved');
  const unapprovedStoreNames = (stores || [])
    .filter(s => s.status === 'pending' || s.status === 'rejected')
    .map(s => s.store_name);

  // Filter products: only products from approved stores (or products not bound to pending/rejected stores)
  const safeProducts = (products || []).filter(p => !unapprovedStoreNames.includes(p.store_name));

  const categories = ['Semua', ...new Set(safeProducts.map(p => p.category).filter(Boolean))];
  const storeList  = ['Semua Toko', ...approvedStores.map(p => p.store_name).filter(Boolean)];

  // Store metrics computation
  const getProductCountForStore = (storeName) => {
    return safeProducts.filter(p => p.store_name === storeName).length;
  };

  const handleSelectStore = (storeName) => {
    if (selectedStore === storeName) {
      setSelectedStore('Semua Toko');
    } else {
      setSelectedStore(storeName);
      // Smooth scroll to product catalog
      const catalogElem = document.getElementById('marketplace-catalog');
      if (catalogElem) {
        catalogElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredProducts = safeProducts
    .filter(p => {
      const storeName = p.store_name || '';
      const matchSearch   = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            storeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'Semua' || p.category === filterCategory;
      const matchStore    = selectedStore === 'Semua Toko' || storeName === selectedStore;
      return matchSearch && matchCategory && matchStore;
    })
    .sort((a, b) => {
      if (sort === 'price-asc')  return (a.price || 0) - (b.price || 0);
      if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sort === 'stock-desc') return (b.stock || 0) - (a.stock || 0);
      return 0;
    });

  const handleAddToCart = (product, qty = 1) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, qty);
    addToast(`"${product.name}" ditambahkan ke keranjang!`, 'success');
  };

  const openProductModal = (product) => {
    setActiveModalProduct(product);
    setModalQty(1);
  };

  // Find store details for modal
  const currentStoreInfo = activeModalProduct
    ? (stores || []).find(s => s.store_name === activeModalProduct.store_name) || {
        store_name: activeModalProduct.store_name || 'Toko Nelayan Bahari Pak Bambang',
        address: 'Pesisir Pantai Tuban, Jawa Timur',
        description: 'Mitra nelayan dan UMKM pengolah hasil laut lokal Tuban.'
      }
    : null;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in space-y-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Dashboard Welcome Header ── */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Building2 className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-sand-500/30 text-sand-300 text-xs font-semibold px-3 py-1 rounded-full border border-sand-400/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sand-400" />
              Pasar Nelayan & UMKM Pesisir
            </span>
            {user?.role === 'seller' && (
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/30">
                Penjual Terverifikasi
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight">
            Dashboard Pasar JaringLokal
          </h1>
          <p className="text-ocean-200 text-sm md:text-base max-w-2xl leading-relaxed">
            Selamat datang, <span className="text-sand-300 font-semibold">{user?.name || 'Pengguna'}</span>! Akses produk hasil laut segar & olahan langsung dari daftar toko nelayan pesisir.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-6 pt-6 border-t border-ocean-700/60 max-w-xl">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/10">
              <div className="text-xs text-ocean-200 font-medium mb-1">Item di Keranjang</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-sand-400" />
                {cartCount} Produk
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/10">
              <div className="text-xs text-ocean-200 font-medium mb-1">Total Pesanan</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-sand-400" />
                {(orders || []).length} Pesanan
              </div>
            </div>
            {user?.role === 'seller' ? (
              <Link
                to="/seller/dashboard"
                className="col-span-2 sm:col-span-1 bg-sand-500 hover:bg-sand-400 text-white rounded-2xl p-3.5 font-semibold text-xs flex flex-col justify-center items-center transition-all shadow-md group"
              >
                <span>Kelola Toko Saya</span>
                <span className="flex items-center gap-1 text-[11px] text-sand-100 font-normal mt-0.5 group-hover:translate-x-0.5 transition-transform">
                  Dashboard <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ) : (
              <Link
                to="/register-seller"
                className="col-span-2 sm:col-span-1 bg-white/15 hover:bg-white/25 text-white rounded-2xl p-3.5 font-semibold text-xs flex flex-col justify-center items-center transition-all border border-white/20"
              >
                <span>Buka Toko Nelayan</span>
                <span className="text-[10px] text-ocean-200 font-normal mt-0.5">Daftar sebagai Penjual</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── STORE DIRECT SHOWCASE SECTION ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-ocean-900 flex items-center gap-2">
              <Store className="h-5 w-5 text-ocean-600" />
              Fishermen & Coastal Processors' Shops (Toko Nelayan & Pengolah Pesisir)
            </h2>
            <p className="text-ocean-500 text-xs md:text-sm">Klik toko untuk langsung melihat produk yang ditawarkan.</p>
          </div>
          {selectedStore !== 'Semua Toko' && (
            <button
              onClick={() => setSelectedStore('Semua Toko')}
              className="text-xs font-semibold text-ocean-600 hover:text-ocean-800 bg-ocean-100 hover:bg-ocean-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Tampilkan Semua Toko
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedStores.map((st) => {
            const isSelected = selectedStore === st.store_name;
            const productCount = getProductCountForStore(st.store_name);

            return (
              <div
                key={st.id}
                onClick={() => handleSelectStore(st.store_name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-ocean-900 text-white border-ocean-900 shadow-md ring-2 ring-sand-400'
                    : 'bg-white text-ocean-900 border-ocean-100 hover:border-ocean-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                  isSelected ? 'bg-sand-500 text-white' : 'bg-ocean-100 text-ocean-700'
                }`}>
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-ocean-900'}`}>
                      {st.store_name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isSelected ? 'bg-sand-400/30 text-sand-200' : 'bg-ocean-100 text-ocean-700'
                    }`}>
                      {productCount} Produk
                    </span>
                  </div>
                  <p className={`text-xs mt-1 line-clamp-1 flex items-center gap-1 ${isSelected ? 'text-ocean-200' : 'text-ocean-500'}`}>
                    <MapPin className="h-3 w-3 flex-shrink-0 text-sand-500" />
                    {st.address || 'Tuban, Jawa Timur'}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-sand-300' : 'text-ocean-600'}`}>
                      {isSelected ? '✓ Filter Aktif' : 'Lihat Produk Toko →'}
                    </span>
                    <button
                      onClick={(e) => handleShareStoreQR(e, st.store_name, st.address)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-sand-400/20 text-sand-300 hover:bg-sand-400/40'
                          : 'bg-ocean-50 text-ocean-600 hover:bg-ocean-100'
                      }`}
                      title="Bagikan Kode QR Toko"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Marketplace Section & Controls ── */}
      <div id="marketplace-catalog">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-bold text-ocean-900">Katalog Produk Live</h2>
            <p className="text-ocean-500 text-xs md:text-sm">
              {selectedStore === 'Semua Toko' 
                ? `Menampilkan ${filteredProducts.length} produk dari semua toko mitra.`
                : `Menampilkan ${filteredProducts.length} produk dari "${selectedStore}".`}
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-ocean-100 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
              <Input
                type="text"
                placeholder="Cari ikan, cumi, udang, terasi, atau nama toko..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 text-sm bg-ocean-50/50 border-ocean-200 focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 hover:text-ocean-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Store filter dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="h-11 px-3 text-sm rounded-xl border border-ocean-200 bg-ocean-50/50 text-ocean-800 font-medium focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                {storeList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>

              {/* Sorting dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 px-3 text-sm rounded-xl border border-ocean-200 bg-ocean-50/50 text-ocean-800 font-medium focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mr-1 flex items-center gap-1 whitespace-nowrap">
              <Filter className="h-3 w-3" /> Kategori:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-ocean-600 text-white shadow-sm font-semibold'
                    : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Product Grid ── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-ocean-100 p-8 shadow-sm">
            <Package className="h-16 w-16 text-ocean-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-ocean-900 mb-2">Produk Tidak Ditemukan</h3>
            <p className="text-ocean-500 text-sm mb-6">Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih.</p>
            <Button
              variant="outline"
              onClick={() => { setSearchTerm(''); setFilterCategory('Semua'); setSelectedStore('Semua Toko'); }}
            >
              Reset Semua Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger">
            {filteredProducts.map((product) => {
              const storeName = product.store_name || 'Toko Nelayan Bahari Pak Bambang';
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-ocean-100 shadow-sm card-hover flex flex-col justify-between"
                >
                  <div>
                    {/* Image container */}
                    <div
                      onClick={() => openProductModal(product)}
                      className="relative h-48 overflow-hidden cursor-pointer bg-ocean-50"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full text-ocean-800 shadow-sm">
                        {product.category}
                      </div>
                      {product.stock < 10 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Stok Sisa {product.stock}
                        </div>
                      )}
                      <button
                        onClick={(e) => handleShareProductQR(e, product)}
                        className="absolute bottom-3 right-3 bg-white/90 backdrop-blur hover:bg-white text-ocean-800 p-2 rounded-full shadow-md transition-transform hover:scale-110"
                        title="Bagikan Kode QR Produk"
                      >
                        <QrCode className="h-4 w-4 text-ocean-700" />
                      </button>
                    </div>

                    {/* Body info */}
                    <div className="p-4">
                      {/* STORE NAME BADGE - Prominent Requirement */}
                      <button
                        onClick={() => setSelectedStore(storeName)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-sand-700 bg-sand-50 border border-sand-200 px-2.5 py-1 rounded-md mb-2.5 w-fit hover:bg-sand-100 transition-colors text-left"
                        title="Klik untuk memfilter toko ini"
                      >
                        <Store className="h-3.5 w-3.5 text-sand-600 flex-shrink-0" />
                        <span className="truncate max-w-[190px]">{storeName}</span>
                      </button>

                      <h3
                        onClick={() => openProductModal(product)}
                        className="font-bold text-ocean-900 text-base mb-1 line-clamp-1 cursor-pointer hover:text-ocean-600 transition-colors"
                      >
                        {product.name}
                      </h3>

                      <div className="text-lg font-bold text-sand-600 mb-3">
                        Rp {Number(product.price).toLocaleString('id-ID')}{' '}
                        <span className="text-xs font-normal text-ocean-400">/{product.unit || 'kg'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer action */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="w-full flex items-center justify-center gap-2 bg-ocean-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-ocean-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Product Detail Modal ── */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-ocean-100 animate-slide-up relative">
            <button
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur text-ocean-700 flex items-center justify-center hover:bg-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-64 relative overflow-hidden bg-ocean-100">
              <img
                src={activeModalProduct.image}
                alt={activeModalProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-ocean-900/80 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
                {activeModalProduct.category}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* STORE INFO BADGE */}
              <div className="bg-ocean-50 border border-ocean-100 p-3.5 rounded-2xl flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ocean-600 text-white flex items-center justify-center flex-shrink-0">
                    <Store className="h-5 w-5 text-sand-300" />
                  </div>
                  <div>
                    <div className="text-xs text-ocean-500 font-medium">Toko / UMKM Penyedia</div>
                    <div className="text-sm font-bold text-ocean-900">{currentStoreInfo?.store_name}</div>
                    <div className="text-xs text-ocean-600 mt-0.5">{currentStoreInfo?.address}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleShareStoreQR(e, currentStoreInfo?.store_name, currentStoreInfo?.address)}
                  className="p-2 bg-white border border-ocean-200 rounded-xl hover:bg-ocean-100 text-ocean-700 transition-colors flex-shrink-0"
                  title="Kode QR Toko"
                >
                  <QrCode className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-ocean-900">{activeModalProduct.name}</h2>
                <div className="text-2xl font-extrabold text-sand-600 mt-1">
                  Rp {Number(activeModalProduct.price).toLocaleString('id-ID')}
                  <span className="text-sm font-normal text-ocean-400"> / {activeModalProduct.unit || 'kg'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-ocean-600 pt-2 border-t border-ocean-100">
                <span>Status Stok:</span>
                <span className="font-semibold text-ocean-900">
                  {activeModalProduct.stock > 0 ? `${activeModalProduct.stock} ${activeModalProduct.unit || 'kg'} Tersedia` : 'Stok Habis'}
                </span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-ocean-700">Jumlah Pesanan:</span>
                <div className="flex items-center gap-3 bg-ocean-50 p-1.5 rounded-xl border border-ocean-200">
                  <button
                    onClick={() => setModalQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white text-ocean-700 flex items-center justify-center hover:bg-ocean-100 font-bold border border-ocean-200 shadow-sm"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-ocean-900 w-8 text-center">{modalQty}</span>
                  <button
                    onClick={() => setModalQty(q => Math.min(activeModalProduct.stock, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white text-ocean-700 flex items-center justify-center hover:bg-ocean-100 font-bold border border-ocean-200 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Add to cart & QR action buttons */}
              <div className="flex gap-2.5 pt-2">
                <Button
                  onClick={() => {
                    handleAddToCart(activeModalProduct, modalQty);
                    setActiveModalProduct(null);
                  }}
                  disabled={activeModalProduct.stock <= 0}
                  className="flex-1 h-12 text-base font-semibold"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Tambah {modalQty} ke Keranjang
                </Button>
                <button
                  onClick={(e) => handleShareProductQR(e, activeModalProduct)}
                  className="p-3 bg-sand-100 hover:bg-sand-200 text-sand-800 border border-sand-300 rounded-xl transition-colors flex items-center justify-center"
                  title="Bagikan Kode QR Produk"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Global QR Code Modal ── */}
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
