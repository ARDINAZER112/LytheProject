import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { logActivity, fetchUserLogs, getClientIpAndLocation } from '../lib/activityLogger';

const DataContext = createContext();

export const getVisitorDeviceId = () => {
  try {
    let devId = localStorage.getItem('jaringlokal_visitor_device_id');
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      localStorage.setItem('jaringlokal_visitor_device_id', devId);
    }
    return devId;
  } catch {
    return 'dev_default';
  }
};

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [orderChats, setOrderChats] = useState({});
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState(() => {
    const saved = localStorage.getItem('jaringlokal_visitor_count');
    return saved ? parseInt(saved, 10) : 18450;
  });
  const { user, updateUserRole } = useAuth();

  const loadLogs = async () => {
    const logsData = await fetchUserLogs();
    setUserLogs(logsData);
  };

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Process automatic updates for support tickets with no activity for 1 week (7 days)
  const processAutoUpdateInactiveTickets = async (ticketList) => {
    if (!Array.isArray(ticketList) || ticketList.length === 0) return ticketList;

    const now = Date.now();
    let hasChanges = false;

    const updatedList = await Promise.all(ticketList.map(async (ticket) => {
      const lastActivity = new Date(ticket.updated_at || ticket.created_at || now).getTime();
      const isInactiveOneWeek = (now - lastActivity) >= ONE_WEEK_MS;
      const isOpen = ticket.status === 'Terbuka' || ticket.status === 'Sedang Diproses';

      if (isOpen && isInactiveOneWeek) {
        hasChanges = true;
        const autoReply = 'Otomasisasi Sistem: Tiket ditutup secara otomatis karena tidak ada aktivitas selama 1 minggu.';
        const currentMsgs = Array.isArray(ticket.messages) ? ticket.messages : [];
        const newMsgs = [...currentMsgs, {
          id: Date.now(),
          sender: 'admin',
          senderName: 'Otomasisasi Sistem',
          text: autoReply,
          created_at: new Date().toISOString()
        }];

        const updatedTicket = {
          ...ticket,
          status: 'Selesai',
          admin_reply: autoReply,
          messages: newMsgs,
          updated_at: new Date().toISOString()
        };

        // Persist SQL update in database
        try {
          await supabase.from('support_tickets').update({
            status: 'Selesai',
            admin_reply: autoReply,
            messages: newMsgs,
            updated_at: new Date().toISOString()
          }).eq('id', ticket.id);
        } catch (e) {
          console.error('Failed to auto update inactive ticket in Supabase:', e);
        }

        return updatedTicket;
      }
      return ticket;
    }));

    if (hasChanges) {
      localStorage.setItem('jaringlokal_tickets', JSON.stringify(updatedList));
    }

    return updatedList;
  };

  // Load Support Tickets from Supabase with 1-week inactivity auto-update and account persistence
  const loadTickets = async () => {
    try {
      const savedGlobal = localStorage.getItem('jaringlokal_tickets');
      const parsedGlobal = savedGlobal ? JSON.parse(savedGlobal) : [];
      let savedUser = [];
      if (user?.id) {
        try {
          const uRaw = localStorage.getItem(`jaringlokal_user_tickets_${user.id}`);
          if (uRaw) savedUser = JSON.parse(uRaw);
        } catch (e) {
          savedUser = [];
        }
      }

      const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      let remoteData = Array.isArray(data) && !error ? data : [];

      const ticketMap = new Map();
      [...parsedGlobal, ...savedUser, ...remoteData].forEach(t => {
        if (t && t.ticket_code) {
          if (!ticketMap.has(t.ticket_code)) {
            ticketMap.set(t.ticket_code, t);
          } else {
            const existing = ticketMap.get(t.ticket_code);
            const exMsgs = Array.isArray(existing.messages) ? existing.messages.length : 0;
            const tMsgs = Array.isArray(t.messages) ? t.messages.length : 0;
            if (tMsgs >= exMsgs) {
              ticketMap.set(t.ticket_code, { ...existing, ...t });
            }
          }
        }
      });

      const mergedList = Array.from(ticketMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      const processed = await processAutoUpdateInactiveTickets(mergedList);
      setTickets(processed);
      localStorage.setItem('jaringlokal_tickets', JSON.stringify(processed));
    } catch {
      const saved = localStorage.getItem('jaringlokal_tickets');
      const parsed = saved ? JSON.parse(saved) : [];
      setTickets(parsed);
    }
  };

  // Load Stores from Supabase
  const loadStores = async () => {
    try {
      const { data, error } = await supabase.from('stores').select('*').order('id', { ascending: true });
      if (!error && Array.isArray(data)) {
        setStores(data);
        localStorage.setItem('jaringlokal_stores', JSON.stringify(data));
      } else {
        const savedStores = localStorage.getItem('jaringlokal_stores');
        setStores(savedStores ? JSON.parse(savedStores) : []);
      }
    } catch {
      const savedStores = localStorage.getItem('jaringlokal_stores');
      setStores(savedStores ? JSON.parse(savedStores) : []);
    }
  };

  // Load Products from Supabase
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (!error && Array.isArray(data)) {
        const formatted = data.map(p => ({
          ...p,
          store_name: p.store_name || '',
        }));
        setProducts(formatted);
        localStorage.setItem('jaringlokal_products', JSON.stringify(formatted));
      } else {
        const savedProducts = localStorage.getItem('jaringlokal_products');
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
      }
    } catch {
      const savedProducts = localStorage.getItem('jaringlokal_products');
      setProducts(savedProducts ? JSON.parse(savedProducts) : []);
    }
  };

  // Load Orders from Supabase
  const loadOrders = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const formattedOrders = data.map(o => ({
          ...o,
          userName: o.user_name || o.userName,
          totalAmount: o.total_amount || o.totalAmount,
          date: o.created_at || o.date,
        }));
        setOrders(formattedOrders);
        localStorage.setItem('jaringlokal_orders', JSON.stringify(formattedOrders));
      } else {
        const savedOrders = localStorage.getItem('jaringlokal_orders');
        setOrders(savedOrders ? JSON.parse(savedOrders) : []);
      }
    } catch {
      const savedOrders = localStorage.getItem('jaringlokal_orders');
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
    }
  };

  // Load Order Chats for a specific order
  const loadOrderChats = async (orderId) => {
    if (!orderId) return [];
    try {
      const { data, error } = await supabase
        .from('order_chats')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        setOrderChats(prev => ({ ...prev, [orderId]: data }));
        localStorage.setItem(`jaringlokal_order_chat_${orderId}`, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Failed to load order chats from Supabase:', e);
    }
    const saved = localStorage.getItem(`jaringlokal_order_chat_${orderId}`);
    const parsed = saved ? JSON.parse(saved) : [];
    setOrderChats(prev => ({ ...prev, [orderId]: parsed }));
    return parsed;
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.allSettled([loadStores(), loadProducts(), loadOrders(), loadLogs(), loadTickets()]);
      setTimeout(() => {
        setLoading(false);
      }, 700);
    };

    initData();

    try {
      const savedCart = localStorage.getItem('jaringlokal_cart');
      if (savedCart && savedCart !== 'undefined') {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      localStorage.removeItem('jaringlokal_cart');
    }

    // ── Supabase Real-Time Subscriptions for Automatic Live Updates ──
    const channel = supabase
      .channel('public-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [...prev.filter(p => p.id !== payload.new.id), payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setStores(prev => [...prev.filter(s => s.id !== payload.new.id), payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setStores(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s));
        } else if (payload.eventType === 'DELETE') {
          setStores(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const formatted = {
            ...payload.new,
            userName: payload.new.user_name || payload.new.userName,
            totalAmount: payload.new.total_amount || payload.new.totalAmount,
            date: payload.new.created_at || payload.new.date,
          };
          setOrders(prev => [formatted, ...prev.filter(o => o.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? {
            ...o,
            ...payload.new,
            userName: payload.new.user_name || o.userName,
            totalAmount: payload.new.total_amount || o.totalAmount,
            status: payload.new.status || o.status,
            escrow_status: payload.new.escrow_status || o.escrow_status,
          } : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_chats' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const msg = payload.new;
          const orderId = msg.order_id;
          setOrderChats(prev => {
            const current = prev[orderId] || [];
            if (current.some(m => m.id === msg.id)) return prev;
            const updated = [...current, msg];
            localStorage.setItem(`jaringlokal_order_chat_${orderId}`, JSON.stringify(updated));
            return { ...prev, [orderId]: updated };
          });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_logs' }, (payload) => {
        setUserLogs(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new, ...prev.filter(t => t.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Sync user role when store status changes to approved/rejected ──
  useEffect(() => {
    if (user && user.role !== 'admin' && stores.length > 0) {
      const myStore = stores.find(s => String(s.user_id) === String(user.id));
      if (myStore?.status === 'approved' && user.role !== 'seller') {
        updateUserRole('seller');
      } else if ((!myStore || myStore.status !== 'approved') && user.role === 'seller') {
        updateUserRole('customer');
      }
    }
  }, [user, stores, updateUserRole]);

  // ── Store Registration & Management ────────────────────────
  const registerStore = async (storeDetails) => {
    if (!user) return { success: false, error: 'Silakan masuk (login) terlebih dahulu.' };

    const existingStore = stores.find(s => String(s.user_id) === String(user.id));

    const newStoreData = {
      user_id: user.id || Date.now(),
      store_name: storeDetails.store_name,
      description: storeDetails.description || '',
      address: storeDetails.address || '',
      phone: storeDetails.phone || '',
      status: 'pending', // Re-submitted or fresh application resets to pending
    };

    if (existingStore) {
      // Re-application: update existing store record to pending status
      const updatedStores = stores.map(s => String(s.user_id) === String(user.id) ? { ...s, ...newStoreData, status: 'pending' } : s);
      setStores(updatedStores);
      localStorage.setItem('jaringlokal_stores', JSON.stringify(updatedStores));

      try {
        const { data, error } = await supabase
          .from('stores')
          .update({ ...newStoreData, status: 'pending' })
          .eq('id', existingStore.id)
          .select()
          .single();

        if (!error && data) {
          loadStores();
          return { success: true, store: data, isResubmission: true };
        }
      } catch (err) {
        console.error('Failed to update re-submitted store in Supabase:', err);
      }
      return { success: true, store: { ...existingStore, ...newStoreData, status: 'pending' }, isResubmission: true };
    }

    // New store application
    const tempStore = { ...newStoreData, id: Date.now() };
    const updatedStores = [...stores, tempStore];
    setStores(updatedStores);
    localStorage.setItem('jaringlokal_stores', JSON.stringify(updatedStores));

    try {
      const { data, error } = await supabase.from('stores').insert([newStoreData]).select().single();
      if (!error && data) {
        tempStore.id = data.id;
        loadStores();
      }
    } catch (err) {
      console.error('Failed to insert store to Supabase:', err);
    }

    return { success: true, store: tempStore, isResubmission: false };
  };

  const updateStoreStatus = async (storeId, newStatus) => {
    const targetStore = stores.find(s => s.id === storeId);
    if (!targetStore) return { success: false, error: 'Data toko tidak ditemukan.' };

    // Enforcement: Once a status is set to "rejected", it cannot be changed to "approved" directly
    if (targetStore.status === 'rejected' && newStatus === 'approved') {
      return {
        success: false,
        error: 'Permohonan toko yang telah berstatus Ditolak (Rejected) tidak dapat langsung disetujui. Pengguna harus mengajukan pendaftaran toko baru terlebih dahulu.'
      };
    }

    const updatedStores = stores.map(s => s.id === storeId ? { ...s, status: newStatus } : s);
    setStores(updatedStores);
    localStorage.setItem('jaringlokal_stores', JSON.stringify(updatedStores));

    try {
      await supabase.from('stores').update({ status: newStatus }).eq('id', storeId);
      if (targetStore?.user_id) {
        const newRole = newStatus === 'approved' ? 'seller' : 'customer';
        await supabase.from('users').update({ role: newRole }).eq('id', targetStore.user_id);
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to update store status in Supabase:', err);
      return { success: false, error: err.message };
    }
  };

  // Helper to get current user's store
  const getStoreForUser = (userId) => {
    if (!userId) return null;
    return stores.find(s => String(s.user_id) === String(userId)) || null;
  };

  // ── Product CRUD Operations ──────────────────────────────────
  const addProduct = async (product) => {
    const userStore = getStoreForUser(user?.id);
    const newProduct = {
      ...product,
      store_id: product.store_id || (userStore ? userStore.id : null),
      store_name: product.store_name || (userStore ? userStore.store_name : 'Toko Nelayan Bahari Pak Bambang'),
    };
    delete newProduct.id;

    // Optimistic UI Update
    const tempProduct = { ...newProduct, id: Date.now() };
    const updatedList = [...products, tempProduct];
    setProducts(updatedList);
    localStorage.setItem('jaringlokal_products', JSON.stringify(updatedList));

    try {
      const { data, error } = await supabase.from('products').insert([newProduct]).select();
      if (!error && data && data.length > 0) {
        loadProducts();
      }
    } catch (err) {
      console.error('Failed to add product to Supabase:', err);
    }
  };

  const updateProduct = async (id, updatedFields) => {
    const updatedList = products.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    setProducts(updatedList);
    localStorage.setItem('jaringlokal_products', JSON.stringify(updatedList));

    try {
      await supabase.from('products').update(updatedFields).eq('id', id);
    } catch (err) {
      console.error('Failed to update product in Supabase:', err);
    }
  };

  const deleteProduct = async (id) => {
    const updatedList = products.filter(p => p.id !== id);
    setProducts(updatedList);
    localStorage.setItem('jaringlokal_products', JSON.stringify(updatedList));

    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete product in Supabase:', err);
    }
  };

  // ── Cart Operations ─────────────────────────────────────────
  const addToCart = (product, quantity = 1) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }
    setCart(newCart);
    localStorage.setItem('jaringlokal_cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity < 1) return;
    const newCart = cart.map(item => item.id === id ? { ...item, quantity } : item);
    setCart(newCart);
    localStorage.setItem('jaringlokal_cart', JSON.stringify(newCart));
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('jaringlokal_cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('jaringlokal_cart');
  };

  // ── Order & Escrow Operations ──────────────────────────────
  const checkout = async (userId, userName) => {
    if (cart.length === 0) return { success: false, error: 'Keranjang kosong.' };
    const purchasedItems = [...cart];
    const subtotal = purchasedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 15000;
    const totalAmount = subtotal + shippingFee;

    // Detect store details from items in cart
    const firstItem = purchasedItems[0];
    const storeId = firstItem?.store_id || null;
    const storeName = firstItem?.store_name || 'Toko Mitra Nelayan';
    const storeObj = stores.find(s => s.id === storeId || s.store_name === storeName);
    const sellerId = storeObj?.user_id || null;

    const dbOrder = {
      user_id: userId || null,
      user_name: userName || user?.name || 'Pelanggan',
      seller_id: sellerId,
      store_id: storeId,
      store_name: storeName,
      total_amount: totalAmount,
      shipping_fee: shippingFee,
      status: 'Menunggu Pembayaran Escrow',
      escrow_status: 'pending_payment',
      items: purchasedItems,
    };

    const tempOrderId = Date.now();
    const tempOrder = {
      ...dbOrder,
      id: tempOrderId,
      userName: dbOrder.user_name,
      totalAmount,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setOrders(prev => [tempOrder, ...prev]);
    clearCart();

    // ── 1. AUTOMATIC PRODUCT STOCK REDUCTION ─────────────────────
    setProducts(prevProducts => {
      const updatedList = prevProducts.map(prod => {
        const itemMatch = purchasedItems.find(it => String(it.id) === String(prod.id));
        if (itemMatch) {
          const newStock = Math.max(0, Number(prod.stock || 0) - Number(itemMatch.quantity || 1));
          return { ...prod, stock: newStock };
        }
        return prod;
      });
      localStorage.setItem('jaringlokal_products', JSON.stringify(updatedList));
      return updatedList;
    });

    purchasedItems.forEach(async (item) => {
      try {
        const matchingProd = products.find(p => String(p.id) === String(item.id));
        if (matchingProd) {
          const newStock = Math.max(0, Number(matchingProd.stock || 0) - Number(item.quantity || 1));
          await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
        }
      } catch (err) {
        console.error(`Failed to update stock in database for product ${item.id}:`, err);
      }
    });

    // ── 2. LOG PURCHASE ACTIVITY (IP & GEOLOCATION) ──────────────
    logActivity({
      action: 'purchase',
      userId,
      userName: dbOrder.user_name,
      metadata: {
        total_amount: totalAmount,
        items_count: purchasedItems.length,
        order_id: tempOrder.id,
      },
    }).then(() => loadLogs());

    let finalOrder = tempOrder;

    try {
      const { data, error } = await supabase.from('orders').insert([dbOrder]).select().single();
      if (!error && data) {
        finalOrder = {
          ...data,
          userName: data.user_name,
          totalAmount: data.total_amount,
          date: data.created_at,
        };
        setOrders(prev => [finalOrder, ...prev.filter(o => o.id !== tempOrderId)]);
        loadOrders();
      }
    } catch (err) {
      console.error('Failed to submit order to Supabase:', err);
    }

    // ── 3. AUTOMATIC INITIAL ESCROW SYSTEM MESSAGE ────────────────
    const welcomeMsgText = `🛡️ Transaksi Rekening Bersama (Escrow) JaringLokal dimulai untuk Pesanan #${finalOrder.id}.
• Total Pembayaran: Rp ${totalAmount.toLocaleString('id-ID')}
• Toko Penjual: ${storeName}
• Pembeli: ${dbOrder.user_name}

Silakan Pembeli melakukan konfirmasi pembayaran ke Rekening Bersama Admin untuk diproses secara aman.`;

    sendOrderChatMessage({
      orderId: finalOrder.id,
      text: welcomeMsgText,
      senderRole: 'system',
      senderName: 'Sistem Escrow JaringLokal',
      senderId: null,
    });

    return { success: true, order: finalOrder };
  };

  const updateOrderStatus = async (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    try {
      await supabase.from('orders').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Failed to update order status in Supabase:', err);
    }
  };

  const updateOrderEscrowStatus = async (orderId, newStatus, newEscrowStatus, systemNote = null) => {
    setOrders(prev => prev.map(o => o.id === Number(orderId) || String(o.id) === String(orderId) ? {
      ...o,
      status: newStatus || o.status,
      escrow_status: newEscrowStatus || o.escrow_status,
      updated_at: new Date().toISOString()
    } : o));

    try {
      const updatePayload = { updated_at: new Date().toISOString() };
      if (newStatus) updatePayload.status = newStatus;
      if (newEscrowStatus) updatePayload.escrow_status = newEscrowStatus;
      await supabase.from('orders').update(updatePayload).eq('id', orderId);
    } catch (err) {
      console.error('Failed to update order escrow status in Supabase:', err);
    }

    if (systemNote) {
      await sendOrderChatMessage({
        orderId,
        text: systemNote,
        senderRole: 'system',
        senderName: 'Sistem Escrow JaringLokal',
        senderId: null,
      });
    }
  };

  // ── Escrow Multi-Party Order Chat Operations ────────────────
  const sendOrderChatMessage = async ({ orderId, text, senderRole, senderName, senderId }) => {
    if (!orderId || !text?.trim()) return { success: false };

    const resolvedRole = senderRole || (user?.role === 'admin' ? 'admin' : user?.role === 'seller' ? 'seller' : 'buyer');
    const resolvedName = senderName || user?.name || (resolvedRole === 'admin' ? 'Admin Escrow' : resolvedRole === 'seller' ? 'Penjual' : 'Pembeli');

    const newMsg = {
      order_id: Number(orderId),
      sender_id: senderId || user?.id || null,
      sender_name: resolvedName,
      sender_role: resolvedRole,
      text: text.trim(),
      created_at: new Date().toISOString(),
    };

    const tempMsg = { ...newMsg, id: Date.now() };

    // Update local state optimistically
    setOrderChats(prev => {
      const current = prev[orderId] || [];
      const updated = [...current, tempMsg];
      localStorage.setItem(`jaringlokal_order_chat_${orderId}`, JSON.stringify(updated));
      return { ...prev, [orderId]: updated };
    });

    try {
      const { data, error } = await supabase.from('order_chats').insert([newMsg]).select().single();
      if (!error && data) {
        setOrderChats(prev => {
          const current = prev[orderId] || [];
          const updated = current.map(m => m.id === tempMsg.id ? data : m);
          localStorage.setItem(`jaringlokal_order_chat_${orderId}`, JSON.stringify(updated));
          return { ...prev, [orderId]: updated };
        });
        return { success: true, message: data };
      }
    } catch (err) {
      console.error('Failed to send order chat message to Supabase:', err);
    }

    return { success: true, message: tempMsg };
  };

  // ── Support Ticket Operations ──────────────────────────────
  const createTicket = async (ticketData) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const createdAt = new Date().toISOString();
    const initialMessage = ticketData.message || '';
    const visitorDevId = getVisitorDeviceId();
    const geoInfo = await getClientIpAndLocation().catch(() => ({ ip_address: '180.252.124.58' }));
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    const newTicket = {
      ticket_code: `TCK-${randomNum}`,
      user_id: user?.id || ticketData.user_id || null,
      name: ticketData.name || user?.name || 'Pengguna',
      email: ticketData.email || user?.email || 'user@jaringlokal.com',
      phone: ticketData.phone || '',
      category: ticketData.category || 'Pertanyaan Umum',
      subject: ticketData.subject || 'Bantuan Layanan',
      message: initialMessage,
      messages: [
        {
          id: Date.now(),
          sender: 'visitor',
          senderName: ticketData.name || user?.name || 'Pengguna',
          text: initialMessage,
          created_at: createdAt,
        }
      ],
      status: 'Terbuka',
      admin_reply: null,
      ip_address: geoInfo.ip_address || '180.252.124.58',
      user_agent: userAgent,
      visitor_device_id: visitorDevId,
      created_at: createdAt,
      updated_at: createdAt,
    };

    // Save ticket code and email into persistent localStorage tracking
    try {
      const existingCodesRaw = localStorage.getItem('jaringlokal_my_ticket_codes');
      const existingCodes = existingCodesRaw ? JSON.parse(existingCodesRaw) : [];
      if (!existingCodes.includes(newTicket.ticket_code)) {
        localStorage.setItem('jaringlokal_my_ticket_codes', JSON.stringify([newTicket.ticket_code, ...existingCodes]));
      }
      if (ticketData.email) {
        localStorage.setItem('jaringlokal_last_visitor_email', ticketData.email);
      }
    } catch (e) {
      console.warn('Failed to update local ticket codes tracking:', e);
    }

    const tempTicket = { ...newTicket, id: Date.now() };
    const updated = [tempTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem('jaringlokal_tickets', JSON.stringify(updated));
    if (user?.id) {
      localStorage.setItem(`jaringlokal_user_tickets_${user.id}`, JSON.stringify(
        updated.filter(t => String(t.user_id) === String(user.id) || t.email?.toLowerCase() === user.email?.toLowerCase())
      ));
    }

    try {
      const { data, error } = await supabase.from('support_tickets').insert([newTicket]).select().single();
      if (!error && data) {
        tempTicket.id = data.id;
        loadTickets();
      }
    } catch (err) {
      console.error('Failed to create support ticket in Supabase:', err);
    }

    return { success: true, ticket: tempTicket };
  };

  const updateTicketStatus = async (ticketId, status, adminReply = null) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        const newMessages = Array.isArray(t.messages) ? [...t.messages] : (t.message ? [{ id: 1, sender: 'visitor', senderName: t.name, text: t.message, created_at: t.created_at }] : []);
        if (adminReply !== null && adminReply.trim() !== '') {
          newMessages.push({
            id: Date.now(),
            sender: 'admin',
            senderName: 'Tim Dukungan Admin',
            text: adminReply,
            created_at: new Date().toISOString()
          });
        }
        return {
          ...t,
          status,
          admin_reply: adminReply !== null ? adminReply : t.admin_reply,
          messages: newMessages,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem('jaringlokal_tickets', JSON.stringify(updated));

    try {
      const target = updated.find(t => t.id === ticketId);
      const updatePayload = {
        status,
        updated_at: new Date().toISOString()
      };
      if (target) {
        if (target.admin_reply !== undefined) updatePayload.admin_reply = target.admin_reply;
        if (target.messages !== undefined) updatePayload.messages = target.messages;
      }
      await supabase.from('support_tickets').update(updatePayload).eq('id', ticketId);
    } catch (err) {
      console.error('Failed to update ticket status in Supabase:', err);
    }
  };

  const addTicketMessage = async (ticketId, messageObj) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        const currentMessages = Array.isArray(t.messages) && t.messages.length > 0
          ? [...t.messages]
          : [{ id: 1, sender: 'visitor', senderName: t.name || 'Pengunjung', text: t.message || '', created_at: t.created_at || new Date().toISOString() }];

        const newMsgList = [...currentMessages, {
          id: Date.now(),
          sender: messageObj.sender || 'visitor',
          senderName: messageObj.senderName || 'Pengunjung',
          text: messageObj.text || '',
          created_at: new Date().toISOString()
        }];

        return {
          ...t,
          messages: newMsgList,
          admin_reply: messageObj.sender === 'admin' ? messageObj.text : t.admin_reply,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    setTickets(updated);
    localStorage.setItem('jaringlokal_tickets', JSON.stringify(updated));

    try {
      const target = updated.find(t => t.id === ticketId);
      if (target) {
        await supabase.from('support_tickets').update({
          messages: target.messages,
          admin_reply: target.admin_reply,
          updated_at: new Date().toISOString()
        }).eq('id', ticketId);
      }
    } catch (err) {
      console.error('Failed to add message to ticket in Supabase:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      loading,
      products, addProduct, updateProduct, deleteProduct,
      stores, registerStore, updateStoreStatus, getStoreForUser,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
      orders, checkout, updateOrderStatus, updateOrderEscrowStatus,
      orderChats, loadOrderChats, sendOrderChatMessage,
      tickets, createTicket, updateTicketStatus, addTicketMessage, loadTickets,
      userLogs, loadLogs,
      visitorCount,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
