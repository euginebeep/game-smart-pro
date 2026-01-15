import { useState } from 'react';
import { Check, Crown, Zap, Star, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const planConfigs = [
  {
    id: 'basic',
    price: '$ 29.90',
    priceValue: 29.90,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    tier: 'basic' as const,
  },
  {
    id: 'advanced',
    price: '$ 49.90',
    priceValue: 49.90,
    icon: Star,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    tier: 'advanced' as const,
  },
  {
    id: 'premium',
    price: '$ 79.90',
    priceValue: 79.90,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    tier: 'premium' as const,
  },
];

export function PricingSection() {
  const { subscription, createCheckout, openCustomerPortal } = useAuth();
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

  const handleManage = async () => {
    setLoadingTier('manage');
    try {
      await openCustomerPortal();
    } catch (err) {
      toast.error(t('pricing.portalError'));
      console.error(err);
    } finally {
      setLoadingTier(null);
    }
  };

  const currentTier = subscription.tier;

  const getLocale = () => {
    switch (language) {
      case 'pt': return 'pt-BR';
      case 'es': return 'es-ES';
      case 'it': return 'it-IT';
      default: return 'en-US';
    }
  };

  return (
    <section id="pricing-section" className="py-8 sm:py-12 scroll-mt-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {t('pricing.title')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {planConfigs.map((planConfig) => {
          const Icon = planConfig.icon;
          const isCurrentPlan = currentTier === planConfig.tier;
          const isDowngrade = 
            (currentTier === 'premium' && planConfig.tier !== 'premium') ||
            (currentTier === 'advanced' && planConfig.tier === 'basic');

          // Get translated features for this plan
          const planName = t(`pricing.plans.${planConfig.id}.name`);
          const features = [
            t(`pricing.plans.${planConfig.id}.features.0`),
            t(`pricing.plans.${planConfig.id}.features.1`),
            t(`pricing.plans.${planConfig.id}.features.2`),
            t(`pricing.plans.${planConfig.id}.features.3`),
            t(`pricing.plans.${planConfig.id}.features.4`),
          ].filter(f => !f.includes('pricing.plans')); // Filter out untranslated keys

          return (
            <div
              key={planConfig.id}
              className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col ${
                planConfig.popular
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 scale-[1.02]'
                  : 'glass-card'
              } ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
              {planConfig.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {t('pricing.yourPlan')}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${planConfig.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{planName}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-black text-foreground">{planConfig.price}</span>
                  <span className="text-muted-foreground text-sm">{t('pricing.perMonth')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isCurrentPlan ? (
                  <button
                    onClick={handleManage}
                    disabled={loadingTier === 'manage'}
                    className="w-full py-3 rounded-xl font-semibold transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center gap-2"
                  >
                    {loadingTier === 'manage' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {t('pricing.manageSubscription')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(planConfig.tier)}
                    disabled={loadingTier === planConfig.tier}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      planConfig.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {loadingTier === planConfig.tier ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isDowngrade ? (
                      t('pricing.downgrade')
                    ) : (
                      t('pricing.subscribeNow')
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {subscription.isSubscribed && subscription.subscriptionEnd && (
        <p className="text-center text-muted-foreground text-sm mt-6">
          {t('pricing.renewsOn')}{' '}
          <span className="text-foreground font-medium">
            {new Date(subscription.subscriptionEnd).toLocaleDateString(getLocale())}
          </span>
        </p>
      )}
    </section>
  );
}