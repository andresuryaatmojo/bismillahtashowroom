import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'executive';
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  fallbackPath = '/admin'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Tampilkan loading saat checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Redirect ke login jika tidak authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    // Executive bisa akses halaman admin, tapi admin tidak bisa akses halaman executive
    if (!(requiredRole === 'admin' && user.role === 'executive')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚫</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <p className="text-sm text-gray-500">
              Role yang diperlukan: {requiredRole} | Role Anda: {user.role}
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      );
    }
  }

  // Check permissions requirement
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(permission => 
        !user.permissions.includes(permission)
      );

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Izin Tidak Mencukupi</h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              <p>Izin yang diperlukan:</p>
              <ul className="list-disc list-inside mt-2">
                {missingPermissions.map(permission => (
                  <li key={permission} className="text-red-600">{permission}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      );
    }
  }

  // Jika semua check passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;