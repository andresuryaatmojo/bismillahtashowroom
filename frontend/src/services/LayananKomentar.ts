// ==================== LAYANAN KOMENTAR ====================
// Layanan untuk mengelola sistem komentar, rating, review, dan moderasi konten
// Mendukung komentar hierarkis, rating, moderasi otomatis, dan analitik komentar

// ==================== INTERFACES ====================

// Interface untuk data komentar utama
export interface DataKomentar {
  id: string;
  parentId?: string; // Untuk komentar balasan
  mobilId: string;
  userId: string;
  konten: string;
  rating?: number; // 1-5 bintang
  tipeKomentar: 'review' | 'pertanyaan' | 'keluhan' | 'saran' | 'testimoni';
  statusKomentar: StatusKomentar;
  metadata: MetadataKomentar;
  lampiran: LampiranKomentar[];
  interaksi: InteraksiKomentar;
  moderasi: Moderasi;
  balasan: DataKomentar[]; // Komentar balasan
  tanggalDibuat: Date;
  tanggalDiperbarui: Date;
  informasiPengguna: InformasiPengguna;
  informasiMobil: InformasiMobil;
  konteksKomentar: KonteksKomentar;
  pengaturanPrivasi: PengaturanPrivasi;
  riwayatEdit: RiwayatEdit[];
  notifikasi: PengaturanNotifikasi;
  analitik: AnalitikKomentar;
}

// Interface untuk status komentar
export interface StatusKomentar {
  aktif: boolean;
  disetujui: boolean;
  ditolak: boolean;
  diarsipkan: boolean;
  dihapus: boolean;
  dilaporkan: boolean;
  disorot: boolean; // Featured comment
  dipinned: boolean; // Pinned to top
  statusCustom: StatusCustom[];
  alasanStatus: string;
  moderatorId?: string;
  tanggalStatusDiubah: Date;
}

// Interface untuk status custom
export interface StatusCustom {
  nama: string;
  nilai: string;
  deskripsi: string;
  warna: string;
  ikon: string;
  prioritas: number;
}

// Interface untuk metadata komentar
export interface MetadataKomentar {
  ipAddress: string;
  userAgent: string;
  platform: string;
  browser: string;
  lokasi: LokasiKomentar;
  bahasa: string;
  timezone: string;
  deviceInfo: DeviceInfo;
  sessionId: string;
  referrer?: string;
  utm: UTMParameters;
  fingerprint: string;
}

// Interface untuk lokasi komentar
export interface LokasiKomentar {
  negara: string;
  provinsi: string;
  kota: string;
  koordinat?: {
    latitude: number;
    longitude: number;
  };
  akurasi: 'tinggi' | 'sedang' | 'rendah';
}

// Interface untuk informasi device
export interface DeviceInfo {
  tipe: 'desktop' | 'mobile' | 'tablet';
  os: string;
  osVersion: string;
  screenResolution: string;
  colorDepth: number;
  touchSupport: boolean;
}

// Interface untuk parameter UTM
export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// Interface untuk lampiran komentar
export interface LampiranKomentar {
  id: string;
  tipe: 'gambar' | 'video' | 'dokumen' | 'audio';
  nama: string;
  url: string;
  ukuran: number;
  format: string;
  thumbnail?: string;
  deskripsi?: string;
  metadata: MetadataLampiran;
  statusModerasiLampiran: StatusModerasiLampiran;
}

// Interface untuk metadata lampiran
export interface MetadataLampiran {
  dimensi?: {
    width: number;
    height: number;
  };
  durasi?: number; // untuk video/audio
  resolusi?: string;
  kualitas?: string;
  checksum: string;
  virusScan: boolean;
  contentType: string;
}

// Interface untuk status moderasi lampiran
export interface StatusModerasiLampiran {
  disetujui: boolean;
  alasanPenolakan?: string;
  flagKonten: FlagKonten[];
  scoreKeamanan: number;
  tanggalModerasiLampiran: Date;
}

// Interface untuk flag konten
export interface FlagKonten {
  tipe: 'spam' | 'inappropriate' | 'copyright' | 'violence' | 'adult' | 'fake';
  tingkatKeparahan: 'rendah' | 'sedang' | 'tinggi' | 'kritis';
  confidence: number;
  deskripsi: string;
}

// Interface untuk interaksi komentar
export interface InteraksiKomentar {
  jumlahLike: number;
  jumlahDislike: number;
  jumlahBalasan: number;
  jumlahLaporan: number;
  jumlahShare: number;
  jumlahView: number;
  ratingHelpful: number; // Seberapa membantu komentar ini
  interaksiPengguna: InteraksiPengguna[];
  scorePopularitas: number;
  trendInteraksi: TrendInteraksi[];
}

// Interface untuk interaksi pengguna
export interface InteraksiPengguna {
  userId: string;
  tipeInteraksi: 'like' | 'dislike' | 'share' | 'report' | 'helpful' | 'not_helpful';
  tanggal: Date;
  komentar?: string;
}

// Interface untuk trend interaksi
export interface TrendInteraksi {
  periode: string;
  jumlahLike: number;
  jumlahDislike: number;
  jumlahView: number;
  scoreEngagement: number;
}

// Interface untuk moderasi
export interface Moderasi {
  statusModerasiKomentar: 'pending' | 'approved' | 'rejected' | 'flagged';
  scoreSpam: number;
  scoreToksisitas: number;
  scoreKualitas: number;
  flagOtomatis: FlagOtomatis[];
  riwayatModerasiKomentar: RiwayatModerasiKomentar[];
  moderatorAssigned?: string;
  prioritasModerasiKomentar: 'rendah' | 'sedang' | 'tinggi' | 'urgent';
  estimasiWaktuModerasiKomentar: number; // dalam menit
  alasanModerasiKomentar?: string;
  tindakanModerasiKomentar?: TindakanModerasiKomentar[];
}

// Interface untuk flag otomatis
export interface FlagOtomatis {
  tipe: string;
  confidence: number;
  alasan: string;
  timestamp: Date;
  algoritma: string;
  versi: string;
}

// Interface untuk riwayat moderasi
export interface RiwayatModerasiKomentar {
  id: string;
  moderatorId: string;
  aksi: string;
  alasan: string;
  tanggal: Date;
  statusSebelum: string;
  statusSesudah: string;
  catatan?: string;
}

// Interface untuk tindakan moderasi
export interface TindakanModerasiKomentar {
  tipe: 'approve' | 'reject' | 'edit' | 'hide' | 'warn' | 'ban';
  deskripsi: string;
  otomatis: boolean;
  tanggal: Date;
  moderatorId?: string;
}

// Interface untuk informasi pengguna
export interface InformasiPengguna {
  id: string;
  nama: string;
  email: string;
  avatar?: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badge: Badge[];
  reputasi: number;
  jumlahKomentar: number;
  ratingRataRata: number;
  tanggalBergabung: Date;
  statusVerifikasi: StatusVerifikasi;
  preferensi: PreferensiPengguna;
}

// Interface untuk badge pengguna
export interface Badge {
  id: string;
  nama: string;
  deskripsi: string;
  ikon: string;
  warna: string;
  kategori: string;
  tanggalDiperoleh: Date;
  kriteria: string;
}

// Interface untuk status verifikasi
export interface StatusVerifikasi {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  dealerVerified: boolean;
  expertVerified: boolean;
}

// Interface untuk preferensi pengguna
export interface PreferensiPengguna {
  notifikasiEmail: boolean;
  notifikasiPush: boolean;
  showRealName: boolean;
  allowDirectMessage: boolean;
  publicProfile: boolean;
  autoSubscribe: boolean;
}

// Interface untuk informasi mobil
export interface InformasiMobil {
  id: string;
  nama: string;
  merek: string;
  model: string;
  tahun: number;
  harga: number;
  gambar: string;
  kategori: string;
  status: 'available' | 'sold' | 'reserved';
  dealer: InformasiDealer;
  spesifikasi: SpesifikasiRingkas;
}

// Interface untuk informasi dealer
export interface InformasiDealer {
  id: string;
  nama: string;
  lokasi: string;
  rating: number;
  jumlahReview: number;
  verified: boolean;
}

// Interface untuk spesifikasi ringkas
export interface SpesifikasiRingkas {
  mesin: string;
  transmisi: string;
  bahanBakar: string;
  kapasitasPenumpang: number;
}

// Interface untuk konteks komentar
export interface KonteksKomentar {
  halaman: string; // detail mobil, listing, comparison, dll
  section: string; // review, qa, general
  referensi?: string; // ID referensi jika ada
  campaign?: string; // Jika bagian dari campaign
  event?: string; // Jika bagian dari event
  konteksTambahan: { [key: string]: any };
}

// Interface untuk pengaturan privasi
export interface PengaturanPrivasi {
  publik: boolean;
  anonimous: boolean;
  hideLocation: boolean;
  hideDevice: boolean;
  allowReply: boolean;
  allowMention: boolean;
  visibilitas: 'public' | 'registered' | 'friends' | 'private';
  pembatasan: PembatasanPrivasi[];
}

// Interface untuk pembatasan privasi
export interface PembatasanPrivasi {
  tipe: 'user' | 'role' | 'location' | 'time';
  nilai: string;
  aksi: 'allow' | 'deny';
}

// Interface untuk riwayat edit
export interface RiwayatEdit {
  id: string;
  kontenSebelum: string;
  kontenSesudah: string;
  alasanEdit: string;
  tanggalEdit: Date;
  editorId: string;
  tipeEdit: 'user' | 'moderator' | 'system';
  perubahan: PerubahanEdit[];
}

// Interface untuk perubahan edit
export interface PerubahanEdit {
  field: string;
  nilaiLama: any;
  nilaiBaru: any;
  tipePerubahan: 'add' | 'remove' | 'modify';
}

// Interface untuk pengaturan notifikasi
export interface PengaturanNotifikasi {
  notifikasiBalasan: boolean;
  notifikasiLike: boolean;
  notifikasiMention: boolean;
  notifikasiModerasiKomentar: boolean;
  frekuensiNotifikasi: 'realtime' | 'hourly' | 'daily' | 'weekly';
  channelNotifikasi: ChannelNotifikasi[];
  templateNotifikasi: TemplateNotifikasi;
}

// Interface untuk channel notifikasi
export interface ChannelNotifikasi {
  tipe: 'email' | 'push' | 'sms' | 'in_app';
  aktif: boolean;
  pengaturan: { [key: string]: any };
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
  deskripsi: string;
  tipe: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
}

// Interface untuk analitik komentar
export interface AnalitikKomentar {
  viewCount: number;
  uniqueViewCount: number;
  engagementRate: number;
  responseRate: number;
  shareCount: number;
  clickThroughRate: number;
  conversionRate: number;
  sentimentScore: number;
  qualityScore: number;
  influenceScore: number;
  viralityScore: number;
  timeToFirstResponse: number;
  averageResponseTime: number;
  peakEngagementTime: Date;
  geografisAnalitik: GeografisAnalitik;
  demografisAnalitik: DemografisAnalitik;
  behavioralAnalitik: BehavioralAnalitik;
}

// Interface untuk geografis analitik
export interface GeografisAnalitik {
  negara: { [key: string]: number };
  provinsi: { [key: string]: number };
  kota: { [key: string]: number };
  timezone: { [key: string]: number };
}

// Interface untuk demografis analitik
export interface DemografisAnalitik {
  usia: { [key: string]: number };
  gender: { [key: string]: number };
  pendidikan: { [key: string]: number };
  pekerjaan: { [key: string]: number };
}

// Interface untuk behavioral analitik
export interface BehavioralAnalitik {
  deviceType: { [key: string]: number };
  browser: { [key: string]: number };
  platform: { [key: string]: number };
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
}

// Interface untuk kriteria pencarian komentar
export interface KriteriaPencarianKomentar {
  query?: string;
  mobilId?: string;
  userId?: string;
  tipeKomentar?: string[];
  rating?: {
    minimum: number;
    maksimum: number;
  };
  tanggal?: RentangTanggal;
  status?: string[];
  lokasi?: string[];
  bahasa?: string[];
  hasLampiran?: boolean;
  sortBy?: 'tanggal' | 'rating' | 'popularitas' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  halaman?: number;
  batasPerHalaman?: number;
  filterLanjutan?: FilterLanjutanKomentar;
}

// Interface untuk rentang tanggal
export interface RentangTanggal {
  mulai: Date;
  selesai: Date;
}

// Interface untuk filter lanjutan komentar
export interface FilterLanjutanKomentar {
  scoreSpam?: {
    minimum: number;
    maksimum: number;
  };
  scoreKualitas?: {
    minimum: number;
    maksimum: number;
  };
  jumlahInteraksi?: {
    minimum: number;
    maksimum: number;
  };
  hasBalasan?: boolean;
  isParent?: boolean;
  moderatorId?: string;
  flagged?: boolean;
  verified?: boolean;
}

// Interface untuk hasil pencarian komentar
export interface HasilPencarianKomentar {
  komentar: DataKomentar[];
  totalHasil: number;
  halamanSaatIni: number;
  totalHalaman: number;
  waktuPencarian: number;
  filterTerapan: FilterTerapanKomentar;
  saran: SaranPencarianKomentar[];
  statistik: StatistikPencarianKomentar;
  pengelompokan: PengelompokanHasilKomentar[];
  rekomendasi: RekomendasiPencarianKomentar[];
}

// Interface untuk filter terapan komentar
export interface FilterTerapanKomentar {
  kriteria: KriteriaPencarianKomentar;
  jumlahFilter: number;
  filterAktif: FilterAktifKomentar[];
}

// Interface untuk filter aktif komentar
export interface FilterAktifKomentar {
  nama: string;
  nilai: string;
  jumlahHasil: number;
}

// Interface untuk saran pencarian komentar
export interface SaranPencarianKomentar {
  teks: string;
  tipe: 'koreksi' | 'alternatif' | 'pelengkap';
  relevansi: number;
}

// Interface untuk statistik pencarian komentar
export interface StatistikPencarianKomentar {
  distribusiTipe: DistribusiTipeKomentar[];
  distribusiRating: DistribusiRatingKomentar[];
  distribusiTanggal: DistribusiTanggalKomentar[];
  distribusiLokasi: DistribusiLokasiKomentar[];
  trendPencarian: TrendPencarianKomentar[];
}

