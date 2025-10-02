const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data pembelian
export interface DataPembelian {
  id: string;
  nomorTransaksi: string;
  tanggalPembelian: string;
  mobil: {
    id: string;
    nama: string;
    merk: string;
    model: string;
    tahun: number;
    foto: string;
  };
  dealer: {
    id: string;
    nama: string;
    alamat: string;
  };
  status: 'selesai' | 'dalam_proses' | 'dibatalkan';
  totalHarga: number;
  sudahDiulas: boolean;
}

// Interface untuk form penilaian
export interface FormPenilaian {
  idMobil: string;
  idTransaksi: string;
  rating: number;
  komentar: string;
  aspekPenilaian: {
    kualitasMobil: number;
    pelayananDealer: number;
    prosesTransaksi: number;
    pengirimanMobil: number;
    nilaiUang: number;
  };
  rekomendasi: boolean;
  foto: File[];
  kelebihanMobil: string[];
  kekuranganMobil: string[];
  kategoriPembeli: 'pertama_kali' | 'berpengalaman' | 'upgrade' | 'ganti_merk';
}

// Interface untuk data ulasan
export interface DataUlasan {
  id?: string;
  idMobil: string;
  idTransaksi: string;
  idUser: string;
  rating: number;
  komentar: string;
  aspekPenilaian: {
    kualitasMobil: number;
    pelayananDealer: number;
    prosesTransaksi: number;
    pengirimanMobil: number;
    nilaiUang: number;
  };
  rekomendasi: boolean;
  foto: string[];
  kelebihanMobil: string[];
  kekuranganMobil: string[];
  kategoriPembeli: string;
  tanggalUlasan: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  notHelpful: number;
}

// Interface untuk validasi ulasan
export interface ValidasiUlasan {
  isValid: boolean;
  errors: {
    rating?: string;
    komentar?: string;
    aspekPenilaian?: string;
    foto?: string;
    kelebihanMobil?: string;
    kekuranganMobil?: string;
  };
}

// Interface untuk statistik ulasan
export interface StatistikUlasan {
  totalUlasan: number;
  ratingRataRata: number;
  distribusiRating: {
    bintang5: number;
    bintang4: number;
    bintang3: number;
    bintang2: number;
    bintang1: number;
  };
  persentaseRekomendasi: number;
  aspekTerbaik: string;
  aspekTerburuk: string;
}

