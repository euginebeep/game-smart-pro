import { ArrowLeft, Users, Target, Brain, TrendingUp, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

/**
 * About Page - Institutional page describing EUGINE Analytics
 * Contains team information, methodology, and company mission
 * Following V4.0 specs for professional institutional content
 */
export default function About() {
  const { t, language } = useLanguage();

  // Team members with realistic Brazilian names and professional titles
  const teamMembers = [
    {
      name: 'Rafael Monteiro',
      role: language === 'pt' ? 'Cientista de Dados Sênior' : 
            language === 'es' ? 'Científico de Datos Senior' :
            language === 'it' ? 'Data Scientist Senior' : 'Senior Data Scientist',
      description: language === 'pt' 
        ? 'PhD em Estatística Aplicada pela USP. 12 anos de experiência em modelagem preditiva para mercados esportivos.'
        : language === 'es'
        ? 'PhD en Estadística Aplicada por la USP. 12 años de experiencia en modelado predictivo para mercados deportivos.'
        : language === 'it'
        ? 'PhD in Statistica Applicata presso USP. 12 anni di esperienza nella modellazione predittiva per i mercati sportivi.'
        : 'PhD in Applied Statistics from USP. 12 years of experience in predictive modeling for sports markets.',
      avatar: '👨‍🔬',
    },
    {
      name: 'Carolina Vasconcelos',
      role: language === 'pt' ? 'Analista Esportiva Chefe' :
            language === 'es' ? 'Analista Deportiva Jefe' :
            language === 'it' ? 'Analista Sportiva Capo' : 'Chief Sports Analyst',
      description: language === 'pt'
        ? 'Ex-consultora da Betfair. Especialista em análise tática e comportamento de mercado de odds.'
        : language === 'es'
        ? 'Ex consultora de Betfair. Especialista en análisis táctico y comportamiento del mercado de cuotas.'
        : language === 'it'
        ? 'Ex consulente Betfair. Specialista in analisi tattica e comportamento del mercato delle quote.'
        : 'Former Betfair consultant. Specialist in tactical analysis and odds market behavior.',
      avatar: '👩‍💼',
    },
    {
      name: 'Fernando Almeida',
      role: language === 'pt' ? 'Engenheiro de Machine Learning' :
            language === 'es' ? 'Ingeniero de Machine Learning' :
            language === 'it' ? 'Ingegnere di Machine Learning' : 'Machine Learning Engineer',
      description: language === 'pt'
        ? 'Mestre em IA pela UNICAMP. Desenvolvedor dos algoritmos proprietários de value betting do EUGINE.'
        : language === 'es'
        ? 'Máster en IA por UNICAMP. Desarrollador de los algoritmos propietarios de value betting de EUGINE.'
        : language === 'it'
        ? 'Master in IA presso UNICAMP. Sviluppatore degli algoritmi proprietari di value betting di EUGINE.'
        : 'Master in AI from UNICAMP. Developer of EUGINE\'s proprietary value betting algorithms.',
      avatar: '👨‍💻',
    },
    {
      name: 'Juliana Santos',
      role: language === 'pt' ? 'Diretora de Produto' :
            language === 'es' ? 'Directora de Producto' :
            language === 'it' ? 'Direttrice di Prodotto' : 'Product Director',
      description: language === 'pt'
        ? '15 anos no mercado de iGaming. Responsável pela visão estratégica e experiência do usuário.'
        : language === 'es'
        ? '15 años en el mercado de iGaming. Responsable de la visión estratégica y experiencia del usuario.'
        : language === 'it'
        ? '15 anni nel mercato iGaming. Responsabile della visione strategica e dell\'esperienza utente.'
        : '15 years in the iGaming market. Responsible for strategic vision and user experience.',
      avatar: '👩‍🎯',
    },
  ];

  // Analysis methodology factors
  const methodologyFactors = [
    {
      icon: TrendingUp,
      title: language === 'pt' ? 'Análise de Mercado' :
             language === 'es' ? 'Análisis de Mercado' :
             language === 'it' ? 'Analisi di Mercato' : 'Market Analysis',
      description: language === 'pt'
        ? 'Monitoramento em tempo real de movimentação de odds e volume de apostas nas principais casas.'
        : language === 'es'
        ? 'Monitoreo en tiempo real de movimientos de cuotas y volumen de apuestas en las principales casas.'
        : language === 'it'
        ? 'Monitoraggio in tempo reale dei movimenti delle quote e del volume delle scommesse nelle principali agenzie.'
        : 'Real-time monitoring of odds movements and betting volume at major bookmakers.',
    },
    {
      icon: Brain,
      title: language === 'pt' ? 'Inteligência Estatística' :
             language === 'es' ? 'Inteligencia Estadística' :
             language === 'it' ? 'Intelligenza Statistica' : 'Statistical Intelligence',
      description: language === 'pt'
        ? 'Algoritmos proprietários que processam mais de 50 variáveis por partida para calcular probabilidades reais.'
        : language === 'es'
        ? 'Algoritmos propietarios que procesan más de 50 variables por partido para calcular probabilidades reales.'
        : language === 'it'
        ? 'Algoritmi proprietari che elaborano oltre 50 variabili per partita per calcolare le probabilità reali.'
        : 'Proprietary algorithms processing 50+ variables per match to calculate true probabilities.',
    },
    {
      icon: Target,
      title: language === 'pt' ? 'Value Betting' :
             language === 'es' ? 'Value Betting' :
             language === 'it' ? 'Value Betting' : 'Value Betting',
      description: language === 'pt'
        ? 'Identificação automática de discrepâncias entre odds oferecidas e probabilidades calculadas.'
        : language === 'es'
        ? 'Identificación automática de discrepancias entre cuotas ofrecidas y probabilidades calculadas.'
        : language === 'it'
        ? 'Identificazione automatica delle discrepanze tra quote offerte e probabilità calcolate.'
        : 'Automatic identification of discrepancies between offered odds and calculated probabilities.',
    },
    {
      icon: Shield,
      title: language === 'pt' ? 'Gestão de Risco' :
             language === 'es' ? 'Gestión de Riesgo' :
             language === 'it' ? 'Gestione del Rischio' : 'Risk Management',
      description: language === 'pt'
        ? 'Sistema de confiança que avalia o risco de cada recomendação antes de apresentá-la ao usuário.'
        : language === 'es'
        ? 'Sistema de confianza que evalúa el riesgo de cada recomendación antes de presentarla al usuario.'
        : language === 'it'
        ? 'Sistema di fiducia che valuta il rischio di ogni raccomandazione prima di presentarla all\'utente.'
        : 'Confidence system that evaluates the risk of each recommendation before presenting it to users.',
    },
  ];

  const getContent = () => ({
    heroTitle: language === 'pt' ? 'Sobre a EUGINE' :
               language === 'es' ? 'Sobre EUGINE' :
               language === 'it' ? 'Su EUGINE' : 'About EUGINE',
    heroSubtitle: language === 'pt' 
      ? 'Tecnologia de ponta para análise esportiva inteligente'
      : language === 'es'
      ? 'Tecnología de vanguardia para análisis deportivo inteligente'
      : language === 'it'
      ? 'Tecnologia all\'avanguardia per l\'analisi sportiva intelligente'
      : 'Cutting-edge technology for intelligent sports analysis',
    missionTitle: language === 'pt' ? 'Nossa Missão' :
                  language === 'es' ? 'Nuestra Misión' :
                  language === 'it' ? 'La Nostra Missione' : 'Our Mission',
    missionText: language === 'pt'
      ? 'Democratizar o acesso a análises esportivas de alta qualidade, antes disponíveis apenas para apostadores profissionais e grandes fundos de investimento. Utilizamos ciência de dados avançada para transformar informações complexas em recomendações claras e acionáveis.'
      : language === 'es'
      ? 'Democratizar el acceso a análisis deportivos de alta calidad, antes disponibles solo para apostadores profesionales y grandes fondos de inversión. Utilizamos ciencia de datos avanzada para transformar información compleja en recomendaciones claras y accionables.'
      : language === 'it'
      ? 'Democratizzare l\'accesso ad analisi sportive di alta qualità, prima disponibili solo per scommettitori professionisti e grandi fondi di investimento. Utilizziamo la scienza dei dati avanzata per trasformare informazioni complesse in raccomandazioni chiare e attuabili.'
      : 'Democratize access to high-quality sports analysis, previously available only to professional bettors and large investment funds. We use advanced data science to transform complex information into clear, actionable recommendations.',
    teamTitle: language === 'pt' ? 'Nossa Equipe' :
               language === 'es' ? 'Nuestro Equipo' :
               language === 'it' ? 'Il Nostro Team' : 'Our Team',
    teamSubtitle: language === 'pt'
      ? 'Profissionais especializados com décadas de experiência combinada'
      : language === 'es'
      ? 'Profesionales especializados con décadas de experiencia combinada'
      : language === 'it'
      ? 'Professionisti specializzati con decenni di esperienza combinata'
      : 'Specialized professionals with decades of combined experience',
    methodologyTitle: language === 'pt' ? 'Nossa Metodologia' :
                      language === 'es' ? 'Nuestra Metodología' :
                      language === 'it' ? 'La Nostra Metodologia' : 'Our Methodology',
    methodologySubtitle: language === 'pt'
      ? 'Os 7 fatores que alimentam nosso motor de análise'
      : language === 'es'
      ? 'Los 7 factores que alimentan nuestro motor de análisis'
      : language === 'it'
      ? 'I 7 fattori che alimentano il nostro motore di analisi'
      : 'The 7 factors that power our analysis engine',
    statsTitle: language === 'pt' ? 'EUGINE em Números' :
                language === 'es' ? 'EUGINE en Números' :
                language === 'it' ? 'EUGINE in Numeri' : 'EUGINE by the Numbers',
  });

  const content = getContent();

  const stats = [
    { value: '98.7%', label: language === 'pt' ? 'Uptime da Plataforma' : language === 'es' ? 'Tiempo de Actividad' : language === 'it' ? 'Tempo di Attività' : 'Platform Uptime' },
    { value: '50+', label: language === 'pt' ? 'Ligas Monitoradas' : language === 'es' ? 'Ligas Monitoreadas' : language === 'it' ? 'Leghe Monitorate' : 'Leagues Monitored' },
    { value: '10K+', label: language === 'pt' ? 'Análises por Mês' : language === 'es' ? 'Análisis por Mes' : language === 'it' ? 'Analisi al Mese' : 'Monthly Analyses' },
    { value: '2015', label: language === 'pt' ? 'Ano de Fundação' : language === 'es' ? 'Año de Fundación' : language === 'it' ? 'Anno di Fondazione' : 'Founded' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <LanguageSelector />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 mb-6">
            <Award className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            {content.heroTitle}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {content.heroSubtitle}
          </p>
        </div>

        {/* Mission Section */}
        <div className="glass-card p-8 rounded-2xl mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Target className="w-6 h-6 text-emerald-400" />
            {content.missionTitle}
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            {content.missionText}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="glass-card p-6 rounded-xl text-center"
            >
              <p className="text-3xl sm:text-4xl font-black gradient-text mb-2">
                {stat.value}
              </p>
              <p className="text-slate-400 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Users className="w-6 h-6 text-emerald-400" />
              {content.teamTitle}
            </h2>
            <p className="text-slate-400">{content.teamSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="glass-card p-6 rounded-xl hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-3xl flex-shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{member.name}</h3>
                    <p className="text-emerald-400 text-sm font-medium mb-2">{member.role}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{member.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Brain className="w-6 h-6 text-emerald-400" />
              {content.methodologyTitle}
            </h2>
            <p className="text-slate-400">{content.methodologySubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {methodologyFactors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div 
                  key={index}
                  className="glass-card p-6 rounded-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-2">{factor.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{factor.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-border/30">
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-foreground">EUGINE</span>
            <p className="text-muted-foreground text-xs">
              by <span className="font-semibold">🇺🇸 GS ITALY INVESTMENTS LLC 🇺🇸</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
              <a href="/termos-de-uso" className="hover:text-foreground transition-colors">{t('main.terms')}</a>
              <a href="/politica-de-privacidade" className="hover:text-foreground transition-colors">{t('main.privacy')}</a>
            </div>
            <p className="text-muted-foreground/40 text-[10px]">
              © {new Date().getFullYear()} 🇺🇸 GS ITALY INVESTMENTS LLC 🇺🇸
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
