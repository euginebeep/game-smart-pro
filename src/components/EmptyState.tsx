import { Zap, TrendingUp, Shield, Clock } from 'lucide-react';

export function EmptyState() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Odds em Tempo Real',
      description: 'Dados atualizados das principais casas de apostas'
    },
    {
      icon: Shield,
      title: 'Análise Automatizada',
      description: 'Algoritmo identifica as melhores oportunidades'
    },
    {
      icon: Clock,
      title: 'Cache Inteligente',
      description: 'Otimização de requisições com cache de 5 minutos'
    }
  ];

  return (
    <div className="glass-card p-8 lg:p-12 text-center animate-fade-in-up">
      <div className="flex justify-center mb-6">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse-slow"
          style={{
            background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(160 84% 39%) 100%)',
            boxShadow: '0 0 40px hsla(160, 84%, 39%, 0.3)'
          }}
        >
          <Zap className="w-10 h-10 text-white" />
        </div>
      </div>

      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
        Pronto para Analisar
      </h2>
      <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
        Clique em <span className="text-primary font-semibold">"Buscar Jogos REAIS"</span> para 
        buscar as melhores odds de futebol em tempo real.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={feature.title}
            className="p-4 rounded-2xl bg-secondary/30 border border-border animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <feature.icon className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
