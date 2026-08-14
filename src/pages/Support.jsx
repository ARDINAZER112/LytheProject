import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useData, getVisitorDeviceId } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { 
  Headphones, MessageSquare, Send, CheckCircle2, Clock, XCircle, 
  Search, ShieldCheck, Mail, Phone, LifeBuoy, ArrowLeft, X, Filter, User
} from 'lucide-react';

export function Support() {
  const { user } = useAuth();
  const { tickets = [], createTicket, addTicketMessage } = useData();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'Pertanyaan Umum';
  
  const savedVisitorEmail = typeof window !== 'undefined' ? (localStorage.getItem('jaringlokal_last_visitor_email') || '') : '';
  const initialEmail = queryParams.get('email') || user?.email || savedVisitorEmail || '';

  const [activeTab, setActiveTab] = useState('create');
  const [ticketForm, setTicketForm] = useState({
    name: user?.name || '',
    email: initialEmail,
    phone: '',
    category: initialCategory === 'Lupa Password / Reset Password' ? 'Pertanyaan Umum' : initialCategory,
    subject: '',
    message: ''
  });

  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Visitor persistent identification
  const visitorDeviceId = getVisitorDeviceId();
  let savedTicketCodes = [];
  try {
    const raw = localStorage.getItem('jaringlokal_my_ticket_codes');
    if (raw) savedTicketCodes = JSON.parse(raw);
  } catch (e) {
    savedTicketCodes = [];
  }

  const effectiveEmail = ticketForm.email || user?.email || savedVisitorEmail;

  // Persistent ticket list matching logged-in user, stored ticket codes, visitor device ID, or email
  const myTickets = tickets.filter(t => {
    // 1. Logged-in user match
    if (user && (t.email?.toLowerCase() === user.email?.toLowerCase() || String(t.user_id) === String(user.id))) {
      return true;
    }
    // 2. Saved ticket code created on this device/browser
    if (t.ticket_code && savedTicketCodes.includes(t.ticket_code)) {
      return true;
    }
    // 3. Visitor device ID match
    if (t.visitor_device_id && t.visitor_device_id === visitorDeviceId) {
      return true;
    }
    // 4. Email match
    if (effectiveEmail && t.email?.toLowerCase() === effectiveEmail.toLowerCase()) {
      return true;
    }
    // 5. Fallback for unauthenticated visitor with no prior tickets: show visitor tickets
    if (!user && savedTicketCodes.length === 0 && !effectiveEmail) {
      return true;
    }
    return false;
  });

  const filteredMyTickets = myTickets.filter(t => {
    const matchSearch = t.ticket_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || 
                        (filterStatus === 'open' && (t.status === 'Terbuka' || t.status === 'Sedang Diproses')) ||
                        (filterStatus === 'closed' && (t.status === 'Selesai' || t.status === 'Tutup'));
    return matchSearch && matchFilter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createTicket(ticketForm);
    setIsSubmitting(false);
    if (res?.success) {
      setSubmittedTicket(res.ticket);
    }
  };

  const handleSendChatReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg = {
      sender: 'visitor',
      senderName: user?.name || selectedTicket.name || 'Pengunjung',
      text: replyText.trim(),
    };

    await addTicketMessage(selectedTicket.id, newMsg);

    // Update local selected ticket view
    setSelectedTicket(prev => {
      if (!prev) return null;
      const currentMsgs = Array.isArray(prev.messages) ? prev.messages : [];
      return {
        ...prev,
        messages: [...currentMsgs, { ...newMsg, id: Date.now(), created_at: new Date().toISOString() }]
      };
    });

    setReplyText('');
  };

  const renderStatusBadge = (status) => {
    if (status === 'Selesai' || status === 'Tutup') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Selesai / Ditutup
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
        <Clock className="h-3.5 w-3.5 text-amber-600" /> Tiket Terbuka
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in space-y-8">
      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-700 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-sand-500/30 text-sand-300 text-xs font-bold px-3 py-1 rounded-full border border-sand-400/30 mb-3">
            <LifeBuoy className="h-3.5 w-3.5 text-sand-400" />
            Pusat Bantuan & Tiket Support
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Layanan Pengaduan & Bantuan Pengunjung
          </h1>
          <p className="text-ocean-200 text-xs md:text-sm mt-1 max-w-xl">
            Sampaikan pertanyaan, kendala transaksi, atau pengaduan layanan. Administrator kami akan memberikan balasan melalui sistem tiket live chat.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('create'); setSubmittedTicket(null); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'create'
                ? 'bg-sand-500 text-white shadow-md'
                : 'bg-white/10 text-ocean-200 hover:bg-white/20'
            }`}
          >
            + Buat Tiket Baru
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-sand-500 text-white shadow-md'
                : 'bg-white/10 text-ocean-200 hover:bg-white/20'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Daftar Tiket Saya ({myTickets.length})
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-ocean-100 shadow-sm">
            {submittedTicket ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-ocean-900">Tiket Dukungan Berhasil Dibuat!</h3>
                <p className="text-ocean-600 text-sm max-w-md mx-auto">
                  Terima kasih, laporan Anda telah diterima oleh Administrator JaringLokal.
                </p>

                <div className="bg-ocean-50 p-5 rounded-2xl border border-ocean-100 text-left text-sm space-y-2.5 max-w-md mx-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-ocean-500">Kode Tiket:</span>
                    <span className="font-bold text-ocean-900 bg-sand-100 text-sand-800 px-3 py-1 rounded-lg font-mono">{submittedTicket.ticket_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ocean-500">Kategori:</span>
                    <span className="font-semibold text-ocean-800">{submittedTicket.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ocean-500">Subjek:</span>
                    <span className="font-medium text-ocean-800">{submittedTicket.subject}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ocean-500">Status:</span>
                    {renderStatusBadge(submittedTicket.status)}
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setTicketForm({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: '',
                        category: 'Pertanyaan Umum',
                        subject: '',
                        message: ''
                      });
                    }}
                    variant="outline"
                  >
                    Kirim Tiket Lain
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedTicket(submittedTicket);
                      setActiveTab('list');
                    }}
                    className="bg-ocean-600"
                  >
                    Buka Percakapan Chat Tiket →
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-ocean-900 mb-1">Formulir Pengajuan Tiket Support</h2>
                <p className="text-ocean-500 text-xs md:text-sm mb-6">
                  Isi informasi di bawah ini untuk mengirimkan pertanyaan atau pengaduan kepada Admin.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Nama Lengkap / Visitor</label>
                    <Input
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      placeholder="Masukkan nama Anda"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ocean-700 mb-1">Email Kontak</label>
                      <Input
                        type="email"
                        required
                        value={ticketForm.email}
                        onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                        placeholder="contoh@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ocean-700 mb-1">No. WhatsApp / Telepon</label>
                      <Input
                        type="tel"
                        value={ticketForm.phone}
                        onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                        placeholder="081234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Kategori Masalah</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full h-11 px-3 text-sm rounded-xl border border-ocean-200 bg-white text-ocean-900 font-medium focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                      <option value="Kendala Transaksi & Pembayaran">Kendala Transaksi & Pembayaran</option>
                      <option value="Pengaduan Layanan & Produk">Pengaduan Layanan & Produk</option>
                      <option value="Pendaftaran Toko & Penjual">Pendaftaran Toko & Penjual</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Subjek Tiket</label>
                    <Input
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      placeholder="Ringkasan topik pertanyaan Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-700 mb-1">Pesan Lengkap / Detail Pengaduan</label>
                    <textarea
                      required
                      rows={5}
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      placeholder="Jelaskan pertanyaan atau masalah yang Anda alami secara rinci..."
                      className="w-full p-3.5 text-sm rounded-xl border border-ocean-200 bg-white text-ocean-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-y"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold bg-sand-500 hover:bg-sand-400 text-white flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Mengirim Tiket...' : 'Kirim Tiket Support ke Admin'}
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Info Side Column */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-ocean-900 text-white border-none shadow-lg">
              <Headphones className="h-10 w-10 text-sand-400 mb-3" />
              <h3 className="text-lg font-bold mb-2">Panduan Pengajuan Tiket</h3>
              <ul className="space-y-3 text-xs text-ocean-200 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-sand-400">1.</span>
                  <span><strong>Lupa Password:</strong> Layanan reset password adalah fungsi pra-login. Silakan hubungi WA Admin (<a href="https://wa.me/6281234567890?text=Halo%20Admin%20JaringLokal,%20saya%20butuh%20bantuan%20reset%20password." target="_blank" rel="noopener noreferrer" className="underline text-sand-300 font-semibold hover:text-white">Chat WA</a>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-sand-400">2.</span>
                  <span><strong>Balasan Admin:</strong> Admin akan meninjau dan merespon pesan Anda. Balasan dapat dipantau langsung di tab "Daftar Tiket Saya".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-sand-400">3.</span>
                  <span><strong>Penutupan Tiket:</strong> Setelah masalah teratasi, Admin dapat mengabaikan atau menutup tiket.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-white border-ocean-100 shadow-sm space-y-3">
              <h4 className="font-bold text-ocean-900 text-sm">Kontak Langsung Operational</h4>
              <div className="text-xs text-ocean-600 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-ocean-500" />
                  <span>bantuan@jaringlokal.id</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-ocean-500" />
                  <span>+62 812 3456 7890 (WA Support)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-ocean-500" />
                  <span>Senin - Minggu: 08:00 - 20:00 WIB</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* ── MY TICKET LIST TAB ── */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-ocean-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
              <Input
                placeholder="Cari kode tiket, subjek, kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-ocean-500 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Status:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-ocean-200 bg-white text-ocean-900 focus:ring-2 focus:ring-ocean-500"
              >
                <option value="all">Semua Status ({myTickets.length})</option>
                <option value="open">Terbuka / Diproses</option>
                <option value="closed">Selesai / Tutup</option>
              </select>
            </div>
          </div>

          {filteredMyTickets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-ocean-100 p-8 shadow-sm">
              <MessageSquare className="h-16 w-16 text-ocean-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-ocean-900 mb-2">Belum Ada Tiket Support</h3>
              <p className="text-ocean-500 text-sm mb-6 max-w-sm mx-auto">
                Anda belum pernah mengajukan tiket atau tidak ada tiket yang cocok dengan kata pencarian.
              </p>
              <Button onClick={() => setActiveTab('create')} className="bg-sand-500">
                + Buat Tiket Support Baru
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMyTickets.map((t) => {
                const msgList = Array.isArray(t.messages) && t.messages.length > 0
                  ? t.messages
                  : (t.message ? [{ id: 1, sender: 'visitor', senderName: t.name, text: t.message, created_at: t.created_at }] : []);

                const lastMsg = msgList[msgList.length - 1];

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="bg-white p-5 rounded-2xl border border-ocean-100 hover:border-ocean-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-sand-100 text-sand-800 px-2.5 py-0.5 rounded-md">
                          {t.ticket_code}
                        </span>
                        <span className="text-xs font-semibold text-ocean-600 bg-ocean-50 border border-ocean-200 px-2.5 py-0.5 rounded-md">
                          {t.category}
                        </span>
                        {renderStatusBadge(t.status)}
                      </div>

                      <h3 className="font-bold text-ocean-900 text-base truncate">
                        {t.subject}
                      </h3>

                      <p className="text-xs text-ocean-500 line-clamp-1">
                        Pesan terakhir: {lastMsg?.text || t.message || '-'}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 flex items-center gap-3">
                      <div className="text-xs text-ocean-400">
                        {new Date(t.created_at || Date.now()).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        Lihat Chat →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TICKET CHAT & DETAILS MODAL ── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-ocean-100 animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-ocean-900 p-5 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs bg-sand-500 text-white px-2 py-0.5 rounded">
                    {selectedTicket.ticket_code}
                  </span>
                  <span className="text-xs text-ocean-200">Kategori: {selectedTicket.category}</span>
                </div>
                <h3 className="font-bold text-lg text-white truncate max-w-md">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-ocean-300 hover:text-white p-1.5 rounded-lg hover:bg-ocean-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sub-header info */}
            <div className="bg-ocean-50 px-6 py-3 border-b border-ocean-100 flex items-center justify-between text-xs text-ocean-700 flex-shrink-0">
              <div className="flex items-center gap-4">
                <span>Pengirim: <strong>{selectedTicket.name}</strong> ({selectedTicket.email})</span>
              </div>
              <div>
                {renderStatusBadge(selectedTicket.status)}
              </div>
            </div>

            {/* Conversation Messages Scroll Box */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-ocean-50/30">
              {(() => {
                const msgList = Array.isArray(selectedTicket.messages) && selectedTicket.messages.length > 0
                  ? selectedTicket.messages
                  : (selectedTicket.message ? [{ id: 1, sender: 'visitor', senderName: selectedTicket.name, text: selectedTicket.message, created_at: selectedTicket.created_at }] : []);

                return msgList.map((msg, index) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-ocean-400 mb-1 px-1">
                        <span className="font-semibold text-ocean-700">{isAdmin ? '🛡️ Administrator' : msg.senderName || 'Anda'}</span>
                        <span>•</span>
                        <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-4 rounded-2xl max-w-lg text-sm shadow-sm ${
                        isAdmin 
                          ? 'bg-ocean-900 text-white rounded-tl-none' 
                          : 'bg-sand-500 text-white rounded-tr-none'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bottom Input Action */}
            <div className="p-4 bg-white border-t border-ocean-100 flex-shrink-0">
              {selectedTicket.status === 'Selesai' || selectedTicket.status === 'Tutup' ? (
                <div className="text-center py-2 text-xs text-ocean-500 bg-ocean-100 rounded-xl font-medium">
                  🔒 Tiket ini telah ditutup oleh Administrator.
                </div>
              ) : (
                <form onSubmit={handleSendChatReply} className="flex gap-2">
                  <Input
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis balasan atau pesan ke Admin..."
                    className="flex-1 text-sm"
                  />
                  <Button type="submit" className="bg-sand-500 hover:bg-sand-400 text-white px-5">
                    <Send className="h-4 w-4 mr-1" /> Kirim
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
