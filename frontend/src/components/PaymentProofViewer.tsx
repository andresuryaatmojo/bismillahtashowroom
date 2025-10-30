import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface PaymentProofViewerProps {
  isOpen: boolean;
  onClose: () => void;
  proofUrl: string | null;
}

const PaymentProofViewer: React.FC<PaymentProofViewerProps> = ({
  isOpen,
  onClose,
  proofUrl
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [useIframe, setUseIframe] = useState(false);

  useEffect(() => {
    if (proofUrl) {
      setIsLoading(true);
      setHasError(false);
      setUseIframe(false);
      
      // Add cache buster
      const urlWithTimestamp = `${proofUrl}?t=${Date.now()}`;
      setDisplayUrl(urlWithTimestamp);
    }
  }, [proofUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.error('Image failed to load, trying iframe fallback...');
    setUseIframe(true);
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!proofUrl) return;
    
    try {
      // Fetch the image
      const response = await fetch(displayUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bukti-pembayaran-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(proofUrl, '_blank');
    }
  };

  const handleOpenNewTab = () => {
    if (proofUrl) {
      window.open(proofUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bukti Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Image Container */}
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
            {isLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Memuat gambar...</p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center p-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Gagal Memuat Gambar
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Gambar tidak dapat ditampilkan. Silakan coba download atau buka di tab baru.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleOpenNewTab}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buka di Tab Baru
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {displayUrl && !hasError && (
              <>
                {useIframe ? (
                  <iframe
                    src={displayUrl}
                    className="w-full h-[600px] border-0"
                    title="Bukti Pembayaran"
                    onLoad={() => setIsLoading(false)}
                    onError={handleIframeError}
                  />
                ) : (
                  <img
                    src={displayUrl}
                    alt="Bukti Pembayaran"
                    className="w-full h-auto object-contain max-h-[600px]"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ display: 'block' }}
                  />
                )}
              </>
            )}
          </div>

          {/* URL Info */}
          {proofUrl && (
            <div className="w-full bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500 break-all">
                URL: {proofUrl}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 w-full justify-center">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleOpenNewTab}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Buka di Tab Baru
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProofViewer;