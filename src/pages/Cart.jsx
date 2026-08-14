import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { ToastContainer, useToast } from '../components/ui/Toast';
import { Trash2, ArrowLeft, Plus, Minus, ShoppingBag, Truck, ArrowRight, MessageSquare, ShieldCheck, Loader2, CheckCircle2, Shield } from 'lucide-react';

const SHIPPING_FEE = 15000;

export function Cart() {
  const { cart, removeFromCart, updateCartQuantity, checkout } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (cart.length > 0 ? SHIPPING_FEE : 0);

  const handleQtyChange = (item, delta) => {
    const next = item.quantity + delta;
    if (next < 1) {
      removeFromCart(item.id);
      addToast(`"${item.name}" dihapus dari keranjang`, 'info');
    } else if (next > item.stock) {
      addToast(`Stok "${item.name}" hanya ${item.stock} ${item.unit || 'kg'}`, 'error');
    } else {
      updateCartQuantity(item.id, next);
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
    addToast(`"${item.name}" dihapus dari keranjang`, 'info');
  };

  const handleCheckout = async () => {
    if (!user) {
      addToast('Silakan masuk terlebih dahulu untuk checkout.', 'error');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    if (createdOrder) {
      // If already checked out, continue directly to chat
      navigate(`/order-chat/${createdOrder.id}`);
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await checkout(user.id, user.name);
      setCheckoutLoading(false);

      if (res.success && res.order) {
        setCreatedOrder(res.order);
        addToast('Pesanan berhasil dibuat! Rekening Bersama (Escrow) aktif 🎉', 'success', 3500);
        setTimeout(() => {
          navigate(`/order-chat/${res.order.id}`);
        }, 1200);
      } else {
        addToast(res.error || 'Gagal memproses pesanan.', 'error');
      }
    } catch (err) {
      setCheckoutLoading(false);
      addToast('Terjadi kesalahan checkout: ' + err.message, 'error');
    }
  };

  // ── Empty state (only if no order just created) ──
  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center animate-fade-in">
        <ShoppingBag className="h-20 w-20 text-ocean-200 mb-6" />
        <h2 className="text-2xl font-bold text-ocean-900 mb-3">Keranjang Belanja Kosong</h2>
        <p className="text-ocean-500 mb-8 max-w-sm">Anda belum menambahkan produk apapun. Temukan hasil laut segar dari nelayan lokal!</p>
        <Link to="/catalog">
          <Button size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Belanja Sekarang
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl animate-fade-in">
      <div className="mb-8">
        <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-ocean-500 hover:text-ocean-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Lanjut Belanja
        </Link>
        <h1 className="text-3xl font-bold text-ocean-900">Keranjang Belanja &amp; Escrow</h1>
        <p className="text-ocean-500 text-sm mt-1">{cart.length} produk dalam keranjang</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cart items ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm overflow-hidden">
            {cart.length > 0 ? (
              <ul className="divide-y divide-ocean-100">
                {cart.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                      />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-ocean-900 leading-snug">{item.name}</h3>
                            <p className="text-xs text-ocean-400 mt-0.5">{item.category}</p>
                            <p className="text-xs text-sand-700 font-medium mt-0.5">{item.store_name || 'Toko Nelayan'}</p>
                          </div>
                          <button
                            onClick={() => handleRemove(item)}
                            className="text-ocean-300 hover:text-red-500 transition-colors p-1 rounded flex-shrink-0"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty controls */}
                          <div className="flex items-center gap-2 bg-ocean-50 rounded-lg p-1">
                            <button
                              onClick={() => handleQtyChange(item, -1)}
                              className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center text-ocean-700 hover:bg-ocean-100 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-ocean-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item, +1)}
                              className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center text-ocean-700 hover:bg-ocean-100 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right">
                            <div className="font-bold text-ocean-900 text-base">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </div>
                            <div className="text-xs text-ocean-400">
                              @Rp {item.price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-ocean-500">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-ocean-900">Pesanan #{createdOrder?.id} Telah Dibuat</p>
                <p className="text-xs text-ocean-500 mt-1">Mengalihkan Anda ke Ruang Chat Transaksi Escrow...</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm p-6 sticky top-24 space-y-4">
            <h2 className="text-lg font-bold text-ocean-900">Ringkasan Pesanan</h2>

            <div className="space-y-2.5">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-ocean-600 truncate mr-2">
                    {item.name} <span className="text-ocean-400">×{item.quantity}</span>
                  </span>
                  <span className="text-ocean-900 font-medium whitespace-nowrap">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-ocean-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-ocean-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm text-ocean-600 items-center">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4" /> Ongkir estimasi
                </span>
                <span>Rp {SHIPPING_FEE.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-ocean-900 text-lg border-t border-ocean-100 pt-3">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Workflow Button Switch: "Proses Pembayaran" -> "Continue to Chat (Lanjut ke Chat)" */}
            {createdOrder ? (
              <Button
                size="lg"
                onClick={() => navigate(`/order-chat/${createdOrder.id}`)}
                className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Lanjut ke Chat Transaksi (Continue to Chat)
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={checkoutLoading || cart.length === 0}
                onClick={handleCheckout}
                className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Menghubungkan Escrow...
                  </>
                ) : (
                  <>
                    Proses Pembayaran &amp; Rekening Bersama
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </Button>
            )}

            {!user && (
              <p className="text-xs text-ocean-400 text-center">
                Anda perlu <Link to="/login" className="text-ocean-600 underline">masuk</Link> untuk checkout
              </p>
            )}

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Rekening Bersama JaringLokal</strong>: Setelah pembayaran, Anda langsung terhubung dalam ruang chat bersama Penjual &amp; Admin.
              </span>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
