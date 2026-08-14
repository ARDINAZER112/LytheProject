import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ToastContainer, useToast } from '../components/ui/Toast';
import {
  ShieldCheck,
  ArrowLeft,
  Send,
  Store,
  User,
  Shield,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  DollarSign,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

const ESCROW_STEPS = [
  { key: 'pending_payment', label: 'Menunggu Pembayaran', desc: 'Pembeli mentransfer dana ke Rekening Bersama Admin' },
  { key: 'in_escrow', label: 'Dana di Escrow Admin', desc: 'Dana aman ditahan oleh Admin, Penjual menyiapkan barang' },
  { key: 'shipped', label: 'Pesanan Dikirim', desc: 'Penjual telah mengirimkan hasil laut segar ke alamat tujuan' },
  { key: 'completed', label: 'Transaksi Selesai', desc: 'Barang diterima, dana diteruskan ke rekening Penjual' },
];

export function EscrowChat() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const {
    orders,
    orderChats,
    loadOrderChats,
    sendOrderChatMessage,
    updateOrderEscrowStatus,
    stores,
  } = useData();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shippingNote, setShippingNote] = useState('');
  const chatBottomRef = useRef(null);

  // Find order
  const order = orders.find(o => String(o.id) === String(orderId) || String(o.id).slice(-6) === String(orderId));
  const messages = (orderChats && order && orderChats[order.id]) || [];

  // Determine current user's role in this transaction
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller' || (order && String(order.seller_id) === String(user?.id));
  const isBuyer = !isAdmin && !isSeller;

  const currentRoleName = isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer';

  useEffect(() => {
    if (order?.id) {
      loadOrderChats(order.id);
    }
  }, [order?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <Package className="h-16 w-16 text-ocean-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-ocean-900 mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-ocean-500 text-sm mb-6">ID transaksi #{orderId} tidak ditemukan dalam database atau telah dipindahkan.</p>
        <Link to="/catalog">
          <Button>Kembali ke Katalog</Button>
        </Link>
      </div>
    );
  }

  const escrowStatus = order.escrow_status || 'pending_payment';

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText;
    setInputText('');
    setSending(true);

    try {
      await sendOrderChatMessage({
        orderId: order.id,
        text: textToSend,
        senderRole: currentRoleName,
        senderName: user?.name || (isAdmin ? 'Admin JaringLokal' : isSeller ? (order.store_name || 'Penjual') : 'Pembeli'),
        senderId: user?.id || null,
      });
    } catch (err) {
      addToast('Gagal mengirim pesan.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  // Buyer: Confirm Payment Transfer to Escrow
  const handleBuyerConfirmPayment = async () => {
    setShowPaymentModal(false);
    await updateOrderEscrowStatus(
      order.id,
      'Dana Ditahan di Escrow Admin',
      'in_escrow',
      `💳 PEMBAYARAN DIKONFIRMASI: Pembeli (${user?.name || order.user_name}) telah mengonfirmasi transfer pembayaran sebesar Rp ${(order.total_amount || order.totalAmount).toLocaleString('id-ID')} ke Rekening Bersama Admin.`
    );
    addToast('Konfirmasi pembayaran terkirim! Dana kini aman di Rekening Bersama Admin.', 'success', 5000);
  };

  // Seller: Mark Order as Shipped
  const handleSellerShipOrder = async () => {
    setShowShipModal(false);
    const noteText = shippingNote.trim() ? ` (Catatan kurir/resi: ${shippingNote})` : '';
    await updateOrderEscrowStatus(
      order.id,
      'Pesanan Dikirim',
      'shipped',
      `🚚 PESANAN DIKIRIM: Penjual (${order.store_name || user?.name}) telah mengirimkan paket pesanan hasil laut.${noteText}`
    );
    setShippingNote('');
    addToast('Status pesanan diperbarui: Sedang Dikirim!', 'success');
  };

  // Buyer: Confirm Goods Received & Completed
  const handleBuyerConfirmReceived = async () => {
    if (window.confirm('Konfirmasi bahwa Anda telah menerima pesanan dengan baik? Dana akan diteruskan oleh Admin ke Penjual.')) {
      await updateOrderEscrowStatus(
        order.id,
        'Selesai',
        'completed',
        `🎉 PESANAN DITERIMA: Pembeli (${user?.name || order.user_name}) telah menerima hasil laut segar dengan baik. Transaksi Escrow selesai.`
      );
      addToast('Pesanan selesai! Terima kasih telah berbelanja di JaringLokal.', 'success');
    }
  };

  // Admin Actions
  const handleAdminVerifyPayment = async () => {
    if (window.confirm('Verifikasi bahwa pembayaran telah masuk dan dana aman tersimpan di Rekening Bersama?')) {
      await updateOrderEscrowStatus(
        order.id,
        'Dana Ditahan di Escrow Admin',
        'in_escrow',
        `🛡️ VERIFIKASI ADMIN: Admin telah memverifikasi dana masuk ke Rekening Bersama. Penjual dipersilakan segera menyiapkan dan mengirimkan produk.`
      );
      addToast('Status diperbarui: Pembayaran Escrow Diverifikasi!', 'success');
    }
  };

  const handleAdminReleaseFunds = async () => {
    if (window.confirm(`Cairkan dana sebesar Rp ${(order.total_amount || order.totalAmount).toLocaleString('id-ID')} ke rekening Penjual (${order.store_name})?`)) {
      await updateOrderEscrowStatus(
        order.id,
        'Selesai',
        'completed',
        `💰 PELEPASAN DANA: Admin telah melepaskan dan meneruskan dana pembayaran ke rekening Penjual (${order.store_name}). Transaksi Escrow berhasil ditutup.`
      );
      addToast('Dana berhasil dicairkan ke Penjual!', 'success');
    }
  };

  const handleAdminRefund = async () => {
    if (window.confirm(`Batalkan transaksi dan lakukan Refund dana ke Pembeli (${order.user_name})?`)) {
      await updateOrderEscrowStatus(
        order.id,
        'Dibatalkan (Refund)',
        'refunded',
        `⚠️ PEMBATALAN & REFUND: Admin membatalkan pesanan ini dan mengembalikan dana ke Pembeli (${order.user_name}).`
      );
      addToast('Transaksi dibatalkan & dana direfund.', 'info');
    }
  };

  const getStepIndex = () => {
    switch (escrowStatus) {
      case 'pending_payment': return 0;
      case 'in_escrow': return 1;
      case 'shipped': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to={isAdmin ? '/admin/orders' : isSeller ? '/seller/dashboard' : '/dashboard'}
            className="inline-flex items-center text-sm font-medium text-ocean-600 hover:text-ocean-800 transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isAdmin ? 'Kembali ke Daftar Transaksi Admin' : isSeller ? 'Kembali ke Dashboard Penjual' : 'Kembali ke Dashboard Pasar'}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-ocean-900 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
              Chat Transaksi &amp; Rekening Bersama (Escrow)
            </h1>
            <span className="bg-ocean-100 text-ocean-800 font-mono text-xs px-2.5 py-1 rounded-full font-bold">
              #{String(order.id).slice(-6)}
            </span>
          </div>
          <p className="text-ocean-500 text-xs md:text-sm mt-0.5">
            Komunikasi 3 Pihak: <strong>Pembeli</strong>, <strong>Penjual</strong>, dan <strong>Admin JaringLokal</strong> dalam perlindungan rekening bersama.
          </p>
        </div>

        {/* User Persona Badge */}
        <div className="bg-white border border-ocean-200 shadow-sm px-4 py-2 rounded-2xl flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
            isAdmin ? 'bg-purple-600 text-white' : isSeller ? 'bg-amber-600 text-white' : 'bg-ocean-600 text-white'
          }`}>
            {isAdmin ? <Shield className="h-4 w-4" /> : isSeller ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div>
            <div className="text-[10px] text-ocean-400 font-semibold uppercase">Anda Masuk Sebagai</div>
            <div className="text-xs font-bold text-ocean-900 capitalize">
              {isAdmin ? '👑 Admin Escrow (Mediator)' : isSeller ? `🏪 Penjual (${order.store_name || user?.name})` : `👤 Pembeli (${user?.name || 'Customer'})`}
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Progress Tracker */}
      <div className="bg-white rounded-3xl border border-ocean-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2 border-b border-ocean-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-bold text-ocean-900">Alur Perlindungan Rekening Bersama (Escrow Guarantee)</span>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Transaksi Terproteksi 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ESCROW_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-ocean-900 text-white border-ocean-900 shadow-md ring-2 ring-emerald-400'
                    : isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-ocean-50/50 border-ocean-100 text-ocean-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCurrent ? 'bg-emerald-500 text-white' : isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-ocean-100 text-ocean-600'
                  }`}>
                    Langkah {idx + 1}
                  </span>
                  {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  {isCurrent && <Clock className="h-4 w-4 text-amber-300 animate-pulse" />}
                </div>
                <h4 className={`text-sm font-bold leading-snug ${isCurrent ? 'text-white' : isDone ? 'text-emerald-900' : 'text-ocean-700'}`}>
                  {step.label}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-ocean-200' : isDone ? 'text-emerald-700' : 'text-ocean-400'}`}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left is Order Details & Action Center, Right is Multi-Party Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Transaction Details & Interactive Action Center */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Details Card */}
          <div className="bg-white rounded-3xl border border-ocean-100 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-ocean-100 pb-3">
              <div>
                <span className="text-xs text-ocean-400 block font-medium">Informasi Toko Mitra</span>
                <span className="text-sm font-bold text-ocean-900 flex items-center gap-1.5 mt-0.5">
                  <Store className="h-4 w-4 text-ocean-600" />
                  {order.store_name || 'Toko Nelayan Pesisir'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-ocean-400 block font-medium">Nama Pembeli</span>
                <span className="text-sm font-bold text-ocean-900 flex items-center gap-1.5 justify-end mt-0.5">
                  <User className="h-4 w-4 text-ocean-600" />
                  {order.user_name || order.userName || 'Pelanggan'}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-xs font-bold text-ocean-500 uppercase tracking-wider mb-2">Item Hasil Laut</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-ocean-50/60 border border-ocean-100 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-ocean-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-ocean-500">{item.quantity} {item.unit || 'kg'} × Rp {Number(item.price).toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                    <div className="font-bold text-ocean-900 flex-shrink-0 ml-2">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-ocean-100 space-y-1.5 text-xs text-ocean-600">
              <div className="flex justify-between">
                <span>Ongkos Kirim Estimasi:</span>
                <span>Rp {(order.shipping_fee || 15000).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-ocean-900 pt-2 border-t border-ocean-100">
                <span>Total Dana Escrow:</span>
                <span className="text-sand-600">Rp {Number(order.total_amount || order.totalAmount).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Interactive Role-Based Escrow Actions Box */}
          <div className="bg-gradient-to-br from-ocean-900 to-ocean-800 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-sand-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-sand-400" />
              Pusat Tindakan Transaksi Escrow
            </div>

            {/* Actions for BUYER */}
            {isBuyer && (
              <div className="space-y-3">
                {escrowStatus === 'pending_payment' && (
                  <>
                    <p className="text-xs text-ocean-200">
                      Silakan lakukan transfer pembayaran ke Rekening Bersama Escrow Admin agar pesanan segera diproses oleh nelayan.
                    </p>
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 text-sm shadow-md"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Konfirmasi Transfer ke Escrow
                    </Button>
                  </>
                )}

                {escrowStatus === 'in_escrow' && (
                  <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-xs space-y-1.5">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Dana Anda Tersimpan Aman di Escrow
                    </div>
                    <p className="text-ocean-200">
                      Penjual sedang mempersiapkan tangkapan segar Anda. Gunakan chat di samping untuk berkoordinasi langsung dengan nelayan &amp; admin.
                    </p>
                  </div>
                )}

                {escrowStatus === 'shipped' && (
                  <>
                    <p className="text-xs text-ocean-200">
                      Pesanan Anda sedang dalam pengiriman. Setelah hasil laut Anda terima dan diperiksa dengan baik, silakan konfirmasi pesanan selesai.
                    </p>
                    <Button
                      onClick={handleBuyerConfirmReceived}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 text-sm shadow-md"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Konfirmasi Pesanan Diterima (Selesai)
                    </Button>
                  </>
                )}

                {escrowStatus === 'completed' && (
                  <div className="p-3.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-xs font-semibold text-emerald-300 text-center">
                    🎉 Transaksi telah selesai. Terima kasih atas kepercayaan Anda!
                  </div>
                )}
              </div>
            )}

            {/* Actions for SELLER */}
            {isSeller && (
              <div className="space-y-3">
                {escrowStatus === 'pending_payment' && (
                  <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-xs text-ocean-200">
                    ⏳ Menunggu pembeli menyelesaikan pembayaran ke Rekening Bersama Admin. Anda dapat mengingatkan pembeli melalui chat di samping.
                  </div>
                )}

                {escrowStatus === 'in_escrow' && (
                  <>
                    <p className="text-xs text-ocean-200">
                      Pembeli telah mentransfer dana ke Rekening Bersama. Anda aman untuk mengirimkan pesanan ke alamat pembeli sekarang.
                    </p>
                    <Button
                      onClick={() => setShowShipModal(true)}
                      className="w-full bg-sand-500 hover:bg-sand-400 text-white font-bold h-11 text-sm shadow-md"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Tandai Pesanan Telah Dikirim
                    </Button>
                  </>
                )}

                {escrowStatus === 'shipped' && (
                  <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-xs text-ocean-200">
                    🚚 Paket dalam perjalanan. Dana akan otomatis dicairkan ke saldo Anda setelah pembeli mengonfirmasi penerimaan barang.
                  </div>
                )}

                {escrowStatus === 'completed' && (
                  <div className="p-3.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-xs font-semibold text-emerald-300 text-center">
                    💰 Transaksi selesai! Dana pesanan telah dicairkan ke toko Anda.
                  </div>
                )}
              </div>
            )}

            {/* Actions for ADMIN */}
            {isAdmin && (
              <div className="space-y-3">
                <div className="text-xs text-purple-200 bg-purple-900/40 p-2.5 rounded-xl border border-purple-400/30">
                  Panel Mediasi Admin: Verifikasi aliran dana dan pastikan hak pembeli &amp; penjual terlindungi.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={handleAdminVerifyPayment}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Verifikasi Dana Escrow
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAdminReleaseFunds}
                    className="bg-sand-500 hover:bg-sand-600 text-white text-xs h-9"
                  >
                    <DollarSign className="mr-1 h-3.5 w-3.5" />
                    Cairkan ke Penjual
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAdminRefund}
                  className="w-full border-red-400/50 text-red-300 hover:bg-red-500/20 text-xs h-9"
                >
                  <AlertCircle className="mr-1 h-3.5 w-3.5" />
                  Batalkan &amp; Refund ke Pembeli
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Party Live Chat Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-ocean-100 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-bold text-sand-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-snug">Ruang Komunikasi Transaksi Escrow</h3>
                <p className="text-[11px] text-ocean-200">
                  Peserta: Pembeli • Penjual ({order.store_name || 'Nelayan'}) • Admin Escrow
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Sync
            </div>
          </div>

          {/* Quick Reply Triggers */}
          <div className="p-2.5 bg-ocean-50 border-b border-ocean-100 flex items-center gap-2 overflow-x-auto text-xs hide-scrollbar">
            <span className="text-[11px] text-ocean-400 font-semibold whitespace-nowrap pl-1">Template:</span>
            {isBuyer && (
              <>
                <button onClick={() => handleQuickReply('Halo, apakah stok hasil laut segar ini siap dikirim hari ini?')} className="bg-white border border-ocean-200 text-ocean-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-ocean-100 transition-colors">
                  Stok siap kirim?
                </button>
                <button onClick={() => handleQuickReply('Saya sudah transfer ke Rekening Bersama Admin, mohon dicek ya.')} className="bg-white border border-ocean-200 text-ocean-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-ocean-100 transition-colors">
                  Sudah saya transfer ke Escrow
                </button>
              </>
            )}
            {isSeller && (
              <>
                <button onClick={() => handleQuickReply('Tangkapan segar baru mendarat, pesanan sedang disiapkan dengan es pendingin.')} className="bg-white border border-ocean-200 text-ocean-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-ocean-100 transition-colors">
                  Pesanan sedang disiapkan
                </button>
                <button onClick={() => handleQuickReply('Paket sudah diserahkan ke kurir pengiriman berpendingin.')} className="bg-white border border-ocean-200 text-ocean-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-ocean-100 transition-colors">
                  Paket sudah dikirim
                </button>
              </>
            )}
            {isAdmin && (
              <>
                <button onClick={() => handleQuickReply('Halo, Admin JaringLokal siap membantu memverifikasi transaksi rekening bersama ini.')} className="bg-white border border-ocean-200 text-ocean-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-ocean-100 transition-colors">
                  Admin siap mediasi
                </button>
                <button onClick={() => handleQuickReply('Pembayaran telah terverifikasi aman di Rekening Bersama Escrow.')} className="bg-white border border-ocean-200 text-ocean-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-ocean-100 transition-colors">
                  Verifikasi aman
                </button>
              </>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-ocean-50/30">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-ocean-400 space-y-2">
                <HelpCircle className="h-10 w-10 mx-auto text-ocean-300" />
                <p className="text-xs font-semibold">Belum ada percakapan. Mulai obrolan transaksi Anda!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isSystem = msg.sender_role === 'system';
                const isMe = user?.id && String(msg.sender_id) === String(user.id);
                const isMsgAdmin = msg.sender_role === 'admin';
                const isMsgSeller = msg.sender_role === 'seller';

                if (isSystem) {
                  return (
                    <div key={msg.id || index} className="p-3.5 bg-sand-50 border border-sand-200 rounded-2xl text-xs text-sand-900 text-center mx-4 my-2 shadow-sm animate-fade-in">
                      <div className="font-bold flex items-center justify-center gap-1.5 text-sand-800 mb-1">
                        <Shield className="h-4 w-4 text-sand-600" />
                        {msg.sender_name || 'Sistem Escrow'}
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      <span className="text-[10px] text-sand-600 block mt-1.5">
                        {new Date(msg.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-bold text-ocean-800">
                        {msg.sender_name}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        isMsgAdmin
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : isMsgSeller
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-ocean-100 text-ocean-800 border border-ocean-300'
                      }`}>
                        {isMsgAdmin ? 'Admin Escrow' : isMsgSeller ? 'Penjual' : 'Pembeli'}
                      </span>
                      <span className="text-[10px] text-ocean-400">
                        {new Date(msg.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-ocean-600 text-white rounded-br-none'
                          : isMsgAdmin
                          ? 'bg-purple-50 border border-purple-200 text-purple-950 rounded-bl-none'
                          : 'bg-white border border-ocean-100 text-ocean-900 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-ocean-100 flex items-center gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ketik pesan sebagai ${isAdmin ? 'Admin' : isSeller ? 'Penjual' : 'Pembeli'}...`}
              className="flex-1 h-11 text-xs bg-ocean-50/60 border-ocean-200 focus:bg-white"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="h-11 px-5 bg-ocean-600 hover:bg-ocean-700 text-white flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Buyer Payment Instruction Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-ocean-100 space-y-5 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ocean-900">Transfer ke Rekening Bersama</h3>
                <p className="text-xs text-ocean-500">Dana ditahan aman oleh Admin JaringLokal</p>
              </div>
            </div>

            <div className="bg-ocean-50 p-4 rounded-2xl border border-ocean-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-ocean-500">Bank Tujuan:</span>
                <span className="font-bold text-ocean-900">Bank Mandiri / BRI Escrow JaringLokal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ocean-500">Nomor Rekening:</span>
                <span className="font-mono font-bold text-ocean-900 text-sm">142-00-1928374-1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ocean-500">Atas Nama:</span>
                <span className="font-bold text-ocean-900">PT JaringLokal Escrow Nusantara</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-ocean-200 text-sm font-bold text-sand-700">
                <span>Total Transfer:</span>
                <span>Rp {Number(order.total_amount || order.totalAmount).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
              Setelah Anda mentransfer dana, klik tombol di bawah ini. Admin &amp; Penjual akan langsung mendapatkan notifikasi otomatis di ruang chat.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Batal</Button>
              <Button onClick={handleBuyerConfirmPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Saya Sudah Transfer Dana
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Shipping Modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-ocean-100 space-y-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sand-100 text-sand-700 rounded-2xl">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ocean-900">Konfirmasi Pengiriman Pesanan</h3>
                <p className="text-xs text-ocean-500">Pastikan hasil laut dikemas dingin &amp; higienis</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ocean-700 mb-1">
                Catatan Pengiriman / No. Resi Kurir (Opsional)
              </label>
              <Input
                placeholder="Cth: Kurir Lokal Pesisir / Resi JNE-982312 / Diantar motor pendingin"
                value={shippingNote}
                onChange={(e) => setShippingNote(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowShipModal(false)}>Batal</Button>
              <Button onClick={handleSellerShipOrder} className="bg-sand-500 hover:bg-sand-600 text-white font-bold">
                Kirim &amp; Beritahu Pembeli
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
