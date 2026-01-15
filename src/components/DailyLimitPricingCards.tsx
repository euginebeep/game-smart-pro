import { useState } from 'react';
import { Check, Loader2, Rocket, Gem, ShieldCheck, Activity, TrendingUp, Brain, Target, Gauge } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const planConfigs = [
  {
    id: 'basic',
    price: '$ 29.90',
    icon: Rocket,
    accentIcon: Activity,
    gradientFrom: 'from-sky-500',
    gradientTo: 'to-blue-600',
    borderColor: 'border-sky-500/20',
    hoverBorder: 'hover:border-sky-400/60',
    tier: 'basic' as const,
  },
  {
    id: 'advanced',
    price: '$ 49.90',
    icon: Gem,
    accentIcon: Brain,
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-600',
    borderColor: 'border-violet-500/30',
    hoverBorder: 'hover:border-violet-400/60',
    popular: true,
    tier: 'advanced' as const,
  },
  {
    id: 'premium',
    price: '$ 79.90',
    icon: ShieldCheck,
    accentIcon: Target,
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    borderColor: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-400/60',
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
      {planConfigs.map((planConfig, index) => {
        const Icon = planConfig.icon;
        const AccentIcon = planConfig.accentIcon;
        const planName = t(`pricing.plans.${planConfig.id}.name`);
        const features = [
          t(`pricing.plans.${planConfig.id}.features.0`),
          t(`pricing.plans.${planConfig.id}.features.1`),
          t(`pricing.plans.${planConfig.id}.features.2`),
          t(`pricing.plans.${planConfig.id}.features.3`),
          t(`pricing.plans.${planConfig.id}.features.4`),
        ].filter(f => !f.includes('pricing.plans'));

        return (
          <div
            key={planConfig.id}
            className={`
              relative group rounded-2xl p-5 border transition-all duration-300 ease-out
              bg-slate-900/60 backdrop-blur-sm
              ${planConfig.borderColor}
              ${planConfig.hoverBorder}
              hover:bg-slate-800/80 hover:scale-[1.02] hover:-translate-y-1
              ${planConfig.popular ? 'border-2 scale-[1.01]' : ''}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Popular Badge */}
            {planConfig.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className={`bg-gradient-to-r ${planConfig.gradientFrom} ${planConfig.gradientTo} text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5`}>
                  <TrendingUp className="w-3 h-3" />
                  {t('pricing.popular')}
                </span>
              </div>
            )}

            {/* Card Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-4">
                <div className={`
                  relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${planConfig.gradientFrom} ${planConfig.gradientTo}
                  flex items-center justify-center mb-3
                  group-hover:scale-105 transition-transform duration-300
                `}>
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <AccentIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">{planName}</h3>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-black text-white">{planConfig.price}</span>
                  <span className="text-slate-500 text-sm">/{t('pricing.perMonth').replace('/', '')}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-5">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${planConfig.gradientFrom} ${planConfig.gradientTo} flex items-center justify-center mt-0.5 shrink-0`}>
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(planConfig.tier)}
                disabled={loadingTier === planConfig.tier}
                className={`
                  w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2
                  bg-gradient-to-r ${planConfig.gradientFrom} ${planConfig.gradientTo}
                  text-white
                  hover:opacity-90 active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {loadingTier === planConfig.tier ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Gauge className="w-4 h-4" />
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
