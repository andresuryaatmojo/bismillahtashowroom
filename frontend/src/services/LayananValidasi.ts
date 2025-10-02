// LayananValidasi.ts - Comprehensive validation service for Mobilindo Showroom
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  data?: any;
}

export interface DataMasukan {
  [key: string]: any;
}

export interface DataRegistrasi {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
  noTelepon: string;
  alamat?: string;
  jenisAkun: 'pembeli' | 'penjual' | 'admin';
}

export interface DataPermohonan {
  judul: string;
  deskripsi: string;
  kategori: string;
  prioritas: 'rendah' | 'sedang' | 'tinggi';
  lampiran?: File[];
}

export interface DataUlasan {
  rating: number;
  komentar: string;
  idProduk: string;
  idUser: string;
}

export interface DataMobil {
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  kilometer: number;
  transmisi: 'manual' | 'automatic';
  bahanBakar: 'bensin' | 'diesel' | 'hybrid' | 'listrik';
  warna: string;
  deskripsi: string;
  lokasi: string;
  kondisi: 'baru' | 'bekas';
  stnk: boolean;
  bpkb: boolean;
}

export interface FotoMobil {
  file: File;
  ukuran: number;
  tipe: string;
  nama: string;
}

export interface DataProfil {
  nama?: string;
  email?: string;
  noTelepon?: string;
  alamat?: string;
  tanggalLahir?: string;
  jenisKelamin?: 'L' | 'P';
  foto?: File;
}

export interface DataUser {
  id: string;
  nama: string;
  email: string;
  status: 'aktif' | 'nonaktif' | 'suspended';
  peran: 'admin' | 'manager' | 'staff' | 'customer';
}

export interface DataKonten {
  judul: string;
  isi: string;
  kategori: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
}

export interface DataParameter {
  nama: string;
  nilai: any;
  tipe: 'string' | 'number' | 'boolean' | 'array' | 'object';
  wajib: boolean;
}

export class LayananValidasi {
  private static instance: LayananValidasi;
  
  // Email regex pattern
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone number pattern (Indonesian format)
  private readonly phonePattern = /^(\+62|62|0)[0-9]{9,13}$/;
  
  // Password requirements
  private readonly passwordMinLength = 8;
  private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  
  // File size limits (in bytes)
  private readonly maxImageSize = 5 * 1024 * 1024; // 5MB
  private readonly maxDocumentSize = 10 * 1024 * 1024; // 10MB
  
  // Allowed file types
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  public static getInstance(): LayananValidasi {
    if (!LayananValidasi.instance) {
      LayananValidasi.instance = new LayananValidasi();
    }
    return LayananValidasi.instance;
  }

  // Method: validasiFormatData
  public validasiFormatData(dataMasukan: DataMasukan): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if data is provided
      if (!dataMasukan || typeof dataMasukan !== 'object') {
        errors.push('Data masukan harus berupa objek yang valid');
        return { isValid: false, errors, warnings };
      }

      // Check for empty object
      if (Object.keys(dataMasukan).length === 0) {
        errors.push('Data masukan tidak boleh kosong');
        return { isValid: false, errors, warnings };
      }

      // Validate each field format
      for (const [key, value] of Object.entries(dataMasukan)) {
        // Check for null or undefined values
        if (value === null || value === undefined) {
          warnings.push(`Field '${key}' memiliki nilai null atau undefined`);
          continue;
        }

        // Check for empty strings
        if (typeof value === 'string' && value.trim() === '') {
          warnings.push(`Field '${key}' berupa string kosong`);
          continue;
        }

        // Validate specific field formats
        if (key.toLowerCase().includes('email')) {
          if (typeof value === 'string' && !this.emailPattern.test(value)) {
            errors.push(`Format email tidak valid untuk field '${key}'`);
          }
        }

        if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('telepon')) {
          if (typeof value === 'string' && !this.phonePattern.test(value)) {
            errors.push(`Format nomor telepon tidak valid untuk field '${key}'`);
          }
        }

