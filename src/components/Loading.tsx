import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Loading() {
  const { t } = useLanguage();

  return (
    <div className="glass-card p-12 lg:p-16 text-center animate-fade-in-up">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative">
          <div className="spinner w-12 h-12" />
          <Globe className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Text */}
        <div>
          <p className="text-xl font-semibold text-foreground mb-2">
            {t('loading.calculating')}
          </p>
          <p className="text-muted-foreground">
            {t('loading.analyzing')}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse-slow"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
