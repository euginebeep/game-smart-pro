import { useState } from 'react';
import { Check, Crown, Zap, Star, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'R$ 29,90',
    priceValue: 29.90,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Odds em tempo real',
      'Recomendação simples',
      '5 buscas por dia',
    ],
    tier: 'basic' as const,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 'R$ 49,90',
    priceValue: 49.90,
    icon: Star,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Tudo do Basic',
      'Histórico H2H',
      'Forma recente',
      'Posição na tabela',
      'Buscas ilimitadas',
    ],
    tier: 'advanced' as const,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 79,90',
    priceValue: 79.90,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Tudo do Advanced',
      'Lesões e desfalques',
      'Estatísticas completas',
      'Previsões da API',
      'Suporte prioritário',
    ],
    tier: 'premium' as const,
  },
];

export function PricingSection() {
  const { subscription, createCheckout, openCustomerPortal } = useAuth();
  const { t } = useLanguage();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: 'basic' | 'advanced' | 'premium') => {
    setLoadingTier(tier);
    try {
      await createCheckout(tier);
    } catch (err) {
      toast.error('Erro ao iniciar checkout. Tente novamente.');
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
      toast.error('Erro ao abrir portal. Tente novamente.');
      console.error(err);
    } finally {
      setLoadingTier(null);
    }
  };

  const currentTier = subscription.tier;

  return (
    <section className="py-8 sm:py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Escolha seu Plano
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Análises mais precisas com dados avançados
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentTier === plan.tier;
          const isUpgrade = 
            (currentTier === 'free' || currentTier === 'basic') && plan.tier !== 'basic' ||
            currentTier === 'advanced' && plan.tier === 'premium';
          const isDowngrade = 
            (currentTier === 'premium' && plan.tier !== 'premium') ||
            (currentTier === 'advanced' && plan.tier === 'basic');

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 scale-[1.02]'
                  : 'glass-card'
              } ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    SEU PLANO
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-black text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

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
                  Gerenciar Assinatura
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loadingTier === plan.tier}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {loadingTier === plan.tier ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isDowngrade ? (
                    'Fazer Downgrade'
                  ) : (
                    'Assinar Agora'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {subscription.isSubscribed && subscription.subscriptionEnd && (
        <p className="text-center text-muted-foreground text-sm mt-6">
          Sua assinatura renova em{' '}
          <span className="text-foreground font-medium">
            {new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')}
          </span>
        </p>
      )}
    </section>
  );
}