        if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
          if (typeof value === 'string') {
            try {
              new URL(value);
            } catch {
              errors.push(`Format URL tidak valid untuk field '${key}'`);
            }
          }
        }

        // Check for SQL injection patterns
        if (typeof value === 'string') {
          const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
            /(--|\/\*|\*\/|;)/,
            /(\b(OR|AND)\b.*=.*)/i
          ];
          
          for (const pattern of sqlPatterns) {
            if (pattern.test(value)) {
              errors.push(`Terdeteksi pola berbahaya pada field '${key}'`);
              break;
            }
          }
        }

        // Check for XSS patterns
        if (typeof value === 'string') {
          const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
          ];
          
          for (const pattern of xssPatterns) {
            if (pattern.test(value)) {
              errors.push(`Terdeteksi pola XSS pada field '${key}'`);
              break;
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataMasukan
      };

    } catch (error) {
      errors.push(`Error dalam validasi format data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiFormatRegistrasi
  public validasiFormatRegistrasi(dataLengkap: DataRegistrasi): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate required fields
      if (!dataLengkap.nama || dataLengkap.nama.trim() === '') {
        errors.push('Nama wajib diisi');
      } else if (dataLengkap.nama.length < 2) {
        errors.push('Nama minimal 2 karakter');
      } else if (dataLengkap.nama.length > 100) {
        errors.push('Nama maksimal 100 karakter');
      }

      // Validate email
      if (!dataLengkap.email || dataLengkap.email.trim() === '') {
        errors.push('Email wajib diisi');
      } else if (!this.emailPattern.test(dataLengkap.email)) {
        errors.push('Format email tidak valid');
      }

      // Validate password
      if (!dataLengkap.password) {
        errors.push('Password wajib diisi');
      } else {
        if (dataLengkap.password.length < this.passwordMinLength) {
          errors.push(`Password minimal ${this.passwordMinLength} karakter`);
        }
        if (!this.passwordPattern.test(dataLengkap.password)) {
          errors.push('Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus');
        }
      }

      // Validate password confirmation
      if (!dataLengkap.confirmPassword) {
        errors.push('Konfirmasi password wajib diisi');
      } else if (dataLengkap.password !== dataLengkap.confirmPassword) {
        errors.push('Password dan konfirmasi password tidak cocok');
      }

      // Validate phone number
      if (!dataLengkap.noTelepon || dataLengkap.noTelepon.trim() === '') {
        errors.push('Nomor telepon wajib diisi');
      } else if (!this.phonePattern.test(dataLengkap.noTelepon)) {
        errors.push('Format nomor telepon tidak valid');
      }

      // Validate account type
      const validAccountTypes = ['pembeli', 'penjual', 'admin'];
      if (!validAccountTypes.includes(dataLengkap.jenisAkun)) {
        errors.push('Jenis akun tidak valid');
      }

      // Validate optional address
      if (dataLengkap.alamat && dataLengkap.alamat.length > 500) {
        warnings.push('Alamat terlalu panjang (maksimal 500 karakter)');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataLengkap
      };

    } catch (error) {
      errors.push(`Error dalam validasi registrasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiDataInput
  public validasiDataInput(dataPermohonan: DataPermohonan): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate title
      if (!dataPermohonan.judul || dataPermohonan.judul.trim() === '') {
        errors.push('Judul permohonan wajib diisi');
      } else if (dataPermohonan.judul.length < 5) {
        errors.push('Judul minimal 5 karakter');
      } else if (dataPermohonan.judul.length > 200) {
        errors.push('Judul maksimal 200 karakter');
      }

      // Validate description
      if (!dataPermohonan.deskripsi || dataPermohonan.deskripsi.trim() === '') {
        errors.push('Deskripsi wajib diisi');
      } else if (dataPermohonan.deskripsi.length < 10) {
        errors.push('Deskripsi minimal 10 karakter');
      } else if (dataPermohonan.deskripsi.length > 2000) {
        errors.push('Deskripsi maksimal 2000 karakter');
      }

      // Validate category
      if (!dataPermohonan.kategori || dataPermohonan.kategori.trim() === '') {
        errors.push('Kategori wajib dipilih');
      }

      // Validate priority
      const validPriorities = ['rendah', 'sedang', 'tinggi'];
      if (!validPriorities.includes(dataPermohonan.prioritas)) {
        errors.push('Prioritas tidak valid');
      }

      // Validate attachments if provided
      if (dataPermohonan.lampiran && dataPermohonan.lampiran.length > 0) {
        if (dataPermohonan.lampiran.length > 5) {
          errors.push('Maksimal 5 file lampiran');
        }

        for (let i = 0; i < dataPermohonan.lampiran.length; i++) {
          const file = dataPermohonan.lampiran[i];
          
          if (file.size > this.maxDocumentSize) {
            errors.push(`File lampiran ${i + 1} terlalu besar (maksimal 10MB)`);
          }

          if (!this.allowedDocumentTypes.includes(file.type) && !this.allowedImageTypes.includes(file.type)) {
            errors.push(`Tipe file lampiran ${i + 1} tidak didukung`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataPermohonan
      };

    } catch (error) {
      errors.push(`Error dalam validasi data input: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: prosesValidasiAwal
  public prosesValidasiAwal(rating: number, komentar: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate rating
      if (rating === null || rating === undefined) {
        errors.push('Rating wajib diberikan');
      } else if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.push('Rating harus berupa angka bulat antara 1-5');
      }

      // Validate comment
      if (!komentar || komentar.trim() === '') {
        warnings.push('Komentar kosong, pertimbangkan untuk memberikan feedback');
      } else {
        if (komentar.length < 5) {
          warnings.push('Komentar terlalu singkat (minimal 5 karakter)');
        } else if (komentar.length > 1000) {
          errors.push('Komentar terlalu panjang (maksimal 1000 karakter)');
        }

        // Check for inappropriate content
        const inappropriateWords = ['spam', 'scam', 'fake', 'palsu', 'penipu'];
        const lowerComment = komentar.toLowerCase();
        
        for (const word of inappropriateWords) {
          if (lowerComment.includes(word)) {
            warnings.push('Komentar mengandung kata yang perlu direview');
            break;
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: { rating, komentar }
      };

    } catch (error) {
      errors.push(`Error dalam validasi awal: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiAkhir
  public validasiAkhir(dataUlasan: DataUlasan): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate rating
      if (!Number.isInteger(dataUlasan.rating) || dataUlasan.rating < 1 || dataUlasan.rating > 5) {
        errors.push('Rating harus berupa angka bulat antara 1-5');
      }

      // Validate comment
      if (!dataUlasan.komentar || dataUlasan.komentar.trim() === '') {
        errors.push('Komentar wajib diisi');
      } else if (dataUlasan.komentar.length > 1000) {
        errors.push('Komentar maksimal 1000 karakter');
      }

      // Validate product ID
      if (!dataUlasan.idProduk || dataUlasan.idProduk.trim() === '') {
        errors.push('ID produk wajib diisi');
      }

      // Validate user ID
      if (!dataUlasan.idUser || dataUlasan.idUser.trim() === '') {
        errors.push('ID user wajib diisi');
      }

      // Cross-validation
      if (dataUlasan.rating <= 2 && dataUlasan.komentar.length < 20) {
        warnings.push('Rating rendah sebaiknya disertai penjelasan yang lebih detail');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataUlasan
      };

    } catch (error) {
      errors.push(`Error dalam validasi akhir: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: prosesValidasiData (pasang iklan mobil)
  public prosesValidasiData(dataMobil: DataMobil): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate brand
      if (!dataMobil.merk || dataMobil.merk.trim() === '') {
        errors.push('Merk mobil wajib diisi');
      }

      // Validate model
      if (!dataMobil.model || dataMobil.model.trim() === '') {
        errors.push('Model mobil wajib diisi');
      }

      // Validate year
      const currentYear = new Date().getFullYear();
      if (!dataMobil.tahun || dataMobil.tahun < 1900 || dataMobil.tahun > currentYear + 1) {
        errors.push(`Tahun mobil harus antara 1900 - ${currentYear + 1}`);
      }

      // Validate price
      if (!dataMobil.harga || dataMobil.harga <= 0) {
        errors.push('Harga mobil harus lebih dari 0');
      } else if (dataMobil.harga > 10000000000) { // 10 billion
        warnings.push('Harga mobil sangat tinggi, pastikan sudah benar');
      }

      // Validate mileage
      if (dataMobil.kilometer < 0) {
        errors.push('Kilometer tidak boleh negatif');
      } else if (dataMobil.kilometer > 1000000) {
        warnings.push('Kilometer sangat tinggi, pastikan sudah benar');
      }

      // Validate transmission
      const validTransmissions = ['manual', 'automatic'];
      if (!validTransmissions.includes(dataMobil.transmisi)) {
        errors.push('Jenis transmisi tidak valid');
      }

      // Validate fuel type
      const validFuelTypes = ['bensin', 'diesel', 'hybrid', 'listrik'];
      if (!validFuelTypes.includes(dataMobil.bahanBakar)) {
        errors.push('Jenis bahan bakar tidak valid');
      }

      // Validate color
      if (!dataMobil.warna || dataMobil.warna.trim() === '') {
        errors.push('Warna mobil wajib diisi');
      }

      // Validate description
      if (!dataMobil.deskripsi || dataMobil.deskripsi.trim() === '') {
        errors.push('Deskripsi mobil wajib diisi');
      } else if (dataMobil.deskripsi.length < 20) {
        warnings.push('Deskripsi terlalu singkat, tambahkan detail lebih lengkap');
      } else if (dataMobil.deskripsi.length > 2000) {
        errors.push('Deskripsi maksimal 2000 karakter');
      }

      // Validate location
      if (!dataMobil.lokasi || dataMobil.lokasi.trim() === '') {
        errors.push('Lokasi mobil wajib diisi');
      }

      // Validate condition
      const validConditions = ['baru', 'bekas'];
      if (!validConditions.includes(dataMobil.kondisi)) {
        errors.push('Kondisi mobil tidak valid');
      }

      // Validate documents
      if (dataMobil.kondisi === 'bekas' && !dataMobil.stnk) {
        warnings.push('Mobil bekas sebaiknya memiliki STNK');
      }

      if (dataMobil.kondisi === 'bekas' && !dataMobil.bpkb) {
        warnings.push('Mobil bekas sebaiknya memiliki BPKB');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataMobil
      };

    } catch (error) {
      errors.push(`Error dalam validasi data mobil: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiFotoMobil
  public validasiFotoMobil(fotoMobil: FotoMobil): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate file existence
      if (!fotoMobil.file) {
        errors.push('File foto wajib dipilih');
        return { isValid: false, errors, warnings };
      }

      // Validate file size
      if (fotoMobil.ukuran > this.maxImageSize) {
        errors.push(`Ukuran file terlalu besar (maksimal ${this.maxImageSize / (1024 * 1024)}MB)`);
      }

      // Validate file type
      if (!this.allowedImageTypes.includes(fotoMobil.tipe)) {
        errors.push('Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP');
      }

      // Validate file name
      if (!fotoMobil.nama || fotoMobil.nama.trim() === '') {
        errors.push('Nama file tidak valid');
      } else if (fotoMobil.nama.length > 255) {
        errors.push('Nama file terlalu panjang');
      }

      // Check for suspicious file names
      const suspiciousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i];
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(fotoMobil.nama)) {
          errors.push('Nama file mencurigakan');
          break;
        }
      }

      // Validate image dimensions (if available)
      if (fotoMobil.file instanceof File) {
        const img = new Image();
        img.onload = () => {
          if (img.width < 400 || img.height < 300) {
            warnings.push('Resolusi foto terlalu rendah (minimal 400x300 pixel)');
          }
          if (img.width > 4000 || img.height > 4000) {
            warnings.push('Resolusi foto sangat tinggi, pertimbangkan untuk mengompres');
          }
        };
        img.src = URL.createObjectURL(fotoMobil.file);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: fotoMobil
      };

    } catch (error) {
      errors.push(`Error dalam validasi foto mobil: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiDataProfil
  public validasiDataProfil(dataBaruProfil: DataProfil): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate name if provided
      if (dataBaruProfil.nama !== undefined) {
        if (dataBaruProfil.nama.trim() === '') {
          errors.push('Nama tidak boleh kosong');
        } else if (dataBaruProfil.nama.length < 2) {
          errors.push('Nama minimal 2 karakter');
        } else if (dataBaruProfil.nama.length > 100) {
          errors.push('Nama maksimal 100 karakter');
        }
      }

      // Validate email if provided
      if (dataBaruProfil.email !== undefined) {
        if (dataBaruProfil.email.trim() === '') {
          errors.push('Email tidak boleh kosong');
        } else if (!this.emailPattern.test(dataBaruProfil.email)) {
          errors.push('Format email tidak valid');
        }
      }

      // Validate phone if provided
      if (dataBaruProfil.noTelepon !== undefined) {
        if (dataBaruProfil.noTelepon.trim() === '') {
          errors.push('Nomor telepon tidak boleh kosong');
        } else if (!this.phonePattern.test(dataBaruProfil.noTelepon)) {
          errors.push('Format nomor telepon tidak valid');
        }
      }

      // Validate address if provided
      if (dataBaruProfil.alamat !== undefined && dataBaruProfil.alamat.length > 500) {
        errors.push('Alamat maksimal 500 karakter');
      }

      // Validate birth date if provided
      if (dataBaruProfil.tanggalLahir !== undefined) {
        const birthDate = new Date(dataBaruProfil.tanggalLahir);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (isNaN(birthDate.getTime())) {
          errors.push('Format tanggal lahir tidak valid');
        } else if (birthDate > today) {
          errors.push('Tanggal lahir tidak boleh di masa depan');
        } else if (age < 17) {
          errors.push('Usia minimal 17 tahun');
        } else if (age > 100) {
          warnings.push('Usia sangat tinggi, pastikan tanggal lahir benar');
        }
      }

      // Validate gender if provided
      if (dataBaruProfil.jenisKelamin !== undefined) {
        const validGenders = ['L', 'P'];
        if (!validGenders.includes(dataBaruProfil.jenisKelamin)) {
          errors.push('Jenis kelamin tidak valid');
        }
      }

      // Validate photo if provided
      if (dataBaruProfil.foto !== undefined) {
        if (dataBaruProfil.foto.size > this.maxImageSize) {
          errors.push(`Ukuran foto terlalu besar (maksimal ${this.maxImageSize / (1024 * 1024)}MB)`);
        }
        
        if (!this.allowedImageTypes.includes(dataBaruProfil.foto.type)) {
          errors.push('Tipe foto tidak didukung. Gunakan JPG, PNG, atau WebP');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataBaruProfil
      };

    } catch (error) {
      errors.push(`Error dalam validasi data profil: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiPasswordLama
  public validasiPasswordLama(passwordLama: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate password existence
      if (!passwordLama || passwordLama.trim() === '') {
        errors.push('Password lama wajib diisi');
        return { isValid: false, errors, warnings };
      }

      // Basic length check
      if (passwordLama.length < this.passwordMinLength) {
        errors.push(`Password minimal ${this.passwordMinLength} karakter`);
      }

      // Note: In real implementation, this would check against stored hash
      // For now, we'll just validate format
      if (!this.passwordPattern.test(passwordLama)) {
        warnings.push('Password tidak memenuhi kriteria keamanan saat ini');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: { passwordLama }
      };

    } catch (error) {
      errors.push(`Error dalam validasi password lama: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiDataMobil
  public validasiDataMobil(dataPerubahan: Partial<DataMobil>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate each field that's being changed
      if (dataPerubahan.merk !== undefined && dataPerubahan.merk.trim() === '') {
        errors.push('Merk mobil tidak boleh kosong');
      }

      if (dataPerubahan.model !== undefined && dataPerubahan.model.trim() === '') {
        errors.push('Model mobil tidak boleh kosong');
      }

      if (dataPerubahan.tahun !== undefined) {
        const currentYear = new Date().getFullYear();
        if (dataPerubahan.tahun < 1900 || dataPerubahan.tahun > currentYear + 1) {
          errors.push(`Tahun mobil harus antara 1900 - ${currentYear + 1}`);
        }
      }

      if (dataPerubahan.harga !== undefined) {
        if (dataPerubahan.harga <= 0) {
          errors.push('Harga mobil harus lebih dari 0');
        } else if (dataPerubahan.harga > 10000000000) {
          warnings.push('Harga mobil sangat tinggi, pastikan sudah benar');
        }
      }

      if (dataPerubahan.kilometer !== undefined) {
        if (dataPerubahan.kilometer < 0) {
          errors.push('Kilometer tidak boleh negatif');
        } else if (dataPerubahan.kilometer > 1000000) {
          warnings.push('Kilometer sangat tinggi, pastikan sudah benar');
        }
      }

      if (dataPerubahan.transmisi !== undefined) {
        const validTransmissions = ['manual', 'automatic'];
        if (!validTransmissions.includes(dataPerubahan.transmisi)) {
          errors.push('Jenis transmisi tidak valid');
        }
      }

      if (dataPerubahan.bahanBakar !== undefined) {
        const validFuelTypes = ['bensin', 'diesel', 'hybrid', 'listrik'];
        if (!validFuelTypes.includes(dataPerubahan.bahanBakar)) {
          errors.push('Jenis bahan bakar tidak valid');
        }
      }

      if (dataPerubahan.warna !== undefined && dataPerubahan.warna.trim() === '') {
        errors.push('Warna mobil tidak boleh kosong');
      }

      if (dataPerubahan.deskripsi !== undefined) {
        if (dataPerubahan.deskripsi.trim() === '') {
          errors.push('Deskripsi mobil tidak boleh kosong');
        } else if (dataPerubahan.deskripsi.length < 20) {
          warnings.push('Deskripsi terlalu singkat, tambahkan detail lebih lengkap');
        } else if (dataPerubahan.deskripsi.length > 2000) {
          errors.push('Deskripsi maksimal 2000 karakter');
        }
      }

      if (dataPerubahan.lokasi !== undefined && dataPerubahan.lokasi.trim() === '') {
        errors.push('Lokasi mobil tidak boleh kosong');
      }

      if (dataPerubahan.kondisi !== undefined) {
        const validConditions = ['baru', 'bekas'];
        if (!validConditions.includes(dataPerubahan.kondisi)) {
          errors.push('Kondisi mobil tidak valid');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataPerubahan
      };

    } catch (error) {
      errors.push(`Error dalam validasi perubahan data mobil: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiDataUser
  public validasiDataUser(dataUser: DataUser): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate ID
      if (!dataUser.id || dataUser.id.trim() === '') {
        errors.push('ID user wajib diisi');
      }

      // Validate name
      if (!dataUser.nama || dataUser.nama.trim() === '') {
        errors.push('Nama user wajib diisi');
      } else if (dataUser.nama.length < 2) {
        errors.push('Nama minimal 2 karakter');
      } else if (dataUser.nama.length > 100) {
        errors.push('Nama maksimal 100 karakter');
      }

      // Validate email
      if (!dataUser.email || dataUser.email.trim() === '') {
        errors.push('Email user wajib diisi');
      } else if (!this.emailPattern.test(dataUser.email)) {
        errors.push('Format email tidak valid');
      }

      // Validate status
      const validStatuses = ['aktif', 'nonaktif', 'suspended'];
      if (!validStatuses.includes(dataUser.status)) {
        errors.push('Status user tidak valid');
      }

      // Validate role
      const validRoles = ['admin', 'manager', 'staff', 'customer'];
      if (!validRoles.includes(dataUser.peran)) {
        errors.push('Peran user tidak valid');
      }

      // Business logic validations
      if (dataUser.peran === 'admin' && dataUser.status === 'suspended') {
        warnings.push('Admin yang di-suspend dapat menyebabkan masalah sistem');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataUser
      };

    } catch (error) {
      errors.push(`Error dalam validasi data user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiKonten
  public validasiKonten(dataKonten: DataKonten): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate title
      if (!dataKonten.judul || dataKonten.judul.trim() === '') {
        errors.push('Judul konten wajib diisi');
      } else if (dataKonten.judul.length < 5) {
        errors.push('Judul minimal 5 karakter');
      } else if (dataKonten.judul.length > 200) {
        errors.push('Judul maksimal 200 karakter');
      }

      // Validate content
      if (!dataKonten.isi || dataKonten.isi.trim() === '') {
        errors.push('Isi konten wajib diisi');
      } else if (dataKonten.isi.length < 10) {
        errors.push('Isi konten minimal 10 karakter');
      } else if (dataKonten.isi.length > 50000) {
        errors.push('Isi konten maksimal 50000 karakter');
      }

      // Validate category
      if (!dataKonten.kategori || dataKonten.kategori.trim() === '') {
        errors.push('Kategori konten wajib dipilih');
      }

      // Validate status
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(dataKonten.status)) {
        errors.push('Status konten tidak valid');
      }

      // Validate tags if provided
      if (dataKonten.tags && dataKonten.tags.length > 10) {
        warnings.push('Terlalu banyak tags (maksimal 10)');
      }

      // Check for inappropriate content
      const inappropriateWords = ['spam', 'scam', 'fake', 'palsu', 'penipu'];
      const lowerContent = (dataKonten.judul + ' ' + dataKonten.isi).toLowerCase();
      
      for (const word of inappropriateWords) {
        if (lowerContent.includes(word)) {
          warnings.push('Konten mengandung kata yang perlu direview');
          break;
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataKonten
      };

    } catch (error) {
      errors.push(`Error dalam validasi konten: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: validasiDataParameter
  public validasiDataParameter(dataParameter: DataParameter): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate parameter name
      if (!dataParameter.nama || dataParameter.nama.trim() === '') {
        errors.push('Nama parameter wajib diisi');
      } else if (dataParameter.nama.length > 100) {
        errors.push('Nama parameter maksimal 100 karakter');
      }

      // Validate parameter type
      const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
      if (!validTypes.includes(dataParameter.tipe)) {
        errors.push('Tipe parameter tidak valid');
      }

      // Validate value based on type
      if (dataParameter.nilai !== null && dataParameter.nilai !== undefined) {
        switch (dataParameter.tipe) {
          case 'string':
            if (typeof dataParameter.nilai !== 'string') {
              errors.push('Nilai parameter harus berupa string');
            }
            break;
          case 'number':
            if (typeof dataParameter.nilai !== 'number' || isNaN(dataParameter.nilai)) {
              errors.push('Nilai parameter harus berupa angka');
            }
            break;
          case 'boolean':
            if (typeof dataParameter.nilai !== 'boolean') {
              errors.push('Nilai parameter harus berupa boolean');
            }
            break;
          case 'array':
            if (!Array.isArray(dataParameter.nilai)) {
              errors.push('Nilai parameter harus berupa array');
            }
            break;
          case 'object':
            if (typeof dataParameter.nilai !== 'object' || Array.isArray(dataParameter.nilai)) {
              errors.push('Nilai parameter harus berupa object');
            }
            break;
        }
      } else if (dataParameter.wajib) {
        errors.push('Parameter wajib tidak boleh kosong');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: dataParameter
      };

    } catch (error) {
      errors.push(`Error dalam validasi parameter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }

  // Method: periksaKelengkapanData
  public periksaKelengkapanData(data?: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const completeness: { [key: string]: boolean } = {};

    try {
      if (!data || typeof data !== 'object') {
        errors.push('Data tidak tersedia untuk diperiksa');
        return { isValid: false, errors, warnings };
      }

      // Define required fields for different data types
      const requiredFields: { [key: string]: string[] } = {
        user: ['id', 'nama', 'email', 'status', 'peran'],
        mobil: ['merk', 'model', 'tahun', 'harga', 'transmisi', 'bahanBakar', 'warna', 'deskripsi', 'lokasi', 'kondisi'],
        registrasi: ['nama', 'email', 'password', 'noTelepon', 'jenisAkun'],
        ulasan: ['rating', 'komentar', 'idProduk', 'idUser'],
        konten: ['judul', 'isi', 'kategori', 'status']
      };

      // Detect data type based on available fields
      let dataType = 'unknown';
      for (const [type, fields] of Object.entries(requiredFields)) {
        const matchCount = fields.filter(field => data.hasOwnProperty(field)).length;
        if (matchCount >= fields.length * 0.6) { // 60% match threshold
          dataType = type;
          break;
        }
      }

      if (dataType === 'unknown') {
        warnings.push('Tipe data tidak dapat diidentifikasi, melakukan pemeriksaan umum');
        
        // General completeness check
        const totalFields = Object.keys(data).length;
        const filledFields = Object.values(data).filter(value => 
          value !== null && value !== undefined && value !== ''
        ).length;
        
        const completenessPercentage = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
        
        if (completenessPercentage < 50) {
          warnings.push(`Kelengkapan data rendah (${completenessPercentage.toFixed(1)}%)`);
        }
        
        return {
          isValid: completenessPercentage >= 50,
          errors,
          warnings,
          data: { 
            dataType, 
            completenessPercentage,
            totalFields,
            filledFields
          }
        };
      }

      // Check specific required fields
      const requiredForType = requiredFields[dataType];
      let missingFields: string[] = [];
      let emptyFields: string[] = [];

      for (const field of requiredForType) {
        completeness[field] = data.hasOwnProperty(field);
        
        if (!data.hasOwnProperty(field)) {
          missingFields.push(field);
        } else if (data[field] === null || data[field] === undefined || data[field] === '') {
          emptyFields.push(field);
        }
      }

      // Report missing fields
      if (missingFields.length > 0) {
        errors.push(`Field wajib tidak ada: ${missingFields.join(', ')}`);
      }

      // Report empty fields
      if (emptyFields.length > 0) {
        warnings.push(`Field kosong: ${emptyFields.join(', ')}`);
      }

      // Calculate completeness percentage
      const totalRequired = requiredForType.length;
      const completed = totalRequired - missingFields.length - emptyFields.length;
      const completenessPercentage = (completed / totalRequired) * 100;

      // Additional checks based on data type
      if (dataType === 'mobil' && data.kondisi === 'bekas') {
        if (!data.stnk || !data.bpkb) {
          warnings.push('Mobil bekas sebaiknya memiliki dokumen lengkap (STNK & BPKB)');
        }
      }

      if (dataType === 'user' && data.peran === 'penjual') {
        const sellerFields = ['noTelepon', 'alamat'];
        const missingSellerFields = sellerFields.filter(field => 
          !data.hasOwnProperty(field) || !data[field]
        );
        if (missingSellerFields.length > 0) {
          warnings.push(`Penjual sebaiknya melengkapi: ${missingSellerFields.join(', ')}`);
        }
      }

      return {
        isValid: missingFields.length === 0,
        errors,
        warnings,
        data: {
          dataType,
          completenessPercentage,
          missingFields,
          emptyFields,
          completeness
        }
      };

    } catch (error) {
      errors.push(`Error dalam pemeriksaan kelengkapan data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }
}

// Export singleton instance
export const layananValidasi = LayananValidasi.getInstance();

// Default export for compatibility
export default LayananValidasi;