// Interface untuk distribusi tipe komentar
export interface DistribusiTipeKomentar {
  tipe: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk distribusi rating komentar
export interface DistribusiRatingKomentar {
  rating: number;
  jumlah: number;
  persentase: number;
}

// Interface untuk distribusi tanggal komentar
export interface DistribusiTanggalKomentar {
  periode: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk distribusi lokasi komentar
export interface DistribusiLokasiKomentar {
  lokasi: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk trend pencarian komentar
export interface TrendPencarianKomentar {
  periode: string;
  jumlahPencarian: number;
  keywordPopuler: string[];
}

// Interface untuk pengelompokan hasil komentar
export interface PengelompokanHasilKomentar {
  kriteria: string;
  grup: GrupHasilKomentar[];
}

// Interface untuk grup hasil komentar
export interface GrupHasilKomentar {
  nama: string;
  jumlah: number;
  items: DataKomentar[];
}

// Interface untuk rekomendasi pencarian komentar
export interface RekomendasiPencarianKomentar {
  tipe: 'filter' | 'sort' | 'keyword';
  deskripsi: string;
  aksi: string;
  manfaat: string;
}

// Interface untuk statistik komentar
export interface StatistikKomentar {
  ringkasan: RingkasanKomentar;
  distribusi: DistribusiKomentar;
  aktivitas: AktivitasKomentar;
  performa: PerformaKomentar;
  moderasi: StatistikModerasiKomentar;
  sentiment: AnalisisSentiment;
  trend: TrendKomentar;
  analisis: AnalisisKomentar;
  prediksi: PrediksiKomentar;
  rekomendasi: RekomendasiKomentar;
  periode: PeriodeStatistik;
}

// Interface untuk ringkasan komentar
export interface RingkasanKomentar {
  totalKomentar: number;
  komentarAktif: number;
  komentarPending: number;
  komentarDitolak: number;
  ratingRataRata: number;
  tingkatPersetujuan: number;
  tingkatBalasan: number;
  waktuRataRataRespon: number;
}

// Interface untuk distribusi komentar
export interface DistribusiKomentar {
  perTipe: DistribusiTipeKomentar[];
  perRating: DistribusiRatingKomentar[];
  perMobil: DistribusiMobilKomentar[];
  perPengguna: DistribusiPenggunaKomentar[];
  perLokasi: DistribusiLokasiKomentar[];
  perWaktu: DistribusiWaktuKomentar[];
}

// Interface untuk distribusi mobil komentar
export interface DistribusiMobilKomentar {
  mobilId: string;
  namaMobil: string;
  jumlah: number;
  persentase: number;
  ratingRataRata: number;
}

// Interface untuk distribusi pengguna komentar
export interface DistribusiPenggunaKomentar {
  level: string;
  jumlah: number;
  persentase: number;
  ratingRataRata: number;
}

// Interface untuk distribusi waktu komentar
export interface DistribusiWaktuKomentar {
  jam: number;
  jumlah: number;
  persentase: number;
}

// Interface untuk aktivitas komentar
export interface AktivitasKomentar {
  komentarHarian: AktivitasHarianKomentar[];
  interaksiHarian: AktivitasHarianKomentar[];
  moderasiHarian: AktivitasHarianKomentar[];
  jamSibuk: JamSibukKomentar[];
  hariAktif: HariAktifKomentar[];
}

// Interface untuk aktivitas harian komentar
export interface AktivitasHarianKomentar {
  tanggal: Date;
  jumlah: number;
  persentasePerubahan: number;
}

// Interface untuk jam sibuk komentar
export interface JamSibukKomentar {
  jam: number;
  jumlahAktivitas: number;
  tipeAktivitas: string[];
}

// Interface untuk hari aktif komentar
export interface HariAktifKomentar {
  hari: string;
  jumlahAktivitas: number;
  jenisAktivitas: JenisAktivitasKomentar[];
}

// Interface untuk jenis aktivitas komentar
export interface JenisAktivitasKomentar {
  jenis: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk performa komentar
export interface PerformaKomentar {
  engagementRate: number;
  responseRate: number;
  approvalRate: number;
  qualityScore: number;
  sentimentScore: number;
  viralityIndex: number;
  influenceScore: number;
  retentionRate: number;
  conversionRate: number;
  satisfactionScore: number;
  topPerformers: TopPerformerKomentar[];
  benchmarking: BenchmarkingKomentar;
}

// Interface untuk top performer komentar
export interface TopPerformerKomentar {
  komentarId: string;
  metrik: string;
  nilai: number;
  ranking: number;
}

// Interface untuk benchmarking komentar
export interface BenchmarkingKomentar {
  industryAverage: { [key: string]: number };
  competitorComparison: { [key: string]: number };
  historicalComparison: { [key: string]: number };
}

// Interface untuk statistik moderasi komentar
export interface StatistikModerasiKomentar {
  totalModerasiKomentar: number;
  moderasiPending: number;
  moderasiSelesai: number;
  tingkatPersetujuan: number;
  waktuRataRataModerasiKomentar: number;
  distribusiModerator: DistribusiModeratorKomentar[];
  trendModerasiKomentar: TrendModerasiKomentar[];
  efisiensiModerasiKomentar: EfisiensiModerasiKomentar;
}

// Interface untuk distribusi moderator komentar
export interface DistribusiModeratorKomentar {
  moderatorId: string;
  namaModerator: string;
  jumlahModerasiKomentar: number;
  tingkatPersetujuan: number;
  waktuRataRata: number;
}

// Interface untuk trend moderasi komentar
export interface TrendModerasiKomentar {
  periode: string;
  jumlahModerasiKomentar: number;
  tingkatPersetujuan: number;
  waktuRataRata: number;
}

// Interface untuk efisiensi moderasi komentar
export interface EfisiensiModerasiKomentar {
  automationRate: number;
  accuracyRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  costPerModeration: number;
}

// Interface untuk analisis sentiment
export interface AnalisisSentiment {
  distribusiSentiment: DistribusiSentiment[];
  trendSentiment: TrendSentiment[];
  sentimentPerMobil: SentimentPerMobil[];
  sentimentPerKategori: SentimentPerKategori[];
  faktorSentiment: FaktorSentiment[];
}

// Interface untuk distribusi sentiment
export interface DistribusiSentiment {
  sentiment: 'positif' | 'netral' | 'negatif';
  jumlah: number;
  persentase: number;
  confidence: number;
}

// Interface untuk trend sentiment
export interface TrendSentiment {
  periode: string;
  sentimentScore: number;
  perubahan: number;
  faktorUtama: string[];
}

// Interface untuk sentiment per mobil
export interface SentimentPerMobil {
  mobilId: string;
  namaMobil: string;
  sentimentScore: number;
  distribusi: DistribusiSentiment[];
}

// Interface untuk sentiment per kategori
export interface SentimentPerKategori {
  kategori: string;
  sentimentScore: number;
  distribusi: DistribusiSentiment[];
}

// Interface untuk faktor sentiment
export interface FaktorSentiment {
  faktor: string;
  dampak: number;
  frekuensi: number;
  contohKomentar: string[];
}

// Interface untuk trend komentar
export interface TrendKomentar {
  trendBulanan: TrendBulananKomentar[];
  trendTopik: TrendTopikKomentar[];
  trendInteraksi: TrendInteraksiKomentar[];
  prediksiTrend: PrediksiTrendKomentar[];
}

// Interface untuk trend bulanan komentar
export interface TrendBulananKomentar {
  bulan: string;
  tahun: number;
  jumlahKomentar: number;
  pertumbuhanPersentase: number;
  topikPopuler: string[];
}

// Interface untuk trend topik komentar
export interface TrendTopikKomentar {
  topik: string;
  trendData: DataTrendKomentar[];
  statusTrend: 'naik' | 'turun' | 'stabil';
  prediksiPertumbuhan: number;
}

// Interface untuk data trend komentar
export interface DataTrendKomentar {
  periode: string;
  nilai: number;
  perubahan: number;
}

// Interface untuk trend interaksi komentar
export interface TrendInteraksiKomentar {
  tipeInteraksi: string;
  trendData: DataTrendKomentar[];
  statusTrend: 'naik' | 'turun' | 'stabil';
}

// Interface untuk prediksi trend komentar
export interface PrediksiTrendKomentar {
  aspek: string;
  prediksi: string;
  tingkatKepercayaan: number;
  faktorPendukung: string[];
  timeframe: string;
}

// Interface untuk analisis komentar
export interface AnalisisKomentar {
  polaKomentar: PolaKomentar[];
  segmentasiPengguna: SegmentasiPenggunaKomentar[];
  analisisKorelasi: AnalisisKorelasiKomentar[];
  insightBisnis: InsightBisnisKomentar[];
  rekomendasiOptimasi: RekomendasiOptimasiKomentar[];
}

// Interface untuk pola komentar
export interface PolaKomentar {
  pola: string;
  deskripsi: string;
  frekuensi: number;
  dampak: string;
  rekomendasi: string;
}

// Interface untuk segmentasi pengguna komentar
export interface SegmentasiPenggunaKomentar {
  segmen: string;
  karakteristik: string[];
  ukuranSegmen: number;
  nilaiSegmen: number;
  strategiTargeting: string[];
}

// Interface untuk analisis korelasi komentar
export interface AnalisisKorelasiKomentar {
  variabel1: string;
  variabel2: string;
  korelasiScore: number;
  signifikansi: string;
  interpretasi: string;
}

// Interface untuk insight bisnis komentar
export interface InsightBisnisKomentar {
  kategori: string;
  insight: string;
  dampakBisnis: string;
  actionItem: string[];
  prioritas: string;
}

// Interface untuk rekomendasi optimasi komentar
export interface RekomendasiOptimasiKomentar {
  area: string;
  rekomendasi: string;
  dampakEstimasi: string;
  tingkatKesulitan: string;
  estimasiWaktu: string;
}

// Interface untuk prediksi komentar
export interface PrediksiKomentar {
  prediksiVolume: PrediksiVolumeKomentar;
  prediksiSentiment: PrediksiSentimentKomentar;
  prediksiTrend: PrediksiTrendKomentar[];
  risikoModerasiKomentar: RisikoModerasiKomentar;
  peluangEngagement: PeluangEngagementKomentar[];
}

// Interface untuk prediksi volume komentar
export interface PrediksiVolumeKomentar {
  periode: string;
  volumeEstimasi: number;
  tingkatKepercayaan: number;
  faktorPendorong: string[];
  skenario: SkenarioPrediksiKomentar[];
}

// Interface untuk skenario prediksi komentar
export interface SkenarioPrediksiKomentar {
  nama: string;
  probabilitas: number;
  dampak: string;
  mitigasi: string[];
}

// Interface untuk prediksi sentiment komentar
export interface PrediksiSentimentKomentar {
  periode: string;
  sentimentEstimasi: number;
  distribusiEstimasi: DistribusiSentiment[];
  faktorPengaruh: string[];
}

// Interface untuk risiko moderasi komentar
export interface RisikoModerasiKomentar {
  tingkatRisiko: string;
  faktorRisiko: FaktorRisikoKomentar[];
  prediksiBebanModerasiKomentar: number;
  strategiMitigasi: string[];
}

// Interface untuk faktor risiko komentar
export interface FaktorRisikoKomentar {
  faktor: string;
  bobot: number;
  dampak: string;
  mitigasi: string;
}

// Interface untuk peluang engagement komentar
export interface PeluangEngagementKomentar {
  kategori: string;
  peluang: string;
  potensiNilai: number;
  probabilitasKeberhasilan: number;
  strategiPendekatan: string[];
}

// Interface untuk rekomendasi komentar
export interface RekomendasiKomentar {
  rekomendasiKonten: RekomendasiKontenKomentar[];
  rekomendasiModerasiKomentar: RekomendasiModerasiKomentar[];
  rekomendasiEngagement: RekomendasiEngagementKomentar[];
  rekomendasiOptimasi: RekomendasiOptimasiKomentar[];
}

// Interface untuk rekomendasi konten komentar
export interface RekomendasiKontenKomentar {
  topik: string;
  alasanRekomendasi: string;
  potensiManfaat: string[];
  langkahImplementasi: string[];
}

// Interface untuk rekomendasi moderasi komentar
export interface RekomendasiModerasiKomentar {
  area: string;
  rekomendasi: string;
  dampakEstimasi: string;
  resourceDibutuhkan: string[];
  timeline: string;
}

// Interface untuk rekomendasi engagement komentar
export interface RekomendasiEngagementKomentar {
  strategi: string;
  deskripsi: string;
  targetAudience: string;
  expectedOutcome: string;
  implementationSteps: string[];
}

// Interface untuk periode statistik
export interface PeriodeStatistik {
  mulai: Date;
  selesai: Date;
  tipeperiode: 'harian' | 'mingguan' | 'bulanan' | 'tahunan' | 'custom';
  deskripsi: string;
}

// Interface untuk respons layanan
export interface ResponLayanan<T> {
  sukses: boolean;
  data?: T;
  pesan: string;
  kodeStatus: number;
  waktuProses: number;
  error?: {
    kode: string;
    detail: string;
    stack?: string;
  };
  metadata?: {
    totalData?: number;
    halaman?: number;
    batasPerHalaman?: number;
    waktuCache?: number;
    versiAPI?: string;
  };
}

// ==================== LAYANAN KOMENTAR CLASS ====================

class LayananKomentar {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 menit

  // ==================== METODE UTAMA ====================

  /**
   * Mengambil semua komentar dengan kriteria tertentu
   */
  async ambilSemuaKomentar(
    kriteria?: KriteriaPencarianKomentar
  ): Promise<ResponLayanan<HasilPencarianKomentar>> {
    try {
      const cacheKey = `komentar_all_${JSON.stringify(kriteria)}`;
      const cached = this.ambilDariCache<HasilPencarianKomentar>(cacheKey);
      
      if (cached) {
        return {
          sukses: true,
          data: cached,
          pesan: 'Data komentar berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      // Simulasi delay untuk mengambil data
      await this.simulasiDelay(300);

      // Generate data komentar sample
      const komentar: DataKomentar[] = [];
      const jumlahKomentar = Math.floor(Math.random() * 20) + 5;

      for (let i = 0; i < jumlahKomentar; i++) {
        const sampleKomentar = await this.generateKomentarSample(1);
         komentar.push(...sampleKomentar);
      }

      const hasilPencarian: HasilPencarianKomentar = {
        komentar,
        totalHasil: komentar.length,
        halamanSaatIni: 1,
        totalHalaman: 1,
        waktuPencarian: 300,
        filterTerapan: {
          kriteria: kriteria || {},
          jumlahFilter: 0,
          filterAktif: []
        },
        saran: [],
        statistik: {
          distribusiTipe: [
            { tipe: 'review', jumlah: 15, persentase: 60 },
            { tipe: 'pertanyaan', jumlah: 8, persentase: 32 },
            { tipe: 'keluhan', jumlah: 2, persentase: 8 }
          ],
          distribusiRating: [
            { rating: 5, jumlah: 10, persentase: 40 },
            { rating: 4, jumlah: 7, persentase: 28 },
            { rating: 3, jumlah: 5, persentase: 20 },
            { rating: 2, jumlah: 2, persentase: 8 },
            { rating: 1, jumlah: 1, persentase: 4 }
          ],
          distribusiTanggal: [
            { periode: 'hari ini', jumlah: 5, persentase: 20 },
            { periode: 'minggu ini', jumlah: 15, persentase: 60 },
            { periode: 'bulan ini', jumlah: 25, persentase: 100 }
          ],
          distribusiLokasi: [
            { lokasi: 'Jakarta', jumlah: 12, persentase: 48 },
            { lokasi: 'Surabaya', jumlah: 8, persentase: 32 },
            { lokasi: 'Bandung', jumlah: 5, persentase: 20 }
          ],
          trendPencarian: [
             { periode: 'harian', jumlahPencarian: 15, keywordPopuler: ['harga'] },
             { periode: 'mingguan', jumlahPencarian: 12, keywordPopuler: ['spesifikasi'] },
             { periode: 'bulanan', jumlahPencarian: 10, keywordPopuler: ['review'] }
           ]
        },
        pengelompokan: [],
        rekomendasi: []
      };

      // Simpan ke cache
      this.simpanKeCache(cacheKey, hasilPencarian);

      return {
        sukses: true,
        data: hasilPencarian,
        pesan: 'Data komentar berhasil diambil',
        kodeStatus: 200,
        waktuProses: 300
      };

    } catch (error) {
      return this.handleError('Gagal mengambil data komentar', error);
    }
  }

   private async generateStatistikKomentar(periode: string): Promise<any> {
     return {
       totalKomentar: Math.floor(Math.random() * 1000) + 100,
       komentarBaru: Math.floor(Math.random() * 50) + 10,
       ratingRataRata: Math.round((Math.random() * 2 + 3) * 10) / 10,
       tingkatRespons: Math.round(Math.random() * 100),
       periode: periode
     };
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
     this.cache.forEach((value, key) => {
       if (key.includes(pattern)) {
         this.cache.delete(key);
       }
     });
   }

   private updateStatusModerasiKomentar(moderasi: any, aksi: string, alasan?: string): any {
     return {
       ...moderasi,
       status: aksi === 'approve' ? 'approved' : 'rejected',
       alasan: alasan || '',
       tanggalDiproses: new Date(),
       diprosesoleh: 'system'
     };
   }

   private handleError(message: string, error: any): ResponLayanan<any> {
     console.error(message, error);
     return {
       sukses: false,
       pesan: message,
       kodeStatus: 500,
       waktuProses: 100,
       data: null
     };
   }

   /**
    * Menyimpan komentar baru
    */
   async simpanKomentar(dataKomentar: Partial<DataKomentar>): Promise<ResponLayanan<DataKomentar>> {
     try {
       await this.simulasiDelay(400);

      // Validasi data
      const validasi = await this.validasiDataKomentar(dataKomentar);
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: `Validasi gagal: ${validasi.errors.join(', ')}`,
          kodeStatus: 400,
          waktuProses: 100
        };
      }

      // Generate data lengkap
      const komentarLengkap: DataKomentar = {
        id: this.generateId(),
        parentId: dataKomentar.parentId,
        mobilId: dataKomentar.mobilId!,
        userId: dataKomentar.userId!,
        konten: dataKomentar.konten!,
        rating: dataKomentar.rating,
        tipeKomentar: dataKomentar.tipeKomentar || 'review',
        statusKomentar: await this.getDefaultStatusKomentar(),
        metadata: await this.generateMetadataKomentar(),
        lampiran: dataKomentar.lampiran || [],
        interaksi: await this.getDefaultInteraksiKomentar(),
        moderasi: await this.getDefaultModerasiKomentar(),
        balasan: [],
        tanggalDibuat: new Date(),
        tanggalDiperbarui: new Date(),
        informasiPengguna: await this.ambilInformasiPengguna(dataKomentar.userId!),
        informasiMobil: await this.ambilInformasiMobil(dataKomentar.mobilId!),
        konteksKomentar: dataKomentar.konteksKomentar || await this.getDefaultKonteksKomentar(),
        pengaturanPrivasi: await this.getDefaultPengaturanPrivasi(),
        riwayatEdit: [],
        notifikasi: await this.getDefaultPengaturanNotifikasi(),
        analitik: await this.getDefaultAnalitikKomentar()
      };

      // Simulasi penyimpanan
      await this.simulasiPenyimpanan(komentarLengkap);

      // Hapus cache terkait
      this.hapusCachePattern('komentar_');

      return {
        sukses: true,
        data: komentarLengkap,
        pesan: 'Komentar berhasil disimpan',
        kodeStatus: 201,
        waktuProses: 400
      };

    } catch (error) {
      return this.handleError('Gagal menyimpan komentar', error);
    }
  }

  /**
   * Mengambil detail komentar berdasarkan ID
   */
  async ambilDetailKomentar(komentarId: string): Promise<ResponLayanan<DataKomentar>> {
    try {
      const cacheKey = `komentar_detail_${komentarId}`;
      const cached = this.ambilDariCache<DataKomentar>(cacheKey);
      
      if (cached) {
        return {
          sukses: true,
          data: cached,
          pesan: 'Detail komentar berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      await this.simulasiDelay(200);

      // Generate sample data
      const komentar = await this.generateKomentarSample(1);
      const detailKomentar = komentar[0];
      detailKomentar.id = komentarId;

      this.simpanKeCache(cacheKey, detailKomentar);

      return {
        sukses: true,
        data: detailKomentar,
        pesan: 'Detail komentar berhasil diambil',
        kodeStatus: 200,
        waktuProses: 200
      };

    } catch (error) {
      return this.handleError('Gagal mengambil detail komentar', error);
    }
  }

  /**
   * Memperbarui komentar
   */
  async perbaruiKomentar(
    komentarId: string, 
    dataUpdate: Partial<DataKomentar>
  ): Promise<ResponLayanan<DataKomentar>> {
    try {
      await this.simulasiDelay(350);

      // Ambil data komentar yang ada
      const komentarExisting = await this.ambilDetailKomentar(komentarId);
      if (!komentarExisting.sukses || !komentarExisting.data) {
        return {
          sukses: false,
          pesan: 'Komentar tidak ditemukan',
          kodeStatus: 404,
          waktuProses: 100
        };
      }

      // Validasi update
      const validasi = await this.validasiDataKomentar(dataUpdate);
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: `Validasi gagal: ${validasi.errors.join(', ')}`,
          kodeStatus: 400,
          waktuProses: 100
        };
      }

      // Update data
      const komentarUpdated: DataKomentar = {
        ...komentarExisting.data,
        ...dataUpdate,
        tanggalDiperbarui: new Date(),
        riwayatEdit: [
          ...komentarExisting.data.riwayatEdit,
          await this.generateRiwayatEdit(komentarExisting.data, dataUpdate)
        ]
      };

      // Simulasi penyimpanan
      await this.simulasiPenyimpanan(komentarUpdated);

      // Hapus cache terkait
      this.hapusCachePattern('komentar_');

      return {
        sukses: true,
        data: komentarUpdated,
        pesan: 'Komentar berhasil diperbarui',
        kodeStatus: 200,
        waktuProses: 350
      };

    } catch (error) {
      return this.handleError('Gagal memperbarui komentar', error);
    }
  }

  /**
   * Menghapus komentar
   */
  async hapusKomentar(komentarId: string): Promise<ResponLayanan<boolean>> {
    try {
      await this.simulasiDelay(250);

      // Simulasi penghapusan
      await this.simulasiPenyimpanan({ id: komentarId, deleted: true });

      // Hapus cache terkait
      this.hapusCachePattern('komentar_');

      return {
        sukses: true,
        data: true,
        pesan: 'Komentar berhasil dihapus',
        kodeStatus: 200,
        waktuProses: 250
      };

    } catch (error) {
      return this.handleError('Gagal menghapus komentar', error);
    }
  }

  /**
   * Mencari komentar berdasarkan kriteria
   */
  async cariKomentar(
    kriteria: KriteriaPencarianKomentar
  ): Promise<ResponLayanan<HasilPencarianKomentar>> {
    try {
      const cacheKey = `komentar_search_${JSON.stringify(kriteria)}`;
      const cached = this.ambilDariCache<HasilPencarianKomentar>(cacheKey);
      
      if (cached) {
        return {
          sukses: true,
          data: cached,
          pesan: 'Hasil pencarian komentar berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      await this.simulasiDelay(400);

      // Generate sample data
      const semuaKomentar = await this.generateKomentarSample(100);
      
      // Filter berdasarkan kriteria
      const komentarTerfilter = this.filterKomentar(semuaKomentar, kriteria);
      const hasilPencarian = await this.prosesHasilPencarianKomentar(komentarTerfilter, kriteria);

      this.simpanKeCache(cacheKey, hasilPencarian);

      return {
        sukses: true,
        data: hasilPencarian,
        pesan: 'Pencarian komentar berhasil',
        kodeStatus: 200,
        waktuProses: 400,
        metadata: {
          totalData: hasilPencarian.totalHasil,
          halaman: hasilPencarian.halamanSaatIni,
          batasPerHalaman: kriteria.batasPerHalaman || 20
        }
      };

    } catch (error) {
      return this.handleError('Gagal mencari komentar', error);
    }
  }

  /**
   * Mengambil statistik komentar
   */
  async ambilStatistikKomentar(
    periode?: PeriodeStatistik
  ): Promise<ResponLayanan<StatistikKomentar>> {
    try {
      const cacheKey = `komentar_stats_${JSON.stringify(periode)}`;
      const cached = this.ambilDariCache<StatistikKomentar>(cacheKey);
      
      if (cached) {
        return {
          sukses: true,
          data: cached,
          pesan: 'Statistik komentar berhasil diambil dari cache',
          kodeStatus: 200,
          waktuProses: 50
        };
      }

      await this.simulasiDelay(500);

      const statistik = await this.generateStatistikKomentar(periode?.toString() || 'bulanan');
      this.simpanKeCache(cacheKey, statistik);

      return {
        sukses: true,
        data: statistik,
        pesan: 'Statistik komentar berhasil diambil',
        kodeStatus: 200,
        waktuProses: 500
      };

    } catch (error) {
      return this.handleError('Gagal mengambil statistik komentar', error);
    }
  }

  /**
   * Mengelola moderasi komentar
   */
  async kelolaModerasiKomentar(
    komentarId: string,
    aksi: 'approve' | 'reject' | 'flag' | 'unflag',
    alasan?: string
  ): Promise<ResponLayanan<DataKomentar>> {
    try {
      await this.simulasiDelay(300);

      // Ambil data komentar
      const komentarResponse = await this.ambilDetailKomentar(komentarId);
      if (!komentarResponse.sukses || !komentarResponse.data) {
        return {
          sukses: false,
          pesan: 'Komentar tidak ditemukan',
          kodeStatus: 404,
          waktuProses: 100
        };
      }

      const komentar = komentarResponse.data;

      // Update status moderasi
      const statusBaru = this.updateStatusModerasiKomentar(komentar.moderasi, aksi, alasan);
      const komentarUpdated: DataKomentar = {
        ...komentar,
        moderasi: statusBaru,
        tanggalDiperbarui: new Date()
      };

      // Simulasi penyimpanan
      await this.simulasiPenyimpanan(komentarUpdated);

      // Hapus cache terkait
      this.hapusCachePattern('komentar_');

      return {
        sukses: true,
        data: komentarUpdated,
        pesan: `Moderasi komentar berhasil: ${aksi}`,
        kodeStatus: 200,
        waktuProses: 300
      };

    } catch (error) {
      return this.handleError('Gagal mengelola moderasi komentar', error);
    }
  }

  // ==================== METODE PRIVATE ====================

  private async generateKomentarSample(jumlah: number): Promise<DataKomentar[]> {
    const komentar: DataKomentar[] = [];
    
    for (let i = 0; i < jumlah; i++) {
      komentar.push({
        id: this.generateId(),
        parentId: Math.random() > 0.8 ? this.generateId() : undefined,
        mobilId: this.generateId(),
        userId: this.generateId(),
        konten: this.generateKontenSample(),
        rating: Math.floor(Math.random() * 5) + 1,
        tipeKomentar: this.getRandomTipeKomentar(),
        statusKomentar: await this.generateStatusKomentarSample(),
        metadata: await this.generateMetadataKomentar(),
        lampiran: await this.generateLampiranSample(),
        interaksi: await this.generateInteraksiSample(),
        moderasi: await this.generateModerasiSample(),
        balasan: [],
        tanggalDibuat: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        tanggalDiperbarui: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        informasiPengguna: await this.generateInformasiPenggunaSample(),
        informasiMobil: await this.generateInformasiMobilSample(),
        konteksKomentar: await this.generateKonteksSample(),
        pengaturanPrivasi: await this.generatePengaturanPrivasiSample(),
        riwayatEdit: [],
        notifikasi: await this.getDefaultPengaturanNotifikasi(),
        analitik: await this.generateAnalitikSample()
      });
    }
    
    return komentar;
  }

  private generateKontenSample(): string {
    const kontenSample = [
      'Mobil yang sangat bagus, nyaman untuk keluarga dan irit bahan bakar.',
      'Pelayanan dealer sangat memuaskan, proses pembelian cepat dan mudah.',
      'Kualitas build quality mobil ini sangat baik, material interior premium.',
      'Harga sesuai dengan kualitas yang didapat, recommended untuk pembelian.',
      'Fitur keselamatan lengkap, cocok untuk berkendara jarak jauh.',
      'Desain eksterior modern dan elegan, interior spacious dan comfortable.',
      'Performa mesin responsif, transmisi halus, handling stabil.',
      'After sales service bagus, spare part mudah didapat.',
      'Konsumsi BBM ekonomis, maintenance cost terjangkau.',
      'Overall satisfied dengan pembelian ini, akan recommend ke teman.'
    ];
    
    return kontenSample[Math.floor(Math.random() * kontenSample.length)];
  }

  private getRandomTipeKomentar(): 'review' | 'pertanyaan' | 'keluhan' | 'saran' | 'testimoni' {
    const tipe = ['review', 'pertanyaan', 'keluhan', 'saran', 'testimoni'] as const;
    return tipe[Math.floor(Math.random() * tipe.length)];
  }

  private async generateStatusKomentarSample(): Promise<StatusKomentar> {
    return {
      aktif: Math.random() > 0.1,
      disetujui: Math.random() > 0.2,
      ditolak: Math.random() > 0.9,
      diarsipkan: Math.random() > 0.95,
      dihapus: false,
      dilaporkan: Math.random() > 0.95,
      disorot: Math.random() > 0.9,
      dipinned: Math.random() > 0.95,
      statusCustom: [],
      alasanStatus: 'Status otomatis dari sistem',
      moderatorId: Math.random() > 0.5 ? this.generateId() : undefined,
      tanggalStatusDiubah: new Date()
    };
  }

  private async generateMetadataKomentar(): Promise<MetadataKomentar> {
    return {
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      platform: 'Windows',
      browser: 'Chrome',
      lokasi: {
        negara: 'Indonesia',
        provinsi: 'DKI Jakarta',
        kota: 'Jakarta Selatan',
        koordinat: {
          latitude: -6.2088,
          longitude: 106.8456
        },
        akurasi: 'tinggi'
      },
      bahasa: 'id-ID',
      timezone: 'Asia/Jakarta',
      deviceInfo: {
        tipe: Math.random() > 0.5 ? 'desktop' : 'mobile',
        os: 'Windows 10',
        osVersion: '10.0.19041',
        screenResolution: '1920x1080',
        colorDepth: 24,
        touchSupport: false
      },
      sessionId: this.generateId(),
      referrer: 'https://google.com',
      utm: {
        source: 'google',
        medium: 'organic',
        campaign: 'brand_search'
      },
      fingerprint: this.generateId()
    };
  }

  private async generateLampiranSample(): Promise<LampiranKomentar[]> {
    if (Math.random() > 0.7) return [];
    
    return [
      {
        id: this.generateId(),
        tipe: 'gambar',
        nama: 'foto_mobil.jpg',
        url: '/uploads/comments/foto_mobil.jpg',
        ukuran: 1024000,
        format: 'jpeg',
        thumbnail: '/uploads/comments/thumbs/foto_mobil_thumb.jpg',
        deskripsi: 'Foto mobil dari berbagai sudut',
        metadata: {
          dimensi: {
            width: 1920,
            height: 1080
          },
          checksum: 'abc123def456',
          virusScan: true,
          contentType: 'image/jpeg'
        },
        statusModerasiLampiran: {
          disetujui: true,
          flagKonten: [],
          scoreKeamanan: 95,
          tanggalModerasiLampiran: new Date()
        }
      }
    ];
  }

  private async generateInteraksiSample(): Promise<InteraksiKomentar> {
    return {
      jumlahLike: Math.floor(Math.random() * 50),
      jumlahDislike: Math.floor(Math.random() * 5),
      jumlahBalasan: Math.floor(Math.random() * 10),
      jumlahLaporan: Math.floor(Math.random() * 2),
      jumlahShare: Math.floor(Math.random() * 15),
      jumlahView: Math.floor(Math.random() * 200) + 50,
      ratingHelpful: Math.floor(Math.random() * 5) + 1,
      interaksiPengguna: [],
      scorePopularitas: Math.floor(Math.random() * 100),
      trendInteraksi: [
        {
          periode: '2024-01',
          jumlahLike: Math.floor(Math.random() * 20),
          jumlahDislike: Math.floor(Math.random() * 3),
          jumlahView: Math.floor(Math.random() * 100),
          scoreEngagement: Math.floor(Math.random() * 100)
        }
      ]
    };
  }

  private async generateModerasiSample(): Promise<Moderasi> {
    return {
      statusModerasiKomentar: Math.random() > 0.8 ? 'pending' : 'approved',
      scoreSpam: Math.floor(Math.random() * 100),
      scoreToksisitas: Math.floor(Math.random() * 30),
      scoreKualitas: Math.floor(Math.random() * 100) + 50,
      flagOtomatis: [],
      riwayatModerasiKomentar: [],
      moderatorAssigned: Math.random() > 0.5 ? this.generateId() : undefined,
      prioritasModerasiKomentar: 'sedang',
      estimasiWaktuModerasiKomentar: Math.floor(Math.random() * 60) + 5,
      alasanModerasiKomentar: 'Moderasi otomatis sistem',
      tindakanModerasiKomentar: []
    };
  }

  private async generateInformasiPenggunaSample(): Promise<InformasiPengguna> {
    return {
      id: this.generateId(),
      nama: 'John Doe',
      email: 'john.doe@email.com',
      avatar: '/avatars/john_doe.jpg',
      level: 'gold',
      badge: [
        {
          id: this.generateId(),
          nama: 'Reviewer Aktif',
          deskripsi: 'Telah memberikan 10+ review berkualitas',
          ikon: 'star',
          warna: '#ffd700',
          kategori: 'engagement',
          tanggalDiperoleh: new Date(),
          kriteria: 'Minimal 10 review dengan rating 4+'
        }
      ],
      reputasi: Math.floor(Math.random() * 1000) + 100,
      jumlahKomentar: Math.floor(Math.random() * 50) + 5,
      ratingRataRata: Math.round((Math.random() * 2 + 3) * 10) / 10,
      tanggalBergabung: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      statusVerifikasi: {
        emailVerified: true,
        phoneVerified: Math.random() > 0.3,
        identityVerified: Math.random() > 0.7,
        dealerVerified: Math.random() > 0.9,
        expertVerified: Math.random() > 0.95
      },
      preferensi: {
        notifikasiEmail: true,
        notifikasiPush: true,
        showRealName: Math.random() > 0.5,
        allowDirectMessage: Math.random() > 0.3,
        publicProfile: Math.random() > 0.2,
        autoSubscribe: Math.random() > 0.6
      }
    };
  }

  private async generateInformasiMobilSample(): Promise<InformasiMobil> {
    return {
      id: this.generateId(),
      nama: 'Toyota Avanza',
      merek: 'Toyota',
      model: '2024',
      tahun: 2024,
      harga: 250000000,
      gambar: 'https://example.com/avanza.jpg',
      kategori: 'SUV',
      status: 'available',
      dealer: {
        id: this.generateId(),
        nama: 'Dealer Resmi Jakarta',
        lokasi: 'Jakarta Selatan',
        rating: Math.round((Math.random() * 2) + 3),
        jumlahReview: Math.floor(Math.random() * 100) + 10,
        verified: true
      },
      spesifikasi: {
        mesin: '1.3L DOHC VVT-i',
        transmisi: 'Manual 5-Speed',
        bahanBakar: 'Bensin',
        kapasitasPenumpang: 7
      }
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async generateKonteksSample(): Promise<KonteksKomentar> {
    return {
      halaman: 'detail-mobil',
      section: 'review',
      referensi: this.generateId(),
      campaign: 'promo-akhir-tahun',
      event: 'auto-show-2024',
      konteksTambahan: {
        source: 'web',
        device: 'desktop',
        browser: 'chrome'
      }
    };
  }

  private async generatePengaturanPrivasiSample(): Promise<PengaturanPrivasi> {
    return {
      publik: true,
      anonimous: false,
      hideLocation: false,
      hideDevice: false,
      allowReply: true,
      allowMention: true,
      visibilitas: 'public',
      pembatasan: []
    };
  }

  private async getDefaultPengaturanNotifikasi(): Promise<PengaturanNotifikasi> {
    return {
      notifikasiBalasan: true,
      notifikasiLike: true,
      notifikasiMention: true,
      notifikasiModerasiKomentar: false,
      frekuensiNotifikasi: 'realtime',
      channelNotifikasi: [
        {
          tipe: 'email',
          aktif: true,
          pengaturan: {}
        },
        {
          tipe: 'in_app',
          aktif: true,
          pengaturan: {}
        }
      ],
      templateNotifikasi: {
        id: this.generateId(),
        nama: 'Default Template',
        subjek: 'Notifikasi Komentar',
        konten: 'Anda memiliki notifikasi baru',
        variabel: []
      }
    };
  }

  private async generateAnalitikSample(): Promise<AnalitikKomentar> {
    return {
      viewCount: Math.floor(Math.random() * 1000) + 100,
      uniqueViewCount: Math.floor(Math.random() * 500) + 50,
      engagementRate: Math.random() * 0.1 + 0.05,
      responseRate: Math.random() * 0.3 + 0.1,
      shareCount: Math.floor(Math.random() * 50) + 5,
      clickThroughRate: Math.random() * 0.05 + 0.01,
      conversionRate: Math.random() * 0.02 + 0.005,
      sentimentScore: Math.random() * 2 - 1,
      qualityScore: Math.random() * 10 + 5,
      influenceScore: Math.random() * 100 + 10,
      viralityScore: Math.random() * 10 + 1,
      timeToFirstResponse: Math.floor(Math.random() * 3600) + 300,
      averageResponseTime: Math.floor(Math.random() * 1800) + 600,
      peakEngagementTime: new Date(),
      geografisAnalitik: {
        negara: { 'Indonesia': 100 },
        provinsi: { 'DKI Jakarta': 80, 'Jawa Barat': 20 },
        kota: { 'Jakarta Selatan': 50, 'Jakarta Pusat': 30 },
        timezone: { 'Asia/Jakarta': 100 }
      },
      demografisAnalitik: {
        usia: { '25-34': 40, '35-44': 30, '18-24': 20, '45-54': 10 },
        gender: { 'L': 60, 'P': 40 },
        pendidikan: { 'S1': 50, 'SMA': 30, 'S2': 15, 'D3': 5 },
        pekerjaan: { 'Karyawan Swasta': 40, 'Wiraswasta': 25, 'PNS': 20, 'Mahasiswa': 15 }
      },
      behavioralAnalitik: {
        deviceType: { 'desktop': 60, 'mobile': 35, 'tablet': 5 },
        browser: { 'chrome': 70, 'firefox': 15, 'safari': 10, 'edge': 5 },
        platform: { 'windows': 60, 'android': 25, 'ios': 10, 'macos': 5 },
        sessionDuration: 1800,
        pageViews: 5,
        bounceRate: 0.3
      }
    };
  }

  // Metode helper yang hilang
   private async getDefaultStatusKomentar(): Promise<StatusKomentar> {
      return {
        aktif: true,
        disetujui: true,
        ditolak: false,
        diarsipkan: false,
        dihapus: false,
        dilaporkan: false,
        disorot: false,
        dipinned: false,
        statusCustom: [],
        alasanStatus: 'Status default',
        tanggalStatusDiubah: new Date()
      };
    }

    private async getDefaultInteraksiKomentar(): Promise<InteraksiKomentar> {
       return {
         jumlahLike: 0,
         jumlahDislike: 0,
         jumlahBalasan: 0,
         jumlahLaporan: 0,
         jumlahShare: 0,
         jumlahView: 0,
         ratingHelpful: 0,
         interaksiPengguna: [],
         scorePopularitas: 0,
         trendInteraksi: []
       };
     }

    private async getDefaultModerasiKomentar(): Promise<Moderasi> {
       return {
         statusModerasiKomentar: 'approved',
         scoreSpam: 0.1,
         scoreToksisitas: 0.1,
         scoreKualitas: 0.8,
         flagOtomatis: [],
         riwayatModerasiKomentar: [],
         prioritasModerasiKomentar: 'rendah',
         estimasiWaktuModerasiKomentar: 5,
         tindakanModerasiKomentar: []
       };
     }

    private async ambilInformasiPengguna(userId: string): Promise<any> {
     return {
       id: userId,
       nama: 'Pengguna Sample',
       email: 'user@example.com',
       avatar: '/images/avatar-default.jpg',
       reputasi: Math.floor(Math.random() * 100) + 1
     };
   }

   private async ambilInformasiMobil(mobilId: string): Promise<InformasiMobil> {
     return this.generateInformasiMobilSample();
   }

   private async getDefaultKonteksKomentar(): Promise<KonteksKomentar> {
     return this.generateKonteksSample();
   }

   private async getDefaultPengaturanPrivasi(): Promise<PengaturanPrivasi> {
     return this.generatePengaturanPrivasiSample();
   }

   private getDefaultAnalitikKomentar(): AnalitikKomentar {
    return {
      viewCount: 0,
      uniqueViewCount: 0,
      engagementRate: 0,
      responseRate: 0,
      shareCount: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      sentimentScore: 0,
      qualityScore: 0,
      influenceScore: 0,
      viralityScore: 0,
      timeToFirstResponse: 0,
      averageResponseTime: 0,
      peakEngagementTime: new Date(),
      geografisAnalitik: {
        negara: {},
        provinsi: {},
        kota: {},
        timezone: {}
      },
      demografisAnalitik: {
        usia: {},
        gender: {},
        pendidikan: {},
        pekerjaan: {}
      },
      behavioralAnalitik: {
        deviceType: {},
        browser: {},
        platform: {},
        sessionDuration: 0,
        pageViews: 0,
        bounceRate: 0
      }
    };
  }

  private async validasiDataKomentar(data: Partial<DataKomentar>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!data.konten || data.konten.trim().length === 0) {
      errors.push('Konten komentar tidak boleh kosong');
    }
    
    if (data.konten && data.konten.length > 1000) {
      errors.push('Konten komentar terlalu panjang (maksimal 1000 karakter)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async generateRiwayatEdit(dataLama: DataKomentar, dataBaru: Partial<DataKomentar>): Promise<any> {
    return {
      id: this.generateId(),
      komentarId: dataLama.id,
      waktuEdit: new Date(),
      perubahanData: {
        sebelum: dataLama,
        sesudah: { ...dataLama, ...dataBaru }
      },
      alasan: 'Edit komentar oleh pengguna'
    };
  }

  private filterKomentar(komentar: DataKomentar[], kriteria: any): DataKomentar[] {
     let hasil = [...komentar];
     
     if (kriteria?.statusKomentar) {
       hasil = hasil.filter(k => k.statusKomentar.aktif === kriteria.statusKomentar.aktif);
     }
     
     if (kriteria?.mobilId) {
       hasil = hasil.filter(k => k.mobilId === kriteria.mobilId);
     }
     
     if (kriteria?.userId) {
       hasil = hasil.filter(k => k.userId === kriteria.userId);
     }
     
     return hasil;
   }

  private async prosesHasilPencarianKomentar(komentar: DataKomentar[], kriteria: any): Promise<any> {
    const batasPerHalaman = kriteria?.batasPerHalaman || 20;
    const halaman = kriteria?.halaman || 1;
    const mulaiDari = (halaman - 1) * batasPerHalaman;
    
    return {
      data: komentar.slice(mulaiDari, mulaiDari + batasPerHalaman),
      totalHasil: komentar.length,
      halamanSaatIni: halaman,
      totalHalaman: Math.ceil(komentar.length / batasPerHalaman)
    };
  }

  // Singleton pattern
  private static instance: LayananKomentar;

  static getInstance(): LayananKomentar {
    if (!LayananKomentar.instance) {
      LayananKomentar.instance = new LayananKomentar();
    }
    return LayananKomentar.instance;
  }
}

// Export singleton instance
export default LayananKomentar.getInstance();