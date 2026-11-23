import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, WifiOff } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const OfflineIndicator: React.FC = () => {
  const { isOnline, t } = useApp();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="bg-[var(--sc-careful-bg)] text-[var(--sc-careful-text)] border-b border-current/20 px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 no-print"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{t.offlineBanner}</span>
    </div>
  );
};

export const UpdatePrompt: React.FC = () => {
  const { t } = useApp();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 rounded-2xl bg-[var(--sc-surface)] border border-[var(--sc-primary)] p-4 shadow-lg flex items-center justify-between gap-3 no-print"
    >
      <span className="text-sm font-semibold">{t.updateAvailable}</span>
      <Button size="md" onClick={() => void updateServiceWorker(true)}>
        <RefreshCw className="w-4 h-4" />
        <span>{t.reloadNow}</span>
      </Button>
    </div>
  );
};

export const PWAInstallButton: React.FC = () => {
  const { t } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (isInstalled || !deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <Button variant="secondary" size="md" onClick={() => void handleInstall()}>
      <Download className="w-4 h-4" />
      <span>{t.installApp}</span>
    </Button>
  );
};
