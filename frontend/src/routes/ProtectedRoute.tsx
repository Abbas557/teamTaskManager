import { Navigate, Outlet } from 'react-router-dom';
import { getStoredUser, isAuthenticated } from '../features/auth/auth-storage';
import { UserRole } from '../types';

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const user = getStoredUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
