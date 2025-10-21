import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  message: string;
  error?: string;
}

export interface UploadOptions {
  folder?: 'featured' | 'gallery' | 'temp';
  maxSizeKB?: number;
  allowedTypes?: string[];
  quality?: number;
}

// ==================== UPLOAD SERVICE CLASS ====================

export class UploadService {
  private static instance: UploadService;
  private readonly BUCKET_NAME = 'article-images';
  private readonly DEFAULT_MAX_SIZE = 5120; // 5MB in KB
  private readonly DEFAULT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  private constructor() {}

  public static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  // ==================== MAIN UPLOAD METHOD ====================

  /**
   * Upload gambar ke Supabase Storage
   * @param file - File yang akan diupload
   * @param options - Opsi upload
   * @returns Promise<UploadResult>
   */
  public async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Set default options
      const {
        folder = 'featured',
        maxSizeKB = this.DEFAULT_MAX_SIZE,
        allowedTypes = this.DEFAULT_ALLOWED_TYPES,
        quality = 0.8
      } = options;

      // Validasi file
      const validation = this.validateFile(file, maxSizeKB, allowedTypes);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validasi file gagal',
          error: validation.error
        };
      }

      // Compress image if needed
      const processedFile = await this.compressImage(file, quality);

      // Generate unique filename
      const fileName = this.generateFileName(processedFile);
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          message: 'Gagal mengupload gambar',
          error: error.message
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        message: 'Gambar berhasil diupload'
      };

    } catch (error) {
      console.error('Upload service error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat upload',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of files
   * @param options - Upload options
   * @returns Promise<UploadResult[]>
   */
  public async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, options));
    return Promise.all(uploadPromises);
  }

  // ==================== DELETE METHOD ====================

  /**
   * Hapus gambar dari storage
   * @param path - Path file di storage
   * @returns Promise<UploadResult>
   */
  public async deleteImage(path: string): Promise<UploadResult> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        return {
          success: false,
          message: 'Gagal menghapus gambar',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Gambar berhasil dihapus'
      };

    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menghapus gambar',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Hapus multiple images
   * @param paths - Array of file paths
   * @returns Promise<UploadResult>
   */
  public async deleteMultipleImages(paths: string[]): Promise<UploadResult> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(paths);

      if (error) {
        return {
          success: false,
          message: 'Gagal menghapus gambar',
          error: error.message
        };
      }

      return {
        success: true,
        message: `${paths.length} gambar berhasil dihapus`
      };

    } catch (error) {
      return {
        success: false,
        message: 'Terjadi kesalahan saat menghapus gambar',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validasi file sebelum upload
   */
  private validateFile(
    file: File,
    maxSizeKB: number,
    allowedTypes: string[]
  ): { valid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'File tidak ditemukan' };
    }

    // Check file size (convert KB to bytes)
    const maxSizeBytes = maxSizeKB * 1024;
    if (file.size > maxSizeBytes) {
      const maxSizeMB = (maxSizeKB / 1024).toFixed(2);
      return { 
        valid: false, 
        error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB` 
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Tipe file tidak didukung. Gunakan: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Compress image untuk menghemat space
   */
  private async compressImage(file: File, quality: number): Promise<File> {
    return new Promise((resolve, reject) => {
      // Jika bukan image atau sudah kecil, skip compression
      if (!file.type.startsWith('image/') || file.size < 500000) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });

              // Gunakan file compressed jika lebih kecil
              resolve(compressedFile.size < file.size ? compressedFile : file);
            },
            file.type,
            quality
          );
        };

        img.onerror = () => resolve(file);
      };

      reader.onerror = () => resolve(file);
    });
  }

  /**
   * Generate unique filename
   */
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-z0-9]/gi, '-') // Replace special chars with dash
      .toLowerCase()
      .substring(0, 30); // Limit length

    return `${sanitizedName}-${timestamp}-${randomString}.${fileExt}`;
  }

  /**
   * Extract path from Supabase URL
   */
  public extractPathFromUrl(url: string): string | null {
    try {
      // Format: https://[project].supabase.co/storage/v1/object/public/article-images/featured/filename.jpg
      const match = url.match(/\/article-images\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Get file info from URL
   */
  public async getFileInfo(path: string): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path.split('/')[0], {
          search: path.split('/').pop()
        });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }

  /**
   * Validate image URL (check if exists)
   */
  public async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage
   */
  public async getStorageUsage(): Promise<{ files: number; size: number }> {
    try {
      let totalFiles = 0;
      let totalSize = 0;

      const folders = ['featured', 'gallery', 'temp'];
      
      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .list(folder);

        if (!error && data) {
          totalFiles += data.length;
          totalSize += data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
        }
      }

      return { files: totalFiles, size: totalSize };
    } catch (error) {
      console.error('Get storage usage error:', error);
      return { files: 0, size: 0 };
    }
  }

  /**
   * Format file size untuk display
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// ==================== EXPORT SINGLETON ====================
export const uploadService = UploadService.getInstance();

// Default export
export default UploadService;