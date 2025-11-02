import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Flag, 
  Star, 
  Calendar, 
  User, 
  MessageSquare,
  Image as ImageIcon,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';

// Define Supabase environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Interfaces
interface ReviewData {
  id: string;
  car_id: string;
  reviewer_id: string;
  transaction_id: string | null;
  rating_stars: number;
  rating_car_condition: number | null;
  rating_seller_service: number | null;
  rating_transaction_process: number | null;
  review_text: string | null;
  pros: string | null;
  cons: string | null;
  is_verified_purchase: boolean;
  moderation_status: 'approved' | 'pending' | 'rejected' | 'flagged';
  status: 'active' | 'hidden' | 'deleted';
  rejection_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  reviewer?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  car?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
  };
  review_images?: {
    id: string;
    image_url: string;
    caption: string | null;
  }[];
}

interface FilterState {
  search: string;
  moderation_status: string;
  rating_filter: string;
  date_range: string;
  verified_only: boolean;
}

interface ModerationAction {
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
  reviewId: string;
}

const HalamanModerasiUlasan: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    reviews: [] as ReviewData[],
    filteredReviews: [] as ReviewData[],
    selectedReview: null as ReviewData | null,
    showDetailModal: false,
    showModerationModal: false,
    showEditModal: false,
    moderationAction: null as ModerationAction | null,
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      flagged: 0
    },
    editData: {
      review_text: '',
      pros: '',
      cons: ''
    }
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    moderation_status: 'all',
    rating_filter: 'all',
    date_range: 'all',
    verified_only: false
  });

  // Helper: panggil REST Supabase dengan apikey sebagai URL param (ABSOLUTE URL)
  const fetchSupabaseRest = async (table: string, params: string) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are missing');
    }
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    // gunakan params string yang sudah dibentuk sebelumnya
    url.search = params;
    url.searchParams.set('apikey', SUPABASE_ANON_KEY);

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase REST error ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
  };

  // Load reviews data
  const loadReviews = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: reviewsDataRaw, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      let reviewsData: ReviewData[] = (reviewsDataRaw ?? []) as ReviewData[];

      if (reviewsData.length > 0) {
        const reviewerIds = Array.from(
          new Set(reviewsData.map((r: ReviewData) => r.reviewer_id).filter(Boolean))
        );
        const carIds = Array.from(
          new Set(reviewsData.map((r: ReviewData) => r.car_id).filter(Boolean))
        );

        // Ambil data reviewer via REST hanya jika ada ID (pakai kolom yang valid)
        let reviewerList: any[] = [];
        if (reviewerIds.length > 0) {
          const reviewerParam = `select=id,full_name,username&id=${encodeURIComponent(
            `in.(${reviewerIds.join(',')})`)}`;
          reviewerList = await fetchSupabaseRest('users', reviewerParam);
        }

        // Ambil data mobil via REST hanya jika ada ID
        let carList: any[] = [];
        if (carIds.length > 0) {
          const carParam = `select=id,title,year,price,car_brands(name),car_models(name)&id=${encodeURIComponent(
            `in.(${carIds.join(',')})`)}`;
          carList = await fetchSupabaseRest('cars', carParam);
        }

        // Ambil data gambar ulasan (via client)
        const { data: reviewImages } = await supabase
          .from('review_images')
          .select('id, review_id, image_url, caption');

        const imageList = reviewImages ?? [];

        // Gabungkan data: gunakan undefined untuk field opsional
        reviewsData = reviewsData.map((review: ReviewData) => {
          const reviewerMatch = reviewerList.find((r: any) => r.id === review.reviewer_id);
          const carMatch = carList.find((c: any) => c.id === review.car_id);
          const imagesForReview = imageList.filter((img: any) => img.review_id === review.id) || [];

          return {
            ...review,
            reviewer: reviewerMatch
              ? {
                  id: String(reviewerMatch.id),
                  full_name: String(reviewerMatch.full_name),
                  // kolom email tidak ada; fallback ke username atau string kosong
                  email: String(reviewerMatch.email ?? reviewerMatch.username ?? ''),
                  // avatar_url memang tidak ada pada tabel ini
                  avatar_url: null
                }
              : undefined,
            car: carMatch
              ? {
                  id: String(carMatch.id),
                  brand: String(carMatch.car_brands?.name ?? ''),
                  model: String(carMatch.car_models?.name ?? carMatch.title ?? ''),
                  year: Number(carMatch.year),
                  price: Number(carMatch.price)
                }
              : undefined,
            review_images: imagesForReview.map((img: any) => ({
              id: String(img.id),
              image_url: String(img.image_url),
              caption: img.caption ?? null
            }))
          };
        });
      }

      const stats = {
        total: reviewsData.length,
        pending: reviewsData.filter((r: ReviewData) => r.moderation_status === 'pending').length,
        approved: reviewsData.filter((r: ReviewData) => r.moderation_status === 'approved').length,
        rejected: reviewsData.filter((r: ReviewData) => r.moderation_status === 'rejected').length,
        flagged: reviewsData.filter((r: ReviewData) => r.moderation_status === 'flagged').length
      };

      setState(prev => ({
        ...prev,
        reviews: reviewsData,
        filteredReviews: reviewsData,
        stats,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Gagal memuat data ulasan',
        isLoading: false
      }));
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...state.reviews];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(review => 
        review.reviewer?.full_name?.toLowerCase().includes(searchLower) ||
        review.reviewer?.email?.toLowerCase().includes(searchLower) ||
        review.car?.brand?.toLowerCase().includes(searchLower) ||
        review.car?.model?.toLowerCase().includes(searchLower) ||
        review.review_text?.toLowerCase().includes(searchLower)
      );
    }

    // Moderation status filter
    if (filters.moderation_status && filters.moderation_status !== 'all') {
        filtered = filtered.filter(review => review.moderation_status === filters.moderation_status);
      }

    // Rating filter
    if (filters.rating_filter && filters.rating_filter !== 'all') {
        const rating = parseInt(filters.rating_filter);
      filtered = filtered.filter(review => review.rating_stars === rating);
    }

    // Date range filter
    if (filters.date_range && filters.date_range !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.date_range) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(review => new Date(review.created_at) >= startDate);
    }

    // Verified purchase filter
    if (filters.verified_only) {
      filtered = filtered.filter(review => review.is_verified_purchase);
    }

    setState(prev => ({ ...prev, filteredReviews: filtered }));
  };

  // Moderate review
  const moderateReview = async (action: ModerationAction) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const updateData: any = {
        moderation_status: action.action === 'approve' ? 'approved' : 
                          action.action === 'reject' ? 'rejected' : 'flagged',
        status: action.action === 'reject' ? 'hidden' : 'active',
        moderated_by: user?.id,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (action.reason) {
        updateData.rejection_reason = action.reason;
      }

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', action.reviewId);

      if (error) throw error;

      // Reload reviews
      await loadReviews();
      
      setState(prev => ({
        ...prev,
        showModerationModal: false,
        moderationAction: null,
        selectedReview: null,
        isLoading: false
      }));

      alert(`Ulasan berhasil ${action.action === 'approve' ? 'disetujui' : 
             action.action === 'reject' ? 'ditolak' : 'ditandai'}!`);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Gagal melakukan moderasi',
        isLoading: false
      }));
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Delete review images first
      const { error: imagesError } = await supabase
        .from('review_images')
        .delete()
        .eq('review_id', reviewId);

      if (imagesError) throw imagesError;

      // Delete review
      const { error: reviewError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (reviewError) throw reviewError;

      // Reload reviews
      await loadReviews();
      
      setState(prev => ({
        ...prev,
        showDetailModal: false,
        selectedReview: null,
        isLoading: false
      }));

      alert('Ulasan berhasil dihapus!');
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Gagal menghapus ulasan',
        isLoading: false
      }));
    }
  };

  // Fungsi untuk membuka modal edit
  const openEditModal = (review: ReviewData) => {
    setState(prev => ({
      ...prev,
      showEditModal: true,
      editData: {
        review_text: review.review_text || '',
        pros: review.pros || '',
        cons: review.cons || ''
      }
    }));
  };

  // Fungsi untuk menangani perubahan pada form edit
  const handleEditChange = (field: string, value: string) => {
    setState(prev => ({
      ...prev,
      editData: {
        ...prev.editData,
        [field]: value
      }
    }));
  };

  // Fungsi untuk menyimpan ulasan yang sudah diedit
  const saveEditedReview = async () => {
    if (!state.selectedReview) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const now = new Date().toISOString();
      
      // Gunakan fetchSupabaseRest untuk update data
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase environment variables are missing');
      }
      
      const url = new URL(`${SUPABASE_URL}/rest/v1/reviews`);
      url.search = `id=eq.${state.selectedReview.id}`;
      url.searchParams.set('apikey', SUPABASE_ANON_KEY);
      
      const updateData = {
        review_text: state.editData.review_text,
        pros: state.editData.pros,
        cons: state.editData.cons,
        updated_at: now,
        moderated_by: user?.id,
        moderated_at: now
      };
      
      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Supabase REST error ${response.status}: ${errorText || response.statusText}`);
      }
      
      // Refresh data
      await loadReviews();
      
      // Update review yang dipilih dengan data terbaru
      const updatedReview = state.reviews.find(r => r.id === state.selectedReview!.id);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        showEditModal: false,
        selectedReview: updatedReview || null
      }));
      
      alert('Ulasan berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating review:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Gagal memperbarui ulasan' 
      }));
      alert(`Gagal memperbarui ulasan: ${error.message}`);
    }
  };
  
  // Placeholder for edit review functions
  // Functions have been moved to avoid duplication

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      case 'flagged': return 'Ditandai';
      default: return status;
    }
  };

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Effects
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'owner') {
      loadReviews();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, state.reviews]);

  // Loading state
  if (authLoading || state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminNavigation />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Memuat data ulasan...</p>
          </div>
        </div>
      </div>
    );
  }

  // Access control
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminNavigation />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Moderasi Ulasan</h1>
                <p className="text-gray-600 mt-1">Kelola dan moderasi ulasan dari pengguna</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={loadReviews}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Error Message */}
          {state.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{state.error}</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{state.stats.total}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>



            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">{state.stats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">{state.stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ditolak</p>
                    <p className="text-2xl font-bold text-red-600">{state.stats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ditandai</p>
                    <p className="text-2xl font-bold text-orange-600">{state.stats.flagged}</p>
                  </div>
                  <Flag className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter & Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Pencarian</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Cari reviewer, mobil, atau teks ulasan..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status Moderasi</Label>
                  <Select
                    value={filters.moderation_status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, moderation_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>

                      <SelectItem value="approved">Disetujui</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                      <SelectItem value="flagged">Ditandai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Select
                    value={filters.rating_filter}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, rating_filter: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Rating</SelectItem>
                      <SelectItem value="5">5 Bintang</SelectItem>
                      <SelectItem value="4">4 Bintang</SelectItem>
                      <SelectItem value="3">3 Bintang</SelectItem>
                      <SelectItem value="2">2 Bintang</SelectItem>
                      <SelectItem value="1">1 Bintang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Periode</Label>
                  <Select
                    value={filters.date_range}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, date_range: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Waktu</SelectItem>
                      <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                      <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                      <SelectItem value="90d">90 Hari Terakhir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => setFilters({
                      search: '',
                      moderation_status: 'all',
                      rating_filter: 'all',
                      date_range: 'all',
                      verified_only: false
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.verified_only}
                    onChange={(e) => setFilters(prev => ({ ...prev, verified_only: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Hanya pembelian terverifikasi</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Ulasan ({state.filteredReviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {state.filteredReviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada ulasan yang ditemukan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.filteredReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{review.reviewer?.full_name || 'Pengguna Anonim'}</p>
                            <p className="text-sm text-gray-500">{review.reviewer?.email}</p>
                          </div>
                          {review.is_verified_purchase && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Terverifikasi
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadgeColor(review.moderation_status)}>
                            {getStatusLabel(review.moderation_status)}
                          </Badge>
                          <Button
                            onClick={() => setState(prev => ({ 
                              ...prev, 
                              selectedReview: review, 
                              showDetailModal: true 
                            }))}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-4">
                            {renderStars(review.rating_stars)}
                            <span className="text-sm text-gray-500">
                              {review.car?.brand} {review.car?.model} {review.car?.year}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        
                        {review.review_text && (
                          <p className="text-gray-700 line-clamp-2">{review.review_text}</p>
                        )}
                        
                        {review.review_images && review.review_images.length > 0 && (
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <ImageIcon className="w-4 h-4 mr-1" />
                            {review.review_images.length} foto
                          </div>
                        )}
                      </div>

                      {review.moderation_status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setState(prev => ({
                              ...prev,
                              moderationAction: { action: 'approve', reviewId: review.id },
                              showModerationModal: true
                            }))}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Pulihkan
                          </Button>
                          <Button
                            onClick={() => setState(prev => ({
                              ...prev,
                              moderationAction: { action: 'reject', reviewId: review.id },
                              showModerationModal: true
                            }))}
                            size="sm"
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Tolak
                          </Button>
                          <Button
                            onClick={() => setState(prev => ({
                              ...prev,
                              moderationAction: { action: 'flag', reviewId: review.id },
                              showModerationModal: true
                            }))}
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            <Flag className="w-4 h-4 mr-1" />
                            Tandai
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={state.showDetailModal} onOpenChange={(open) => 
        setState(prev => ({ ...prev, showDetailModal: open, selectedReview: open ? prev.selectedReview : null }))
      }>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Ulasan</DialogTitle>
            <DialogDescription>
              Lihat detail ulasan, informasi pengguna, mobil terkait, dan status moderasi.
            </DialogDescription>
          </DialogHeader>
          
          {state.selectedReview && (
            <div className="space-y-6">
              {/* Reviewer Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{state.selectedReview.reviewer?.full_name || 'Pengguna Anonim'}</h3>
                  <p className="text-sm text-gray-500">{state.selectedReview.reviewer?.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusBadgeColor(state.selectedReview.moderation_status)}>
                      {getStatusLabel(state.selectedReview.moderation_status)}
                    </Badge>
                    {state.selectedReview.is_verified_purchase && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Pembelian Terverifikasi
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Dibuat</p>
                  <p className="font-medium">{new Date(state.selectedReview.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {/* Car Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Mobil yang Diulas</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {state.selectedReview.car?.brand} {state.selectedReview.car?.model} {state.selectedReview.car?.year}
                    </p>
                    <p className="text-sm text-gray-500">
                      Harga: Rp {state.selectedReview.car?.price?.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Details */}
              <div className="space-y-3">
                <h4 className="font-medium">Rating & Ulasan</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rating Keseluruhan:</span>
                      {renderStars(state.selectedReview.rating_stars, 'md')}
                    </div>
                    
                    {state.selectedReview.rating_car_condition && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Kondisi Mobil:</span>
                        {renderStars(state.selectedReview.rating_car_condition, 'md')}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {state.selectedReview.rating_seller_service && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Layanan Penjual:</span>
                        {renderStars(state.selectedReview.rating_seller_service, 'md')}
                      </div>
                    )}
                    
                    {state.selectedReview.rating_transaction_process && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Proses Transaksi:</span>
                        {renderStars(state.selectedReview.rating_transaction_process, 'md')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              {state.selectedReview.review_text && (
                <div>
                  <h4 className="font-medium mb-2">Ulasan</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{state.selectedReview.review_text}</p>
                  </div>
                </div>
              )}

              {/* Pros & Cons */}
              {(state.selectedReview.pros || state.selectedReview.cons) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.selectedReview.pros && (
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Kelebihan</h4>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm">{state.selectedReview.pros}</p>
                      </div>
                    </div>
                  )}
                  
                  {state.selectedReview.cons && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Kekurangan</h4>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm">{state.selectedReview.cons}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Images */}
              {state.selectedReview.review_images && state.selectedReview.review_images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Foto ({state.selectedReview.review_images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {state.selectedReview.review_images.map((image, index) => (
                      <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.caption || `Foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(image.image_url, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderation Info */}
              {state.selectedReview.moderated_at && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Informasi Moderasi</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Status:</span> {getStatusLabel(state.selectedReview.moderation_status)}</p>
                    <p><span className="font-medium">Dimoderasi pada:</span> {new Date(state.selectedReview.moderated_at).toLocaleString('id-ID')}</p>
                    {state.selectedReview.rejection_reason && (
                      <p><span className="font-medium">Alasan:</span> {state.selectedReview.rejection_reason}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  {state.selectedReview.moderation_status === 'pending' && (
                    <>
                      <Button
                        onClick={() => setState(prev => ({
                          ...prev,
                          moderationAction: { action: 'approve', reviewId: state.selectedReview!.id },
                          showModerationModal: true
                        }))}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        onClick={() => setState(prev => ({
                          ...prev,
                          moderationAction: { action: 'reject', reviewId: state.selectedReview!.id },
                          showModerationModal: true
                        }))}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                      <Button
                        onClick={() => setState(prev => ({
                          ...prev,
                          moderationAction: { action: 'flag', reviewId: state.selectedReview!.id },
                          showModerationModal: true
                        }))}
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Tandai
                      </Button>
                    </>
                  )}
                  
                  {/* Tombol Edit Ulasan */}
                  <Button
                    onClick={() => openEditModal(state.selectedReview!)}
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Edit Ulasan
                  </Button>
                </div>
                
                <Button
                  onClick={() => deleteReview(state.selectedReview!.id)}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Review Modal */}
      <Dialog open={state.showEditModal} onOpenChange={(open) => 
        setState(prev => ({ ...prev, showEditModal: open }))
      }>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Ulasan</DialogTitle>
            <DialogDescription>
              Ubah konten ulasan ini. Perubahan akan langsung terlihat oleh pengguna.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="review_text">Teks Ulasan</Label>
              <Textarea 
                id="review_text" 
                value={state.editData.review_text} 
                onChange={(e) => handleEditChange('review_text', e.target.value)}
                rows={5}
                placeholder="Teks ulasan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pros">Kelebihan</Label>
              <Textarea 
                id="pros" 
                value={state.editData.pros} 
                onChange={(e) => handleEditChange('pros', e.target.value)}
                rows={3}
                placeholder="Kelebihan produk/layanan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cons">Kekurangan</Label>
              <Textarea 
                id="cons" 
                value={state.editData.cons} 
                onChange={(e) => handleEditChange('cons', e.target.value)}
                rows={3}
                placeholder="Kekurangan produk/layanan"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, showEditModal: false }))}
            >
              Batal
            </Button>
            <Button 
              onClick={saveEditedReview}
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Moderation Modal */}
      <Dialog open={state.showModerationModal} onOpenChange={(open) => 
        setState(prev => ({ ...prev, showModerationModal: open, moderationAction: open ? prev.moderationAction : null }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {state.moderationAction?.action === 'approve' && 'Pulihkan Ulasan'}
              {state.moderationAction?.action === 'reject' && 'Tolak Ulasan'}
              {state.moderationAction?.action === 'flag' && 'Tandai Ulasan'}
            </DialogTitle>
            <DialogDescription>
              {state.moderationAction?.action === 'approve' && 'Ulasan akan dipulihkan dan ditampilkan kembali kepada publik.'}
              {state.moderationAction?.action === 'reject' && 'Ulasan akan ditolak dan disembunyikan dari publik.'}
              {state.moderationAction?.action === 'flag' && 'Ulasan akan ditandai untuk investigasi lebih lanjut.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {(state.moderationAction?.action === 'reject' || state.moderationAction?.action === 'flag') && (
              <div>
                <Label htmlFor="reason">Alasan {state.moderationAction.action === 'reject' ? 'Penolakan' : 'Penandaan'}</Label>
                <Textarea
                  id="reason"
                  placeholder={`Masukkan alasan ${state.moderationAction.action === 'reject' ? 'penolakan' : 'penandaan'}...`}
                  value={state.moderationAction?.reason || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    moderationAction: prev.moderationAction ? {
                      ...prev.moderationAction,
                      reason: e.target.value
                    } : null
                  }))}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, showModerationModal: false, moderationAction: null }))}
            >
              Batal
            </Button>
            <Button
              onClick={() => state.moderationAction && moderateReview(state.moderationAction)}
              className={
                state.moderationAction?.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                state.moderationAction?.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-orange-600 hover:bg-orange-700'
              }
            >
              {state.moderationAction?.action === 'approve' && 'Setujui'}
              {state.moderationAction?.action === 'reject' && 'Tolak'}
              {state.moderationAction?.action === 'flag' && 'Tandai'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalamanModerasiUlasan;