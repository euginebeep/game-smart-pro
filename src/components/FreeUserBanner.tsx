import { Crown, Gift, Clock, Zap, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FreeUserBannerProps {
  type: 'partial-report' | 'limit-reached';
}

export function FreeUserBanner({ type }: FreeUserBannerProps) {
  const { t } = useLanguage();

  if (type === 'partial-report') {
    return (
      <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              🎁 {t('freeUser.partialReport') || 'Relatório Parcial Gratuito'}
            </h3>
            <p className="text-amber-200/80 text-sm mt-1">
              {t('freeUser.partialReportDesc') || 'Você está vendo um relatório limitado com'}{' '}
              <span className="font-semibold text-white">3 {t('freeUser.matches') || 'partidas'}</span>, 
              <span className="font-semibold text-white"> 1 {t('freeUser.accumulator') || 'aposta combinada'}</span>{' '}
              {t('freeUser.and') || 'e'}{' '}
              <span className="font-semibold text-white">1 zebra</span>.
              {' '}{t('freeUser.subscribeForMore') || 'Assine um plano para acessar todas as análises completas!'}
            </p>
          </div>
          <a 
            href="#pricing-section" 
            className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            {t('freeUser.viewPlans') || 'Ver Planos'}
          </a>
        </div>
      </div>
    );
  }

  // limit-reached - Mini pricing cards matching Landing page design
  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-red-900/30 to-slate-900/95 border-2 border-red-500/50 rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center animate-pulse">
          <Clock className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-xl sm:text-2xl">
            🚫 {t('freeUser.limitTitle') || 'Usuários Grátis: 1 Relatório Por Dia'}
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg">
            {t('freeUser.limitDesc') || 'Você já utilizou seu relatório gratuito de hoje. Volte amanhã ou assine um plano para acesso ilimitado!'}
          </p>
        </div>
        
        {/* Pricing Mini Cards - Matching Landing page structure */}
        <div className="grid gap-3 sm:grid-cols-4 mt-4 w-full max-w-4xl">
          {/* Day Use */}
          <div className="glass-card border-2 border-success/50 rounded-xl p-4 hover:border-success transition-all">
            <div className="text-center">
              <span className="text-success font-bold text-sm">{t('pricing.plans.dayuse.name') || 'DAY USE'}</span>
              <div className="text-success/80 text-[10px] font-medium mt-1">Premium 24h</div>
            </div>
            <div className="text-2xl font-black text-white text-center my-2">$7,77</div>
            <div className="text-success/80 text-xs text-center font-medium">{t('pricing.oneTimePayment') || 'PAGAMENTO ÚNICO'}</div>
            <ul className="mt-3 space-y-1">
              <li className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                <Zap className="w-3 h-3 text-success shrink-0" />
                <span>Acesso Premium 24h</span>
              </li>
            </ul>
          </div>
          
          {/* Basic */}
          <div className="glass-card border-2 border-transparent rounded-xl p-4 hover:border-primary transition-all">
            <div className="text-center">
              <span className="text-primary font-bold text-sm">{t('pricing.plans.basic.name') || 'BASIC'}</span>
            </div>
            <div className="text-2xl font-black text-white text-center my-2">$29,90</div>
            <div className="text-muted-foreground text-xs text-center">/mês</div>
            <ul className="mt-3 space-y-1">
              <li className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                <Check className="w-3 h-3 text-primary shrink-0" />
                <span>5 jogos/dia</span>
              </li>
            </ul>
          </div>
          
          {/* Advanced */}
          <div className="relative glass-card price-card-highlighted rounded-xl p-4 transition-all">
            <div className="absolute -top-2 right-2 z-10">
              <span 
                className="bg-primary text-primary-foreground text-[8px] px-2 py-0.5 rounded-full font-bold inline-block"
                style={{ transform: 'rotate(15deg)' }}
              >
                {t('pricing.popular') || 'Mais Popular'}
              </span>
            </div>
            <div className="text-center pt-2">
              <span className="text-primary font-bold text-sm">{t('pricing.plans.advanced.name') || 'ADVANCED'}</span>
            </div>
            <div className="text-2xl font-black text-white text-center my-2">$49,90</div>
            <div className="text-muted-foreground text-xs text-center">/mês</div>
            <ul className="mt-3 space-y-1">
              <li className="flex items-center gap-1.5 text-foreground text-[10px]">
                <Check className="w-3 h-3 text-primary shrink-0" />
                <span>10 jogos + análises</span>
              </li>
            </ul>
          </div>
          
          {/* Premium */}
          <div 
            className="glass-card border-2 border-accent/50 rounded-xl p-4 hover:border-accent transition-all"
            style={{ background: 'linear-gradient(180deg, hsla(260, 80%, 60%, 0.1) 0%, hsla(230, 45%, 12%, 1) 100%)' }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-accent text-accent-foreground text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                {t('pricing.bestValue') || 'Melhor Valor'}
              </span>
            </div>
            <div className="text-center pt-2">
              <span className="text-accent font-bold text-sm">{t('pricing.plans.premium.name') || 'PREMIUM'}</span>
            </div>
            <div className="text-muted-foreground text-sm line-through text-center">$199,00</div>
            <div className="text-2xl font-black text-white text-center">$79,90</div>
            <div className="text-muted-foreground text-xs text-center">/mês</div>
            <ul className="mt-2 space-y-1">
              <li className="flex items-center gap-1.5 text-foreground text-[10px]">
                <Check className="w-3 h-3 text-accent shrink-0" />
                <span>Ilimitado + tudo</span>
              </li>
            </ul>
          </div>
        </div>
        
        <a 
          href="#pricing-section" 
          className="mt-4 bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 text-lg"
        >
          <Crown className="w-5 h-5" />
          {t('pricing.subscribeNow') || 'Assinar Agora'}
        </a>
        
        <p className="text-slate-500 text-xs">
          💳 Day Use {t('pricing.dayUseInfo') || 'é pagamento único via Stripe'} • {t('pricing.otherPlansInfo') || 'Demais planos são recorrentes mensais'}
        </p>
      </div>
    </div>
  );
}