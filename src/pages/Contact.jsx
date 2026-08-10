import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, MapPin, Phone } from 'lucide-react';

export function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-3xl font-bold text-ocean-900 mb-4">Kemitraan B2B & Restoran</h1>
          <p className="text-ocean-600 mb-8 leading-relaxed">
            JaringLokal membuka peluang kerja sama untuk menyuplai hasil laut segar harian ke restoran, hotel, maupun bisnis katering Anda. 
            Dapatkan harga khusus kemitraan dan prioritas pengiriman.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-ocean-100 p-3 rounded-full mr-4 text-ocean-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-ocean-900">Alamat Pusat</h3>
                <p className="text-ocean-600">Jl. Pesisir Utara No.45, Kabupaten Tuban, Jawa Timur 62314</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-ocean-100 p-3 rounded-full mr-4 text-ocean-600">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-ocean-900">Telepon / WhatsApp</h3>
                <p className="text-ocean-600">+62 812 3456 7890</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-ocean-100 p-3 rounded-full mr-4 text-ocean-600">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-ocean-900">Email</h3>
                <p className="text-ocean-600">b2b@jaringlokal.id</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-ocean-100">
          {isSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-12">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-ocean-900 mb-2">Pesan Terkirim!</h3>
              <p className="text-ocean-600">Tim kami akan segera menghubungi Anda untuk mendiskusikan kebutuhan pasokan hasil laut bisnis Anda.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-ocean-900 mb-6">Ajukan Berlangganan Suplai Harian</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-1">Nama Bisnis / Restoran</label>
                  <Input required placeholder="Contoh: Resto Seafood Nusantara" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-1">Nama Kontak Person</label>
                  <Input required placeholder="Nama lengkap Anda" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-1">No. WhatsApp</label>
                    <Input required type="tel" placeholder="0812..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-1">Email</label>
                    <Input required type="email" placeholder="email@bisnis.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ocean-700 mb-1">Kebutuhan Harian (Estimasi)</label>
                  <textarea 
                    required 
                    className="flex w-full rounded-md border border-ocean-200 bg-white px-3 py-2 text-sm placeholder:text-ocean-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 min-h-[100px] resize-y"
                    placeholder="Contoh: Rajungan 10kg, Cumi 5kg, Ikan Kerapu 15kg"
                  ></textarea>
                </div>
                <Button type="submit" className="w-full h-12 text-lg">Kirim Permintaan Suplai</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
