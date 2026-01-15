import { useState } from 'react';
import { Check, Crown, Zap, Star, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const planConfigs = [
  {
    id: 'basic',
    price: '$ 29.90',
    icon: Zap,
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    hoverGlow: 'hover:shadow-blue-500/50',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400',
    iconBg: 'bg-blue-500/20',
    tier: 'basic' as const,
  },
  {
    id: 'advanced',
    price: '$ 49.90',
    icon: Star,
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    hoverGlow: 'hover:shadow-purple-500/50',
    borderColor: 'border-purple-500/50',
    hoverBorder: 'hover:border-purple-400',
    iconBg: 'bg-purple-500/20',
    popular: true,
    tier: 'advanced' as const,
  },
  {
    id: 'premium',
    price: '$ 79.90',
    icon: Crown,
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
    hoverGlow: 'hover:shadow-amber-500/50',
    borderColor: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-400',
    iconBg: 'bg-amber-500/20',
    tier: 'premium' as const,
  },
];

export function DailyLimitPricingCards() {
  const { createCheckout } = useAuth();
  const { t, language } = useLanguage();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: 'basic' | 'advanced' | 'premium') => {
    setLoadingTier(tier);
    try {
      await createCheckout(tier, language);
    } catch (err) {
      toast.error(t('pricing.checkoutError'));
      console.error(err);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3 mt-6 w-full">
      {planConfigs.map((planConfig) => {
        const Icon = planConfig.icon;
        const planName = t(`pricing.plans.${planConfig.id}.name`);
        const features = [
          t(`pricing.plans.${planConfig.id}.features.0`),
          t(`pricing.plans.${planConfig.id}.features.1`),
          t(`pricing.plans.${planConfig.id}.features.2`),
          t(`pricing.plans.${planConfig.id}.features.3`),
        ].filter(f => !f.includes('pricing.plans'));

        return (
          <div
            key={planConfig.id}
            className={`
              relative group rounded-2xl p-5 border-2 transition-all duration-500 ease-out cursor-pointer
              bg-slate-900/80 backdrop-blur-xl
              ${planConfig.borderColor}
              ${planConfig.hoverBorder}
              ${planConfig.hoverGlow}
              hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1
              ${planConfig.popular ? 'ring-2 ring-purple-500/30 scale-[1.02]' : ''}
            `}
          >
            {/* Popular Badge */}
            {planConfig.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-3 h-3" />
                  {t('pricing.popular')}
                </span>
              </div>
            )}

            {/* Glow Effect on Hover */}
            <div className={`
              absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
              bg-gradient-to-br ${planConfig.gradientFrom} ${planConfig.gradientTo} blur-xl -z-10
            `} style={{ transform: 'scale(0.95)' }} />

            {/* Card Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-4">
                <div className={`
                  w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${planConfig.gradientFrom} ${planConfig.gradientTo}
                  flex items-center justify-center mb-3 shadow-lg
                  group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500
                `}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">{planName}</h3>
                <div className="mt-1">
                  <span className="text-2xl font-black text-white">{planConfig.price}</span>
                  <span className="text-slate-400 text-sm">/{t('pricing.perMonth').replace('/', '')}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300 group-hover:text-white transition-colors">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 transition-colors bg-gradient-to-br ${planConfig.gradientFrom} ${planConfig.gradientTo} bg-clip-text text-transparent`} 
                      style={{ color: planConfig.id === 'basic' ? '#3b82f6' : planConfig.id === 'advanced' ? '#a855f7' : '#f59e0b' }}
                    />
                    <span className="text-xs">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(planConfig.tier)}
                disabled={loadingTier === planConfig.tier}
                className={`
                  w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
                  bg-gradient-to-r ${planConfig.gradientFrom} ${planConfig.gradientTo}
                  text-white shadow-lg
                  hover:shadow-xl hover:brightness-110 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  group-hover:animate-pulse
                `}
              >
                {loadingTier === planConfig.tier ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    {t('pricing.subscribeNow')}
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
