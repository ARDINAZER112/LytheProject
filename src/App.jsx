import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Layouts
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/layout/AdminLayout';

import { SkeletonDashboard } from './components/ui/Skeleton';

// User Pages
import { Home } from './pages/Home';
import { UserDashboard } from './pages/UserDashboard';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Statistics } from './pages/Statistics';
import { Support } from './pages/Support';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Seller Pages
import { SellerRegister } from './pages/SellerRegister';
import { SellerDashboard } from './pages/SellerDashboard';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { Orders } from './pages/admin/Orders';
import { Stores } from './pages/admin/Stores';
import { AdminTickets } from './pages/admin/Tickets';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return <SkeletonDashboard />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public/User & Seller Routes */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="catalog" element={<Catalog />} />
              <Route path="support" element={<Support />} />
              <Route path="cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="register-seller" element={<SellerRegister />} />
              <Route path="seller/dashboard" element={
                <ProtectedRoute>
                  <SellerDashboard />
                </ProtectedRoute>
              } />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="stores" element={<Stores />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="tickets" element={<AdminTickets />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

