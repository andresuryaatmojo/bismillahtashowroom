import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types untuk sistem autentikasi
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'executive' | 'user';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi data user untuk demo
  const mockUsers = {
    admin: {
      id: '1',
      username: 'admin',
      email: 'admin@mobilindo.com',
      role: 'admin' as const,
      permissions: ['read_cars', 'write_cars', 'delete_cars', 'manage_users', 'view_reports'],
      createdAt: '2024-01-01T00:00:00Z'
    },
    executive: {
      id: '2',
      username: 'executive',
      email: 'executive@mobilindo.com',
      role: 'executive' as const,
      permissions: ['read_cars', 'write_cars', 'delete_cars', 'manage_users', 'view_reports', 'manage_system', 'view_analytics', 'export_data'],
      createdAt: '2024-01-01T00:00:00Z'
    }
  };

  // Check untuk token yang tersimpan saat aplikasi dimuat
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fungsi login
  const login = async (username: string, password: string, role?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulasi API call dengan delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cek kredensial berdasarkan role yang dipilih atau otomatis detect
      let targetUser = null;
      
      if (role) {
        // Jika role dispesifikasi, cek user dengan role tersebut
        if (role === 'admin' && username === 'admin' && password === 'admin123') {
          targetUser = mockUsers.admin;
        } else if (role === 'executive' && username === 'executive' && password === 'exec123') {
          targetUser = mockUsers.executive;
        }
      } else {
        // Auto-detect berdasarkan kredensial
        if (username === 'admin' && password === 'admin123') {
          targetUser = mockUsers.admin;
        } else if (username === 'executive' && password === 'exec123') {
          targetUser = mockUsers.executive;
        }
      }
      
      if (targetUser) {
        const updatedUser = {
          ...targetUser,
          lastLogin: new Date().toISOString()
        };
        
        // Simpan token dan data user
        const token = `mock_token_${targetUser.id}_${Date.now()}`;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        setUser(updatedUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  // Check permission
  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  // Check role
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk menggunakan AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;