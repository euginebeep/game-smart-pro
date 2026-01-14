import { Zap, TrendingUp, LogOut } from 'lucide-react';

interface HeaderProps {
  onFetch: () => void;
  loading: boolean;
  apiRemaining: number | null;
  onSignOut?: () => void;
}

export function Header({ onFetch, loading, apiRemaining, onSignOut }: HeaderProps) {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <header className="mb-6 sm:mb-8 lg:mb-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Animated Logo */}
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px] rounded-xl sm:rounded-2xl lg:rounded-[20px] flex items-center justify-center animate-pulse-slow"
            style={{
              background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(160 84% 39%) 100%)',
              boxShadow: '0 0 30px hsla(160, 84%, 39%, 0.4)'
            }}
          >
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black gradient-text tracking-tight">
              EUGINE v3.0
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base font-medium mt-0.5 sm:mt-1">
              Sistema de Análise de Apostas Esportivas
            </p>
          </div>
        </div>

        {/* Live Badge + Action */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
          {/* Live Badge */}
          <div className="badge badge-live text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-destructive rounded-full animate-pulse-slow" />
            <span className="uppercase tracking-wide">
              ODDS REAIS • {today}
            </span>
          </div>

          {/* API Remaining - hidden on mobile */}
          {apiRemaining !== null && (
            <div className="badge badge-info hidden sm:flex">
              <span className="text-xs">
                API: {apiRemaining} requisições
              </span>
            </div>
          )}

          {/* Fetch Button */}
          <button
            onClick={onFetch}
            disabled={loading}
            className="btn-primary flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg w-full sm:w-auto justify-center"
          >
            <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Buscando...' : 'Buscar Jogos'}</span>
          </button>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