export class KontrollerUlasan {
  private token: string | null = null;
  private maxFileSize = 5 * 1024 * 1024; // 5MB
  private allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private maxPhotos = 5;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat riwayat pembelian pengguna yang bisa diulas
   * @returns Promise<DataPembelian[]>
   */
  public async muatRiwayatPembelian(): Promise<DataPembelian[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ulasan/riwayat-pembelian`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error loading purchase history:', error);
      return [];
    }
  }

  /**
   * Memuat form penilaian untuk mobil tertentu
   * @param idMobil - ID mobil yang akan diulas
   * @param idTransaksi - ID transaksi pembelian
   * @returns FormPenilaian
   */
  public muatFormPenilaian(idMobil: string, idTransaksi?: string): FormPenilaian {
    return {
      idMobil,
      idTransaksi: idTransaksi || '',
      rating: 0,
      komentar: '',
      aspekPenilaian: {
        kualitasMobil: 0,
        pelayananDealer: 0,
        prosesTransaksi: 0,
        pengirimanMobil: 0,
        nilaiUang: 0
      },
      rekomendasi: false,
      foto: [],
      kelebihanMobil: [],
      kekuranganMobil: [],
      kategoriPembeli: 'pertama_kali'
    };
  }

  /**
   * Validasi data ulasan sebelum dikirim
   * @param rating - Rating yang diberikan (1-5)
   * @param komentar - Komentar ulasan
   * @param aspekPenilaian - Penilaian per aspek
   * @param foto - Array file foto
   * @returns ValidasiUlasan
   */
  public validasiDataUlasan(
    rating: number,
    komentar: string,
    aspekPenilaian?: any,
    foto?: File[]
  ): ValidasiUlasan {
    const errors: ValidasiUlasan['errors'] = {};

    // Validasi rating
    if (!rating || rating < 1 || rating > 5) {
      errors.rating = 'Rating harus diisi dengan nilai 1-5 bintang';
    }

    // Validasi komentar
    if (!komentar || komentar.trim().length === 0) {
      errors.komentar = 'Komentar ulasan harus diisi';
    } else if (komentar.trim().length < 10) {
      errors.komentar = 'Komentar minimal 10 karakter';
    } else if (komentar.trim().length > 1000) {
      errors.komentar = 'Komentar maksimal 1000 karakter';
    }

    // Validasi aspek penilaian
    if (aspekPenilaian) {
      const aspekKeys = ['kualitasMobil', 'pelayananDealer', 'prosesTransaksi', 'pengirimanMobil', 'nilaiUang'];
      const aspekTidakValid = aspekKeys.some(key => 
        !aspekPenilaian[key] || aspekPenilaian[key] < 1 || aspekPenilaian[key] > 5
      );
      
      if (aspekTidakValid) {
        errors.aspekPenilaian = 'Semua aspek penilaian harus diisi dengan nilai 1-5';
      }
    }

    // Validasi foto
    if (foto && foto.length > 0) {
      if (foto.length > this.maxPhotos) {
        errors.foto = `Maksimal ${this.maxPhotos} foto yang dapat diunggah`;
      }

      const fotoTidakValid = foto.some(file => {
        return !this.allowedFileTypes.includes(file.type) || file.size > this.maxFileSize;
      });

      if (fotoTidakValid) {
        errors.foto = 'Format foto harus JPG/PNG/WebP dengan ukuran maksimal 5MB';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Mengecek keputusan pengguna untuk menambah foto
   * @param rating - Rating yang diberikan
   * @param komentar - Komentar yang diberikan
   * @returns boolean - true jika disarankan menambah foto
   */
  public cekKeputusanTambahFoto(rating: number, komentar: string): boolean {
    // Sarankan tambah foto jika:
    // 1. Rating sangat baik (5 bintang) atau sangat buruk (1-2 bintang)
    // 2. Komentar cukup panjang (lebih dari 100 karakter)
    return rating === 5 || rating <= 2 || komentar.length > 100;
  }

  /**
   * Memproses pengiriman ulasan
   * @param dataUlasan - Data ulasan yang akan dikirim
   * @returns Promise<{success: boolean, message: string, data?: any}>
   */
  public async ProsesKirimUlasan(dataUlasan: FormPenilaian): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      // Validasi data terlebih dahulu
      const validasi = this.validasiDataUlasan(
        dataUlasan.rating,
        dataUlasan.komentar,
        dataUlasan.aspekPenilaian,
        dataUlasan.foto
      );

      if (!validasi.isValid) {
        return {
          success: false,
          message: 'Data ulasan tidak valid',
          data: { errors: validasi.errors }
        };
      }

      // Upload foto terlebih dahulu jika ada
      let urlFoto: string[] = [];
      if (dataUlasan.foto.length > 0) {
        urlFoto = await this.uploadFotoUlasan(dataUlasan.foto);
      }

      // Siapkan data untuk dikirim ke server
      const payload = {
        idMobil: dataUlasan.idMobil,
        idTransaksi: dataUlasan.idTransaksi,
        rating: dataUlasan.rating,
        komentar: dataUlasan.komentar.trim(),
        aspekPenilaian: dataUlasan.aspekPenilaian,
        rekomendasi: dataUlasan.rekomendasi,
        foto: urlFoto,
        kelebihanMobil: dataUlasan.kelebihanMobil.filter(item => item.trim().length > 0),
        kekuranganMobil: dataUlasan.kekuranganMobil.filter(item => item.trim().length > 0),
        kategoriPembeli: dataUlasan.kategoriPembeli,
        tanggalUlasan: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/ulasan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim ulasan');
      }

      return {
        success: true,
        message: 'Ulasan berhasil dikirim dan akan ditinjau oleh moderator',
        data: result.data
      };

    } catch (error) {
      console.error('Error submitting review:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim ulasan'
      };
    }
  }

  /**
   * Upload foto ulasan ke server
   * @param files - Array file foto
   * @returns Promise<string[]> - Array URL foto yang berhasil diupload
   */
  private async uploadFotoUlasan(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await fetch(`${API_BASE_URL}/upload/ulasan-foto`, {
        method: 'POST',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Gagal upload foto: ${file.name}`);
      }

      const result = await response.json();
      return result.data.url;
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    }
  }

  /**
   * Memuat ulasan untuk mobil tertentu
   * @param idMobil - ID mobil
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 10)
   * @param sortBy - Urutan ('terbaru' | 'terlama' | 'rating_tinggi' | 'rating_rendah' | 'helpful')
   * @returns Promise<{ulasan: DataUlasan[], total: number, statistik: StatistikUlasan}>
   */
  public async muatUlasanMobil(
    idMobil: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'terbaru'
  ): Promise<{
    ulasan: DataUlasan[];
    total: number;
    statistik: StatistikUlasan;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      const response = await fetch(`${API_BASE_URL}/ulasan/mobil/${idMobil}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error loading car reviews:', error);
      return {
        ulasan: [],
        total: 0,
        statistik: {
          totalUlasan: 0,
          ratingRataRata: 0,
          distribusiRating: {
            bintang5: 0,
            bintang4: 0,
            bintang3: 0,
            bintang2: 0,
            bintang1: 0
          },
          persentaseRekomendasi: 0,
          aspekTerbaik: '',
          aspekTerburuk: ''
        }
      };
    }
  }

  /**
   * Memberikan vote helpful/not helpful pada ulasan
   * @param idUlasan - ID ulasan
   * @param isHelpful - true untuk helpful, false untuk not helpful
   * @returns Promise<boolean>
   */
  public async voteUlasan(idUlasan: string, isHelpful: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/ulasan/${idUlasan}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ isHelpful })
      });

      return response.ok;
    } catch (error) {
      console.error('Error voting review:', error);
      return false;
    }
  }

  /**
   * Melaporkan ulasan yang tidak pantas
   * @param idUlasan - ID ulasan
   * @param alasan - Alasan pelaporan
   * @returns Promise<boolean>
   */
  public async laporkanUlasan(idUlasan: string, alasan: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/ulasan/${idUlasan}/lapor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ alasan })
      });

      return response.ok;
    } catch (error) {
      console.error('Error reporting review:', error);
      return false;
    }
  }

  /**
   * Format rating menjadi bintang
   * @param rating - Nilai rating (1-5)
   * @returns string - Representasi bintang
   */
  public formatRatingBintang(rating: number): string {
    const bintangPenuh = '★';
    const bintangKosong = '☆';
    return bintangPenuh.repeat(Math.floor(rating)) + bintangKosong.repeat(5 - Math.floor(rating));
  }

  /**
   * Menghitung rata-rata aspek penilaian
   * @param aspekPenilaian - Object aspek penilaian
   * @returns number - Rata-rata nilai
   */
  public hitungRataRataAspek(aspekPenilaian: any): number {
    const values = Object.values(aspekPenilaian) as number[];
    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.round((total / values.length) * 10) / 10;
  }

  /**
   * Validasi file foto sebelum upload
   * @param file - File yang akan divalidasi
   * @returns {isValid: boolean, error?: string}
   */
  public validasiFoto(file: File): { isValid: boolean; error?: string } {
    if (!this.allowedFileTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP'
      };
    }

    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: 'Ukuran file terlalu besar. Maksimal 5MB'
      };
    }

    return { isValid: true };
  }
}

export default KontrollerUlasan;