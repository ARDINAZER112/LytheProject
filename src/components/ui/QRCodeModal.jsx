import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, ExternalLink } from 'lucide-react';

export function QRCodeModal({ isOpen, onClose, title, subtitle, value, type = 'product' }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-ocean-100 animate-slide-up relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ocean-50 text-ocean-700 flex items-center justify-center hover:bg-ocean-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-sand-100 text-sand-800 text-xs font-semibold px-3 py-1 rounded-full border border-sand-200 mb-3">
          <QrCode className="h-3.5 w-3.5 text-sand-600" />
          {type === 'store' ? 'Kode QR Toko Mitra' : 'Kode QR Produk'}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-ocean-900 mb-1 line-clamp-1">{title}</h3>
        {subtitle && <p className="text-xs text-ocean-500 mb-5 line-clamp-1">{subtitle}</p>}

        {/* QR Code Card */}
        <div className="bg-gradient-to-br from-ocean-50 to-sand-50 p-6 rounded-2xl border border-ocean-100 inline-block shadow-inner mb-5">
          <div className="bg-white p-4 rounded-xl shadow-md border border-white">
            <QRCodeSVG
              value={value || window.location.href}
              size={190}
              bgColor="#ffffff"
              fgColor="#0f2b48"
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <p className="text-xs text-ocean-600 mb-5 leading-relaxed">
          Pindai (scan) kode QR di atas menggunakan kamera smartphone untuk mengakses informasi secara langsung.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Tautan Tersalin!' : 'Salin Tautan'}
          </button>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-3 rounded-xl border border-ocean-200 text-ocean-700 hover:bg-ocean-50 transition-colors"
            title="Buka Tautan"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
