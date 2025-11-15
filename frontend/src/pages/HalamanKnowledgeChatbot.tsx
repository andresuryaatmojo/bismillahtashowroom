import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExternalLink, FileText, Info } from 'lucide-react';

const HalamanKnowledgeChatbot: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const GOOGLE_DOCS_URL = 'https://docs.google.com/document/d/1CZccPbLrzkJKz66dvjkUPynLn4egrVFiFImRtEuzB2w/edit?usp=sharing';

  const handleOpenGoogleDocs = () => {
    window.open(GOOGLE_DOCS_URL, '_blank', 'noopener,noreferrer');
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Anda tidak memiliki akses ke halaman ini.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Knowledge Base Chatbot
          </h1>
          <p className="text-gray-600">
            Kelola knowledge base chatbot melalui Google Docs
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <FileText size={48} />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              Dokumen Knowledge Base
            </h2>
            <p className="text-center text-blue-100">
              Kelola pertanyaan dan jawaban chatbot di Google Docs
            </p>
          </div>

          <div className="p-6">
            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Panduan Pengelolaan:</p>
                  <ul className="space-y-1.5 ml-1">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>Klik tombol "Buka Google Docs" di bawah untuk mengakses dokumen</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>Edit pertanyaan dan jawaban sesuai kebutuhan chatbot</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>Gunakan format yang konsisten agar mudah dibaca</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>Semua perubahan otomatis tersimpan di Google Docs</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>Pastikan dokumen tetap terorganisir dan terstruktur dengan baik</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={handleOpenGoogleDocs}
                className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <ExternalLink size={20} />
                Buka Google Docs
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3">
                  <div className="text-gray-600 text-sm mb-1">Platform</div>
                  <div className="font-semibold text-gray-800">Google Docs</div>
                </div>
                <div className="p-3">
                  <div className="text-gray-600 text-sm mb-1">Akses</div>
                  <div className="font-semibold text-gray-800">Admin Only</div>
                </div>
                <div className="p-3">
                  <div className="text-gray-600 text-sm mb-1">Sinkronisasi</div>
                  <div className="font-semibold text-gray-800">Otomatis</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">💡 Tips:</h3>
          <ul className="text-sm text-gray-700 space-y-2 ml-1">
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Kelompokkan pertanyaan berdasarkan kategori menggunakan heading</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Pastikan setiap jawaban ditulis dengan jelas dan mudah dipahami</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Lakukan review dan update knowledge base secara berkala</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Tambahkan variasi pertanyaan untuk meningkatkan akurasi respons chatbot</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Gunakan bahasa yang konsisten dan sesuai dengan tone brand</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HalamanKnowledgeChatbot;
