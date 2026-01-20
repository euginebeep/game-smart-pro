import { Crown, Zap, Gift, CreditCard, Clock } from 'lucide-react';
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
              🎁 Relatório Parcial Gratuito
            </h3>
            <p className="text-amber-200/80 text-sm mt-1">
              Você está vendo um relatório limitado com <span className="font-semibold text-white">3 partidas</span>, 
              <span className="font-semibold text-white"> 1 aposta combinada</span> e 
              <span className="font-semibold text-white"> 1 zebra</span>.
              Assine um plano para acessar todas as análises completas, duplas premium e muito mais!
            </p>
          </div>
          <a 
            href="#pricing-section" 
            className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Ver Planos
          </a>
        </div>
      </div>
    );
  }

  // limit-reached
  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-red-900/30 to-slate-900/95 border-2 border-red-500/50 rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center animate-pulse">
          <Clock className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-xl sm:text-2xl">
            🚫 Usuários Grátis: 1 Relatório Por Dia
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg">
            Você já utilizou seu relatório gratuito de hoje. Volte amanhã ou assine um plano para acesso ilimitado às melhores análises!
          </p>
        </div>
        
        {/* Pricing Mini Cards */}
        <div className="grid gap-3 sm:grid-cols-4 mt-4 w-full max-w-3xl">
          {/* Day Use */}
          <div className="bg-slate-800/60 border border-emerald-500/30 rounded-xl p-4 hover:border-emerald-400/60 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm">Day Use</span>
            </div>
            <div className="text-2xl font-black text-white">$7,77</div>
            <div className="text-emerald-400/80 text-xs font-medium">PAGAMENTO ÚNICO</div>
            <div className="text-slate-500 text-[10px] mt-1">24h de acesso Premium</div>
          </div>
          
          {/* Basic */}
          <div className="bg-slate-800/60 border border-sky-500/30 rounded-xl p-4 hover:border-sky-400/60 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <span className="text-sky-400 font-bold text-sm">Basic</span>
            </div>
            <div className="text-2xl font-black text-white">$29,90</div>
            <div className="text-sky-400/80 text-xs">/mês</div>
            <div className="text-slate-500 text-[10px] mt-1">5 jogos/dia</div>
          </div>
          
          {/* Advanced */}
          <div className="bg-slate-800/60 border border-violet-500/30 rounded-xl p-4 hover:border-violet-400/60 transition-all relative">
            <div className="absolute -top-2 right-2 bg-violet-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">
              POPULAR
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-violet-400" />
              <span className="text-violet-400 font-bold text-sm">Advanced</span>
            </div>
            <div className="text-2xl font-black text-white">$49,90</div>
            <div className="text-violet-400/80 text-xs">/mês</div>
            <div className="text-slate-500 text-[10px] mt-1">10 jogos + análises</div>
          </div>
          
          {/* Premium */}
          <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-4 hover:border-amber-400/60 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">Premium</span>
            </div>
            <div className="text-2xl font-black text-white">$79,90</div>
            <div className="text-amber-400/80 text-xs">/mês</div>
            <div className="text-slate-500 text-[10px] mt-1">Ilimitado + tudo</div>
          </div>
        </div>
        
        <a 
          href="#pricing-section" 
          className="mt-4 bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 text-lg"
        >
          <Crown className="w-5 h-5" />
          Assinar Agora
        </a>
        
        <p className="text-slate-500 text-xs">
          💳 Day Use é pagamento único via Stripe • Demais planos são recorrentes mensais
        </p>
      </div>
    </div>
  );
}