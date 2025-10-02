// ==================== ENTITAS TEST DRIVE ====================
// Kelas untuk mengelola data dan operasi test drive mobil
// Mengatur permohonan, jadwal, dan feedback test drive

// Interface untuk data test drive
export interface DataTestDrive {
  idTestDrive: string;
  idPengguna: string;
  idMobil: string;
  tanggalTestDrive: Date;
  jamTestDrive: string;
  statusTestDrive: string;
  catatanKhusus: string;
  konfirmasiAdmin: boolean;
  feedbackTestDrive: string;
  ratingExperience: number;
  durasiTestDrive: number;
  lokasiTestDrive: string;
}

// Interface untuk data permohonan test drive
export interface DataPermohonanTestDrive {
  idPengguna: string;
  idMobil: string;
  tanggalTestDrive: Date;
  jamTestDrive: string;
  catatanKhusus?: string;
  durasiTestDrive: number;
  lokasiTestDrive: string;
}

// Interface untuk response validasi
export interface ResponValidasi {
  valid: boolean;
  pesan: string;
}

// Interface untuk detail permohonan
export interface DetailPermohonan {
  dataTestDrive: DataTestDrive;
  dataPengguna: {
    nama: string;
    email: string;
    telepon: string;
  };
  dataMobil: {
    merk: string;
    model: string;
    tahun: number;
    harga: number;
  };
  statusDetail: string;
  riwayatStatus: Array<{
    status: string;
    tanggal: Date;
    keterangan: string;
  }>;
}

class EntitasTestDrive {
  // Attributes
  private idTestDrive: string;
  private idPengguna: string;
  private idMobil: string;
  private tanggalTestDrive: Date;
  private jamTestDrive: string;
  private statusTestDrive: string;
  private catatanKhusus: string;
  private konfirmasiAdmin: boolean;
  private feedbackTestDrive: string;
  private ratingExperience: number;
  private durasiTestDrive: number;
  private lokasiTestDrive: string;

  constructor(data?: Partial<DataTestDrive>) {
    this.idTestDrive = data?.idTestDrive || this.generateId();
    this.idPengguna = data?.idPengguna || '';
    this.idMobil = data?.idMobil || '';
    this.tanggalTestDrive = data?.tanggalTestDrive || new Date();
    this.jamTestDrive = data?.jamTestDrive || '';
    this.statusTestDrive = data?.statusTestDrive || 'pending';
    this.catatanKhusus = data?.catatanKhusus || '';
    this.konfirmasiAdmin = data?.konfirmasiAdmin || false;
    this.feedbackTestDrive = data?.feedbackTestDrive || '';
    this.ratingExperience = data?.ratingExperience || 0;
    this.durasiTestDrive = data?.durasiTestDrive || 30;
    this.lokasiTestDrive = data?.lokasiTestDrive || '';
  }

  // Methods

  /**
   * Menyimpan data permohonan test drive baru
   * @param dataPermohonan - Data permohonan test drive
   * @returns Promise<string> - ID test drive yang dibuat
   */
  public async simpanDataPermohonan(dataPermohonan: DataPermohonanTestDrive): Promise<string> {
    try {
      // Validasi data permohonan
      const validasi = await this.validasiDataPermohonan(dataPermohonan);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Cek ketersediaan jadwal
      const jadwalTersedia = await this.cekKetersediaanJadwal(
        dataPermohonan.tanggalTestDrive,
        dataPermohonan.jamTestDrive,
        dataPermohonan.lokasiTestDrive
      );

      if (!jadwalTersedia.valid) {
        throw new Error(jadwalTersedia.pesan);
      }

      // Generate ID baru
      const idTestDriveBaru = this.generateId();

      // Set data test drive
      this.idTestDrive = idTestDriveBaru;
      this.idPengguna = dataPermohonan.idPengguna;
      this.idMobil = dataPermohonan.idMobil;
      this.tanggalTestDrive = dataPermohonan.tanggalTestDrive;
      this.jamTestDrive = dataPermohonan.jamTestDrive;
      this.catatanKhusus = dataPermohonan.catatanKhusus || '';
      this.durasiTestDrive = dataPermohonan.durasiTestDrive;
      this.lokasiTestDrive = dataPermohonan.lokasiTestDrive;
      this.statusTestDrive = 'pending';
      this.konfirmasiAdmin = false;

      // Simulasi penyimpanan ke database
      await this.simpanKeDatabase();

      // Kirim notifikasi ke admin
      await this.kirimNotifikasiKeAdmin(idTestDriveBaru);

      // Log aktivitas
      await this.logAktivitas(idTestDriveBaru, 'permohonan_dibuat', 'Permohonan test drive baru dibuat');

      return idTestDriveBaru;

    } catch (error) {
      throw new Error(`Gagal menyimpan permohonan test drive: ${error}`);
    }
  }

  /**
   * Mengambil detail permohonan test drive
   * @param idPermohonan - ID permohonan test drive
   * @returns Promise<DetailPermohonan> - Detail lengkap permohonan
   */
  public async ambilDetailPermohonan(idPermohonan: string): Promise<DetailPermohonan> {
    try {
      // Validasi ID permohonan
      if (!idPermohonan || idPermohonan.trim() === '') {
        throw new Error('ID permohonan tidak valid');
      }

      // Simulasi pengambilan data dari database
      await this.simulasiDelay(300);

      // Ambil data test drive
      const dataTestDrive = await this.ambilDataTestDriveById(idPermohonan);
      if (!dataTestDrive) {
        throw new Error('Data test drive tidak ditemukan');
      }

      // Ambil data pengguna
      const dataPengguna = await this.ambilDataPengguna(dataTestDrive.idPengguna);

      // Ambil data mobil
      const dataMobil = await this.ambilDataMobil(dataTestDrive.idMobil);

      // Ambil riwayat status
      const riwayatStatus = await this.ambilRiwayatStatus(idPermohonan);

      // Tentukan status detail
      const statusDetail = this.tentukanStatusDetail(dataTestDrive.statusTestDrive, dataTestDrive.konfirmasiAdmin);

      return {
        dataTestDrive,
        dataPengguna,
        dataMobil,
        statusDetail,
        riwayatStatus
      };

    } catch (error) {
      throw new Error(`Gagal mengambil detail permohonan: ${error}`);
    }
  }

  /**
   * Memperbarui status permohonan test drive
   * @param idPermohonan - ID permohonan test drive
   * @param status - Status baru
   * @returns Promise<boolean> - Status keberhasilan update
   */
  public async updateStatusPermohonan(idPermohonan: string, status: string): Promise<boolean> {
    try {
      // Validasi input
      if (!idPermohonan || idPermohonan.trim() === '') {
        throw new Error('ID permohonan tidak valid');
      }

      if (!status || status.trim() === '') {
        throw new Error('Status tidak valid');
      }

      // Validasi status yang diizinkan
      const statusValid = ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'rescheduled'];
      if (!statusValid.includes(status)) {
        throw new Error('Status tidak dikenali');
      }

      // Ambil data test drive saat ini
      const dataTestDrive = await this.ambilDataTestDriveById(idPermohonan);
      if (!dataTestDrive) {
        throw new Error('Data test drive tidak ditemukan');
      }

      // Validasi transisi status
      const transisiValid = await this.validasiTransisiStatus(dataTestDrive.statusTestDrive, status);
      if (!transisiValid.valid) {
        throw new Error(transisiValid.pesan);
      }

      // Update status
      const statusLama = dataTestDrive.statusTestDrive;
      await this.updateStatusDatabase(idPermohonan, status);

      // Set konfirmasi admin jika diperlukan
      if (status === 'approved' || status === 'rejected') {
        await this.setKonfirmasiAdmin(idPermohonan, true);
      }

      // Log perubahan status
      await this.logPerubahanStatus(idPermohonan, statusLama, status);

      // Kirim notifikasi ke pengguna
      await this.kirimNotifikasiKePengguna(dataTestDrive.idPengguna, idPermohonan, status);

      // Handle aksi khusus berdasarkan status
      await this.handleAksiKhususStatus(idPermohonan, status, dataTestDrive);

      return true;

    } catch (error) {
      throw new Error(`Gagal memperbarui status permohonan: ${error}`);
    }
  }

  // Private helper methods

  private generateId(): string {
    return 'TD' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validasiDataPermohonan(data: DataPermohonanTestDrive): Promise<ResponValidasi> {
    await this.simulasiDelay(200);

    // Validasi ID pengguna
    if (!data.idPengguna || data.idPengguna.trim() === '') {
      return { valid: false, pesan: 'ID pengguna harus diisi' };
    }

    // Validasi ID mobil
    if (!data.idMobil || data.idMobil.trim() === '') {
      return { valid: false, pesan: 'ID mobil harus diisi' };
    }

    // Validasi tanggal test drive
    if (!data.tanggalTestDrive || data.tanggalTestDrive < new Date()) {
      return { valid: false, pesan: 'Tanggal test drive tidak valid atau sudah lewat' };
    }

    // Validasi jam test drive
    if (!data.jamTestDrive || data.jamTestDrive.trim() === '') {
      return { valid: false, pesan: 'Jam test drive harus diisi' };
    }

    // Validasi durasi
    if (!data.durasiTestDrive || data.durasiTestDrive < 15 || data.durasiTestDrive > 120) {
      return { valid: false, pesan: 'Durasi test drive harus antara 15-120 menit' };
    }

    // Validasi lokasi
    if (!data.lokasiTestDrive || data.lokasiTestDrive.trim() === '') {
      return { valid: false, pesan: 'Lokasi test drive harus diisi' };
    }

    return { valid: true, pesan: 'Data permohonan valid' };
  }

  private async cekKetersediaanJadwal(tanggal: Date, jam: string, lokasi: string): Promise<ResponValidasi> {
    await this.simulasiDelay(300);

    // Simulasi pengecekan jadwal yang sudah ada
    const jadwalBentrok = Math.random() < 0.1; // 10% kemungkinan bentrok

    if (jadwalBentrok) {
      return {
        valid: false,
        pesan: 'Jadwal tidak tersedia, silakan pilih waktu lain'
      };
    }

    return { valid: true, pesan: 'Jadwal tersedia' };
  }

  private async simpanKeDatabase(): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi penyimpanan ke database
  }

  private async kirimNotifikasiKeAdmin(idTestDrive: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi ke admin
  }

  private async logAktivitas(idTestDrive: string, tipeAktivitas: string, deskripsi: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi logging aktivitas
  }

  private async ambilDataTestDriveById(id: string): Promise<DataTestDrive | null> {
    await this.simulasiDelay(200);

    // Simulasi data test drive
    return {
      idTestDrive: id,
      idPengguna: 'USR001',
      idMobil: 'CAR001',
      tanggalTestDrive: new Date(),
      jamTestDrive: '10:00',
      statusTestDrive: 'pending',
      catatanKhusus: 'Ingin test drive di area Jakarta Selatan',
      konfirmasiAdmin: false,
      feedbackTestDrive: '',
      ratingExperience: 0,
      durasiTestDrive: 30,
      lokasiTestDrive: 'Showroom Jakarta Selatan'
    };
  }

  private async ambilDataPengguna(idPengguna: string): Promise<any> {
    await this.simulasiDelay(200);

    return {
      nama: 'John Doe',
      email: 'john.doe@email.com',
      telepon: '081234567890'
    };
  }

  private async ambilDataMobil(idMobil: string): Promise<any> {
    await this.simulasiDelay(200);

    return {
      merk: 'Toyota',
      model: 'Avanza',
      tahun: 2023,
      harga: 250000000
    };
  }

  private async ambilRiwayatStatus(idTestDrive: string): Promise<Array<any>> {
    await this.simulasiDelay(200);

    return [
      {
        status: 'pending',
        tanggal: new Date(),
        keterangan: 'Permohonan test drive dibuat'
      }
    ];
  }

  private tentukanStatusDetail(status: string, konfirmasiAdmin: boolean): string {
    if (status === 'pending' && !konfirmasiAdmin) {
      return 'Menunggu konfirmasi admin';
    } else if (status === 'approved' && konfirmasiAdmin) {
      return 'Disetujui, siap untuk test drive';
    } else if (status === 'rejected' && konfirmasiAdmin) {
      return 'Ditolak oleh admin';
    } else if (status === 'completed') {
      return 'Test drive selesai';
    } else if (status === 'cancelled') {
      return 'Dibatalkan';
    } else if (status === 'rescheduled') {
      return 'Dijadwal ulang';
    }
    return 'Status tidak diketahui';
  }

  private async validasiTransisiStatus(statusLama: string, statusBaru: string): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    // Definisi transisi status yang valid
    const transisiValid: { [key: string]: string[] } = {
      'pending': ['approved', 'rejected', 'cancelled'],
      'approved': ['completed', 'cancelled', 'rescheduled'],
      'rejected': ['pending'],
      'completed': [],
      'cancelled': ['pending'],
      'rescheduled': ['approved', 'cancelled']
    };

    if (!transisiValid[statusLama] || !transisiValid[statusLama].includes(statusBaru)) {
      return {
        valid: false,
        pesan: `Tidak dapat mengubah status dari ${statusLama} ke ${statusBaru}`
      };
    }

    return { valid: true, pesan: 'Transisi status valid' };
  }

  private async updateStatusDatabase(idTestDrive: string, status: string): Promise<void> {
    await this.simulasiDelay(200);
    this.statusTestDrive = status;
  }

  private async setKonfirmasiAdmin(idTestDrive: string, konfirmasi: boolean): Promise<void> {
    await this.simulasiDelay(100);
    this.konfirmasiAdmin = konfirmasi;
  }

  private async logPerubahanStatus(idTestDrive: string, statusLama: string, statusBaru: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi logging perubahan status
  }

  private async kirimNotifikasiKePengguna(idPengguna: string, idTestDrive: string, status: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi ke pengguna
  }

  private async handleAksiKhususStatus(idTestDrive: string, status: string, dataTestDrive: DataTestDrive): Promise<void> {
    await this.simulasiDelay(200);

    switch (status) {
      case 'approved':
        // Kirim detail lokasi dan instruksi
        await this.kirimInstruksiTestDrive(dataTestDrive.idPengguna, idTestDrive);
        break;
      case 'completed':
        // Kirim form feedback
        await this.kirimFormFeedback(dataTestDrive.idPengguna, idTestDrive);
        break;
      case 'cancelled':
        // Update ketersediaan jadwal
        await this.updateKetersediaanJadwal(dataTestDrive.tanggalTestDrive, dataTestDrive.jamTestDrive);
        break;
    }
  }

  private async kirimInstruksiTestDrive(idPengguna: string, idTestDrive: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman instruksi test drive
  }

  private async kirimFormFeedback(idPengguna: string, idTestDrive: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman form feedback
  }

  private async updateKetersediaanJadwal(tanggal: Date, jam: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update ketersediaan jadwal
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataTestDrive {
    return {
      idTestDrive: this.idTestDrive,
      idPengguna: this.idPengguna,
      idMobil: this.idMobil,
      tanggalTestDrive: this.tanggalTestDrive,
      jamTestDrive: this.jamTestDrive,
      statusTestDrive: this.statusTestDrive,
      catatanKhusus: this.catatanKhusus,
      konfirmasiAdmin: this.konfirmasiAdmin,
      feedbackTestDrive: this.feedbackTestDrive,
      ratingExperience: this.ratingExperience,
      durasiTestDrive: this.durasiTestDrive,
      lokasiTestDrive: this.lokasiTestDrive
    };
  }
}

export type StatusTestDrive = 'pending' | 'approved' | 'completed' | 'cancelled';

export default EntitasTestDrive;