import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
  };

  if (!showInstallBanner || !deferredPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#f5f5f7',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      zIndex: 1000,
      borderBottom: '2px solid #ffcc00'
    }}>
      <div style={{ flex: 1 }}>
        <strong>Installer ProdTalent</strong>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Accès rapide depuis votre écran d'accueil
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(135deg, #ffcc00 0%, #ffd700 100%)',
            color: '#1a1a1a',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: '#ccc',
            border: '1px solid #444',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;