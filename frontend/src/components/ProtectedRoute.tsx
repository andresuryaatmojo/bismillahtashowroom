import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'owner'; // ← Tambahkan type safety
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredPermission 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    requiredRole,
    requiredPermission,
    userPermissions: user?.permissions,
    path: location.pathname
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    console.log(`❌ Insufficient role. Required: ${requiredRole}, Got: ${user.role}`);
    
    // Redirect based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'owner') {
      return <Navigate to="/owner" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Check permission requirement
  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    console.log(`❌ Missing permission: ${requiredPermission}`);
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render children
  console.log('✅ Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;