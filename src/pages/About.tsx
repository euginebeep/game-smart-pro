import { ArrowLeft, Users, Target, Brain, TrendingUp, Shield, Award } from 'lucide-react';
import USFlag3D from '@/components/USFlag3D';
import { StandardFooter } from '@/components/StandardFooter';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function About() {
  const { t, language } = useLanguage();

  const teamMembers = [
    {
      name: 'Rafael Monteiro',
      role: language === 'pt' ? 'Cientista de Dados Sênior' : language === 'es' ? 'Científico de Datos Senior' : language === 'it' ? 'Data Scientist Senior' : 'Senior Data Scientist',
      description: language === 'pt' ? 'PhD em Estatística Aplicada pela USP. 12 anos de experiência em modelagem preditiva para mercados esportivos.' : language === 'es' ? 'PhD en Estadística Aplicada por la USP. 12 años de experiencia en modelado predictivo.' : language === 'it' ? 'PhD in Statistica Applicata presso USP. 12 anni di esperienza nella modellazione predittiva.' : 'PhD in Applied Statistics from USP. 12 years of experience in predictive modeling for sports markets.',
      initials: 'RM',
    },
    {
      name: 'Carolina Vasconcelos',
      role: language === 'pt' ? 'Analista Esportiva Chefe' : language === 'es' ? 'Analista Deportiva Jefe' : language === 'it' ? 'Analista Sportiva Capo' : 'Chief Sports Analyst',
      description: language === 'pt' ? 'Ex-consultora da Betfair. Especialista em análise tática e comportamento de mercado de odds.' : language === 'es' ? 'Ex consultora de Betfair. Especialista en análisis táctico.' : language === 'it' ? 'Ex consulente Betfair. Specialista in analisi tattica.' : 'Former Betfair consultant. Specialist in tactical analysis and odds market behavior.',
      initials: 'CV',
    },
    {
      name: 'Fernando Almeida',
      role: language === 'pt' ? 'Engenheiro de Machine Learning' : language === 'es' ? 'Ingeniero de Machine Learning' : language === 'it' ? 'Ingegnere di Machine Learning' : 'Machine Learning Engineer',
      description: language === 'pt' ? 'Mestre em IA pela UNICAMP. Desenvolvedor dos algoritmos proprietários de value betting do EUGINE.' : language === 'es' ? 'Máster en IA por UNICAMP. Desarrollador de los algoritmos propietarios.' : language === 'it' ? 'Master in IA presso UNICAMP. Sviluppatore degli algoritmi proprietari.' : "Master in AI from UNICAMP. Developer of EUGINE's proprietary value betting algorithms.",
      initials: 'FA',
    },
    {
      name: 'Juliana Santos',
      role: language === 'pt' ? 'Diretora de Produto' : language === 'es' ? 'Directora de Producto' : language === 'it' ? 'Direttrice di Prodotto' : 'Product Director',
      description: language === 'pt' ? '15 anos no mercado de iGaming. Responsável pela visão estratégica e experiência do usuário.' : language === 'es' ? '15 años en el mercado de iGaming.' : language === 'it' ? '15 anni nel mercato iGaming.' : '15 years in the iGaming market. Responsible for strategic vision and user experience.',
      initials: 'JS',
    },
  ];

  const methodologyFactors = [
    { icon: TrendingUp, title: language === 'pt' ? 'Análise de Mercado' : language === 'es' ? 'Análisis de Mercado' : language === 'it' ? 'Analisi di Mercato' : 'Market Analysis', description: language === 'pt' ? 'Monitoramento em tempo real de movimentação de odds e volume de apostas.' : language === 'es' ? 'Monitoreo en tiempo real de movimientos de cuotas.' : language === 'it' ? 'Monitoraggio in tempo reale dei movimenti delle quote.' : 'Real-time monitoring of odds movements and betting volume.' },
    { icon: Brain, title: language === 'pt' ? 'Inteligência Estatística' : language === 'es' ? 'Inteligencia Estadística' : language === 'it' ? 'Intelligenza Statistica' : 'Statistical Intelligence', description: language === 'pt' ? 'Algoritmos proprietários que processam mais de 50 variáveis por partida.' : language === 'es' ? 'Algoritmos propietarios que procesan más de 50 variables.' : language === 'it' ? 'Algoritmi proprietari che elaborano oltre 50 variabili.' : 'Proprietary algorithms processing 50+ variables per match.' },
    { icon: Target, title: 'Value Betting', description: language === 'pt' ? 'Identificação automática de discrepâncias entre odds oferecidas e probabilidades calculadas.' : language === 'es' ? 'Identificación automática de discrepancias entre cuotas y probabilidades.' : language === 'it' ? 'Identificazione automatica delle discrepanze tra quote e probabilità.' : 'Automatic identification of discrepancies between odds and probabilities.' },
    { icon: Shield, title: language === 'pt' ? 'Gestão de Risco' : language === 'es' ? 'Gestión de Riesgo' : language === 'it' ? 'Gestione del Rischio' : 'Risk Management', description: language === 'pt' ? 'Sistema de confiança que avalia o risco de cada recomendação.' : language === 'es' ? 'Sistema de confianza que evalúa el riesgo de cada recomendación.' : language === 'it' ? 'Sistema di fiducia che valuta il rischio di ogni raccomandazione.' : 'Confidence system that evaluates the risk of each recommendation.' },
  ];

  const content = {
    heroTitle: language === 'pt' ? 'Sobre a EUGINE' : language === 'es' ? 'Sobre EUGINE' : language === 'it' ? 'Su EUGINE' : 'About EUGINE',
    heroSubtitle: language === 'pt' ? 'Tecnologia de ponta para análise esportiva inteligente' : language === 'es' ? 'Tecnología de vanguardia para análisis deportivo inteligente' : language === 'it' ? "Tecnologia all'avanguardia per l'analisi sportiva intelligente" : 'Cutting-edge technology for intelligent sports analysis',
    missionTitle: language === 'pt' ? 'Nossa Missão' : language === 'es' ? 'Nuestra Misión' : language === 'it' ? 'La Nostra Missione' : 'Our Mission',
    missionText: language === 'pt' ? 'Democratizar o acesso a análises esportivas de alta qualidade, antes disponíveis apenas para apostadores profissionais e grandes fundos de investimento.' : language === 'es' ? 'Democratizar el acceso a análisis deportivos de alta calidad.' : language === 'it' ? "Democratizzare l'accesso ad analisi sportive di alta qualità." : 'Democratize access to high-quality sports analysis, previously available only to professional bettors.',
    teamTitle: language === 'pt' ? 'Nossa Equipe' : language === 'es' ? 'Nuestro Equipo' : language === 'it' ? 'Il Nostro Team' : 'Our Team',
    teamSubtitle: language === 'pt' ? 'Profissionais especializados com décadas de experiência combinada' : language === 'es' ? 'Profesionales especializados con décadas de experiencia' : language === 'it' ? 'Professionisti specializzati con decenni di esperienza' : 'Specialized professionals with decades of combined experience',
    methodologyTitle: language === 'pt' ? 'Nossa Metodologia' : language === 'es' ? 'Nuestra Metodología' : language === 'it' ? 'La Nostra Metodologia' : 'Our Methodology',
    methodologySubtitle: language === 'pt' ? 'Os 7 fatores que alimentam nosso motor de análise' : language === 'es' ? 'Los 7 factores que alimentan nuestro motor' : language === 'it' ? 'I 7 fattori che alimentano il nostro motore' : 'The 7 factors that power our analysis engine',
    statsTitle: language === 'pt' ? 'EUGINE em Números' : language === 'es' ? 'EUGINE en Números' : language === 'it' ? 'EUGINE in Numeri' : 'EUGINE by the Numbers',
  };

  const stats = [
    { value: '98.7%', label: language === 'pt' ? 'Uptime da Plataforma' : language === 'es' ? 'Tiempo de Actividad' : language === 'it' ? 'Tempo di Attività' : 'Platform Uptime' },
    { value: '50+', label: language === 'pt' ? 'Ligas Monitoradas' : language === 'es' ? 'Ligas Monitoreadas' : language === 'it' ? 'Leghe Monitorate' : 'Leagues Monitored' },
    { value: '10K+', label: language === 'pt' ? 'Análises por Mês' : language === 'es' ? 'Análisis por Mes' : language === 'it' ? 'Analisi al Mese' : 'Monthly Analyses' },
    { value: '2015', label: language === 'pt' ? 'Ano de Fundação' : language === 'es' ? 'Año de Fundación' : language === 'it' ? 'Anno di Fondazione' : 'Founded' },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <LanguageSelector />
          </div>
        </div>

        <div className="text-center mb-16">
          <div className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center bg-secondary/50">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">{content.heroTitle}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{content.heroSubtitle}</p>
        </div>

        <div className="rounded-xl p-8 border border-border/50 mb-12" style={{ background: 'hsl(var(--card))' }}>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            {content.missionTitle}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{content.missionText}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-xl p-6 text-center border border-border/50" style={{ background: 'hsl(var(--card))' }}>
              <p className="text-3xl sm:text-4xl font-black text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              {content.teamTitle}
            </h2>
            <p className="text-muted-foreground">{content.teamSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all" style={{ background: 'hsl(var(--card))' }}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-foreground font-bold text-sm shrink-0 bg-secondary/50">{member.initials}</div>
                  <div>
                    <h3 className="text-foreground font-bold text-lg">{member.name}</h3>
                    <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
              <Brain className="w-6 h-6 text-primary" />
              {content.methodologyTitle}
            </h2>
            <p className="text-muted-foreground">{content.methodologySubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {methodologyFactors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div key={index} className="rounded-xl p-6 border border-border/50" style={{ background: 'hsl(var(--card))' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold mb-2">{factor.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{factor.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <StandardFooter className="mt-8" />
      </div>
    </div>
  );
}
