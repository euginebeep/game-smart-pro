/**
 * Landing Page - EUGINE v4.0
 * Public entry page with hero, interactive tabs, and pricing sections
 * Design: Dark Blue (#0A0E27) + Cyan (#00D9FF) theme
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Brain
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import MoneyExplosion from '@/components/MoneyExplosion';
import ParticlesBackground from '@/components/ParticlesBackground';

// Import step images
import step1Image from '@/assets/step1-escolha-jogo.png';
import step2Image from '@/assets/step2-receba-analise.png';
import step3Image from '@/assets/step3-decida-confianca.png';

export default function Landing() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState(1);
  const [premiumHovered, setPremiumHovered] = useState(false);

  const labels = {
    pt: {
      nav: {
        howItWorks: 'Como Funciona',
        plans: 'Planos',
        login: 'Login',
        getStarted: 'Comece Agora',
      },
      hero: {
        title: 'PARE DE ADIVINHAR.',
        titleHighlight: 'COMECE A GANHAR COM ANÁLISE DE DADOS.',
        subtitle: 'Nossa IA analisa mais de 40 mercados e 7 fatores por jogo para te dar a melhor recomendação. Simples, direto e lucrativo.',
        cta: 'RECEBER ANÁLISE GRÁTIS',
      },
      steps: {
        title: 'Entenda a Análise em 3 Passos Simples',
        step1: { 
          title: '1. Escolha o Jogo',
          heading: '1. Escolha o Jogo',
          description: 'Explore nossa extensa lista de eventos esportivos. Selecione o jogo de futebol que você deseja analisar com base nos times, data e hora. Sua análise começa aqui.',
        },
        step2: { 
          title: '2. Receba a Análise',
          heading: 'Insights Estratégicos',
          description: 'Receba análises baseadas em dados e algoritmos avançados para prever resultados com alta precisão. Nossas recomendações te dão a vantagem que você precisa.',
        },
        step3: { 
          title: '3. Decida com Confiança',
          heading: 'Decida com Confiança e Maximize seus Lucros',
          description: 'Use nossos dados e análises de especialistas para tomar decisões informadas. Veja seu histórico de sucesso, acompanhe o crescimento da sua banca e aposte com a certeza de quem sabe o que faz.',
        },
      },
      pricing: {
        title: 'Escolha o Plano Perfeito para Você',
        dayUse: {
          name: 'DAY USE',
          badge: 'Premium 24h',
          price: '$7,77',
          period: '/dia',
          features: [
            'Acesso Premium Completo por 24h',
            'Análises Avançadas Ilimitadas',
            'Pagamento Único (PIX)',
            'Sem Recorrência',
          ],
          cta: 'Comprar Day Use',
        },
        basic: {
          name: 'BASIC',
          price: '$29,90',
          period: '/mês',
          features: [
            '5 Jogos por Dia',
            'Análise Simples',
            '1 Dupla Diária',
          ],
          cta: 'Assinar Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Mais Popular',
          price: '$49,90',
          period: '/mês',
          features: [
            '10 Jogos por Dia',
            'Análise Completa',
            '3 Duplas Diárias',
            'Acumuladores',
          ],
          cta: 'Assinar Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Melhor Valor',
          originalPrice: '$199,00',
          price: '$79,90',
          period: '/mês',
          features: [
            'Jogos Ilimitados',
            'Análise Premium Completa',
            'Todas as Duplas e Zebras',
            'Acumuladores Premium',
            'Exportação de Relatórios',
            'Suporte Prioritário',
          ],
          cta: 'Assinar Premium',
        },
      },
      footer: {
        about: 'Sobre Nós',
        terms: 'Termos de Uso',
        privacy: 'Política de Privacidade',
        copyright: '© 2024 EUGINE v4.0. Todos os direitos reservados. Jogue com responsabilidade.',
      },
    },
    en: {
      nav: {
        howItWorks: 'How It Works',
        plans: 'Plans',
        login: 'Login',
        getStarted: 'Get Started',
      },
      hero: {
        title: 'STOP GUESSING. START',
        titleHighlight: 'WINNING WITH DATA ANALYSIS.',
        subtitle: 'Our AI analyzes over 40 markets and 7 factors per game to give you the best recommendation. Simple, direct, and profitable.',
        cta: 'GET FREE ANALYSIS',
      },
      steps: {
        title: 'Understand the Analysis in 3 Simple Steps',
        step1: { 
          title: '1. Choose the Game',
          heading: '1. Choose the Game',
          description: 'Explore our extensive list of sporting events. Select the football game you want to analyze based on teams, date and time. Your analysis starts here.',
        },
        step2: { 
          title: '2. Receive the Analysis',
          heading: 'Strategic Insights',
          description: 'Receive analysis based on data and advanced algorithms to predict results with high accuracy. Our recommendations give you the edge you need.',
        },
        step3: { 
          title: '3. Decide with Confidence',
          heading: 'Decide with Confidence and Maximize Your Profits',
          description: 'Use our data and expert analysis to make informed decisions. See your success history, track your bankroll growth and bet with confidence.',
        },
      },
      pricing: {
        title: 'Choose the Perfect Plan for You',
        dayUse: {
          name: 'DAY USE',
          badge: 'Premium 24h',
          price: '$7.77',
          period: '/day',
          features: [
            'Full Premium Access for 24h',
            'Unlimited Advanced Analysis',
            'One-Time Payment (PIX)',
            'No Recurring Charges',
          ],
          cta: 'Buy Day Use',
        },
        basic: {
          name: 'BASIC',
          price: '$29.90',
          period: '/month',
          features: [
            '5 Games per Day',
            'Simple Analysis',
            '1 Daily Double',
          ],
          cta: 'Subscribe Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Most Popular',
          price: '$49.90',
          period: '/month',
          features: [
            '10 Games per Day',
            'Complete Analysis',
            '3 Daily Doubles',
            'Accumulators',
          ],
          cta: 'Subscribe Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Best Value',
          originalPrice: '$199.00',
          price: '$79.90',
          period: '/month',
          features: [
            'Unlimited Games',
            'Full Premium Analysis',
            'All Doubles and Zebras',
            'Premium Accumulators',
            'Report Export',
            'Priority Support',
          ],
          cta: 'Subscribe Premium',
        },
      },
      footer: {
        about: 'About Us',
        terms: 'Terms of Use',
        privacy: 'Privacy Policy',
        copyright: '© 2024 EUGINE v4.0. All rights reserved. Gamble responsibly.',
      },
    },
    es: {
      nav: {
        howItWorks: 'Cómo Funciona',
        plans: 'Planes',
        login: 'Iniciar Sesión',
        getStarted: 'Comenzar',
      },
      hero: {
        title: 'DEJA DE ADIVINAR. EMPIEZA A',
        titleHighlight: 'GANAR CON ANÁLISIS DE DATOS.',
        subtitle: 'Nuestra IA analiza más de 40 mercados y 7 factores por juego para darte la mejor recomendación. Simple, directo y rentable.',
        cta: 'OBTENER ANÁLISIS GRATIS',
      },
      steps: {
        title: 'Entiende el Análisis en 3 Pasos Simples',
        step1: { 
          title: '1. Elige el Juego',
          heading: '1. Elige el Juego',
          description: 'Explora nuestra extensa lista de eventos deportivos. Selecciona el partido de fútbol que deseas analizar según los equipos, fecha y hora. Tu análisis comienza aquí.',
        },
        step2: { 
          title: '2. Recibe el Análisis',
          heading: 'Insights Estratégicos',
          description: 'Recibe análisis basados en datos y algoritmos avanzados para predecir resultados con alta precisión. Nuestras recomendaciones te dan la ventaja que necesitas.',
        },
        step3: { 
          title: '3. Decide con Confianza',
          heading: 'Decide con Confianza y Maximiza tus Ganancias',
          description: 'Usa nuestros datos y análisis de expertos para tomar decisiones informadas. Ve tu historial de éxito, sigue el crecimiento de tu banca y apuesta con seguridad.',
        },
      },
      pricing: {
        title: 'Elige el Plan Perfecto para Ti',
        dayUse: {
          name: 'DAY USE',
          badge: 'Premium 24h',
          price: '$7,77',
          period: '/día',
          features: [
            'Acceso Premium Completo por 24h',
            'Análisis Avanzados Ilimitados',
            'Pago Único (PIX)',
            'Sin Recurrencia',
          ],
          cta: 'Comprar Day Use',
        },
        basic: {
          name: 'BASIC',
          price: '$29,90',
          period: '/mes',
          features: [
            '5 Juegos por Día',
            'Análisis Simple',
            '1 Doble Diario',
          ],
          cta: 'Suscribir Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Más Popular',
          price: '$49,90',
          period: '/mes',
          features: [
            '10 Juegos por Día',
            'Análisis Completo',
            '3 Dobles Diarios',
            'Acumuladores',
          ],
          cta: 'Suscribir Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Mejor Valor',
          originalPrice: '$199,00',
          price: '$79,90',
          period: '/mes',
          features: [
            'Juegos Ilimitados',
            'Análisis Premium Completo',
            'Todas las Dobles y Zebras',
            'Acumuladores Premium',
            'Exportación de Informes',
            'Soporte Prioritario',
          ],
          cta: 'Suscribir Premium',
        },
      },
      footer: {
        about: 'Sobre Nosotros',
        terms: 'Términos de Uso',
        privacy: 'Política de Privacidad',
        copyright: '© 2024 EUGINE v4.0. Todos los derechos reservados. Juega responsablemente.',
      },
    },
    it: {
      nav: {
        howItWorks: 'Come Funziona',
        plans: 'Piani',
        login: 'Accedi',
        getStarted: 'Inizia Ora',
      },
      hero: {
        title: 'SMETTI DI INDOVINARE. INIZIA A',
        titleHighlight: "VINCERE CON L'ANALISI DEI DATI.",
        subtitle: "La nostra IA analizza oltre 40 mercati e 7 fattori per partita per darti la migliore raccomandazione. Semplice, diretto e redditizio.",
        cta: 'OTTIENI ANALISI GRATIS',
      },
      steps: {
        title: "Comprendi l'Analisi in 3 Semplici Passi",
        step1: { 
          title: '1. Scegli la Partita',
          heading: '1. Scegli la Partita',
          description: "Esplora la nostra ampia lista di eventi sportivi. Seleziona la partita di calcio che vuoi analizzare in base a squadre, data e ora. La tua analisi inizia qui.",
        },
        step2: { 
          title: "2. Ricevi l'Analisi",
          heading: 'Insights Strategici',
          description: "Ricevi analisi basate su dati e algoritmi avanzati per prevedere i risultati con alta precisione. Le nostre raccomandazioni ti danno il vantaggio che ti serve.",
        },
        step3: { 
          title: '3. Decidi con Fiducia',
          heading: 'Decidi con Fiducia e Massimizza i Tuoi Profitti',
          description: 'Usa i nostri dati e le analisi degli esperti per prendere decisioni informate. Visualizza la tua storia di successo, monitora la crescita del tuo bankroll e scommetti con sicurezza.',
        },
      },
      pricing: {
        title: 'Scegli il Piano Perfetto per Te',
        dayUse: {
          name: 'DAY USE',
          badge: 'Premium 24h',
          price: '$7,77',
          period: '/giorno',
          features: [
            'Accesso Premium Completo per 24h',
            'Analisi Avanzate Illimitate',
            'Pagamento Unico (PIX)',
            'Senza Ricorrenza',
          ],
          cta: 'Acquista Day Use',
        },
        basic: {
          name: 'BASIC',
          price: '$29,90',
          period: '/mese',
          features: [
            '5 Partite al Giorno',
            'Analisi Semplice',
            '1 Doppia Giornaliera',
          ],
          cta: 'Abbonati Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Più Popolare',
          price: '$49,90',
          period: '/mese',
          features: [
            '10 Partite al Giorno',
            'Analisi Completa',
            '3 Doppie Giornaliere',
            'Accumulatori',
          ],
          cta: 'Abbonati Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Miglior Valore',
          originalPrice: '$199,00',
          price: '$79,90',
          period: '/mese',
          features: [
            'Partite Illimitate',
            'Analisi Premium Completa',
            'Tutte le Doppie e Zebra',
            'Accumulatori Premium',
            'Esportazione Report',
            'Supporto Prioritario',
          ],
          cta: 'Abbonati Premium',
        },
      },
      footer: {
        about: 'Chi Siamo',
        terms: 'Termini di Uso',
        privacy: 'Politica sulla Privacy',
        copyright: '© 2024 EUGINE v4.0. Tutti i diritti riservati. Gioca responsabilmente.',
      },
    },
  };

  const l = labels[language] || labels.pt;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stepImages = [step1Image, step2Image, step3Image];
  const stepTitles = [l.steps.step1.title, l.steps.step2.title, l.steps.step3.title];
  const stepData = [
    { heading: l.steps.step1.heading, description: l.steps.step1.description },
    { heading: l.steps.step2.heading, description: l.steps.step2.description },
    { heading: l.steps.step3.heading, description: l.steps.step3.description },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Animated Particles Background */}
      <ParticlesBackground />
      
      {/* Circuit Pattern Background */}
      <div className="fixed inset-0 circuit-pattern pointer-events-none opacity-30" />
      
      {/* Navigation */}
      <nav className="relative z-50 max-w-7xl mx-auto flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow"
              style={{
                background: 'linear-gradient(135deg, hsl(185 100% 50%) 0%, hsl(260 80% 60%) 100%)',
              }}
            >
              <Brain className="w-5 h-5 text-background" />
            </div>
          </div>
          <span className="font-display text-xl font-bold tracking-wide">
            <span className="text-foreground">EUGINE</span>
            <span className="text-primary ml-1">v4.0</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold"
          >
            {l.nav.howItWorks}
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold"
          >
            {l.nav.plans}
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold"
          >
            {l.nav.login}
          </button>
          <LanguageSelector />
          <button 
            onClick={() => navigate('/auth')}
            className="btn-primary text-sm py-3 px-6"
          >
            {l.nav.getStarted}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSelector />
          <button 
            onClick={() => navigate('/auth')}
            className="btn-primary text-xs py-2 px-4"
          >
            {l.nav.getStarted}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-5 pt-16 pb-20 lg:pt-20 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-6 leading-[1.15]">
            <span className="text-foreground block">{l.hero.title}</span>
            <span className="text-primary block mt-1">{l.hero.titleHighlight}</span>
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            {l.hero.subtitle}
          </p>

          {/* Hero Phone Mockup Preview */}
          <div className="relative max-w-xs mx-auto mb-10" style={{ perspective: '1000px' }}>
            <div 
              className="relative transition-transform duration-500 hover:scale-105"
              style={{
                transform: 'rotateY(-5deg) rotateX(5deg)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotateY(-5deg) rotateX(5deg)';
              }}
            >
              {/* Phone Frame */}
              <div 
                className="relative w-[200px] h-[400px] sm:w-[220px] sm:h-[440px] mx-auto rounded-[32px] p-2 overflow-hidden"
                style={{ 
                  background: 'linear-gradient(145deg, hsla(230, 50%, 20%, 1), hsla(230, 50%, 15%, 1))',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px hsla(185, 100%, 50%, 0.2)',
                  border: '3px solid hsla(185, 100%, 50%, 0.3)'
                }}
              >
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-background/80 rounded-full z-20" />
                
                {/* Screen Content */}
                <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-card">
                  <img 
                    src={step1Image} 
                    alt="EUGINE Dashboard" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Button Overlay */}
                  <button 
                    onClick={() => navigate('/auth')}
                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                  >
                    <div 
                      className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center animate-glow cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div 
                className="absolute inset-0 -z-10 blur-3xl opacity-40"
                style={{
                  background: 'linear-gradient(180deg, hsla(185, 100%, 50%, 0.3) 0%, hsla(260, 80%, 60%, 0.3) 100%)',
                }}
              />
            </div>
          </div>

          <button 
            onClick={() => navigate('/auth')}
            className="btn-primary text-base sm:text-xl py-5 px-10 inline-flex items-center gap-2"
          >
            {l.hero.cta}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Interactive Manual Section */}
      <section id="how-it-works" className="relative px-5 py-20">
        <div 
          className="max-w-6xl mx-auto p-8 lg:p-16 rounded-3xl"
          style={{
            background: 'linear-gradient(180deg, hsl(230 45% 12%) 0%, hsl(230 50% 10%) 100%)',
            border: '1px solid hsla(185, 100%, 50%, 0.2)',
          }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-10">
            {l.steps.title}
          </h2>

          {/* Tab Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12">
            {stepTitles.map((title, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx + 1)}
                className={`flex-1 px-4 py-4 text-base lg:text-lg font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === idx + 1 
                    ? 'bg-primary text-primary-foreground shadow-[0_0_25px_hsla(185,100%,50%,0.7)]' 
                    : 'bg-card/50 text-muted-foreground border border-border hover:text-foreground hover:border-primary/30'
                }`}
                style={{
                  boxShadow: activeTab === idx + 1 ? '0 4px 15px rgba(0, 0, 0, 0.2)' : undefined,
                }}
              >
                {title}
              </button>
            ))}
          </div>

          {/* Tab Content - Two Column Layout */}
          <div className="relative">
            {stepData.map((step, idx) => (
              <div 
                key={idx}
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center transition-all duration-500 ${
                  activeTab === idx + 1 
                    ? 'opacity-100' 
                    : 'hidden opacity-0'
                }`}
              >
                {/* Text Column */}
                <div className="order-2 md:order-1 flex flex-col justify-start">
                  <h3 
                    className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {step.heading}
                  </h3>
                  <div className="bg-card/80 p-4 sm:p-5 lg:p-6 rounded-xl border border-border/50 backdrop-blur-sm">
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Phone Mockup Column */}
                <div 
                  className="order-1 md:order-2 flex justify-center items-center"
                  style={{ perspective: '1000px' }}
                >
                  <div 
                    className="relative w-[200px] h-[400px] sm:w-[240px] sm:h-[480px] md:w-[280px] md:h-[560px] lg:w-[320px] lg:h-[640px] transition-transform duration-500 hover:scale-105"
                    style={{
                      transform: 'rotateY(-8deg) rotateX(2deg)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'rotateY(-8deg) rotateX(2deg)';
                    }}
                  >
                    <img 
                      src={stepImages[idx]} 
                      alt={stepTitles[idx]}
                      className="w-full h-full object-contain"
                      style={{
                        filter: 'drop-shadow(0 0 30px hsla(185, 100%, 50%, 0.25))',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-12">
            {l.pricing.title}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Day Use - Special */}
            <div className="relative glass-card p-8 flex flex-col border-2 border-success/50 transition-all duration-300 hover:-translate-y-2.5 hover:border-primary hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.2)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-success text-success-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {l.pricing.dayUse.badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-4">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.dayUse.name}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-primary text-4xl sm:text-5xl font-black">{l.pricing.dayUse.price}</span>
                  <span className="text-muted-foreground text-base font-semibold">{l.pricing.dayUse.period}</span>
                </div>
              </div>
              <ul className="space-y-4 flex-grow mb-8">
                {l.pricing.dayUse.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <Zap className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full h-14 mt-auto rounded-lg font-bold bg-success text-success-foreground hover:bg-success/90 transition-all hover:shadow-lg flex items-center justify-center"
              >
                {l.pricing.dayUse.cta}
              </button>
            </div>

            {/* Basic */}
            <div className="glass-card p-8 flex flex-col border-2 border-transparent transition-all duration-300 hover:-translate-y-2.5 hover:border-primary hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.2)]">
              <div className="text-center mb-6">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.basic.name}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-primary text-4xl sm:text-5xl font-black">{l.pricing.basic.price}</span>
                  <span className="text-muted-foreground text-base font-semibold">{l.pricing.basic.period}</span>
                </div>
              </div>
              <ul className="space-y-4 flex-grow mb-8">
                {l.pricing.basic.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="btn-outline w-full h-14 mt-auto flex items-center justify-center"
              >
                {l.pricing.basic.cta}
              </button>
            </div>

            {/* Advanced - Featured */}
            <div className="relative glass-card p-8 flex flex-col price-card-highlighted transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.3)]">
              <div className="absolute -top-3 right-5 z-10">
                <span 
                  className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full inline-block"
                  style={{ transform: 'rotate(15deg)' }}
                >
                  {l.pricing.advanced.badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-4">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.advanced.name}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-primary text-4xl sm:text-5xl font-black">{l.pricing.advanced.price}</span>
                  <span className="text-muted-foreground text-base font-semibold">{l.pricing.advanced.period}</span>
                </div>
              </div>
              <ul className="space-y-4 flex-grow mb-8">
                {l.pricing.advanced.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="btn-primary w-full h-14 mt-auto flex items-center justify-center"
              >
                {l.pricing.advanced.cta}
              </button>
            </div>

            {/* Premium - Featured with Discount and Money Explosion */}
            <div 
              className="relative glass-card p-8 flex flex-col border-2 border-accent/50 transition-all duration-300 hover:-translate-y-2.5 hover:border-accent hover:shadow-[0_20px_40px_hsla(260,80%,60%,0.3)]" 
              style={{ background: 'linear-gradient(180deg, hsla(260, 80%, 60%, 0.1) 0%, hsla(230, 45%, 12%, 1) 100%)' }}
              onMouseEnter={() => setPremiumHovered(true)}
              onMouseLeave={() => setPremiumHovered(false)}
            >
              <MoneyExplosion isActive={premiumHovered} />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {(l.pricing.premium as any).badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-4 relative z-10">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.premium.name}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-lg line-through">{(l.pricing.premium as any).originalPrice}</span>
                  <span className="text-accent text-4xl sm:text-5xl font-black">{l.pricing.premium.price}</span>
                  <span className="text-muted-foreground text-base font-semibold">{l.pricing.premium.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-grow mb-8 relative z-10">
                {l.pricing.premium.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full h-14 mt-auto rounded-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 transition-all hover:shadow-lg relative z-10 flex items-center justify-center"
              >
                {l.pricing.premium.cta}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-5 py-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/about" className="hover:text-foreground transition-colors">{l.footer.about}</a>
              <a href="/termos-de-uso" className="hover:text-foreground transition-colors">{l.footer.terms}</a>
              <a href="/politica-de-privacidade" className="hover:text-foreground transition-colors">{l.footer.privacy}</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <p className="text-center text-muted-foreground text-sm mt-8">
            {l.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}