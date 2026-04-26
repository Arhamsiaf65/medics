import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore} from '../store/authStore';
import type { Role
  
 } from '../store/authStore';
interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to a default page if cross-role access is attempted
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
