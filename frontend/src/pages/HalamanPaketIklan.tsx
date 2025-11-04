import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PackageForm from '../components/PackageForm';
import PackageTable from '../components/PackageTable';
import ListingPackagesService from '../services/listingPackagesService';
import { ListingPackage, ListingPackageStats, PackageUsageAnalytics } from '../types/listing-packages';
import {
  Package,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Star,
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

const HalamanPaketIklan: React.FC = () => {
  const [stats, setStats] = useState<ListingPackageStats | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<PackageUsageAnalytics[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ListingPackage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadStats();
    loadUsageAnalytics();
  }, []);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const { data, error } = await ListingPackagesService.getListingPackageStats();
      if (error) {
        console.error('Error loading stats:', error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Unexpected error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadUsageAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const { data, error } = await ListingPackagesService.getPackageUsageAnalytics();
      if (error) {
        console.error('Error loading analytics:', error);
      } else {
        setUsageAnalytics(data || []);
      }
    } catch (error) {
      console.error('Unexpected error loading analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setShowForm(true);
  };

  const handleEditPackage = (pkg: ListingPackage) => {
    setSelectedPackage(pkg);
    setShowForm(true);
  };

  const handleViewPackage = (pkg: ListingPackage) => {
    setSelectedPackage(pkg);
    setShowDetails(true);
  };

  const handleFormSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
    setShowForm(false);
    setSelectedPackage(null);
    loadStats();
    // Trigger refresh untuk PackageTable
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTableSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
    loadStats();
    // Trigger refresh untuk PackageTable
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormError = (message: string) => {
    setError(message);
    setSuccess(null);
    setTimeout(() => setError(null), 5000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: string | number;
    icon: any;
    change?: number;
    changeType?: 'increase' | 'decrease';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'increase' ? '+' : ''}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Paket</h1>
            <p className="text-gray-600">Kelola paket listing dan rencana harga</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Perbarui Statistik
            </Button>
            <Button onClick={handleCreatePackage}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Paket
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <div className="col-span-4 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Memuat statistik...
            </div>
          ) : (
            <>
              <StatCard
                title="Total Paket"
                value={stats?.total_packages || 0}
                icon={Package}
              />
              <StatCard
                title="Paket Aktif"
                value={stats?.active_packages || 0}
                icon={CheckCircle}
              />
              <StatCard
                title="Total Pendapatan"
                value={formatPrice(stats?.total_revenue || 0)}
                icon={DollarSign}
              />
              <StatCard
                title="Listing Aktif"
                value={stats?.active_listings || 0}
                icon={Users}
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="packages">Semua Paket</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            <PackageTable
              onEdit={handleEditPackage}
              onView={handleViewPackage}
              onSuccess={handleTableSuccess}
              onError={handleFormError}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analitik Penggunaan Paket</CardTitle>
                <CardDescription>
                  Pantau performa paket dan pola penggunaan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Memuat analitik...
                  </div>
                ) : usageAnalytics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada data penggunaan tersedia.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usageAnalytics.map((analytics) => (
                      <Card key={analytics.package_id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{analytics.package_name}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Penggunaan Saat Ini</p>
                                <p className="font-semibold">{analytics.current_usage}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Penggunaan</p>
                                <p className="font-semibold">{analytics.total_usage}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Pendapatan Bulan Ini</p>
                                <p className="font-semibold">{formatPrice(analytics.revenue_this_month)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Tren</p>
                                <div className="flex items-center gap-2">
                                  {getTrendIcon(analytics.usage_trend)}
                                  <span className="capitalize">
                                    {analytics.usage_trend === 'increasing' ? 'Naik' :
                                     analytics.usage_trend === 'decreasing' ? 'Turun' : 'Stabil'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {analytics.conversion_rate}% konversi
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Package Form Modal */}
        {showForm && (
          <PackageForm
            package={selectedPackage}
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
        )}

        {/* Package Details Modal */}
        {showDetails && selectedPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xl">Detail Paket</CardTitle>
                  <CardDescription>{selectedPackage.name}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  �
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informasi Dasar</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nama</p>
                      <p className="font-medium">{selectedPackage.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Slug</p>
                      <p className="font-medium">{selectedPackage.slug}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Harga</p>
                      <p className="font-medium">{formatPrice(selectedPackage.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Durasi</p>
                      <p className="font-medium">{selectedPackage.duration_days} hari</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Maksimal Foto</p>
                      <p className="font-medium">{selectedPackage.max_photos || 'Tidak terbatas'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={selectedPackage.is_active ? "default" : "secondary"}>
                        {selectedPackage.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </div>
                  {selectedPackage.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Deskripsi</p>
                      <p className="mt-1">{selectedPackage.description}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fitur</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.is_featured && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Paket Unggulan
                      </Badge>
                    )}
                    {selectedPackage.is_highlighted && (
                      <Badge variant="secondary">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Disorot
                      </Badge>
                    )}
                    {selectedPackage.allows_refresh && (
                      <Badge variant="outline">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh ({selectedPackage.refresh_count || 0} kali)
                      </Badge>
                    )}
                    {selectedPackage.allows_badge && selectedPackage.badge_text && (
                      <Badge variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Badge {selectedPackage.badge_text}
                      </Badge>
                    )}
                  </div>
                  {selectedPackage.priority_level && selectedPackage.priority_level > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tingkat Prioritas</p>
                      <p className="font-medium">{selectedPackage.priority_level}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Metadata */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Metadata</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Urutan Tampilan</p>
                      <p className="font-medium">{selectedPackage.display_order || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dibuat</p>
                      <p className="font-medium">
                        {selectedPackage.created_at
                          ? new Date(selectedPackage.created_at).toLocaleDateString()
                          : 'Tidak Diketahui'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Terakhir Diperbarui</p>
                      <p className="font-medium">
                        {selectedPackage.updated_at
                          ? new Date(selectedPackage.updated_at).toLocaleDateString()
                          : 'Tidak Diketahui'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Tutup
                  </Button>
                  <Button onClick={() => {
                    setShowDetails(false);
                    handleEditPackage(selectedPackage);
                  }}>
                    Edit Paket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanPaketIklan;