import { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Tarayıcının otomatik kurulum prompt'unu engelle
      e.preventDefault();
      // Prompt'u sakla
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Kurulum prompt'unu göster
    deferredPrompt.prompt();

    // Kullanıcının seçimini bekle
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Kullanıcı PWA kurulumunu kabul etti');
    } else {
      console.log('Kullanıcı PWA kurulumunu reddetti');
    }

    // Prompt'u temizle
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Uygulamayı Yükle</h3>
          <p className="text-xs opacity-90 mt-1">
            Sosyal Ajanda'yı telefonunuza yükleyerek daha hızlı erişim sağlayın!
          </p>
        </div>
        <div className="flex gap-2 ml-3">
          <button
            onClick={handleDismiss}
            className="text-xs px-2 py-1 bg-blue-500 rounded hover:bg-blue-400"
          >
            Kapat
          </button>
          <button
            onClick={handleInstallClick}
            className="text-xs px-3 py-1 bg-white text-blue-600 rounded font-semibold hover:bg-gray-100"
          >
            Yükle
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;