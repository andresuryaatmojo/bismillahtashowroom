// src/pages/HalamanKelolaUser.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { adminService } from '../lib/adminService';
import { useNavigate } from 'react-router-dom';

// Interface untuk data user
interface UserData {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  role: 'user' | 'admin' | 'owner';
  current_mode: 'buyer' | 'seller';
  profile_picture?: string;
  is_verified: boolean;
  account_status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  registered_at?: string;
  created_at: string;
  updated_at: string;
}

// Interface untuk statistik
interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersToday: number;
  adminUsers: number;
  sellerUsers: number;
  buyerUsers: number;
}

// Interface untuk filter
interface UserFilter {
  search: string;
  role: string;
  status: string;
  verified: string;
  dateFrom: string;
  dateTo: string;
}

const HalamanKelolaUser: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Helper functions untuk permission checking
  const canEditUser = (targetUser: UserData): boolean => {
    if (!profile) return false;
    
    // Owner bisa edit semua
    if (profile.role === 'owner') return true;
    
    // Admin hanya bisa edit user biasa
    if (profile.role === 'admin') {
      return targetUser.role === 'user';
    }
    
    return false;
  };

  const canDeleteUser = (targetUser: UserData): boolean => {
    return canEditUser(targetUser);
  };

  // State management
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    newUsersToday: 0,
    adminUsers: 0,
    sellerUsers: 0,
    buyerUsers: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Filter state
  const [filter, setFilter] = useState<UserFilter>({
    search: '',
    role: 'all',
    status: 'all',
    verified: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Form state untuk edit user
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    role: 'user' as 'user' | 'admin' | 'owner',
    current_mode: 'buyer' as 'buyer' | 'seller',
    is_verified: false,
    account_status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Check admin permission
  useEffect(() => {
    if (profile && profile.role !== 'admin' && profile.role !== 'owner') {
      navigate('/dashboard');
      return;
    }
  }, [profile, navigate]);

  // Load users data
  useEffect(() => {
    loadUsers();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [users, filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading users...');

      const { data, error } = await adminService.getAllUsers();

      if (error) {
        console.error('❌ Error loading users:', error);
        setErrorMessage('Gagal memuat data user: ' + error.message);
        return;
      }

      console.log('✅ Loaded users:', data?.length || 0);
      setUsers(data || []);
      calculateStats(data || []);
      setErrorMessage('');
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      setErrorMessage('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userData: UserData[]) => {
    const today = new Date().toDateString();

    const newStats: UserStats = {
      totalUsers: userData.length,
      activeUsers: userData.filter(u => u.account_status === 'active').length,
      verifiedUsers: userData.filter(u => u.is_verified).length,
      newUsersToday: userData.filter(u => 
        new Date(u.registered_at || u.created_at).toDateString() === today
      ).length,
      adminUsers: userData.filter(u => u.role === 'admin' || u.role === 'owner').length,
      sellerUsers: userData.filter(u => u.current_mode === 'seller').length,
      buyerUsers: userData.filter(u => u.current_mode === 'buyer').length,
    };

    setStats(newStats);
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search
    if (filter.search) {
      const s = filter.search.toLowerCase();
      filtered = filtered.filter(user =>
        (user.username || '').toLowerCase().includes(s) ||
        (user.email || '').toLowerCase().includes(s) ||
        (user.full_name || '').toLowerCase().includes(s) ||
        (user.phone_number || '').toLowerCase().includes(s)
      );
    }

    // Role filter
    if (filter.role !== 'all') {
      if (filter.role === 'seller') {
        filtered = filtered.filter(u => u.current_mode === 'seller');
      } else if (filter.role === 'buyer') {
        filtered = filtered.filter(u => u.current_mode === 'buyer');
      } else if (filter.role === 'admin') {
        filtered = filtered.filter(u => u.role === 'admin' || u.role === 'owner');
      } else if (filter.role === 'owner') {
        filtered = filtered.filter(u => u.role === 'owner');
      } else if (filter.role === 'user') {
        filtered = filtered.filter(u => u.role === 'user');
      }
    }

    // Status filter
    if (filter.status !== 'all') {
      filtered = filtered.filter(u => u.account_status === filter.status);
    }

    // Verified filter
    if (filter.verified !== 'all') {
      filtered = filtered.filter(u =>
        filter.verified === 'verified' ? u.is_verified : !u.is_verified
      );
    }

    // Date range
    if (filter.dateFrom) {
      filtered = filtered.filter(u => 
        new Date(u.registered_at || u.created_at) >= new Date(filter.dateFrom)
      );
    }
    if (filter.dateTo) {
      filtered = filtered.filter(u => 
        new Date(u.registered_at || u.created_at) <= new Date(filter.dateTo)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (
    userId: string, 
    action: 'activate' | 'deactivate' | 'suspend' | 'verify' | 'unverify' | 'delete'
  ) => {
    try {
      setActionLoading(userId);
      console.log(`🔄 Performing action: ${action} on user: ${userId}`);

      let result;

      switch (action) {
        case 'activate':
          result = await adminService.updateUserStatus(userId, 'active');
          break;
        case 'deactivate':
          result = await adminService.updateUserStatus(userId, 'inactive');
          break;
        case 'suspend':
          result = await adminService.updateUserStatus(userId, 'suspended');
          break;
        case 'verify':
          result = await adminService.updateUserVerification(userId, true);
          break;
        case 'unverify':
          result = await adminService.updateUserVerification(userId, false);
          break;
        case 'delete':
          const confirmed = window.confirm(
            '⚠️ PERINGATAN: Apakah Anda yakin ingin menghapus user ini?\n\n' +
            'Tindakan ini akan:\n' +
            '• Menghapus user secara PERMANEN dari database\n' +
            '• Menghapus semua data terkait user\n' +
            '• TIDAK DAPAT dibatalkan\n\n' +
            'Ketik "HAPUS" untuk konfirmasi.'
          );
          
          if (!confirmed) {
            setActionLoading(null);
            return;
          }

          result = await adminService.deleteUser(userId);
          break;
      }

      if (result.error) {
        console.error(`❌ Action ${action} failed:`, result.error);
        alert(`Gagal melakukan ${action}: ${result.error.message}`);
        return;
      }

      console.log(`✅ Action ${action} successful`);
      await loadUsers();
      
    } catch (error: any) {
      console.error('❌ Error performing action:', error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      city: user.city || '',
      province: user.province || '',
      postal_code: user.postal_code || '',
      role: user.role,
      current_mode: user.current_mode,
      is_verified: user.is_verified,
      account_status: user.account_status,
    });
    setFormErrors({});
    setShowEditUser(true);
  };

  const handleSaveUser = async () => {
    try {
      // Validate form
      const errors: {[key: string]: string} = {};
      
      if (!formData.username.trim()) errors.username = 'Username wajib diisi';
      if (!formData.email.trim()) errors.email = 'Email wajib diisi';
      if (!formData.full_name.trim()) errors.full_name = 'Nama lengkap wajib diisi';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      if (!selectedUser) {
        alert('User tidak ditemukan');
        return;
      }

      console.log('💾 Saving user changes...');

      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        province: formData.province.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        role: formData.role,
        current_mode: formData.current_mode,
        is_verified: formData.is_verified,
        account_status: formData.account_status,
      };

      const { error } = await adminService.updateUser(selectedUser.id, updateData);

      if (error) {
        console.error('❌ Update failed:', error);
        alert('Gagal menyimpan perubahan: ' + error.message);
        return;
      }

      console.log('✅ User updated successfully');
      await loadUsers();
      setShowEditUser(false);
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error('❌ Error saving user:', error);
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (user: UserData) => {
    if (user.account_status === 'suspended') return 'bg-orange-100 text-orange-800';
    if (user.account_status === 'inactive') return 'bg-red-100 text-red-800';
    if (user.is_verified) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (user: UserData) => {
    if (user.account_status === 'suspended') return 'Suspended';
    if (user.account_status === 'inactive') return 'Tidak Aktif';
    if (user.is_verified) return 'Terverifikasi';
    return 'Belum Verifikasi';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-12 md:pt-16 pb-8">
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
          <p className="text-gray-600 mt-2">Manajemen pengguna sistem (Read, Update, Delete)</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total User</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Terverifikasi</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verifiedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Baru Hari Ini</p>
                <p className="text-2xl font-bold text-orange-600">{stats.newUsersToday}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cari username, email, nama..."
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={filter.role} onValueChange={(value) => setFilter(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="verified">Verifikasi</Label>
              <Select value={filter.verified} onValueChange={(value) => setFilter(prev => ({ ...prev, verified: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="unverified">Belum Verifikasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Dari Tanggal</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filter.dateFrom}
                onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar User ({filteredUsers.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Kontak</th>
                  <th className="text-left p-4">Terdaftar</th>
                  <th className="text-left p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.profile_picture} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || user.username}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(user)}>
                        {getStatusText(user)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{formatDate(user.created_at)}</div>
                        {user.last_login && (
                          <div className="text-gray-500">
                            Login: {formatDate(user.last_login)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* View Detail */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetail(true);
                          }}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit User */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={!canEditUser(user)}
                          title={canEditUser(user) ? "Edit User" : "Tidak ada akses"}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* Activate/Deactivate */}
                        {user.account_status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'deactivate')}
                            disabled={actionLoading === user.id}
                            title="Nonaktifkan User"
                          >
                            <UserX className="h-4 w-4 text-red-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                            disabled={actionLoading === user.id}
                            title="Aktifkan User"
                          >
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}

                        {/* Verify/Unverify */}
                        {!user.is_verified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'verify')}
                            disabled={actionLoading === user.id}
                            title="Verifikasi User"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}

                        {/* Delete User */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'delete')}
                          disabled={actionLoading === user.id || !canDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                          title={canDeleteUser(user) ? "Hapus User" : "Tidak ada akses"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada user yang ditemukan
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profile_picture} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.full_name?.charAt(0) || selectedUser.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name || selectedUser.username}</h3>
                  <p className="text-gray-600">@{selectedUser.username}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRoleBadgeColor(selectedUser.role)}>
                      {selectedUser.role.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusBadgeColor(selectedUser)}>
                      {getStatusText(selectedUser)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informasi Kontak</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedUser.phone_number}</span>
                      </div>
                    )}
                    {selectedUser.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <div>{selectedUser.address}</div>
                          {selectedUser.city && <div>{selectedUser.city}, {selectedUser.province}</div>}
                          {selectedUser.postal_code && <div>{selectedUser.postal_code}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Informasi Akun</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Terdaftar: {formatDate(selectedUser.created_at)}</span>
                    </div>
                    {selectedUser.last_login && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span>Login Terakhir: {formatDate(selectedUser.last_login)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Mode: {selectedUser.current_mode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
                {formErrors.username && <p className="text-sm text-red-600">{formErrors.username}</p>}
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-fullname">Nama Lengkap</Label>
              <Input
                id="edit-fullname"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
              {formErrors.full_name && <p className="text-sm text-red-600">{formErrors.full_name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Nomor Telepon</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'user' | 'admin' | 'owner') => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-address">Alamat</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-city">Kota</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-province">Provinsi</Label>
                <Input
                  id="edit-province"
                  value={formData.province}
                  onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-postal">Kode Pos</Label>
                <Input
                  id="edit-postal"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-mode">Mode</Label>
                <Select 
                  value={formData.current_mode} 
                  onValueChange={(value: 'buyer' | 'seller') => 
                    setFormData(prev => ({ ...prev, current_mode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status Akun</Label>
                <Select 
                  value={formData.account_status} 
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                    setFormData(prev => ({ ...prev, account_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Terverifikasi</span>
              </label>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditUser(false);
                  setSelectedUser(null);
                  setFormErrors({});
                }}
              >
                Batal
              </Button>
              <Button onClick={handleSaveUser}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalamanKelolaUser;