// LayananBookmark.ts - Layanan untuk mengelola bookmark pengguna
// Mengelola penyimpanan, pengambilan, dan organisasi bookmark mobil favorit

// ==================== INTERFACES ====================

// Interface untuk data bookmark
export interface DataBookmark {
  id: string;
  userId: string;
  mobilId: string;
  judulBookmark: string;
  deskripsi?: string;
  kategori: KategoriBookmark;
  tags: string[];
  prioritas: PrioritasBookmark;
  status: StatusBookmark;
  metadata: MetadataBookmark;
  tanggalDibuat: Date;
  tanggalDiperbarui: Date;
  tanggalTerakhirDiakses: Date;
  pengaturanNotifikasi: PengaturanNotifikasi;
  dataMobil: MobilBookmark;
  catatan: CatatanBookmark[];
  berbagi: PengaturanBerbagi;
  sinkronisasi: StatusSinkronisasi;
}

// Interface untuk kategori bookmark
export interface KategoriBookmark {
  id: string;
  nama: string;
  deskripsi: string;
  warna: string;
  ikon: string;
  urutanTampil: number;
  isDefault: boolean;
  aturanKategori: AturanKategori;
  statistik: StatistikKategori;
}

// Interface untuk aturan kategori
export interface AturanKategori {
  maksimalItem: number;
  autoKategorisasi: boolean;
  kriteriaAuto: KriteriaAutoKategorisasi[];
  notifikasiPenuh: boolean;
  aksesPublik: boolean;
}

// Interface untuk kriteria auto kategorisasi
export interface KriteriaAutoKategorisasi {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
  bobot: number;
}

// Interface untuk statistik kategori
export interface StatistikKategori {
  totalBookmark: number;
  bookmarkAktif: number;
  bookmarkArsip: number;
  rataRataAkses: number;
  popularitasScore: number;
}

// Interface untuk prioritas bookmark
export interface PrioritasBookmark {
  level: 'rendah' | 'sedang' | 'tinggi' | 'kritis';
  score: number;
  faktorPrioritas: FaktorPrioritas[];
  autoUpdate: boolean;
  reminderAktif: boolean;
}

// Interface untuk faktor prioritas
export interface FaktorPrioritas {
  nama: string;
  bobot: number;
  nilai: number;
  deskripsi: string;
}

// Interface untuk status bookmark
export interface StatusBookmark {
  aktif: boolean;
  diarsipkan: boolean;
  dihapus: boolean;
  disinkronkan: boolean;
  perluReview: boolean;
  statusCustom: StatusCustom[];
}

// Interface untuk status custom
export interface StatusCustom {
  key: string;
  value: string;
  tipe: 'boolean' | 'string' | 'number' | 'date';
  deskripsi: string;
}

// Interface untuk metadata bookmark
export interface MetadataBookmark {
  sumber: string;
  deviceDibuat: string;
  lokasiDibuat?: string;
  versi: number;
  checksum: string;
  ukuranData: number;
  formatData: string;
  kompresi: boolean;
  enkripsi: boolean;
  backup: InfoBackup;
}

// Interface untuk info backup
export interface InfoBackup {
  terakhirBackup: Date;
  lokasiBackup: string;
  ukuranBackup: number;
  statusBackup: 'success' | 'failed' | 'in_progress';
  autoBackup: boolean;
}

// Interface untuk pengaturan notifikasi
export interface PengaturanNotifikasi {
  aktif: boolean;
  jenisNotifikasi: JenisNotifikasi[];
  frekuensi: FrekuensiNotifikasi;
  waktuNotifikasi: WaktuNotifikasi[];
  channelNotifikasi: ChannelNotifikasi[];
  templateNotifikasi: TemplateNotifikasi;
}

// Interface untuk jenis notifikasi
export interface JenisNotifikasi {
  tipe: 'price_drop' | 'availability' | 'promotion' | 'reminder' | 'update';
  aktif: boolean;
  threshold?: number;
  kondisi?: string;
}

// Interface untuk frekuensi notifikasi
export interface FrekuensiNotifikasi {
  tipe: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;
  hariKhusus?: string[];
  jamKhusus?: string[];
}

// Interface untuk waktu notifikasi
export interface WaktuNotifikasi {
  jam: string;
  hari: string[];
  timezone: string;
  aktif: boolean;
}

// Interface untuk channel notifikasi
export interface ChannelNotifikasi {
  tipe: 'email' | 'sms' | 'push' | 'in_app';
  alamat: string;
  aktif: boolean;
  prioritas: number;
}

// Interface untuk template notifikasi
export interface TemplateNotifikasi {
  id: string;
  nama: string;
  subjek: string;
  konten: string;
  variabel: VariabelTemplate[];
}

// Interface untuk variabel template
export interface VariabelTemplate {
  nama: string;
  tipe: string;
  defaultValue: string;
  required: boolean;
}

// Interface untuk mobil bookmark
export interface MobilBookmark {
  id: string;
  nama: string;
  merek: string;
  model: string;
  tahun: number;
  harga: HargaMobil;
  spesifikasi: SpesifikasiRingkas;
  gambar: GambarMobil[];
  dealer: InfoDealer;
  ketersediaan: KetersediaanMobil;
  riwayatHarga: RiwayatHarga[];
  perbandingan: DataPerbandingan;
}

// Interface untuk harga mobil
export interface HargaMobil {
  hargaJual: number;
  hargaOTR: number;
  diskon: number;
  promo: InfoPromo[];
  cicilan: InfoCicilan;
  riwayatPerubahan: PerubahanHarga[];
}

// Interface untuk info promo
export interface InfoPromo {
  id: string;
  nama: string;
  deskripsi: string;
  nilaiDiskon: number;
  tipeDiskon: 'percentage' | 'fixed';
  tanggalMulai: Date;
  tanggalBerakhir: Date;
  syaratKetentuan: string[];
}

// Interface untuk info cicilan
export interface InfoCicilan {
  dp: number;
  tenor: number[];
  bungaEfektif: number;
  cicilanBulanan: number;
  totalBayar: number;
  asuransi: InfoAsuransi;
}

// Interface untuk info asuransi
export interface InfoAsuransi {
  wajib: boolean;
  jenis: string[];
  biaya: number;
  coverage: string[];
}

// Interface untuk perubahan harga
export interface PerubahanHarga {
  tanggal: Date;
  hargaLama: number;
  hargaBaru: number;
  persentasePerubahan: number;
  alasan: string;
}

// Interface untuk spesifikasi ringkas
export interface SpesifikasiRingkas {
  mesin: string;
  transmisi: string;
  bahanBakar: string;
  kapasitasMesin: string;
  tenagaMaksimal: string;
  torsiMaksimal: string;
  konsumsiGSM: string;
  fiturUtama: string[];
}

// Interface untuk gambar mobil
export interface GambarMobil {
  id: string;
  url: string;
  tipe: 'exterior' | 'interior' | 'engine' | 'feature';
  deskripsi: string;
  isPrimary: boolean;
  resolusi: string;
  ukuranFile: number;
}

// Interface untuk info dealer
export interface InfoDealer {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  rating: number;
  jamOperasional: JamOperasional[];
  layananTersedia: string[];
}

// Interface untuk jam operasional
export interface JamOperasional {
  hari: string;
  jamBuka: string;
  jamTutup: string;
  istirahat?: PeriodeIstirahat;
}

// Interface untuk periode istirahat
export interface PeriodeIstirahat {
  mulai: string;
  selesai: string;
}

// Interface untuk ketersediaan mobil
export interface KetersediaanMobil {
  stok: number;
  statusKetersediaan: 'tersedia' | 'terbatas' | 'habis' | 'pre_order';
  estimasiKetersediaan: Date;
  lokasiStok: LokasiStok[];
  reservasi: InfoReservasi;
}

// Interface untuk lokasi stok
export interface LokasiStok {
  dealerId: string;
  namaDealer: string;
  jumlahStok: number;
  statusStok: string;
}

// Interface untuk info reservasi
export interface InfoReservasi {
  bisaDireservasi: boolean;
  biayaReservasi: number;
  masaBerlaku: number;
  syaratReservasi: string[];
}

// Interface untuk riwayat harga
export interface RiwayatHarga {
  tanggal: Date;
  harga: number;
  tipeHarga: 'regular' | 'promo' | 'clearance';
  sumber: string;
  validitas: boolean;
}

// Interface untuk data perbandingan
export interface DataPerbandingan {
  mobilSejenis: MobilSejenis[];
  keunggulan: string[];
  kekurangan: string[];
  scorePerbandingan: number;
  rekomendasiAlternatif: string[];
}

// Interface untuk mobil sejenis
export interface MobilSejenis {
  id: string;
  nama: string;
  harga: number;
  similarityScore: number;
  perbedaanUtama: string[];
}

// Interface untuk catatan bookmark
export interface CatatanBookmark {
  id: string;
  judul: string;
  konten: string;
  tipe: 'text' | 'voice' | 'image' | 'link';
  tags: string[];
  prioritas: 'rendah' | 'sedang' | 'tinggi';
  tanggalDibuat: Date;
  tanggalDiperbarui: Date;
  attachment: AttachmentCatatan[];
  reminder: ReminderCatatan;
}

// Interface untuk attachment catatan
export interface AttachmentCatatan {
  id: string;
  nama: string;
  tipe: string;
  ukuran: number;
  url: string;
  thumbnail?: string;
}

// Interface untuk reminder catatan
export interface ReminderCatatan {
  aktif: boolean;
  tanggalReminder: Date;
  tipeReminder: 'once' | 'daily' | 'weekly' | 'monthly';
  pesan: string;
  sudahDiingatkan: boolean;
}

// Interface untuk pengaturan berbagi
export interface PengaturanBerbagi {
  bisaDibagikan: boolean;
  levelAkses: 'public' | 'private' | 'shared';
  daftarPengguna: PenggunaBerbagi[];
  linkBerbagi: LinkBerbagi;
  pembatasan: PembatasanBerbagi;
}

// Interface untuk pengguna berbagi
export interface PenggunaBerbagi {
  userId: string;
  namaUser: string;
  email: string;
  levelAkses: 'view' | 'comment' | 'edit';
  tanggalDibagikan: Date;
  statusAktif: boolean;
}

// Interface untuk link berbagi
export interface LinkBerbagi {
  url: string;
  token: string;
  tanggalKadaluarsa: Date;
  jumlahAkses: number;
  maksimalAkses: number;
  requirePassword: boolean;
}

// Interface untuk pembatasan berbagi
export interface PembatasanBerbagi {
  batasan: string[];
  wilayahTerbatas: string[];
  waktuAkses: WaktuAkses;
  deviceTerbatas: string[];
}

// Interface untuk waktu akses
export interface WaktuAkses {
  jamMulai: string;
  jamSelesai: string;
  hariAktif: string[];
  timezone: string;
}

// Interface untuk status sinkronisasi
export interface StatusSinkronisasi {
  terakhirSinkron: Date;
  statusSinkron: 'synced' | 'pending' | 'failed' | 'conflict';
  deviceSinkron: DeviceSinkron[];
  konflikData: KonflikData[];
  autoSinkron: boolean;
}

// Interface untuk device sinkron
export interface DeviceSinkron {
  deviceId: string;
  namaDevice: string;
  tipeDevice: string;
  terakhirSinkron: Date;
  statusSinkron: string;
  versiData: number;
}

// Interface untuk konflik data
export interface KonflikData {
  field: string;
  nilaiLokal: any;
  nilaiRemote: any;
  tanggalKonflik: Date;
  statusResolusi: 'pending' | 'resolved' | 'ignored';
}

// Interface untuk kriteria pencarian bookmark
export interface KriteriaPencarianBookmark {
  query?: string;
  kategori?: string[];
  tags?: string[];
  prioritas?: string[];
  status?: string[];
  rentangTanggal?: RentangTanggal;
  rentangHarga?: RentangHarga;
  merek?: string[];
  model?: string[];
  tahun?: RentangTahun;
  dealer?: string[];
  lokasi?: string;
  radiusLokasi?: number;
  urutkan?: UrrutanPencarian;
  halaman?: number;
  batasPerHalaman?: number;
  filterLanjutan?: FilterLanjutan[];
}

// Interface untuk rentang tanggal
export interface RentangTanggal {
  mulai: Date;
  selesai: Date;
  tipeRentang: 'created' | 'updated' | 'accessed';
}

// Interface untuk rentang harga
export interface RentangHarga {
  minimum: number;
  maksimum: number;
  tipeHarga: 'jual' | 'otr' | 'cicilan';
}

// Interface untuk rentang tahun
export interface RentangTahun {
  minimum: number;
  maksimum: number;
}

// Interface untuk urutan pencarian
export interface UrrutanPencarian {
  field: string;
  arah: 'asc' | 'desc';
  prioritas: number;
}

// Interface untuk filter lanjutan
export interface FilterLanjutan {
  field: string;
  operator: string;
  value: any;
  logicOperator?: 'AND' | 'OR';
}

// Interface untuk hasil pencarian bookmark
export interface HasilPencarianBookmark {
  bookmarks: DataBookmark[];
  totalHasil: number;
  halamanSaatIni: number;
  totalHalaman: number;
  waktuPencarian: number;
  filterTerapan: FilterTerapan;
  saran: SaranPencarian[];
  statistik: StatistikPencarianBookmark;
  pengelompokan: PengelompokanHasil[];
}

// Interface untuk filter terapan
export interface FilterTerapan {
  kriteria: KriteriaPencarianBookmark;
  jumlahFilter: number;
  filterAktif: FilterAktif[];
}

// Interface untuk filter aktif
export interface FilterAktif {
  nama: string;
  nilai: string;
  jumlahHasil: number;
}

// Interface untuk saran pencarian
export interface SaranPencarian {
  teks: string;
  tipe: 'koreksi' | 'alternatif' | 'pelengkap';
  relevansi: number;
}

// Interface untuk statistik pencarian bookmark
export interface StatistikPencarianBookmark {
  distribusiKategori: DistribusiKategori[];
  distribusiMerek: DistribusiMerek[];
  distribusiHarga: DistribusiHarga[];
  distribusiTahun: DistribusiTahun[];
  trendPencarian: TrendPencarian[];
}

// Interface untuk distribusi kategori
export interface DistribusiKategori {
  kategori: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk distribusi merek
export interface DistribusiMerek {
  merek: string;
  jumlah: number;
  persentase: number;
  rataRataHarga: number;
}

// Interface untuk distribusi harga
export interface DistribusiHarga {
  rentang: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk distribusi tahun
export interface DistribusiTahun {
  tahun: number;
  jumlah: number;
  persentase: number;
}

// Interface untuk trend pencarian
export interface TrendPencarian {
  periode: string;
  jumlahPencarian: number;
  keywordPopuler: string[];
}

// Interface untuk pengelompokan hasil
export interface PengelompokanHasil {
  kriteria: string;
  grup: GrupHasil[];
}

// Interface untuk grup hasil
export interface GrupHasil {
  nama: string;
  jumlah: number;
  items: DataBookmark[];
}

// Interface untuk statistik bookmark
export interface StatistikBookmark {
  ringkasan: RingkasanBookmark;
  distribusi: DistribusiBookmark;
  aktivitas: AktivitasBookmark;
  performa: PerformaBookmark;
  trend: TrendBookmark;
  analisis: AnalisisBookmark;
  prediksi: PrediksiBookmark;
  rekomendasi: RekomendasiBookmark;
  periode: PeriodeStatistik;
}

// Interface untuk ringkasan bookmark
export interface RingkasanBookmark {
  totalBookmark: number;
  bookmarkAktif: number;
  bookmarkArsip: number;
  bookmarkTerhapus: number;
  kategoriTerbanyak: string;
  merekTerpopuler: string;
  rataRataHarga: number;
  totalNilaiBookmark: number;
}

// Interface untuk distribusi bookmark
export interface DistribusiBookmark {
  perKategori: DistribusiKategori[];
  perMerek: DistribusiMerek[];
  perHarga: DistribusiHarga[];
  perTahun: DistribusiTahun[];
  perDealer: DistribusiDealer[];
  perLokasi: DistribusiLokasi[];
}

// Interface untuk distribusi dealer
export interface DistribusiDealer {
  dealer: string;
  jumlah: number;
  persentase: number;
  rataRataRating: number;
}

// Interface untuk distribusi lokasi
export interface DistribusiLokasi {
  lokasi: string;
  jumlah: number;
  persentase: number;
  radiusRataRata: number;
}

// Interface untuk aktivitas bookmark
export interface AktivitasBookmark {
  bookmarkBaru: AktivitasHarian[];
  aksesHarian: AktivitasHarian[];
  modifikasiHarian: AktivitasHarian[];
  penghapusanHarian: AktivitasHarian[];
  jamSibuk: JamSibuk[];
  hariAktif: HariAktif[];
}

// Interface untuk aktivitas harian
export interface AktivitasHarian {
  tanggal: Date;
  jumlah: number;
  persentasePerubahan: number;
}

// Interface untuk jam sibuk
export interface JamSibuk {
  jam: number;
  jumlahAktivitas: number;
  tipeAktivitas: string[];
}

// Interface untuk hari aktif
export interface HariAktif {
  hari: string;
  jumlahAktivitas: number;
  jenisAktivitas: JenisAktivitas[];
}

// Interface untuk jenis aktivitas
export interface JenisAktivitas {
  jenis: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk performa bookmark
export interface PerformaBookmark {
  waktuRataRataAkses: number;
  frekuensiAkses: FrekuensiAkses[];
  tingkatRetensi: number;
  tingkatKonversi: number;
  efektivitasKategori: EfektivitasKategori[];
  kepuasanPengguna: KepuasanPengguna;
}

// Interface untuk frekuensi akses
export interface FrekuensiAkses {
  bookmarkId: string;
  jumlahAkses: number;
  terakhirDiakses: Date;
  rataRataInterval: number;
}

// Interface untuk efektivitas kategori
export interface EfektivitasKategori {
  kategori: string;
  tingkatAkses: number;
  tingkatKonversi: number;
  scoreEfektivitas: number;
}

// Interface untuk kepuasan pengguna
export interface KepuasanPengguna {
  ratingRataRata: number;
  jumlahFeedback: number;
  distribusiRating: DistribusiRating[];
  komentarPositif: number;
  komentarNegatif: number;
}

// Interface untuk distribusi rating
export interface DistribusiRating {
  rating: number;
  jumlah: number;
  persentase: number;
}

// Interface untuk trend bookmark
export interface TrendBookmark {
  trendBulanan: TrendBulanan[];
  trendKategori: TrendKategori[];
  trendMerek: TrendMerek[];
  trendHarga: TrendHarga[];
  prediksiTrend: PrediksiTrend[];
}

// Interface untuk trend bulanan
export interface TrendBulanan {
  bulan: string;
  tahun: number;
  jumlahBookmark: number;
  pertumbuhanPersentase: number;
  kategoriPopuler: string[];
}

// Interface untuk trend kategori
export interface TrendKategori {
  kategori: string;
  trendData: DataTrend[];
  statusTrend: 'naik' | 'turun' | 'stabil';
  prediksiPertumbuhan: number;
}

// Interface untuk data trend
export interface DataTrend {
  periode: string;
  nilai: number;
  perubahan: number;
}

// Interface untuk trend merek
export interface TrendMerek {
  merek: string;
  popularitas: number;
  perubahanPopularitas: number;
  proyeksiPopularitas: number;
  faktorTrend: string[];
}

// Interface untuk trend harga
export interface TrendHarga {
  rentangHarga: string;
  trendPermintaan: 'naik' | 'turun' | 'stabil';
  persentasePerubahan: number;
  faktorPenyebab: string[];
}

// Interface untuk prediksi trend
export interface PrediksiTrend {
  aspek: string;
  prediksi: string;
  tingkatKepercayaan: number;
  faktorPendukung: string[];
  timeframe: string;
}

// Interface untuk analisis bookmark
export interface AnalisisBookmark {
  polaPerilaku: PolaPerilaku[];
  segmentasiPengguna: SegmentasiPengguna[];
  analisisKorelasi: AnalisisKorelasi[];
  insightBisnis: InsightBisnis[];
  rekomendasiOptimasi: RekomendasiOptimasi[];
}

// Interface untuk pola perilaku
export interface PolaPerilaku {
  pola: string;
  deskripsi: string;
  frekuensi: number;
  dampak: string;
  rekomendasi: string;
}

// Interface untuk segmentasi pengguna
export interface SegmentasiPengguna {
  segmen: string;
  karakteristik: string[];
  ukuranSegmen: number;
  nilaiSegmen: number;
  strategiTargeting: string[];
}

// Interface untuk analisis korelasi
export interface AnalisisKorelasi {
  variabel1: string;
  variabel2: string;
  korelasiScore: number;
  signifikansi: string;
  interpretasi: string;
}

// Interface untuk insight bisnis
export interface InsightBisnis {
  kategori: string;
  insight: string;
  dampakBisnis: string;
  actionItem: string[];
  prioritas: 'rendah' | 'sedang' | 'tinggi';
}

// Interface untuk rekomendasi optimasi
export interface RekomendasiOptimasi {
  area: string;
  rekomendasi: string;
  dampakEstimasi: string;
  tingkatKesulitan: 'mudah' | 'sedang' | 'sulit';
  estimasiWaktu: string;
}

// Interface untuk prediksi bookmark
export interface PrediksiBookmark {
  prediksiPertumbuhan: PrediksiPertumbuhan;
  prediksiKategori: PrediksiKategori[];
  prediksiPerilaku: PrediksiPerilaku[];
  risikoChurn: RisikoChurn;
  peluangUpsell: PeluangUpsell[];
}

// Interface untuk prediksi pertumbuhan
export interface PrediksiPertumbuhan {
  periode: string;
  pertumbuhanEstimasi: number;
  tingkatKepercayaan: number;
  faktorPendorong: string[];
  skenario: SkenarioPrediksi[];
}

// Interface untuk skenario prediksi
export interface SkenarioPrediksi {
  nama: string;
  probabilitas: number;
  dampak: string;
  mitigasi: string[];
}

// Interface untuk prediksi kategori
export interface PrediksiKategori {
  kategori: string;
  trendPrediksi: 'naik' | 'turun' | 'stabil';
  pertumbuhanEstimasi: number;
  faktorPendorong: string[];
}

// Interface untuk prediksi perilaku
export interface PrediksiPerilaku {
  perilaku: string;
  probabilitas: number;
  dampak: string;
  rekomendasiAksi: string[];
}

// Interface untuk risiko churn
export interface RisikoChurn {
  tingkatRisiko: 'rendah' | 'sedang' | 'tinggi';
  faktorRisiko: FaktorRisiko[];
  prediksiChurn: number;
  strategiRetensi: string[];
}

// Interface untuk faktor risiko
export interface FaktorRisiko {
  faktor: string;
  bobot: number;
  dampak: string;
  mitigasi: string;
}

// Interface untuk peluang upsell
export interface PeluangUpsell {
  kategori: string;
  peluang: string;
  potensiNilai: number;
  probabilitasKeberhasilan: number;
  strategiPendekatan: string[];
}

// Interface untuk rekomendasi bookmark
export interface RekomendasiBookmark {
  rekomendasiMobil: RekomendasiMobil[];
  rekomendasiKategori: RekomendasiKategori[];
  rekomendasiAksi: RekomendasiAksi[];
  rekomendasiOptimasi: RekomendasiOptimasi[];
}

// Interface untuk rekomendasi mobil
export interface RekomendasiMobil {
  mobilId: string;
  namaMobil: string;
  scoreRekomendasi: number;
  alasanRekomendasi: string[];
  kategoriCocok: string[];
  estimasiMinat: number;
}

// Interface untuk rekomendasi kategori
export interface RekomendasiKategori {
  kategori: string;
  alasanRekomendasi: string;
  potensiManfaat: string[];
  langkahImplementasi: string[];
}

// Interface untuk rekomendasi aksi
export interface RekomendasiAksi {
  aksi: string;
  prioritas: 'rendah' | 'sedang' | 'tinggi';
  dampakEstimasi: string;
  resourceDibutuhkan: string[];
  timeline: string;
}

// Interface untuk periode statistik
export interface PeriodeStatistik {
  mulai: Date;
  selesai: Date;
  tipeperiode: 'harian' | 'mingguan' | 'bulanan' | 'tahunan' | 'custom';
  deskripsi: string;
}

// Interface untuk respons layanan
export interface ResponLayanan<T = any> {
  sukses: boolean;
  data?: T;
  pesan: string;
  kodeStatus: number;
  waktuProses: number;
  metadata?: {
    total?: number;
    halaman?: number;
    batasPerHalaman?: number;
    versi?: string;
    timestamp?: Date;
  };
  error?: {
    kode: string;
    detail: string;
    stack?: string;
  };
}

// ==================== LAYANAN BOOKMARK ====================

export class LayananBookmark {
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 menit

  // ==================== METODE UTAMA ====================

  /**
   * Mengambil semua bookmark pengguna
   */
  async ambilSemuaBookmark(
    userId: string,
    kriteria?: KriteriaPencarianBookmark
  ): Promise<ResponLayanan<HasilPencarianBookmark>> {
    try {
      await this.simulasiDelay();

      const cacheKey = `bookmarks_${userId}_${JSON.stringify(kriteria)}`;
      const cachedData = this.ambilDariCache<HasilPencarianBookmark>(cacheKey);
      
      if (cachedData) {
        return {
          sukses: true,
          data: cachedData,
          pesan: 'Data bookmark berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      const bookmarks = await this.generateDataBookmark(userId, kriteria);
      const hasil = await this.prosesHasilPencarian(bookmarks, kriteria);

      this.simpanKeCache(cacheKey, hasil);

      return {
        sukses: true,
        data: hasil,
        pesan: 'Data bookmark berhasil diambil',
        kodeStatus: 200,
        waktuProses: 150,
        metadata: {
          total: hasil.totalHasil,
          halaman: hasil.halamanSaatIni,
          batasPerHalaman: kriteria?.batasPerHalaman || 20,
          versi: '1.0',
          timestamp: new Date()
        }
      };
    } catch (error) {
      return this.handleError('Gagal mengambil data bookmark', error);
    }
  }

  /**
   * Menyimpan bookmark baru
   */
  async simpanBookmark(
    userId: string,
    dataBookmark: Partial<DataBookmark>
  ): Promise<ResponLayanan<DataBookmark>> {
    try {
      await this.simulasiDelay();

      const validasi = await this.validasiDataBookmark(dataBookmark);
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: `Validasi gagal: ${validasi.errors.join(', ')}`,
          kodeStatus: 400,
          waktuProses: 100
        };
      }

      const bookmarkBaru: DataBookmark = {
        id: this.generateId(),
        userId,
        mobilId: dataBookmark.mobilId!,
        judulBookmark: dataBookmark.judulBookmark!,
        deskripsi: dataBookmark.deskripsi || '',
        kategori: dataBookmark.kategori || await this.getDefaultKategori(),
        tags: dataBookmark.tags || [],
        prioritas: dataBookmark.prioritas || await this.getDefaultPrioritas(),
        status: await this.getDefaultStatus(),
        metadata: await this.generateMetadata(),
        tanggalDibuat: new Date(),
        tanggalDiperbarui: new Date(),
        tanggalTerakhirDiakses: new Date(),
        pengaturanNotifikasi: dataBookmark.pengaturanNotifikasi || await this.getDefaultNotifikasi(),
        dataMobil: await this.ambilDataMobil(dataBookmark.mobilId!),
        catatan: [],
        berbagi: await this.getDefaultBerbagi(),
        sinkronisasi: await this.getDefaultSinkronisasi()
      };

      // Simulasi penyimpanan ke database
      await this.simulasiPenyimpanan(bookmarkBaru);

      // Hapus cache terkait
      this.hapusCachePattern(`bookmarks_${userId}`);

      return {
        sukses: true,
        data: bookmarkBaru,
        pesan: 'Bookmark berhasil disimpan',
        kodeStatus: 201,
        waktuProses: 200
      };
    } catch (error) {
      return this.handleError('Gagal menyimpan bookmark', error);
    }
  }

  /**
   * Mengambil detail bookmark
   */
  async ambilDetailBookmark(
    bookmarkId: string,
    userId: string
  ): Promise<ResponLayanan<DataBookmark>> {
    try {
      await this.simulasiDelay();

      const cacheKey = `bookmark_detail_${bookmarkId}`;
      const cachedData = this.ambilDariCache<DataBookmark>(cacheKey);
      
      if (cachedData) {
        // Update waktu terakhir diakses
        cachedData.tanggalTerakhirDiakses = new Date();
        return {
          sukses: true,
          data: cachedData,
          pesan: 'Detail bookmark berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      const bookmark = await this.generateDetailBookmark(bookmarkId, userId);
      
      if (!bookmark) {
        return {
          sukses: false,
          pesan: 'Bookmark tidak ditemukan',
          kodeStatus: 404,
          waktuProses: 100
        };
      }

      // Update waktu terakhir diakses
      bookmark.tanggalTerakhirDiakses = new Date();
      
      this.simpanKeCache(cacheKey, bookmark);

      return {
        sukses: true,
        data: bookmark,
        pesan: 'Detail bookmark berhasil diambil',
        kodeStatus: 200,
        waktuProses: 120
      };
    } catch (error) {
      return this.handleError('Gagal mengambil detail bookmark', error);
    }
  }

  /**
   * Memperbarui bookmark
   */
  async perbaruiBookmark(
    bookmarkId: string,
    userId: string,
    dataUpdate: Partial<DataBookmark>
  ): Promise<ResponLayanan<DataBookmark>> {
    try {
      await this.simulasiDelay();

      const bookmarkExisting = await this.ambilDetailBookmark(bookmarkId, userId);
      if (!bookmarkExisting.sukses || !bookmarkExisting.data) {
        return {
          sukses: false,
          pesan: 'Bookmark tidak ditemukan',
          kodeStatus: 404,
          waktuProses: 100
        };
      }

      const validasi = await this.validasiDataBookmark(dataUpdate);
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: `Validasi gagal: ${validasi.errors.join(', ')}`,
          kodeStatus: 400,
          waktuProses: 100
        };
      }

      const bookmarkUpdate: DataBookmark = {
        ...bookmarkExisting.data,
        ...dataUpdate,
        id: bookmarkId,
        userId,
        tanggalDiperbarui: new Date(),
        metadata: {
          ...bookmarkExisting.data.metadata,
          versi: bookmarkExisting.data.metadata.versi + 1
        }
      };

      // Simulasi update ke database
      await this.simulasiPenyimpanan(bookmarkUpdate);

      // Hapus cache terkait
      this.hapusCachePattern(`bookmark_detail_${bookmarkId}`);
      this.hapusCachePattern(`bookmarks_${userId}`);

      return {
        sukses: true,
        data: bookmarkUpdate,
        pesan: 'Bookmark berhasil diperbarui',
        kodeStatus: 200,
        waktuProses: 180
      };
    } catch (error) {
      return this.handleError('Gagal memperbarui bookmark', error);
    }
  }

  /**
   * Menghapus bookmark
   */
  async hapusBookmark(
    bookmarkId: string,
    userId: string
  ): Promise<ResponLayanan<boolean>> {
    try {
      await this.simulasiDelay();

      const bookmark = await this.ambilDetailBookmark(bookmarkId, userId);
      if (!bookmark.sukses || !bookmark.data) {
        return {
          sukses: false,
          pesan: 'Bookmark tidak ditemukan',
          kodeStatus: 404,
          waktuProses: 100
        };
      }

      // Simulasi soft delete
      const bookmarkUpdate = {
        ...bookmark.data,
        status: {
          ...bookmark.data.status,
          dihapus: true
        },
        tanggalDiperbarui: new Date()
      };

      await this.simulasiPenyimpanan(bookmarkUpdate);

      // Hapus cache terkait
      this.hapusCachePattern(`bookmark_detail_${bookmarkId}`);
      this.hapusCachePattern(`bookmarks_${userId}`);

      return {
        sukses: true,
        data: true,
        pesan: 'Bookmark berhasil dihapus',
        kodeStatus: 200,
        waktuProses: 150
      };
    } catch (error) {
      return this.handleError('Gagal menghapus bookmark', error);
    }
  }

  /**
   * Mencari bookmark
   */
  async cariBookmark(
    userId: string,
    kriteria: KriteriaPencarianBookmark
  ): Promise<ResponLayanan<HasilPencarianBookmark>> {
    try {
      await this.simulasiDelay();

      const cacheKey = `search_bookmarks_${userId}_${JSON.stringify(kriteria)}`;
      const cachedData = this.ambilDariCache<HasilPencarianBookmark>(cacheKey);
      
      if (cachedData) {
        return {
          sukses: true,
          data: cachedData,
          pesan: 'Hasil pencarian bookmark berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      const bookmarks = await this.generateDataBookmark(userId, kriteria);
      const hasil = await this.prosesHasilPencarian(bookmarks, kriteria);

      this.simpanKeCache(cacheKey, hasil);

      return {
        sukses: true,
        data: hasil,
        pesan: 'Pencarian bookmark berhasil',
        kodeStatus: 200,
        waktuProses: 200,
        metadata: {
          total: hasil.totalHasil,
          halaman: hasil.halamanSaatIni,
          batasPerHalaman: kriteria.batasPerHalaman || 20
        }
      };
    } catch (error) {
      return this.handleError('Gagal mencari bookmark', error);
    }
  }

  /**
   * Mengambil statistik bookmark
   */
  async ambilStatistikBookmark(
    userId: string,
    periode?: PeriodeStatistik
  ): Promise<ResponLayanan<StatistikBookmark>> {
    try {
      await this.simulasiDelay();

      const cacheKey = `stats_bookmarks_${userId}_${JSON.stringify(periode)}`;
      const cachedData = this.ambilDariCache<StatistikBookmark>(cacheKey);
      
      if (cachedData) {
        return {
          sukses: true,
          data: cachedData,
          pesan: 'Statistik bookmark berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      const statistik = await this.generateStatistikBookmark(userId, periode);
      this.simpanKeCache(cacheKey, statistik);

      return {
        sukses: true,
        data: statistik,
        pesan: 'Statistik bookmark berhasil diambil',
        kodeStatus: 200,
        waktuProses: 300
      };
    } catch (error) {
      return this.handleError('Gagal mengambil statistik bookmark', error);
    }
  }

  /**
   * Mengelola kategori bookmark
   */
  async kelolaKategori(
    userId: string,
    aksi: 'create' | 'update' | 'delete',
    dataKategori: Partial<KategoriBookmark>
  ): Promise<ResponLayanan<KategoriBookmark[]>> {
    try {
      await this.simulasiDelay();

      const kategoriExisting = await this.ambilKategoriPengguna(userId);
      let kategoriUpdate: KategoriBookmark[] = [...kategoriExisting];

      switch (aksi) {
        case 'create':
          const kategoriBaru: KategoriBookmark = {
            id: this.generateId(),
            nama: dataKategori.nama!,
            deskripsi: dataKategori.deskripsi || '',
            warna: dataKategori.warna || '#007bff',
            ikon: dataKategori.ikon || 'bookmark',
            urutanTampil: kategoriUpdate.length + 1,
            isDefault: false,
            aturanKategori: dataKategori.aturanKategori || await this.getDefaultAturanKategori(),
            statistik: await this.getDefaultStatistikKategori()
          };
          kategoriUpdate.push(kategoriBaru);
          break;

        case 'update':
          const indexUpdate = kategoriUpdate.findIndex(k => k.id === dataKategori.id);
          if (indexUpdate !== -1) {
            kategoriUpdate[indexUpdate] = {
              ...kategoriUpdate[indexUpdate],
              ...dataKategori
            };
          }
          break;

        case 'delete':
          kategoriUpdate = kategoriUpdate.filter(k => k.id !== dataKategori.id);
          break;
      }

      // Simulasi penyimpanan
      await this.simulasiPenyimpanan(kategoriUpdate);

      // Hapus cache terkait
      this.hapusCachePattern(`categories_${userId}`);
      this.hapusCachePattern(`bookmarks_${userId}`);

      return {
        sukses: true,
        data: kategoriUpdate,
        pesan: `Kategori berhasil ${aksi === 'create' ? 'dibuat' : aksi === 'update' ? 'diperbarui' : 'dihapus'}`,
        kodeStatus: 200,
        waktuProses: 150
      };
    } catch (error) {
      return this.handleError('Gagal mengelola kategori', error);
    }
  }

  // ==================== METODE PRIVAT ====================

  private async generateDataBookmark(
    userId: string,
    kriteria?: KriteriaPencarianBookmark
  ): Promise<DataBookmark[]> {
    const jumlahData = Math.floor(Math.random() * 50) + 10;
    const bookmarks: DataBookmark[] = [];

    for (let i = 0; i < jumlahData; i++) {
      const bookmark: DataBookmark = {
        id: this.generateId(),
        userId,
        mobilId: this.generateId(),
        judulBookmark: `Bookmark Mobil ${i + 1}`,
        deskripsi: `Deskripsi untuk bookmark mobil ${i + 1}`,
        kategori: await this.generateKategoriSample(),
        tags: this.generateTags(),
        prioritas: await this.generatePrioritasSample(),
        status: await this.generateStatusSample(),
        metadata: await this.generateMetadata(),
        tanggalDibuat: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        tanggalDiperbarui: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        tanggalTerakhirDiakses: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        pengaturanNotifikasi: await this.generateNotifikasiSample(),
        dataMobil: await this.generateMobilSample(),
        catatan: await this.generateCatatanSample(),
        berbagi: await this.generateBerbagiSample(),
        sinkronisasi: await this.generateSinkronisasiSample()
      };

      bookmarks.push(bookmark);
    }

    return this.filterBookmarks(bookmarks, kriteria);
  }

  private async generateDetailBookmark(
    bookmarkId: string,
    userId: string
  ): Promise<DataBookmark | null> {
    // Simulasi pencarian bookmark
    const bookmarks = await this.generateDataBookmark(userId);
    return bookmarks.find(b => b.id === bookmarkId) || null;
  }

  private async generateKategoriSample(): Promise<KategoriBookmark> {
    const kategoris = ['Favorit', 'Wishlist', 'Perbandingan', 'Budget', 'Luxury'];
    const nama = kategoris[Math.floor(Math.random() * kategoris.length)];
    
    return {
      id: this.generateId(),
      nama,
      deskripsi: `Kategori ${nama}`,
      warna: this.generateRandomColor(),
      ikon: 'bookmark',
      urutanTampil: Math.floor(Math.random() * 10) + 1,
      isDefault: nama === 'Favorit',
      aturanKategori: await this.getDefaultAturanKategori(),
      statistik: await this.getDefaultStatistikKategori()
    };
  }

  private generateTags(): string[] {
    const allTags = ['sedan', 'suv', 'hatchback', 'mpv', 'sport', 'luxury', 'ekonomis', 'keluarga'];
    const jumlahTags = Math.floor(Math.random() * 4) + 1;
    const tags: string[] = [];
    
    for (let i = 0; i < jumlahTags; i++) {
      const tag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    return tags;
  }

  private async generatePrioritasSample(): Promise<PrioritasBookmark> {
    const levels: ('rendah' | 'sedang' | 'tinggi' | 'kritis')[] = ['rendah', 'sedang', 'tinggi', 'kritis'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    return {
      level,
      score: Math.floor(Math.random() * 100) + 1,
      faktorPrioritas: [
        {
          nama: 'Harga',
          bobot: 0.3,
          nilai: Math.floor(Math.random() * 10) + 1,
          deskripsi: 'Faktor harga mobil'
        },
        {
          nama: 'Fitur',
          bobot: 0.4,
          nilai: Math.floor(Math.random() * 10) + 1,
          deskripsi: 'Kelengkapan fitur'
        }
      ],
      autoUpdate: Math.random() > 0.5,
      reminderAktif: Math.random() > 0.5
    };
  }

  private async generateStatusSample(): Promise<StatusBookmark> {
    return {
      aktif: Math.random() > 0.1,
      diarsipkan: Math.random() > 0.8,
      dihapus: false,
      disinkronkan: Math.random() > 0.2,
      perluReview: Math.random() > 0.7,
      statusCustom: []
    };
  }

  private async generateMetadata(): Promise<MetadataBookmark> {
    return {
      sumber: 'web_app',
      deviceDibuat: 'desktop',
      lokasiDibuat: 'Jakarta, Indonesia',
      versi: 1,
      checksum: this.generateId(),
      ukuranData: Math.floor(Math.random() * 1000) + 100,
      formatData: 'json',
      kompresi: false,
      enkripsi: true,
      backup: {
        terakhirBackup: new Date(),
        lokasiBackup: 'cloud_storage',
        ukuranBackup: Math.floor(Math.random() * 500) + 50,
        statusBackup: 'success',
        autoBackup: true
      }
    };
  }

  private async generateNotifikasiSample(): Promise<PengaturanNotifikasi> {
    return {
      aktif: Math.random() > 0.3,
      jenisNotifikasi: [
        {
          tipe: 'price_drop',
          aktif: true,
          threshold: 5,
          kondisi: 'percentage'
        }
      ],
      frekuensi: {
        tipe: 'daily',
        interval: 1,
        hariKhusus: ['monday', 'wednesday', 'friday'],
        jamKhusus: ['09:00', '15:00']
      },
      waktuNotifikasi: [
        {
          jam: '09:00',
          hari: ['monday', 'wednesday', 'friday'],
          timezone: 'Asia/Jakarta',
          aktif: true
        }
      ],
      channelNotifikasi: [
        {
          tipe: 'email',
          alamat: 'user@example.com',
          aktif: true,
          prioritas: 1
        }
      ],
      templateNotifikasi: {
        id: this.generateId(),
        nama: 'Default Template',
        subjek: 'Update Bookmark Anda',
        konten: 'Ada update untuk bookmark {{nama_mobil}}',
        variabel: [
          {
            nama: 'nama_mobil',
            tipe: 'string',
            defaultValue: '',
            required: true
          }
        ]
      }
    };
  }

  private async generateMobilSample(): Promise<MobilBookmark> {
    const mereks = ['Toyota', 'Honda', 'Suzuki', 'Mitsubishi', 'Nissan'];
    const models = ['Avanza', 'Innova', 'Fortuner', 'Civic', 'CR-V'];
    
    const merek = mereks[Math.floor(Math.random() * mereks.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    
    return {
      id: this.generateId(),
      nama: `${merek} ${model}`,
      merek,
      model,
      tahun: 2020 + Math.floor(Math.random() * 4),
      harga: {
        hargaJual: 200000000 + Math.floor(Math.random() * 300000000),
        hargaOTR: 220000000 + Math.floor(Math.random() * 320000000),
        diskon: Math.floor(Math.random() * 20000000),
        promo: [
          {
            id: this.generateId(),
            nama: 'Promo Akhir Tahun',
            deskripsi: 'Diskon spesial akhir tahun',
            nilaiDiskon: 15000000,
            tipeDiskon: 'fixed',
            tanggalMulai: new Date(),
            tanggalBerakhir: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            syaratKetentuan: ['Berlaku untuk pembelian cash', 'Tidak dapat digabung dengan promo lain']
          }
        ],
        cicilan: {
          dp: 50000000,
          tenor: [12, 24, 36, 48, 60],
          bungaEfektif: 8.5,
          cicilanBulanan: 4500000,
          totalBayar: 270000000,
          asuransi: {
            wajib: true,
            jenis: ['TLO', 'All Risk'],
            biaya: 5000000,
            coverage: ['Kecelakaan', 'Pencurian', 'Bencana Alam']
          }
        },
        riwayatPerubahan: [
          {
            tanggal: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            hargaLama: 250000000,
            hargaBaru: 240000000,
            persentasePerubahan: -4,
            alasan: 'Penyesuaian harga pasar'
          }
        ]
      },
      spesifikasi: {
        mesin: '1.5L DOHC',
        transmisi: 'CVT',
        bahanBakar: 'Bensin',
        kapasitasMesin: '1496 cc',
        tenagaMaksimal: '121 HP',
        torsiMaksimal: '145 Nm',
        konsumsiGSM: '16.1 km/l',
        fiturUtama: ['ABS', 'Airbag', 'Power Steering', 'AC']
      },
      gambar: [
        {
          id: this.generateId(),
          url: '/images/mobil1.jpg',
          tipe: 'exterior',
          deskripsi: 'Tampak depan',
          isPrimary: true,
          resolusi: '1920x1080',
          ukuranFile: 245760
        }
      ],
      dealer: {
        id: this.generateId(),
        nama: 'Dealer Resmi Jakarta',
        alamat: 'Jl. Sudirman No. 123, Jakarta',
        telepon: '021-12345678',
        email: 'info@dealer.com',
        website: 'www.dealer.com',
        rating: 4.5,
        jamOperasional: [
          {
            hari: 'Senin-Jumat',
            jamBuka: '08:00',
            jamTutup: '17:00',
            istirahat: {
              mulai: '12:00',
              selesai: '13:00'
            }
          }
        ],
        layananTersedia: ['Penjualan', 'Service', 'Spare Part']
      },
      ketersediaan: {
        stok: Math.floor(Math.random() * 10) + 1,
        statusKetersediaan: 'tersedia',
        estimasiKetersediaan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lokasiStok: [
          {
            dealerId: this.generateId(),
            namaDealer: 'Dealer Jakarta',
            jumlahStok: 3,
            statusStok: 'ready'
          }
        ],
        reservasi: {
          bisaDireservasi: true,
          biayaReservasi: 5000000,
          masaBerlaku: 30,
          syaratReservasi: ['KTP', 'NPWP', 'Slip Gaji']
        }
      },
      riwayatHarga: [
        {
          tanggal: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          harga: 260000000,
          tipeHarga: 'regular',
          sumber: 'dealer_official',
          validitas: true
        }
      ],
      perbandingan: {
        mobilSejenis: [
          {
            id: this.generateId(),
            nama: 'Honda CR-V',
            harga: 280000000,
            similarityScore: 0.85,
            perbedaanUtama: ['Mesin lebih besar', 'Fitur lebih lengkap']
          }
        ],
        keunggulan: ['Harga kompetitif', 'Konsumsi BBM irit', 'Perawatan mudah'],
        kekurangan: ['Fitur terbatas', 'Performa kurang sporty'],
        scorePerbandingan: 7.5,
        rekomendasiAlternatif: ['Honda HR-V', 'Mazda CX-5']
      }
    };
  }

  private async generateCatatanSample(): Promise<CatatanBookmark[]> {
    const jumlahCatatan = Math.floor(Math.random() * 3);
    const catatan: CatatanBookmark[] = [];
    
    for (let i = 0; i < jumlahCatatan; i++) {
      catatan.push({
        id: this.generateId(),
        judul: `Catatan ${i + 1}`,
        konten: `Ini adalah catatan untuk bookmark mobil ${i + 1}`,
        tipe: 'text',
        tags: ['penting', 'review'],
        prioritas: 'sedang',
        tanggalDibuat: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        tanggalDiperbarui: new Date(),
        attachment: [],
        reminder: {
          aktif: false,
          tanggalReminder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          tipeReminder: 'once',
          pesan: 'Jangan lupa review mobil ini',
          sudahDiingatkan: false
        }
      });
    }
    
    return catatan;
  }

  private async generateBerbagiSample(): Promise<PengaturanBerbagi> {
     return {
       bisaDibagikan: Math.random() > 0.7,
       levelAkses: 'private',
       daftarPengguna: [],
       linkBerbagi: {
         url: '',
         token: '',
         tanggalKadaluarsa: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
         jumlahAkses: 0,
         maksimalAkses: 100,
         requirePassword: false
       },
       pembatasan: {
         batasan: [],
         wilayahTerbatas: [],
         waktuAkses: {
           jamMulai: '00:00',
           jamSelesai: '23:59',
           hariAktif: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
           timezone: 'Asia/Jakarta'
         },
         deviceTerbatas: []
       }
     };
   }

   private async generateSinkronisasiSample(): Promise<StatusSinkronisasi> {
     return {
       terakhirSinkron: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
       statusSinkron: 'synced',
       deviceSinkron: [
         {
           deviceId: this.generateId(),
           namaDevice: 'Desktop PC',
           tipeDevice: 'desktop',
           terakhirSinkron: new Date(),
           statusSinkron: 'synced',
           versiData: 1
         }
       ],
       konflikData: [],
       autoSinkron: true
     };
   }

   private async prosesHasilPencarian(
     bookmarks: DataBookmark[],
     kriteria?: KriteriaPencarianBookmark
   ): Promise<HasilPencarianBookmark> {
     const batasPerHalaman = kriteria?.batasPerHalaman || 20;
     const halaman = kriteria?.halaman || 1;
     const startIndex = (halaman - 1) * batasPerHalaman;
     const endIndex = startIndex + batasPerHalaman;

     const bookmarksPaginated = bookmarks.slice(startIndex, endIndex);

     return {
       bookmarks: bookmarksPaginated,
       totalHasil: bookmarks.length,
       halamanSaatIni: halaman,
       totalHalaman: Math.ceil(bookmarks.length / batasPerHalaman),
       waktuPencarian: Math.floor(Math.random() * 200) + 50,
       filterTerapan: {
         kriteria: kriteria || {},
         jumlahFilter: this.hitungJumlahFilter(kriteria),
         filterAktif: this.generateFilterAktif(kriteria)
       },
       saran: this.generateSaranPencarian(),
       statistik: await this.generateStatistikPencarian(bookmarks),
       pengelompokan: await this.generatePengelompokanHasil(bookmarks)
     };
   }

   private filterBookmarks(
     bookmarks: DataBookmark[],
     kriteria?: KriteriaPencarianBookmark
   ): DataBookmark[] {
     if (!kriteria) return bookmarks;

     return bookmarks.filter(bookmark => {
       // Filter berdasarkan query
       if (kriteria.query) {
         const query = kriteria.query.toLowerCase();
         const matchQuery = 
           bookmark.judulBookmark.toLowerCase().includes(query) ||
           bookmark.deskripsi?.toLowerCase().includes(query) ||
           bookmark.dataMobil.nama.toLowerCase().includes(query) ||
           bookmark.dataMobil.merek.toLowerCase().includes(query);
         if (!matchQuery) return false;
       }

       // Filter berdasarkan kategori
       if (kriteria.kategori && kriteria.kategori.length > 0) {
         if (!kriteria.kategori.includes(bookmark.kategori.nama)) return false;
       }

       // Filter berdasarkan tags
       if (kriteria.tags && kriteria.tags.length > 0) {
         const hasMatchingTag = kriteria.tags.some(tag => 
           bookmark.tags.includes(tag)
         );
         if (!hasMatchingTag) return false;
       }

       // Filter berdasarkan merek
       if (kriteria.merek && kriteria.merek.length > 0) {
         if (!kriteria.merek.includes(bookmark.dataMobil.merek)) return false;
       }

       // Filter berdasarkan rentang harga
       if (kriteria.rentangHarga) {
         const harga = bookmark.dataMobil.harga.hargaOTR;
         if (harga < kriteria.rentangHarga.minimum || harga > kriteria.rentangHarga.maksimum) {
           return false;
         }
       }

       // Filter berdasarkan tahun
       if (kriteria.tahun) {
         const tahun = bookmark.dataMobil.tahun;
         if (tahun < kriteria.tahun.minimum || tahun > kriteria.tahun.maksimum) {
           return false;
         }
       }

       return true;
     });
   }

   private hitungJumlahFilter(kriteria?: KriteriaPencarianBookmark): number {
     if (!kriteria) return 0;
     
     let count = 0;
     if (kriteria.query) count++;
     if (kriteria.kategori && kriteria.kategori.length > 0) count++;
     if (kriteria.tags && kriteria.tags.length > 0) count++;
     if (kriteria.merek && kriteria.merek.length > 0) count++;
     if (kriteria.rentangHarga) count++;
     if (kriteria.tahun) count++;
     
     return count;
   }

   private generateFilterAktif(kriteria?: KriteriaPencarianBookmark): FilterAktif[] {
     const filterAktif: FilterAktif[] = [];
     
     if (kriteria?.kategori && kriteria.kategori.length > 0) {
       filterAktif.push({
         nama: 'Kategori',
         nilai: kriteria.kategori.join(', '),
         jumlahHasil: Math.floor(Math.random() * 50) + 10
       });
     }
     
     if (kriteria?.merek && kriteria.merek.length > 0) {
       filterAktif.push({
         nama: 'Merek',
         nilai: kriteria.merek.join(', '),
         jumlahHasil: Math.floor(Math.random() * 30) + 5
       });
     }
     
     return filterAktif;
   }

   private generateSaranPencarian(): SaranPencarian[] {
     return [
       {
         teks: 'Toyota Avanza',
         tipe: 'alternatif',
         relevansi: 0.85
       },
       {
         teks: 'Honda CR-V',
         tipe: 'pelengkap',
         relevansi: 0.78
       },
       {
         teks: 'SUV keluarga',
         tipe: 'koreksi',
         relevansi: 0.92
       }
     ];
   }

   private async generateStatistikPencarian(bookmarks: DataBookmark[]): Promise<StatistikPencarianBookmark> {
     return {
       distribusiKategori: this.generateDistribusiKategori(bookmarks),
       distribusiMerek: this.generateDistribusiMerek(bookmarks),
       distribusiHarga: this.generateDistribusiHarga(bookmarks),
       distribusiTahun: this.generateDistribusiTahun(bookmarks),
       trendPencarian: this.generateTrendPencarian()
     };
   }

   private generateDistribusiKategori(bookmarks: DataBookmark[]): DistribusiKategori[] {
     const kategoriCount = new Map<string, number>();
     bookmarks.forEach(b => {
       const kategori = b.kategori.nama;
       kategoriCount.set(kategori, (kategoriCount.get(kategori) || 0) + 1);
     });

     return Array.from(kategoriCount.entries()).map(([kategori, jumlah]) => ({
       kategori,
       jumlah,
       persentase: Math.round((jumlah / bookmarks.length) * 100)
     }));
   }

   private generateDistribusiMerek(bookmarks: DataBookmark[]): DistribusiMerek[] {
     const merekCount = new Map<string, { jumlah: number; totalHarga: number }>();
     
     bookmarks.forEach(b => {
       const merek = b.dataMobil.merek;
       const existing = merekCount.get(merek) || { jumlah: 0, totalHarga: 0 };
       merekCount.set(merek, {
         jumlah: existing.jumlah + 1,
         totalHarga: existing.totalHarga + b.dataMobil.harga.hargaOTR
       });
     });

     return Array.from(merekCount.entries()).map(([merek, data]) => ({
       merek,
       jumlah: data.jumlah,
       persentase: Math.round((data.jumlah / bookmarks.length) * 100),
       rataRataHarga: Math.round(data.totalHarga / data.jumlah)
     }));
   }

   private generateDistribusiHarga(bookmarks: DataBookmark[]): DistribusiHarga[] {
     const rentangHarga = [
       { rentang: '< 200 Juta', min: 0, max: 200000000 },
       { rentang: '200-400 Juta', min: 200000000, max: 400000000 },
       { rentang: '400-600 Juta', min: 400000000, max: 600000000 },
       { rentang: '> 600 Juta', min: 600000000, max: Infinity }
     ];

     return rentangHarga.map(range => {
       const jumlah = bookmarks.filter(b => 
         b.dataMobil.harga.hargaOTR >= range.min && b.dataMobil.harga.hargaOTR < range.max
       ).length;
       
       return {
         rentang: range.rentang,
         jumlah,
         persentase: Math.round((jumlah / bookmarks.length) * 100)
       };
     });
   }

   private generateDistribusiTahun(bookmarks: DataBookmark[]): DistribusiTahun[] {
     const tahunCount = new Map<number, number>();
     bookmarks.forEach(b => {
       const tahun = b.dataMobil.tahun;
       tahunCount.set(tahun, (tahunCount.get(tahun) || 0) + 1);
     });

     return Array.from(tahunCount.entries()).map(([tahun, jumlah]) => ({
       tahun,
       jumlah,
       persentase: Math.round((jumlah / bookmarks.length) * 100)
     }));
   }

   private generateTrendPencarian(): TrendPencarian[] {
     return [
       {
         periode: '2024-01',
         jumlahPencarian: 1250,
         keywordPopuler: ['Toyota Avanza', 'Honda CR-V', 'Suzuki Ertiga']
       },
       {
         periode: '2024-02',
         jumlahPencarian: 1380,
         keywordPopuler: ['Mitsubishi Xpander', 'Honda HR-V', 'Toyota Fortuner']
       }
     ];
   }

   private async generatePengelompokanHasil(bookmarks: DataBookmark[]): Promise<PengelompokanHasil[]> {
     return [
       {
         kriteria: 'Merek',
         grup: this.groupByMerek(bookmarks)
       },
       {
         kriteria: 'Kategori',
         grup: this.groupByKategori(bookmarks)
       }
     ];
   }

   private groupByMerek(bookmarks: DataBookmark[]): GrupHasil[] {
     const groups = new Map<string, DataBookmark[]>();
     
     bookmarks.forEach(bookmark => {
       const merek = bookmark.dataMobil.merek;
       if (!groups.has(merek)) {
         groups.set(merek, []);
       }
       groups.get(merek)!.push(bookmark);
     });

     return Array.from(groups.entries()).map(([nama, items]) => ({
       nama,
       jumlah: items.length,
       items: items.slice(0, 5) // Batasi 5 item per grup
     }));
   }

   private groupByKategori(bookmarks: DataBookmark[]): GrupHasil[] {
     const groups = new Map<string, DataBookmark[]>();
     
     bookmarks.forEach(bookmark => {
       const kategori = bookmark.kategori.nama;
       if (!groups.has(kategori)) {
         groups.set(kategori, []);
       }
       groups.get(kategori)!.push(bookmark);
     });

     return Array.from(groups.entries()).map(([nama, items]) => ({
       nama,
       jumlah: items.length,
       items: items.slice(0, 5)
     }));
   }

   private async generateStatistikBookmark(
     userId: string,
     periode?: PeriodeStatistik
   ): Promise<StatistikBookmark> {
     return {
       ringkasan: await this.generateRingkasanBookmark(userId),
       distribusi: await this.generateDistribusiBookmark(userId),
       aktivitas: await this.generateAktivitasBookmark(userId),
       performa: await this.generatePerformaBookmark(userId),
       trend: await this.generateTrendBookmark(userId),
       analisis: await this.generateAnalisisBookmark(userId),
       prediksi: await this.generatePrediksiBookmark(userId),
       rekomendasi: await this.generateRekomendasiBookmark(userId),
       periode: periode || {
         mulai: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
         selesai: new Date(),
         tipeperiode: 'bulanan',
         deskripsi: 'Statistik 30 hari terakhir'
       }
     };
   }

   private async generateRingkasanBookmark(userId: string): Promise<RingkasanBookmark> {
     return {
       totalBookmark: Math.floor(Math.random() * 100) + 20,
       bookmarkAktif: Math.floor(Math.random() * 80) + 15,
       bookmarkArsip: Math.floor(Math.random() * 15) + 2,
       bookmarkTerhapus: Math.floor(Math.random() * 5),
       kategoriTerbanyak: 'Favorit',
       merekTerpopuler: 'Toyota',
       rataRataHarga: 350000000,
       totalNilaiBookmark: 2800000000
     };
   }

   private async generateDistribusiBookmark(userId: string): Promise<DistribusiBookmark> {
     return {
       perKategori: [
         { kategori: 'Favorit', jumlah: 25, persentase: 40 },
         { kategori: 'Wishlist', jumlah: 20, persentase: 32 },
         { kategori: 'Perbandingan', jumlah: 18, persentase: 28 }
       ],
       perMerek: [
         { merek: 'Toyota', jumlah: 30, persentase: 48, rataRataHarga: 320000000 },
         { merek: 'Honda', jumlah: 20, persentase: 32, rataRataHarga: 380000000 },
         { merek: 'Suzuki', jumlah: 13, persentase: 20, rataRataHarga: 250000000 }
       ],
       perHarga: [
         { rentang: '< 200 Juta', jumlah: 15, persentase: 24 },
         { rentang: '200-400 Juta', jumlah: 35, persentase: 56 },
         { rentang: '> 400 Juta', jumlah: 13, persentase: 20 }
       ],
       perTahun: [
         { tahun: 2024, jumlah: 25, persentase: 40 },
         { tahun: 2023, jumlah: 20, persentase: 32 },
         { tahun: 2022, jumlah: 18, persentase: 28 }
       ],
       perDealer: [
         { dealer: 'Toyota Jakarta', jumlah: 15, persentase: 24, rataRataRating: 4.5 },
         { dealer: 'Honda Sunter', jumlah: 12, persentase: 19, rataRataRating: 4.3 }
       ],
       perLokasi: [
         { lokasi: 'Jakarta', jumlah: 40, persentase: 64, radiusRataRata: 15 },
         { lokasi: 'Bekasi', jumlah: 23, persentase: 36, radiusRataRata: 25 }
       ]
     };
   }

   private async generateAktivitasBookmark(userId: string): Promise<AktivitasBookmark> {
     return {
       bookmarkBaru: this.generateAktivitasHarian('bookmark_baru'),
       aksesHarian: this.generateAktivitasHarian('akses'),
       modifikasiHarian: this.generateAktivitasHarian('modifikasi'),
       penghapusanHarian: this.generateAktivitasHarian('penghapusan'),
       jamSibuk: [
         { jam: 9, jumlahAktivitas: 45, tipeAktivitas: ['akses', 'bookmark'] },
         { jam: 14, jumlahAktivitas: 38, tipeAktivitas: ['akses', 'edit'] },
         { jam: 20, jumlahAktivitas: 52, tipeAktivitas: ['bookmark', 'review'] }
       ],
       hariAktif: [
         {
           hari: 'Senin',
           jumlahAktivitas: 85,
           jenisAktivitas: [
             { jenis: 'akses', jumlah: 45, persentase: 53 },
             { jenis: 'bookmark', jumlah: 25, persentase: 29 },
             { jenis: 'edit', jumlah: 15, persentase: 18 }
           ]
         }
       ]
     };
   }

   private generateAktivitasHarian(tipe: string): AktivitasHarian[] {
     return Array.from({ length: 30 }, (_, i) => ({
       tanggal: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
       jumlah: Math.floor(Math.random() * 20) + 5,
       persentasePerubahan: Math.round((Math.random() - 0.5) * 40)
     }));
   }

   private async generatePerformaBookmark(userId: string): Promise<PerformaBookmark> {
     return {
       waktuRataRataAkses: 2.5,
       frekuensiAkses: [
         {
           bookmarkId: this.generateId(),
           jumlahAkses: 25,
           terakhirDiakses: new Date(),
           rataRataInterval: 2.5
         }
       ],
       tingkatRetensi: 85,
       tingkatKonversi: 12,
       efektivitasKategori: [
         {
           kategori: 'Favorit',
           tingkatAkses: 92,
           tingkatKonversi: 18,
           scoreEfektivitas: 8.5
         }
       ],
       kepuasanPengguna: {
         ratingRataRata: 4.3,
         jumlahFeedback: 156,
         distribusiRating: [
           { rating: 5, jumlah: 78, persentase: 50 },
           { rating: 4, jumlah: 47, persentase: 30 },
           { rating: 3, jumlah: 23, persentase: 15 },
           { rating: 2, jumlah: 6, persentase: 4 },
           { rating: 1, jumlah: 2, persentase: 1 }
         ],
         komentarPositif: 125,
         komentarNegatif: 8
       }
     };
   }

   private async generateTrendBookmark(userId: string): Promise<TrendBookmark> {
     return {
       trendBulanan: [
         {
           bulan: 'Januari',
           tahun: 2024,
           jumlahBookmark: 45,
           pertumbuhanPersentase: 12,
           kategoriPopuler: ['Favorit', 'Wishlist']
         }
       ],
       trendKategori: [
         {
           kategori: 'Favorit',
           trendData: [
             { periode: '2024-01', nilai: 25, perubahan: 5 },
             { periode: '2024-02', nilai: 30, perubahan: 20 }
           ],
           statusTrend: 'naik',
           prediksiPertumbuhan: 15
         }
       ],
       trendMerek: [
         {
           merek: 'Toyota',
           popularitas: 85,
           perubahanPopularitas: 8,
           proyeksiPopularitas: 90,
           faktorTrend: ['Reliabilitas tinggi', 'Harga kompetitif']
         }
       ],
       trendHarga: [
         {
           rentangHarga: '200-400 Juta',
           trendPermintaan: 'naik',
           persentasePerubahan: 12,
           faktorPenyebab: ['Daya beli meningkat', 'Promo menarik']
         }
       ],
       prediksiTrend: [
         {
           aspek: 'Kategori SUV',
           prediksi: 'Akan mengalami peningkatan minat 20% dalam 6 bulan ke depan',
           tingkatKepercayaan: 78,
           faktorPendukung: ['Tren lifestyle', 'Kebutuhan keluarga'],
           timeframe: '6 bulan'
         }
       ]
     };
   }

   private async generateAnalisisBookmark(userId: string): Promise<AnalisisBookmark> {
     return {
       polaPerilaku: [
         {
           pola: 'Akses puncak sore hari',
           deskripsi: 'Pengguna cenderung mengakses bookmark pada jam 17:00-19:00',
           frekuensi: 65,
           dampak: 'Tinggi',
           rekomendasi: 'Optimalkan notifikasi pada jam tersebut'
         }
       ],
       segmentasiPengguna: [
         {
           segmen: 'Pembeli Pertama',
           karakteristik: ['Budget terbatas', 'Mencari mobil keluarga'],
           ukuranSegmen: 45,
           nilaiSegmen: 8.2,
           strategiTargeting: ['Fokus pada value for money', 'Highlight fitur keselamatan']
         }
       ],
       analisisKorelasi: [
         {
           variabel1: 'Harga',
           variabel2: 'Frekuensi Akses',
           korelasiScore: -0.65,
           signifikansi: 'Tinggi',
           interpretasi: 'Semakin tinggi harga, semakin jarang diakses'
         }
       ],
       insightBisnis: [
         {
           kategori: 'Perilaku Pengguna',
           insight: 'Pengguna lebih aktif pada akhir pekan',
           dampakBisnis: 'Peluang peningkatan engagement 25%',
           actionItem: ['Buat konten khusus weekend', 'Tingkatkan promo weekend'],
           prioritas: 'tinggi'
         }
       ],
       rekomendasiOptimasi: [
         {
           area: 'User Experience',
           rekomendasi: 'Implementasi fitur quick bookmark',
           dampakEstimasi: 'Peningkatan engagement 15%',
           tingkatKesulitan: 'sedang',
           estimasiWaktu: '2-3 minggu'
         }
       ]
     };
   }

   private async generatePrediksiBookmark(userId: string): Promise<PrediksiBookmark> {
     return {
       prediksiPertumbuhan: {
         periode: '6 bulan ke depan',
         pertumbuhanEstimasi: 25,
         tingkatKepercayaan: 82,
         faktorPendorong: ['Peningkatan awareness brand', 'Ekspansi fitur'],
         skenario: [
           {
             nama: 'Optimis',
             probabilitas: 30,
             dampak: 'Pertumbuhan 35%',
             mitigasi: ['Persiapan infrastruktur', 'Peningkatan tim support']
           }
         ]
       },
       prediksiKategori: [
         {
           kategori: 'SUV',
           trendPrediksi: 'naik',
           pertumbuhanEstimasi: 30,
           faktorPendorong: ['Tren lifestyle', 'Kebutuhan keluarga besar']
         }
       ],
       prediksiPerilaku: [
         {
           perilaku: 'Mobile usage increase',
           probabilitas: 85,
           dampak: 'Shift ke mobile-first experience',
           rekomendasiAksi: ['Optimasi mobile app', 'Responsive design improvement']
         }
       ],
       risikoChurn: {
         tingkatRisiko: 'rendah',
         faktorRisiko: [
           {
             faktor: 'Kurangnya engagement',
             bobot: 0.4,
             dampak: 'Sedang',
             mitigasi: 'Implementasi gamification'
           }
         ],
         prediksiChurn: 8,
         strategiRetensi: ['Personalisasi konten', 'Loyalty program', 'Push notification cerdas']
       },
       peluangUpsell: [
         {
           kategori: 'Premium Features',
           peluang: 'Advanced analytics dashboard',
           potensiNilai: 150000,
           probabilitasKeberhasilan: 65,
           strategiPendekatan: ['Free trial', 'Feature demonstration', 'Customer success story']
         }
       ]
     };
   }

   private async generateRekomendasiBookmark(userId: string): Promise<RekomendasiBookmark> {
     return {
       rekomendasiMobil: [
         {
           mobilId: this.generateId(),
           namaMobil: 'Toyota Avanza Veloz',
           scoreRekomendasi: 8.5,
           alasanRekomendasi: ['Sesuai budget', 'Fitur lengkap', 'Brand terpercaya'],
           kategoriCocok: ['Keluarga', 'Ekonomis'],
           estimasiMinat: 78
         }
       ],
       rekomendasiKategori: [
         {
           kategori: 'Hybrid',
           alasanRekomendasi: 'Tren ramah lingkungan dan efisiensi BBM',
           potensiManfaat: ['Hemat BBM', 'Ramah lingkungan', 'Teknologi terdepan'],
           langkahImplementasi: ['Research model hybrid', 'Bandingkan harga', 'Test drive']
         }
       ],
       rekomendasiAksi: [
         {
           aksi: 'Update profil preferensi',
           prioritas: 'tinggi',
           dampakEstimasi: 'Rekomendasi lebih akurat 40%',
           resourceDibutuhkan: ['5 menit waktu user'],
           timeline: 'Segera'
         }
       ],
       rekomendasiOptimasi: [
         {
           area: 'Bookmark Organization',
           rekomendasi: 'Gunakan sistem tag yang lebih terstruktur',
           dampakEstimasi: 'Efisiensi pencarian meningkat 50%',
           tingkatKesulitan: 'mudah',
           estimasiWaktu: '10 menit'
         }
       ]
     };
   }

   // Helper methods untuk validasi dan utilitas
   private async validasiDataBookmark(data: Partial<DataBookmark>): Promise<{ valid: boolean; errors: string[] }> {
     const errors: string[] = [];

     if (!data.mobilId) {
       errors.push('ID mobil harus diisi');
     }

     if (!data.judulBookmark || data.judulBookmark.trim().length === 0) {
       errors.push('Judul bookmark harus diisi');
     }

     if (data.judulBookmark && data.judulBookmark.length > 100) {
       errors.push('Judul bookmark maksimal 100 karakter');
     }

     return {
       valid: errors.length === 0,
       errors
     };
   }

   private async getDefaultKategori(): Promise<KategoriBookmark> {
     return {
       id: this.generateId(),
       nama: 'Favorit',
       deskripsi: 'Kategori default untuk bookmark favorit',
       warna: '#007bff',
       ikon: 'star',
       urutanTampil: 1,
       isDefault: true,
       aturanKategori: await this.getDefaultAturanKategori(),
       statistik: await this.getDefaultStatistikKategori()
     };
   }

   private async getDefaultPrioritas(): Promise<PrioritasBookmark> {
     return {
       level: 'sedang',
       score: 50,
       faktorPrioritas: [],
       autoUpdate: false,
       reminderAktif: false
     };
   }

   private async getDefaultStatus(): Promise<StatusBookmark> {
     return {
       aktif: true,
       diarsipkan: false,
       dihapus: false,
       disinkronkan: true,
       perluReview: false,
       statusCustom: []
     };
   }

   private async getDefaultNotifikasi(): Promise<PengaturanNotifikasi> {
     return {
       aktif: false,
       jenisNotifikasi: [],
       frekuensi: {
         tipe: 'daily',
         interval: 1
       },
       waktuNotifikasi: [],
       channelNotifikasi: [],
       templateNotifikasi: {
         id: this.generateId(),
         nama: 'Default',
         subjek: 'Update Bookmark',
         konten: 'Ada update untuk bookmark Anda',
         variabel: []
       }
     };
   }

   private async getDefaultBerbagi(): Promise<PengaturanBerbagi> {
     return {
       bisaDibagikan: false,
       levelAkses: 'private',
       daftarPengguna: [],
       linkBerbagi: {
         url: '',
         token: '',
         tanggalKadaluarsa: new Date(),
         jumlahAkses: 0,
         maksimalAkses: 0,
         requirePassword: false
       },
       pembatasan: {
         batasan: [],
         wilayahTerbatas: [],
         waktuAkses: {
           jamMulai: '00:00',
           jamSelesai: '23:59',
           hariAktif: [],
           timezone: 'Asia/Jakarta'
         },
         deviceTerbatas: []
       }
     };
   }

   private async getDefaultSinkronisasi(): Promise<StatusSinkronisasi> {
     return {
       terakhirSinkron: new Date(),
       statusSinkron: 'synced',
       deviceSinkron: [],
       konflikData: [],
       autoSinkron: true
     };
   }

   private async getDefaultAturanKategori(): Promise<AturanKategori> {
     return {
       maksimalItem: 100,
       autoKategorisasi: false,
       kriteriaAuto: [],
       notifikasiPenuh: true,
       aksesPublik: false
     };
   }

   private async getDefaultStatistikKategori(): Promise<StatistikKategori> {
     return {
       totalBookmark: 0,
       bookmarkAktif: 0,
       bookmarkArsip: 0,
       rataRataAkses: 0,
       popularitasScore: 0
     };
   }

   private async ambilDataMobil(mobilId: string): Promise<MobilBookmark> {
     // Simulasi pengambilan data mobil dari service lain
     return await this.generateMobilSample();
   }

   private async ambilKategoriPengguna(userId: string): Promise<KategoriBookmark[]> {
     // Simulasi pengambilan kategori pengguna
     return [
       await this.getDefaultKategori(),
       {
         id: this.generateId(),
         nama: 'Wishlist',
         deskripsi: 'Mobil yang diinginkan',
         warna: '#28a745',
         ikon: 'heart',
         urutanTampil: 2,
         isDefault: false,
         aturanKategori: await this.getDefaultAturanKategori(),
         statistik: await this.getDefaultStatistikKategori()
       }
     ];
   }

   // Utility methods
   private generateId(): string {
     return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
   }

   private generateRandomColor(): string {
     const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
     return colors[Math.floor(Math.random() * colors.length)];
   }

   private async simulasiDelay(ms: number = 100): Promise<void> {
     return new Promise(resolve => setTimeout(resolve, ms));
   }

   private async simulasiPenyimpanan(data: any): Promise<void> {
     await this.simulasiDelay(200);
     // Simulasi penyimpanan ke database
   }

   private ambilDariCache<T>(key: string): T | null {
     const cached = this.cache.get(key);
     if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
       return cached.data;
     }
     this.cache.delete(key);
     return null;
   }

   private simpanKeCache<T>(key: string, data: T): void {
     this.cache.set(key, {
       data,
       timestamp: Date.now()
     });
   }

   private hapusCachePattern(pattern: string): void {
     for (const [key] of Array.from(this.cache.entries())) {
       if (key.includes(pattern)) {
         this.cache.delete(key);
       }
     }
   }

   private handleError(message: string, error: any): ResponLayanan<any> {
     console.error(message, error);
     return {
       sukses: false,
       pesan: message,
       kodeStatus: 500,
       waktuProses: 100,
       error: {
         kode: 'INTERNAL_ERROR',
         detail: error instanceof Error ? error.message : 'Unknown error',
         stack: error instanceof Error ? error.stack : undefined
       }
     };
   }
 }

 // ==================== EXPORT ====================
 export default LayananBookmark;