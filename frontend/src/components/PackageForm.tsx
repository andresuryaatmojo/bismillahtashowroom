import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import ListingPackagesService from '../services/listingPackagesService';
import { ListingPackage, CreateListingPackageRequest } from '../types/listing-packages';
import { Loader2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

interface PackageFormProps {
  package?: ListingPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const PackageForm: React.FC<PackageFormProps> = ({
  package: editingPackage,
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [formData, setFormData] = useState<CreateListingPackageRequest>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    duration_days: 30,
    max_photos: 5,
    is_featured: false,
    is_highlighted: false,
    priority_level: 0,
    allows_refresh: false,
    refresh_count: 0,
    allows_badge: false,
    badge_text: '',
    features: {},
    is_active: true,
    display_order: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  useEffect(() => {
    if (editingPackage) {
      setFormData({
        name: editingPackage.name,
        slug: editingPackage.slug,
        description: editingPackage.description || '',
        price: editingPackage.price,
        duration_days: editingPackage.duration_days,
        max_photos: editingPackage.max_photos || 5,
        is_featured: editingPackage.is_featured || false,
        is_highlighted: editingPackage.is_highlighted || false,
        priority_level: editingPackage.priority_level || 0,
        allows_refresh: editingPackage.allows_refresh || false,
        refresh_count: editingPackage.refresh_count || 0,
        allows_badge: editingPackage.allows_badge || false,
        badge_text: editingPackage.badge_text || '',
        features: editingPackage.features || {},
        is_active: editingPackage.is_active ?? true,
        display_order: editingPackage.display_order || 0
      });
    } else {
      // Reset form for new package
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: 0,
        duration_days: 30,
        max_photos: 5,
        is_featured: false,
        is_highlighted: false,
        priority_level: 0,
        allows_refresh: false,
        refresh_count: 0,
        allows_badge: false,
        badge_text: '',
        features: {},
        is_active: true,
        display_order: 0
      });
    }
  }, [editingPackage, isOpen]);

  const handleInputChange = (field: keyof CreateListingPackageRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user types
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const generateSlugFromName = async () => {
    if (!formData.name.trim()) {
      onError('Please enter a package name first');
      return;
    }

    setIsGeneratingSlug(true);
    try {
      const slug = await ListingPackagesService.generateUniqueSlug(formData.name);
      handleInputChange('slug', slug);
    } catch (error) {
      onError('Failed to generate unique slug');
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  const validateForm = (): boolean => {
    const validation = ListingPackagesService.validatePackageData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      let result;
      if (editingPackage) {
        result = await ListingPackagesService.updateListingPackage({
          ...formData,
          id: editingPackage.id
        });
      } else {
        result = await ListingPackagesService.createListingPackage(formData);
      }

      if (result.error) {
        onError(result.error.message || 'Failed to save package');
      } else {
        onSuccess(editingPackage ? 'Package updated successfully' : 'Package created successfully');
        onClose();
      }
    } catch (error) {
      onError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">
              {editingPackage ? 'Edit Paket' : 'Buat Paket Baru'}
            </CardTitle>
            <CardDescription>
              {editingPackage
                ? 'Modifikasi detail dan pengaturan paket'
                : 'Buat paket listing baru dengan fitur kustom'
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {errors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <div className="space-y-1">
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Dasar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Paket *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="contoh: Paket Premium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="contoh: paket-premium"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSlugFromName}
                      disabled={isGeneratingSlug || !formData.name.trim()}
                    >
                      {isGeneratingSlug ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Deskripsikan fitur dan manfaat paket..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Pricing and Duration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Harga & Durasi</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (IDR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    required
                  />
                  {formData.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(formData.price)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durasi (Hari) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => handleInputChange('duration_days', Number(e.target.value))}
                    placeholder="30"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPhotos">Maksimal Foto</Label>
                  <Input
                    id="maxPhotos"
                    type="number"
                    value={formData.max_photos}
                    onChange={(e) => handleInputChange('max_photos', Number(e.target.value))}
                    placeholder="5"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Features and Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fitur & Opsi</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Paket Unggulan</Label>
                      <p className="text-sm text-muted-foreground">
                        Tampilkan sebagai opsi unggulan
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Disorot</Label>
                      <p className="text-sm text-muted-foreground">
                        Sorot dalam tampilan listing
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_highlighted}
                      onCheckedChange={(checked) => handleInputChange('is_highlighted', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Izinkan Refresh</Label>
                      <p className="text-sm text-muted-foreground">
                        Pengguna bisa refresh listing mereka
                      </p>
                    </div>
                    <Switch
                      checked={formData.allows_refresh}
                      onCheckedChange={(checked) => handleInputChange('allows_refresh', checked)}
                    />
                  </div>

                  {formData.allows_refresh && (
                    <div className="space-y-2">
                      <Label htmlFor="refreshCount">Jumlah Refresh</Label>
                      <Input
                        id="refreshCount"
                        type="number"
                        value={formData.refresh_count}
                        onChange={(e) => handleInputChange('refresh_count', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Izinkan Badge</Label>
                      <p className="text-sm text-muted-foreground">
                        Tampilkan badge khusus pada listing
                      </p>
                    </div>
                    <Switch
                      checked={formData.allows_badge}
                      onCheckedChange={(checked) => handleInputChange('allows_badge', checked)}
                    />
                  </div>

                  {formData.allows_badge && (
                    <div className="space-y-2">
                      <Label htmlFor="badgeText">Teks Badge</Label>
                      <Input
                        id="badgeText"
                        value={formData.badge_text}
                        onChange={(e) => handleInputChange('badge_text', e.target.value)}
                        placeholder="contoh: PREMIUM"
                        maxLength={20}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="priorityLevel">Tingkat Prioritas</Label>
                    <Input
                      id="priorityLevel"
                      type="number"
                      value={formData.priority_level}
                      onChange={(e) => handleInputChange('priority_level', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Urutan Tampilan</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => handleInputChange('display_order', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aktif</Label>
                  <p className="text-sm text-muted-foreground">
                    Paket tersedia untuk pembelian
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingPackage ? 'Memperbarui...' : 'Membuat...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingPackage ? 'Perbarui Paket' : 'Buat Paket'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageForm;