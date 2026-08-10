import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { logActivity, fetchUserLogs } from '../lib/activityLogger';

const DataContext = createContext();

const initialStores = [
  {
    id: 1,
    user_id: 2,
    store_name: 'Toko Nelayan Bahari Pak Bambang',
    description: 'Penyedia hasil laut segar langsung dari tangkapan nelayan pesisir Tuban.',
    address: 'Jl. Pesisir Pantai Kradenan No. 12, Tuban',
    phone: '081234567890',
    status: 'approved',
  },
  {
    id: 2,
    user_id: 3,
    store_name: 'Dapur Olahan Laut Ibu Siti',
    description: 'Olahan khas ikan asap, terasi super, dan bandeng presto higienis.',
    address: 'Jl. Raya Nelayan No. 45, Tuban',
    phone: '089876543210',
    status: 'approved',
  }
];

const initialProducts = [
  { id: 1, store_id: 2, store_name: 'Dapur Olahan Laut Ibu Siti', name: 'Terasi Pesisir Tuban', price: 25000, category: 'Olahan', stock: 50, image: 'https://images.unsplash.com/photo-1621317762692-0f04f2f53472?auto=format&fit=crop&q=80&w=400', unit: 'bungkus' },
  { id: 2, store_id: 1, store_name: 'Toko Nelayan Bahari Pak Bambang', name: 'Rajungan Segar', price: 85000, category: 'Tangkapan Segar', stock: 20, image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400', unit: 'kg' },
  { id: 3, store_id: 2, store_name: 'Dapur Olahan Laut Ibu Siti', name: 'Ikan Asap Tuban', price: 35000, category: 'Olahan', stock: 30, image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=400', unit: 'kg' },
  { id: 4, store_id: 1, store_name: 'Toko Nelayan Bahari Pak Bambang', name: 'Cumi-cumi Segar', price: 60000, category: 'Tangkapan Segar', stock: 40, image: 'https://images.unsplash.com/photo-1559868725-b467ec6a6d0c?auto=format&fit=crop&q=80&w=400', unit: 'kg' },
  { id: 5, store_id: 1, store_name: 'Toko Nelayan Bahari Pak Bambang', name: 'Udang Vaname Segar', price: 75000, category: 'Tangkapan Segar', stock: 35, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=400', unit: 'kg' },
  { id: 6, store_id: 1, store_name: 'Toko Nelayan Bahari Pak Bambang', name: 'Ikan Kerapu Merah', price: 120000, category: 'Tangkapan Segar', stock: 8, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400', unit: 'kg' },
  { id: 7, store_id: 1, store_name: 'Toko Nelayan Bahari Pak Bambang', name: 'Kerang Hijau', price: 30000, category: 'Tangkapan Segar', stock: 60, image: 'https://images.unsplash.com/photo-1569385210018-127685f22b5a?auto=format&fit=crop&q=80&w=400', unit: 'kg' },
  { id: 8, store_id: 2, store_name: 'Dapur Olahan Laut Ibu Siti', name: 'Bandeng Presto', price: 45000, category: 'Olahan', stock: 25, image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&q=80&w=400', unit: 'ekor' },
];

const initialOrders = [
  {
    id: 101,
    userName: 'Budi Santoso',
    totalAmount: 255000,
    status: 'Selesai',
    items: [
      { id: 2, name: 'Rajungan Segar', price: 85000, quantity: 3, unit: 'kg', store_name: 'Toko Nelayan Bahari Pak Bambang' }
    ],
    date: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 102,
    userName: 'Siti Rahma',
    totalAmount: 125000,
    status: 'Selesai',
    items: [
      { id: 1, name: 'Terasi Pesisir Tuban', price: 25000, quantity: 5, unit: 'bungkus', store_name: 'Dapur Olahan Laut Ibu Siti' }
    ],
    date: '2026-08-03T14:30:00.000Z'
  },
  {
    id: 103,
    userName: 'Ahmad Fauzi',
    totalAmount: 180000,
    status: 'Dikirim',
    items: [
      { id: 4, name: 'Cumi-cumi Segar', price: 60000, quantity: 3, unit: 'kg', store_name: 'Toko Nelayan Bahari Pak Bambang' }
    ],
    date: '2026-08-05T09:15:00.000Z'
  },
  {
    id: 104,
    userName: 'Dewi Lestari',
    totalAmount: 105000,
    status: 'Diproses',
    items: [
      { id: 3, name: 'Ikan Asap Tuban', price: 35000, quantity: 3, unit: 'kg', store_name: 'Dapur Olahan Laut Ibu Siti' }
    ],
    date: '2026-08-06T16:20:00.000Z'
  }
];

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [stores, setStores]     = useState([]);
  const [orders, setOrders]     = useState([]);
  const [cart, setCart]         = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [visitorCount, setVisitorCount] = useState(() => {
    const saved = localStorage.getItem('jaringlokal_visitor_count');
    return saved ? parseInt(saved, 10) : 18450;
  });
  const { user, updateUserRole } = useAuth();

  const loadLogs = async () => {
    const logsData = await fetchUserLogs();
    setUserLogs(logsData);
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

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.allSettled([loadStores(), loadProducts(), loadOrders(), loadLogs()]);
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
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_logs' }, (payload) => {
        setUserLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Store Registration & Management ────────────────────────
  const registerStore = async (storeDetails) => {
    if (!user) return { success: false, error: 'Silakan masuk (login) terlebih dahulu.' };

    const newStore = {
      user_id: user.id || Date.now(),
      store_name: storeDetails.store_name,
      description: storeDetails.description || '',
      address: storeDetails.address || '',
      phone: storeDetails.phone || '',
      status: 'approved', // Auto-approve upon registration to grant seller status
    };

    // Optimistic UI update
    const tempStore = { ...newStore, id: Date.now() };
    const updatedStores = [...stores, tempStore];
    setStores(updatedStores);
    localStorage.setItem('jaringlokal_stores', JSON.stringify(updatedStores));

    try {
      const { data, error } = await supabase.from('stores').insert([newStore]).select().single();
      if (!error && data) {
        tempStore.id = data.id;
        loadStores();
      }
    } catch (err) {
      console.error('Failed to insert store to Supabase:', err);
    }

    // Automatically update user role to seller!
    await updateUserRole('seller');

    return { success: true, store: tempStore };
  };

  // Helper to get current user's store
  const getStoreForUser = (userId) => {
    if (!userId) return null;
    return stores.find(s => s.user_id === userId || s.user_id === Number(userId)) || null;
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

  // ── Order Operations ────────────────────────────────────────
  const checkout = async (userId, userName) => {
    if (cart.length === 0) return false;
    const purchasedItems = [...cart];
    const totalAmount = purchasedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const dbOrder = {
      user_name: userName || 'Pelanggan',
      total_amount: totalAmount,
      status: 'Menunggu Konfirmasi',
      items: purchasedItems,
    };

    const tempOrder = {
      id: Date.now(),
      userId,
      userName: dbOrder.user_name,
      items: purchasedItems,
      totalAmount,
      status: dbOrder.status,
      date: new Date().toISOString(),
    };

    setOrders(prev => [tempOrder, ...prev]);
    clearCart();

    // ── 1. AUTOMATIC PRODUCT STOCK REDUCTION ─────────────────────
    // Deduct stock in local state immediately
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

    // Deduct stock in PostgreSQL database
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

    try {
      const { data, error } = await supabase.from('orders').insert([dbOrder]).select();
      if (!error && data) {
        loadOrders();
      }
    } catch (err) {
      console.error('Failed to submit order to Supabase:', err);
    }
    return true;
  };

  const updateOrderStatus = async (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    try {
      await supabase.from('orders').update({ status }).eq('id', id);
    } catch (err) {
      console.error('Failed to update order status in Supabase:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      loading,
      products, addProduct, updateProduct, deleteProduct,
      stores, registerStore, getStoreForUser,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
      orders, checkout, updateOrderStatus,
      userLogs, loadLogs,
      visitorCount,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
