import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('eugine_install_dismissed');
    if (dismissed) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    if (ios) {
      setIsIOS(true);
      const timer = setTimeout(() => setShowBanner(true), 30000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 20000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('eugine_install_dismissed', 'installed');
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('eugine_install_dismissed', Date.now().toString());
  }

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up">
        <div className="max-w-md mx-auto bg-card border border-primary/30 rounded-2xl p-4 shadow-[0_0_30px_hsla(199,89%,48%,0.2)]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-foreground font-bold text-sm">
                {t('install.title') || 'Instale o EUGINE no seu celular'}
              </h4>
              <p className="text-muted-foreground text-xs mt-0.5">
                {t('install.subtitle') || 'Acesse mais rápido, como um app. Sem baixar nada.'}
              </p>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleInstall} className="flex-1 btn-primary py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              {t('install.button') || 'Instalar'}
            </button>
            <button onClick={handleDismiss} className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('install.later') || 'Depois'}
            </button>
          </div>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-[10000] bg-background/80 backdrop-blur-sm flex items-end justify-center p-4" onClick={handleDismiss}>
          <div className="w-full max-w-md bg-card border border-primary/30 rounded-2xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-foreground font-bold text-lg mb-4 text-center">
              {t('install.iosTitle') || 'Como instalar no iPhone'}
            </h4>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">1</span>
                <p className="text-foreground text-sm pt-1">
                  {t('install.iosStep1') || 'Toque no botão de compartilhar'} ⬆️ {t('install.iosStep1b') || 'na barra do Safari'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">2</span>
                <p className="text-foreground text-sm pt-1">
                  {t('install.iosStep2') || 'Role para baixo e toque em "Adicionar à Tela de Início"'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">3</span>
                <p className="text-foreground text-sm pt-1">
                  {t('install.iosStep3') || 'Toque em "Adicionar" e pronto!'}
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="w-full btn-primary py-3 rounded-xl text-sm font-bold">
              {t('install.understood') || 'Entendi!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}