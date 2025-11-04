import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import ListingPackagesService from '../services/listingPackagesService';
import { ListingPackage, ListingPackageFilters } from '../types/listing-packages';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  StarOff,
  Highlighter,
  Plus,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';

interface PackageTableProps {
  onEdit: (pkg: ListingPackage) => void;
  onView: (pkg: ListingPackage) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  refreshTrigger?: number;
}

const PackageTable: React.FC<PackageTableProps> = ({
  onEdit,
  onView,
  onSuccess,
  onError,
  refreshTrigger
}) => {
  const [packages, setPackages] = useState<ListingPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ListingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ListingPackageFilters>({
    is_active: undefined,
    is_featured: undefined,
    sort_by: 'display_order',
    sort_order: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadPackages();
  }, [filters, refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [packages, searchTerm, filters]);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await ListingPackagesService.getListingPackages(filters);

      if (error) {
        onError('Failed to load packages');
        console.error('Error loading packages:', error);
      } else {
        setPackages(data || []);
      }
    } catch (error) {
      onError('An unexpected error occurred');
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.is_active !== undefined) {
      filtered = filtered.filter(pkg => pkg.is_active === filters.is_active);
    }

    // Apply featured filter
    if (filters.is_featured !== undefined) {
      filtered = filtered.filter(pkg => pkg.is_featured === filters.is_featured);
    }

    // Apply price filter
    if (filters.min_price !== undefined) {
      filtered = filtered.filter(pkg => pkg.price >= filters.min_price!);
    }
    if (filters.max_price !== undefined) {
      filtered = filtered.filter(pkg => pkg.price <= filters.max_price!);
    }

    // Apply duration filter
    if (filters.min_duration !== undefined) {
      filtered = filtered.filter(pkg => pkg.duration_days >= filters.min_duration!);
    }
    if (filters.max_duration !== undefined) {
      filtered = filtered.filter(pkg => pkg.duration_days <= filters.max_duration!);
    }

    setFilteredPackages(filtered);
  };

  const handleDeletePackage = async (packageId: number) => {
    if (!window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      const { success, error } = await ListingPackagesService.deleteListingPackage(packageId);

      if (error || !success) {
        onError(error?.message || 'Failed to delete package');
      } else {
        onSuccess('Package deleted successfully');
      }
    } catch (error) {
      onError('An unexpected error occurred');
    }
  };

  const handleToggleStatus = async (packageId: number, currentStatus: boolean) => {
    setIsUpdating(packageId);
    try {
      const { data, error } = await ListingPackagesService.togglePackageStatus(packageId, !currentStatus);

      if (error) {
        onError('Failed to update package status');
      } else {
        onSuccess(`Package ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      onError('An unexpected error occurred');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSort = (sortBy: string) => {
    const newOrder = filters.sort_by === sortBy && filters.sort_order === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sort_by: sortBy as any,
      sort_order: newOrder
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const clearFilters = () => {
    setFilters({
      is_active: undefined,
      is_featured: undefined,
      sort_by: 'display_order',
      sort_order: 'asc'
    });
    setSearchTerm('');
  };

  const exportData = () => {
    const csvContent = [
      // Headers
      ['Name', 'Slug', 'Price', 'Duration', 'Max Photos', 'Featured', 'Highlighted', 'Active', 'Created At'].join(','),
      // Data rows
      ...filteredPackages.map(pkg => [
        `"${pkg.name}"`,
        `"${pkg.slug}"`,
        pkg.price,
        pkg.duration_days,
        pkg.max_photos || 'N/A',
        pkg.is_featured ? 'Yes' : 'No',
        pkg.is_highlighted ? 'Yes' : 'No',
        pkg.is_active ? 'Yes' : 'No',
        pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listing-packages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading packages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Paket Listing</CardTitle>
            <CardDescription>
              Kelola paket listing dan harga
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              disabled={filteredPackages.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPackages}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari paket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(filters.is_active !== undefined || filters.is_featured !== undefined ||
                filters.min_price !== undefined || filters.max_price !== undefined) && (
                <Badge variant="secondary" className="ml-2">Active</Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Featured</label>
                  <select
                    value={filters.is_featured === undefined ? '' : filters.is_featured.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      is_featured: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="true">Featured</option>
                    <option value="false">Not Featured</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Price</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.min_price || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      min_price: e.target.value ? Number(e.target.value) : undefined
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Price</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.max_price || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      max_price: e.target.value ? Number(e.target.value) : undefined
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredPackages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {searchTerm || filters.is_active !== undefined || filters.is_featured !== undefined
                ? 'Tidak ada paket yang sesuai dengan kriteria Anda.'
                : 'Tidak ada paket ditemukan. Buat paket pertama Anda untuk memulai.'}
            </p>
            <Button onClick={() => onEdit(null as any)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Paket
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[200px] cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nama</span>
                      {filters.sort_by === 'name' && (
                        filters.sort_order === 'asc' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Harga</span>
                      {filters.sort_by === 'price' && (
                        filters.sort_order === 'asc' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('duration_days')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Durasi</span>
                      {filters.sort_by === 'duration_days' && (
                        filters.sort_order === 'asc' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Fitur</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-muted-foreground">{pkg.slug}</div>
                        {pkg.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                            {pkg.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatPrice(pkg.price)}</div>
                    </TableCell>
                    <TableCell>
                      <div>{pkg.duration_days} days</div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.max_photos || 'N/A'} photos
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pkg.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {pkg.is_highlighted && (
                          <Badge variant="secondary" className="text-xs">
                            <Highlighter className="h-3 w-3 mr-1" />
                            Highlighted
                          </Badge>
                        )}
                        {pkg.allows_refresh && (
                          <Badge variant="outline" className="text-xs">
                            Refresh ({pkg.refresh_count || 0})
                          </Badge>
                        )}
                        {pkg.allows_badge && pkg.badge_text && (
                          <Badge variant="outline" className="text-xs">
                            {pkg.badge_text}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pkg.is_active ? "default" : "secondary"}
                        className={pkg.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                      >
                        {pkg.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onView(pkg)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit(pkg)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Paket
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(pkg.id, pkg.is_active ?? true)}
                            disabled={isUpdating === pkg.id}
                          >
                            {isUpdating === pkg.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : pkg.is_active ? (
                              <PowerOff className="h-4 w-4 mr-2" />
                            ) : (
                              <Power className="h-4 w-4 mr-2" />
                            )}
                            {pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus Paket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageTable;