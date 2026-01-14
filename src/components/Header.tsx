import { Zap, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onFetch: () => void;
  loading: boolean;
  apiRemaining: number | null;
}

export function Header({ onFetch, loading, apiRemaining }: HeaderProps) {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <header className="mb-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-5">
          {/* Animated Logo */}
          <div 
            className="w-[70px] h-[70px] rounded-[20px] flex items-center justify-center animate-pulse-slow"
            style={{
              background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(160 84% 39%) 100%)',
              boxShadow: '0 0 30px hsla(160, 84%, 39%, 0.4)'
            }}
          >
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h1 className="text-4xl lg:text-5xl font-black gradient-text tracking-tight">
              EUGINE v3.0
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base font-medium mt-1">
              Sistema de Análise de Apostas Esportivas
            </p>
          </div>
        </div>

        {/* Live Badge + Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Live Badge */}
          <div className="badge badge-live">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse-slow" />
            <span className="uppercase tracking-wide text-xs">
              ODDS REAIS • {today}
            </span>
          </div>

          {/* API Remaining */}
          {apiRemaining !== null && (
            <div className="badge badge-info">
              <span className="text-xs">
                API: {apiRemaining} requisições restantes
              </span>
            </div>
          )}

          {/* Fetch Button */}
          <button
            onClick={onFetch}
            disabled={loading}
            className="btn-primary flex items-center gap-3 text-lg"
          >
            <Zap className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Buscando...' : 'Buscar Jogos REAIS'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
