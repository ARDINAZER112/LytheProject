import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Headphones, CheckCircle2, Clock, Search, Mail, Phone, X, Send, 
  MessageSquare, Lock, RefreshCw, AlertCircle, ShieldCheck, User
} from 'lucide-react';

export function AdminTickets() {
  const { tickets = [], updateTicketStatus, addTicketMessage } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.ticket_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'open' && (t.status === 'Terbuka' || t.status === 'Sedang Diproses')) ||
                          (filterStatus === 'closed' && (t.status === 'Selesai' || t.status === 'Tutup'));
    
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Terbuka' || t.status === 'Sedang Diproses').length;
  const closedCount = tickets.filter(t => t.status === 'Selesai' || t.status === 'Tutup').length;

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReplyInput.trim() || !selectedTicket) return;

    const replyMsg = {
      sender: 'admin',
      senderName: 'Tim Support Administrator',
      text: adminReplyInput.trim(),
    };

    await addTicketMessage(selectedTicket.id, replyMsg);

    setSelectedTicket(prev => {
      if (!prev) return null;
      const currentMsgs = Array.isArray(prev.messages) ? prev.messages : [];
      return {
        ...prev,
        admin_reply: adminReplyInput.trim(),
        messages: [...currentMsgs, { ...replyMsg, id: Date.now(), created_at: new Date().toISOString() }]
      };
    });

    setAdminReplyInput('');
  };

  const handleToggleCloseTicket = async (ticketId, currentStatus) => {
    const isCurrentlyClosed = currentStatus === 'Selesai' || currentStatus === 'Tutup';
    const newStatus = isCurrentlyClosed ? 'Terbuka' : 'Selesai';

    await updateTicketStatus(ticketId, newStatus);

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? ({ ...prev, status: newStatus }) : null);
    }
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
        <Clock className="h-3.5 w-3.5 text-amber-600" /> Terbuka
      </span>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ocean-900 flex items-center gap-2">
            <Headphones className="h-7 w-7 text-ocean-600" />
            Manajemen Tiket Support & Layanan Pengaduan
          </h1>
          <p className="text-ocean-500 text-sm mt-0.5">
            Kelola pertanyaan pengunjung, kendala reset password, dan tutup tiket yang telah ditangani.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-ocean-100">
          <p className="text-xs text-ocean-500 font-medium">Total Tiket Dukungan</p>
          <p className="text-2xl font-bold text-ocean-900 mt-1">{totalCount}</p>
        </Card>
        <Card className="p-4 bg-amber-50/60 border-amber-200">
          <p className="text-xs text-amber-800 font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Tiket Terbuka (Perlu Respon)
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{openCount}</p>
        </Card>
        <Card className="p-4 bg-emerald-50/60 border-emerald-200">
          <p className="text-xs text-emerald-800 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Tiket Selesai / Ditutup
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{closedCount}</p>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-ocean-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-ocean-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
            <Input
              placeholder="Cari kode tiket, email, nama, subjek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-ocean-200 bg-white text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="Lupa Password / Reset Password">Lupa Password</option>
              <option value="Kendala Transaksi & Pembayaran">Kendala Transaksi</option>
              <option value="Pengaduan Layanan & Produk">Pengaduan Layanan</option>
              <option value="Pertanyaan Umum">Pertanyaan Umum</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-ocean-200 bg-white text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500"
            >
              <option value="all">Semua Status ({tickets.length})</option>
              <option value="open">Terbuka ({openCount})</option>
              <option value="closed">Selesai / Ditutup ({closedCount})</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode & Pengirim Tiket</TableHead>
              <TableHead>Kategori & Subjek</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead>Status Tiket</TableHead>
              <TableHead className="text-right">Tindakan Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const isClosed = ticket.status === 'Selesai' || ticket.status === 'Tutup';
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-ocean-100 rounded-xl text-ocean-700 flex-shrink-0 mt-0.5">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-xs text-sand-800 bg-sand-100 px-2 py-0.5 rounded w-fit mb-1">
                            {ticket.ticket_code}
                          </div>
                          <div className="font-bold text-ocean-900 text-sm">{ticket.name}</div>
                          <div className="text-xs text-ocean-500">{ticket.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-600 bg-ocean-50 border border-ocean-200 px-2 py-0.5 rounded">
                          {ticket.category}
                        </span>
                        <div className="font-semibold text-ocean-900 text-sm line-clamp-1">{ticket.subject}</div>
                        <div className="text-xs text-ocean-500 line-clamp-1">{ticket.message}</div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-ocean-600">
                      {new Date(ticket.created_at || Date.now()).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>

                    <TableCell>
                      {renderStatusBadge(ticket.status)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-xs h-8 px-3"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Respon Chat
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleToggleCloseTicket(ticket.id, ticket.status)}
                          className={`text-xs h-8 px-3 ${
                            isClosed
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isClosed ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Buka Kembali
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Tutup Tiket
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-ocean-500">
                  <Headphones className="h-10 w-10 mx-auto text-ocean-200 mb-2" />
                  <p className="font-semibold text-sm">Tidak ada tiket dukungan ditemukan.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── ADMIN CHAT & DETAIL INSPECTOR DRAWER MODAL ── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-ocean-100 animate-slide-up flex flex-col max-h-[90vh]">
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

            <div className="bg-ocean-50 px-6 py-3 border-b border-ocean-100 flex items-center justify-between text-xs text-ocean-800 flex-shrink-0">
              <div>
                Visitor: <strong>{selectedTicket.name}</strong> ({selectedTicket.email}) {selectedTicket.phone ? `• WA: ${selectedTicket.phone}` : ''}
              </div>
              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedTicket.status)}
                <Button
                  size="sm"
                  onClick={() => handleToggleCloseTicket(selectedTicket.id, selectedTicket.status)}
                  className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {selectedTicket.status === 'Selesai' || selectedTicket.status === 'Tutup' ? 'Buka Tiket' : 'Tutup Tiket'}
                </Button>
              </div>
            </div>

            {/* Conversation list */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-ocean-50/30">
              {(() => {
                const msgList = Array.isArray(selectedTicket.messages) && selectedTicket.messages.length > 0
                  ? selectedTicket.messages
                  : (selectedTicket.message ? [{ id: 1, sender: 'visitor', senderName: selectedTicket.name, text: selectedTicket.message, created_at: selectedTicket.created_at }] : []);

                return msgList.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-ocean-400 mb-1 px-1">
                        <span className="font-semibold text-ocean-700">{isAdmin ? '🛡️ Tim Support Admin' : msg.senderName || selectedTicket.name}</span>
                        <span>•</span>
                        <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-4 rounded-2xl max-w-lg text-sm shadow-sm ${
                        isAdmin 
                          ? 'bg-ocean-900 text-white rounded-tr-none' 
                          : 'bg-white border border-ocean-200 text-ocean-900 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Admin Input action */}
            <div className="p-4 bg-white border-t border-ocean-100 flex-shrink-0">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <Input
                  required
                  value={adminReplyInput}
                  onChange={(e) => setAdminReplyInput(e.target.value)}
                  placeholder="Kirimkan pesan balasan resmi Administrator..."
                  className="flex-1 text-sm"
                />
                <Button type="submit" className="bg-ocean-600 hover:bg-ocean-700 text-white px-5">
                  <Send className="h-4 w-4 mr-1" /> Balas Chat
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
