import { Clock, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrialBannerProps {
  daysRemaining: number;
  isExpired: boolean;
}

export function TrialBanner({ daysRemaining, isExpired }: TrialBannerProps) {
  const { t } = useLanguage();

  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('trial.expired')}</h3>
              <p className="text-slate-400 text-sm">{t('trial.expiredDesc')}</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            <Crown className="w-4 h-4 mr-2" />
            {t('trial.viewPlans')}
          </Button>
        </div>
      </div>
    );
  }

  if (daysRemaining <= 3) {
    return (
      <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {daysRemaining === 1 ? t('trial.lastDay') : `${daysRemaining} ${t('trial.daysRemaining')}`}
              </h3>
              <p className="text-slate-400 text-sm">{t('trial.subscribeNow')}</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            <Crown className="w-4 h-4 mr-2" />
            {t('trial.viewPlans')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6">
      <div className="flex items-center justify-center gap-2 text-emerald-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">
          {t('trial.trialPeriod')} <strong>{daysRemaining} {t('trial.days')}</strong> {t('trial.remaining')}
        </span>
      </div>
    </div>
  );
}
