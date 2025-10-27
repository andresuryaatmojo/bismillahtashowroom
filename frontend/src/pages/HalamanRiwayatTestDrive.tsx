import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { testDriveService } from '../services/testDriveService';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { CalendarIcon, ClockIcon, MapPinIcon, FileText } from 'lucide-react';
import GuestNavigation from '../components/GuestNavigation';

// Import interface dari testDriveService
import { TestDriveWithDetails as TestDriveDetails } from '../services/testDriveService';

// Interface untuk data test drive
interface TestDriveWithDetails extends TestDriveDetails {}

function HalamanRiwayatTestDrive() {
  const [testDrives, setTestDrives] = useState<TestDriveWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUserTestDrives();
  }, []);

  const loadUserTestDrives = async () => {
    setLoading(true);
    try {
      // Dapatkan user saat ini
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      console.log('Current user ID:', user.id);

      // Ambil data test drive langsung dari Supabase
      const { data, error } = await supabase
        .from('test_drive_requests')
        .select(`
          *,
          cars (
            id,
            title,
            year,
            price,
            car_brands (name),
            car_models (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching test drives from Supabase:', error);
        throw error;
      }

      console.log('Test drive data loaded from Supabase:', data);
      
      if (data && data.length > 0) {
        // Tambahkan data pengguna dari user saat ini
        const enhancedData = data.map(item => ({
          ...item,
          users: {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Pengguna',
            phone_number: user.user_metadata?.phone_number || '-'
          }
        }));
        
        setTestDrives(enhancedData);
      } else {
        console.log('No test drive data found for this user');
        setTestDrives([]);
      }
    } catch (error) {
      console.error('Error loading test drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTestDrive = async (testDriveId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan test drive ini?')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const result = await testDriveService.cancelTestDrive(testDriveId, user.id);
      
      if (result.success) {
        alert('Test drive berhasil dibatalkan');
        loadUserTestDrives();
      } else {
        alert(result.error || 'Gagal membatalkan test drive');
      }
    } catch (error) {
      console.error('Error cancelling test drive:', error);
      alert('Terjadi kesalahan saat membatalkan test drive');
    }
  };

  const handleConfirmReschedule = async (testDriveId: string) => {
    if (!window.confirm('Apakah Anda setuju dengan jadwal baru ini?')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const result = await testDriveService.confirmRescheduledTestDrive(testDriveId, user.id);
      
      if (result.success) {
        alert('Jadwal test drive baru berhasil dikonfirmasi');
        loadUserTestDrives();
      } else {
        alert(result.error || 'Gagal mengonfirmasi jadwal baru');
      }
    } catch (error) {
      console.error('Error confirming rescheduled test drive:', error);
      alert('Terjadi kesalahan saat mengonfirmasi jadwal baru');
    }
  };

  // State untuk form ajukan jadwal ulang
  const [rescheduleForm, setRescheduleForm] = useState<{
    openId: string | null;
    date: string;
    time: string;
    notes: string;
  }>({
    openId: null,
    date: '',
    time: '',
    notes: ''
  });

  // Helper untuk mendeteksi dan menghapus marker di catatan user
  const USER_RESCHEDULE_MARKER = '[USER_RESCHEDULE_REQUEST]';
  const isUserRescheduleRequest = (notes?: string) =>
    !!notes && notes.startsWith(USER_RESCHEDULE_MARKER);
  const stripUserRescheduleMarker = (notes?: string) =>
    (notes || '').replace(/^\[USER_RESCHEDULE_REQUEST\]\s?/, '');

  // Buka form reschedule untuk test drive tertentu
  const handleOpenRescheduleForm = (testDrive: TestDriveWithDetails) => {
    setRescheduleForm({
      openId: testDrive.id,
      date: testDrive.scheduled_date || '',
      time: testDrive.scheduled_time || '',
      notes: testDrive.user_notes || '' // tidak perlu strip marker
    });
  };

  // Tutup form reschedule
  const handleCancelRescheduleForm = () => {
    setRescheduleForm({
      openId: null,
      date: '',
      time: '',
      notes: ''
    });
  };

  // Submit pengajuan jadwal ulang
  const handleSubmitReschedule = async () => {
    try {
      if (!rescheduleForm.openId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Validasi sederhana
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rescheduleForm.date)) {
        alert('Format tanggal tidak valid. Gunakan YYYY-MM-DD');
        return;
      }
      if (!/^\d{2}:\d{2}$/.test(rescheduleForm.time)) {
        alert('Format waktu tidak valid. Gunakan HH:mm');
        return;
      }

      const result = await testDriveService.requestReschedule(
        rescheduleForm.openId,
        user.id,
        rescheduleForm.date,
        rescheduleForm.time,
        rescheduleForm.notes || undefined
      );

      if (result.success) {
        alert('Pengajuan jadwal ulang berhasil dikirim. Menunggu persetujuan admin.');
        handleCancelRescheduleForm();
        loadUserTestDrives();
      } else {
        alert(result.error || 'Gagal mengajukan jadwal ulang');
      }
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      alert('Terjadi kesalahan saat mengajukan jadwal ulang');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Menunggu Konfirmasi</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Dikonfirmasi</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Selesai</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Dibatalkan</Badge>;
      case 'rescheduled':
        return <Badge className="bg-purple-500">Dijadwalkan Ulang</Badge>;
      case 'reschedule_requested':
        return <Badge className="bg-orange-500">Menunggu Persetujuan Jadwal Ulang</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      return new Intl.DateTimeFormat('id-ID', options).format(date);
    } catch (error) {
      return dateString;
    }
  };

  const filteredTestDrives = testDrives.filter(td => {
    if (activeTab === 'all') return true;
    return td.status === activeTab;
  });

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-left mb-6">Riwayat Test Drive</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="pending">Menunggu</TabsTrigger>
            <TabsTrigger value="confirmed">Dikonfirmasi</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
            <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-8">
            <p>Memuat data...</p>
          </div>
        ) : filteredTestDrives.length === 0 ? (
          <div className="text-center py-8">
            <p>Tidak ada data test drive {activeTab !== 'all' ? `dengan status ${activeTab}` : ''}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTestDrives.map((testDrive) => (
              <Card key={testDrive.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {testDrive.cars?.car_brands?.name} {testDrive.cars?.car_models?.name}
                      </CardTitle>
                      <CardDescription>
                        {testDrive.cars?.title} ({testDrive.cars?.year})
                      </CardDescription>
                    </div>
                    <div>{getStatusBadge(testDrive.status)}</div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(testDrive.scheduled_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      <span>Pukul {testDrive.scheduled_time} ({testDrive.duration_minutes} menit)</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-500" />
                      <span>{testDrive.location}</span>
                    </div>
                    
                    {testDrive.user_notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-1" />
                        <span>{stripUserRescheduleMarker(testDrive.user_notes)}</span>
                      </div>
                    )}
                    
                    {/* TAMPILKAN CATATAN ADMIN JIKA ADA */}
                    {testDrive.admin_notes && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-500 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-700">Catatan Admin</p>
                            <p className="text-sm text-gray-600">{testDrive.admin_notes}</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {testDrive.rejection_reason && (
                      <>
                        <Separator />
                        <div className="pt-2">
                          <p className="font-semibold text-red-500">Alasan Penolakan:</p>
                          <p>{testDrive.rejection_reason}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  {testDrive.status === 'pending' && (
                    <div className="w-full flex flex-col gap-2">
                      <Button 
                        variant="secondary"
                        onClick={() => handleOpenRescheduleForm(testDrive)}
                        className="w-full"
                      >
                        Ajukan Jadwal Ulang
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleCancelTestDrive(testDrive.id)}
                        className="w-full"
                      >
                        Batalkan Test Drive
                      </Button>

                      {rescheduleForm.openId === testDrive.id && (
                        <div className="mt-3 p-3 border rounded-md space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium">Tanggal Baru</label>
                              <input
                                type="date"
                                value={rescheduleForm.date}
                                onChange={(e) => setRescheduleForm(f => ({ ...f, date: e.target.value }))}
                                className="border rounded px-3 py-2"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium">Waktu Baru</label>
                              <input
                                type="time"
                                value={rescheduleForm.time}
                                onChange={(e) => setRescheduleForm(f => ({ ...f, time: e.target.value }))}
                                className="border rounded px-3 py-2"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Catatan (opsional)</label>
                            <textarea
                              value={rescheduleForm.notes}
                              onChange={(e) => setRescheduleForm(f => ({ ...f, notes: e.target.value }))}
                              className="border rounded px-3 py-2"
                              rows={3}
                              placeholder="Contoh: Saya hanya bisa sore hari."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={handleSubmitReschedule}
                            >
                              Kirim Pengajuan
                            </Button>
                            <Button 
                              variant="secondary"
                              className="flex-1"
                              onClick={handleCancelRescheduleForm}
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {testDrive.status === 'confirmed' && (
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-sm text-green-600">Test drive Anda telah dikonfirmasi</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleOpenRescheduleForm(testDrive)}
                        >
                          Ajukan Jadwal Ulang
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleCancelTestDrive(testDrive.id)}
                        >
                          Batalkan Test Drive
                        </Button>
                      </div>

                      {rescheduleForm.openId === testDrive.id && (
                        <div className="mt-3 p-3 border rounded-md space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium">Tanggal Baru</label>
                              <input
                                type="date"
                                value={rescheduleForm.date}
                                onChange={(e) => setRescheduleForm(f => ({ ...f, date: e.target.value }))}
                                className="border rounded px-3 py-2"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium">Waktu Baru</label>
                              <input
                                type="time"
                                value={rescheduleForm.time}
                                onChange={(e) => setRescheduleForm(f => ({ ...f, time: e.target.value }))}
                                className="border rounded px-3 py-2"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Catatan (opsional)</label>
                            <textarea
                              value={rescheduleForm.notes}
                              onChange={(e) => setRescheduleForm(f => ({ ...f, notes: e.target.value }))}
                              className="border rounded px-3 py-2"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={handleSubmitReschedule}
                            >
                              Kirim Pengajuan
                            </Button>
                            <Button 
                              variant="secondary"
                              className="flex-1"
                              onClick={handleCancelRescheduleForm}
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {testDrive.status === 'rescheduled' && (
                    <div className="w-full flex flex-col gap-2">
                      {/* Jika pengajuan reschedule oleh user dan belum dikonfirmasi admin */}
                      {isUserRescheduleRequest(testDrive.user_notes) && !testDrive.confirmed_at ? (
                        <>
                          <p className="text-sm text-orange-600">
                            Anda telah mengajukan jadwal ulang. Menunggu persetujuan admin.
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="secondary"
                              className="flex-1"
                              onClick={() => handleOpenRescheduleForm(testDrive)}
                            >
                              Ubah Pengajuan
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleCancelTestDrive(testDrive.id)}
                            >
                              Batalkan Test Drive
                            </Button>
                          </div>

                          {rescheduleForm.openId === testDrive.id && (
                            <div className="mt-3 p-3 border rounded-md space-y-3">
                              {/* Form reschedule */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-sm font-medium">Tanggal Baru</label>
                                  <input
                                    type="date"
                                    value={rescheduleForm.date}
                                    onChange={(e) => setRescheduleForm(f => ({ ...f, date: e.target.value }))}
                                    className="border rounded px-3 py-2"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-sm font-medium">Waktu Baru</label>
                                  <input
                                    type="time"
                                    value={rescheduleForm.time}
                                    onChange={(e) => setRescheduleForm(f => ({ ...f, time: e.target.value }))}
                                    className="border rounded px-3 py-2"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Catatan (opsional)</label>
                                <textarea
                                  value={rescheduleForm.notes}
                                  onChange={(e) => setRescheduleForm(f => ({ ...f, notes: e.target.value }))}
                                  className="border rounded px-3 py-2"
                                  rows={3}
                                  placeholder="Contoh: Saya hanya bisa sore hari."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  onClick={handleSubmitReschedule}
                                >
                                  Kirim Pengajuan
                                </Button>
                                <Button 
                                  variant="secondary"
                                  className="flex-1"
                                  onClick={handleCancelRescheduleForm}
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-purple-600">Test drive telah dijadwalkan ulang oleh admin</p>
                          <div className="flex gap-2">
                            <Button 
                              variant="default"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleConfirmReschedule(testDrive.id)}
                            >
                              Konfirmasi Jadwal Baru
                            </Button>
                            <Button 
                              variant="secondary"
                              className="flex-1"
                              onClick={() => handleOpenRescheduleForm(testDrive)}
                            >
                              Ajukan Jadwal Ulang
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleCancelTestDrive(testDrive.id)}
                            >
                              Batalkan Test Drive
                            </Button>
                          </div>

                          {rescheduleForm.openId === testDrive.id && (
                            <div className="mt-3 p-3 border rounded-md space-y-3">
                              {/* Form reschedule */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-sm font-medium">Tanggal Baru</label>
                                  <input
                                    type="date"
                                    value={rescheduleForm.date}
                                    onChange={(e) => setRescheduleForm(f => ({ ...f, date: e.target.value }))}
                                    className="border rounded px-3 py-2"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-sm font-medium">Waktu Baru</label>
                                  <input
                                    type="time"
                                    value={rescheduleForm.time}
                                    onChange={(e) => setRescheduleForm(f => ({ ...f, time: e.target.value }))}
                                    className="border rounded px-3 py-2"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Catatan (opsional)</label>
                                <textarea
                                  value={rescheduleForm.notes}
                                  onChange={(e) => setRescheduleForm(f => ({ ...f, notes: e.target.value }))}
                                  className="border rounded px-3 py-2"
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  onClick={handleSubmitReschedule}
                                >
                                  Kirim Pengajuan
                                </Button>
                                <Button 
                                  variant="secondary"
                                  className="flex-1"
                                  onClick={handleCancelRescheduleForm}
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {testDrive.status === 'reschedule_requested' && (
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-sm text-orange-600">
                        Anda telah mengajukan jadwal ulang. Menunggu persetujuan admin.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleCancelTestDrive(testDrive.id)}
                        className="w-full"
                      >
                        Batalkan Test Drive
                      </Button>
                    </div>
                  )}

                  {testDrive.status === 'completed' && (
                    <p className="text-sm text-blue-600">Test drive telah selesai</p>
                  )}

                  {testDrive.status === 'cancelled' && (
                    <p className="text-sm text-red-600">Test drive dibatalkan</p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
export default HalamanRiwayatTestDrive;