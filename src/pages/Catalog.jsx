import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Catalog() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}
