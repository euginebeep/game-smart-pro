import { useState } from 'react';
import { Check, Zap, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import MoneyExplosion from './MoneyExplosion';

interface UnifiedPricingCardsProps {
  showManageButton?: boolean;
  variant?: 'full' | 'compact';
}

export function UnifiedPricingCards({ showManageButton = true, variant = 'full' }: UnifiedPricingCardsProps) {
  const { subscription, createCheckout, createDayUseCheckout, openCustomerPortal } = useAuth();
  const { t, language } = useLanguage();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [premiumHovered, setPremiumHovered] = useState(false);

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

  const handleDayUse = async () => {
    setLoadingTier('dayuse');
    try {
      await createDayUseCheckout(language);
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

  // Plan configurations matching Landing page exactly
  const plans = [
    {
      id: 'dayuse',
      name: t('pricing.plans.dayuse.name'),
      badge: t('pricing.dayUseBadge') || 'Premium 24h',
      price: '$7,77',
      period: t('pricing.perDay') || '/dia',
      features: [
        t('pricing.plans.dayuse.features.0'),
        t('pricing.plans.dayuse.features.1'),
        t('pricing.plans.dayuse.features.2'),
        t('pricing.plans.dayuse.features.3'),
      ].filter(f => !f.includes('pricing.plans')),
      cta: t('pricing.buyDayUse') || 'Comprar Day Use',
      isOneTime: true,
      borderColor: 'border-success/50',
      hoverBorder: 'hover:border-primary',
      accentColor: 'text-success',
      buttonClass: 'bg-success text-success-foreground hover:bg-success/90',
      checkIcon: 'text-success',
    },
    {
      id: 'basic',
      name: t('pricing.plans.basic.name'),
      price: '$29,90',
      period: t('pricing.perMonth'),
      features: [
        t('pricing.plans.basic.features.0'),
        t('pricing.plans.basic.features.1'),
        t('pricing.plans.basic.features.2'),
        t('pricing.plans.basic.features.3'),
        t('pricing.plans.basic.features.4'),
      ].filter(f => !f.includes('pricing.plans')),
      cta: t('pricing.subscribeNow'),
      tier: 'basic' as const,
      borderColor: 'border-transparent',
      hoverBorder: 'hover:border-primary',
      accentColor: 'text-primary',
      buttonClass: 'btn-outline',
      checkIcon: 'text-primary',
    },
    {
      id: 'advanced',
      name: t('pricing.plans.advanced.name'),
      badge: t('pricing.popular'),
      price: '$49,90',
      period: t('pricing.perMonth'),
      features: [
        t('pricing.plans.advanced.features.0'),
        t('pricing.plans.advanced.features.1'),
        t('pricing.plans.advanced.features.2'),
        t('pricing.plans.advanced.features.3'),
        t('pricing.plans.advanced.features.4'),
      ].filter(f => !f.includes('pricing.plans')),
      cta: t('pricing.subscribeNow'),
      tier: 'advanced' as const,
      isPopular: true,
      borderColor: 'price-card-highlighted',
      hoverBorder: '',
      accentColor: 'text-primary',
      buttonClass: 'btn-primary',
      checkIcon: 'text-primary',
    },
    {
      id: 'premium',
      name: t('pricing.plans.premium.name'),
      badge: t('pricing.bestValue') || 'Melhor Valor',
      originalPrice: '$199,00',
      price: '$79,90',
      period: t('pricing.perMonth'),
      features: [
        t('pricing.plans.premium.features.0'),
        t('pricing.plans.premium.features.1'),
        t('pricing.plans.premium.features.2'),
        t('pricing.plans.premium.features.3'),
        t('pricing.plans.premium.features.4'),
        t('pricing.plans.premium.features.5'),
      ].filter(f => !f.includes('pricing.plans')),
      cta: t('pricing.subscribeNow'),
      tier: 'premium' as const,
      borderColor: 'border-accent/50',
      hoverBorder: 'hover:border-accent',
      accentColor: 'text-accent',
      buttonClass: 'bg-accent text-accent-foreground hover:bg-accent/90',
      checkIcon: 'text-accent',
      isPremium: true,
    },
  ];

  const isCompact = variant === 'compact';

  return (
    <div className={`grid gap-4 sm:gap-6 ${isCompact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
      {plans.map((plan) => {
        const isCurrentPlan = currentTier === plan.tier;
        const isDowngrade = 
          (currentTier === 'premium' && plan.tier && plan.tier !== 'premium') ||
          (currentTier === 'advanced' && plan.tier === 'basic');

        return (
          <div
            key={plan.id}
            className={`
              relative glass-card ${isCompact ? 'p-5' : 'p-6 sm:p-8'} flex flex-col border-2 transition-all duration-300 
              hover:-translate-y-2.5 hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.2)]
              ${plan.isPopular ? 'price-card-highlighted' : plan.borderColor}
              ${plan.hoverBorder}
              ${plan.isPremium ? '' : ''}
              ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
            `}
            style={plan.isPremium ? { background: 'linear-gradient(180deg, hsla(260, 80%, 60%, 0.1) 0%, hsla(230, 45%, 12%, 1) 100%)' } : {}}
            onMouseEnter={() => plan.isPremium && setPremiumHovered(true)}
            onMouseLeave={() => plan.isPremium && setPremiumHovered(false)}
          >
            {plan.isPremium && <MoneyExplosion isActive={premiumHovered} />}
            
            {/* Badges */}
            {plan.badge && !plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className={`${plan.id === 'dayuse' ? 'bg-success text-success-foreground' : 'bg-accent text-accent-foreground'} text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap`}>
                  {plan.badge}
                </span>
              </div>
            )}

            {plan.isPopular && (
              <div className="absolute -top-3 right-5 z-10">
                <span 
                  className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full inline-block"
                  style={{ transform: 'rotate(15deg)' }}
                >
                  {plan.badge}
                </span>
              </div>
            )}

            {isCurrentPlan && showManageButton && (
              <div className="absolute -top-3 right-4 z-10">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {t('pricing.yourPlan')}
                </span>
              </div>
            )}

            {/* Header */}
            <div className={`text-center ${isCompact ? 'mb-4' : 'mb-6'} ${plan.badge || plan.isPopular ? 'pt-4' : ''} relative z-10`}>
              <h3 className={`text-foreground font-bold ${isCompact ? 'text-lg' : 'text-xl'} mb-4`}>{plan.name}</h3>
              <div className="flex flex-col items-center">
                {plan.originalPrice && (
                  <span className="text-muted-foreground text-lg line-through">{plan.originalPrice}</span>
                )}
                <span className={`${plan.accentColor} ${isCompact ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-black`}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-base font-semibold">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <ul className={`${isCompact ? 'space-y-2' : 'space-y-3 sm:space-y-4'} flex-grow ${isCompact ? 'mb-4' : 'mb-8'} relative z-10`}>
              {plan.features.map((feature, idx) => (
                <li key={idx} className={`flex items-start gap-3 ${plan.isPopular || plan.isPremium ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {plan.isOneTime ? (
                    <Zap className={`w-5 h-5 ${plan.checkIcon} mt-0.5 shrink-0`} />
                  ) : (
                    <Check className={`w-5 h-5 ${plan.checkIcon} mt-0.5 shrink-0`} />
                  )}
                  <span className={isCompact ? 'text-sm' : ''}>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Button */}
            <div className="mt-auto relative z-10">
              {isCurrentPlan && showManageButton ? (
                <button
                  onClick={handleManage}
                  disabled={loadingTier === 'manage'}
                  className="w-full h-14 rounded-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                >
                  {loadingTier === 'manage' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {t('pricing.manageSubscription')}
                </button>
              ) : plan.isOneTime ? (
                <button
                  onClick={handleDayUse}
                  disabled={loadingTier === 'dayuse'}
                  className={`w-full h-14 rounded-lg font-bold ${plan.buttonClass} transition-all hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  {loadingTier === 'dayuse' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    plan.cta
                  )}
                </button>
              ) : (
                <button
                  onClick={() => plan.tier && handleSubscribe(plan.tier)}
                  disabled={loadingTier === plan.tier}
                  className={`w-full h-14 rounded-lg font-bold ${plan.buttonClass} transition-all hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  {loadingTier === plan.tier ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isDowngrade ? (
                    t('pricing.downgrade')
                  ) : (
                    plan.cta
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Subscription renewal info */}
      {subscription.isSubscribed && subscription.subscriptionEnd && showManageButton && (
        <div className="col-span-full text-center text-muted-foreground text-sm mt-2">
          {t('pricing.renewsOn')}{' '}
          <span className="text-foreground font-medium">
            {new Date(subscription.subscriptionEnd).toLocaleDateString(getLocale())}
          </span>
        </div>
      )}
    </div>
  );
}
