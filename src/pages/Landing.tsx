/**
 * Landing Page - EUGINE v4.0
 * Public entry page with hero, steps, and pricing sections
 */

import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Target, 
  BarChart3, 
  Zap,
  Shield,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Brain,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

// Import step images
import step1Image from '@/assets/step1-escolha-jogo.png';
import step2Image from '@/assets/step2-receba-analise.png';
import step3Image from '@/assets/step3-decida-confianca.png';

export default function Landing() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const labels = {
    pt: {
      nav: {
        howItWorks: 'Como Funciona',
        plans: 'Planos',
        login: 'Login',
        getStarted: 'Comece Agora',
      },
      hero: {
        title: 'PARE DE ADIVINHAR. COMECE A',
        titleHighlight: 'GANHAR COM ANÁLISE DE DADOS.',
        subtitle: 'Nossa IA analisa mais de 40 mercados e 7 fatores por jogo para te dar a melhor recomendação. Simples, direto e lucrativo.',
        cta: 'RECEBER ANÁLISE GRÁTIS',
      },
      steps: {
        title: 'Entenda a Análise em 3 Passos Simples',
        step1: {
          title: '1. Escolha o Jogo',
          desc: 'Selecione o jogo que deseja analisar entre centenas de opções disponíveis.',
        },
        step2: {
          title: '2. Receba a Análise',
          desc: 'A IA processa os dados em tempo real e gera uma recomendação clara e fundamentada.',
        },
        step3: {
          title: '3. Decida com Confiança',
          desc: 'Com probabilidade de acerto e análise aprofundada dos fatores decisivos.',
        },
        bottomText: 'A IA processa os dados em tempo real e gera uma recomendação clara e fundamentada, com probabilidade de acerto e análise aprofundada dos fatores decisivos.',
      },
      pricing: {
        title: 'Escolha o Plano Perfeito para Você',
        dayUse: {
          name: 'DAY USE',
          badge: 'Acesso Premium 24h',
          price: 'R$7,77',
          period: '/dia',
          features: [
            'Acesso Premium Completo',
            'Válido por 24 Horas',
            'Pagamento Único (PIX)',
            'Sem Recorrência',
          ],
          cta: 'Comprar Day Use',
        },
        basic: {
          name: 'BASIC',
          price: 'R$29,90',
          period: '/mês',
          features: [
            'Análise Básica de 10 Jogos/Dia',
            'Acesso a Mercados Populares',
            'Suporte por E-mail',
          ],
          cta: 'Assinar Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Mais Popular',
          price: 'R$49,90',
          period: '/mês',
          features: [
            'Análise Completa de Todos os Jogos',
            'Mais de 40 Mercados',
            'Insights Exclusivos de IA',
            'Suporte Prioritário',
          ],
          cta: 'Assinar Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Promoção',
          originalPrice: 'R$199,00',
          price: 'R$79,99',
          period: '/mês',
          features: [
            'Tudo do Advanced +',
            'Análise em Tempo Real',
            'Alertas Personalizados',
            'Consultoria com Especialista',
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
          desc: 'Select the game you want to analyze from hundreds of available options.',
        },
        step2: {
          title: '2. Receive the Analysis',
          desc: 'AI processes data in real-time and generates a clear, well-founded recommendation.',
        },
        step3: {
          title: '3. Decide with Confidence',
          desc: 'With probability of success and in-depth analysis of decisive factors.',
        },
        bottomText: 'AI processes data in real-time and generates a clear, well-founded recommendation, with probability of success and in-depth analysis of decisive factors.',
      },
      pricing: {
        title: 'Choose the Perfect Plan for You',
        dayUse: {
          name: 'DAY USE',
          badge: '24h Premium Access',
          price: '$7.77',
          period: '/day',
          features: [
            'Full Premium Access',
            'Valid for 24 Hours',
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
            'Basic Analysis of 10 Games/Day',
            'Access to Popular Markets',
            'Email Support',
          ],
          cta: 'Subscribe Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Most Popular',
          price: '$49.90',
          period: '/month',
          features: [
            'Complete Analysis of All Games',
            'More than 40 Markets',
            'Exclusive AI Insights',
            'Priority Support',
          ],
          cta: 'Subscribe Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Promo',
          originalPrice: '$199.00',
          price: '$79.99',
          period: '/month',
          features: [
            'Everything from Advanced +',
            'Real-Time Analysis',
            'Custom Alerts',
            'Expert Consultation',
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
          desc: 'Selecciona el juego que deseas analizar entre cientos de opciones disponibles.',
        },
        step2: {
          title: '2. Recibe el Análisis',
          desc: 'La IA procesa los datos en tiempo real y genera una recomendación clara y fundamentada.',
        },
        step3: {
          title: '3. Decide con Confianza',
          desc: 'Con probabilidad de acierto y análisis profundo de los factores decisivos.',
        },
        bottomText: 'La IA procesa los datos en tiempo real y genera una recomendación clara y fundamentada, con probabilidad de acierto y análisis profundo de los factores decisivos.',
      },
      pricing: {
        title: 'Elige el Plan Perfecto para Ti',
        dayUse: {
          name: 'DAY USE',
          badge: 'Acceso Premium 24h',
          price: '$7,77',
          period: '/día',
          features: [
            'Acceso Premium Completo',
            'Válido por 24 Horas',
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
            'Análisis Básico de 10 Juegos/Día',
            'Acceso a Mercados Populares',
            'Soporte por Email',
          ],
          cta: 'Suscribir Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Más Popular',
          price: '$49,90',
          period: '/mes',
          features: [
            'Análisis Completo de Todos los Juegos',
            'Más de 40 Mercados',
            'Insights Exclusivos de IA',
            'Soporte Prioritario',
          ],
          cta: 'Suscribir Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Promo',
          originalPrice: '$199,00',
          price: '$79,99',
          period: '/mes',
          features: [
            'Todo del Advanced +',
            'Análisis en Tiempo Real',
            'Alertas Personalizadas',
            'Consultoría con Especialista',
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
        titleHighlight: 'VINCERE CON L\'ANALISI DEI DATI.',
        subtitle: 'La nostra IA analizza oltre 40 mercati e 7 fattori per partita per darti la migliore raccomandazione. Semplice, diretto e redditizio.',
        cta: 'OTTIENI ANALISI GRATIS',
      },
      steps: {
        title: 'Comprendi l\'Analisi in 3 Semplici Passi',
        step1: {
          title: '1. Scegli la Partita',
          desc: 'Seleziona la partita che vuoi analizzare tra centinaia di opzioni disponibili.',
        },
        step2: {
          title: '2. Ricevi l\'Analisi',
          desc: 'L\'IA elabora i dati in tempo reale e genera una raccomandazione chiara e fondata.',
        },
        step3: {
          title: '3. Decidi con Fiducia',
          desc: 'Con probabilità di successo e analisi approfondita dei fattori decisivi.',
        },
        bottomText: 'L\'IA elabora i dati in tempo reale e genera una raccomandazione chiara e fondata, con probabilità di successo e analisi approfondita dei fattori decisivi.',
      },
      pricing: {
        title: 'Scegli il Piano Perfetto per Te',
        dayUse: {
          name: 'DAY USE',
          badge: 'Accesso Premium 24h',
          price: '€7,77',
          period: '/giorno',
          features: [
            'Accesso Premium Completo',
            'Valido per 24 Ore',
            'Pagamento Unico (PIX)',
            'Senza Ricorrenza',
          ],
          cta: 'Acquista Day Use',
        },
        basic: {
          name: 'BASIC',
          price: '€29,90',
          period: '/mese',
          features: [
            'Analisi Base di 10 Partite/Giorno',
            'Accesso ai Mercati Popolari',
            'Supporto via Email',
          ],
          cta: 'Abbonati Basic',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'Più Popolare',
          price: '€49,90',
          period: '/mese',
          features: [
            'Analisi Completa di Tutte le Partite',
            'Più di 40 Mercati',
            'Insights Esclusivi dell\'IA',
            'Supporto Prioritario',
          ],
          cta: 'Abbonati Advanced',
        },
        premium: {
          name: 'PREMIUM',
          badge: 'Promo',
          originalPrice: '€199,00',
          price: '€79,99',
          period: '/mese',
          features: [
            'Tutto dell\'Advanced +',
            'Analisi in Tempo Reale',
            'Avvisi Personalizzati',
            'Consulenza con Esperto',
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Circuit Pattern Background */}
      <div className="fixed inset-0 circuit-pattern pointer-events-none opacity-50" />
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow"
              style={{
                background: 'linear-gradient(135deg, hsl(185 90% 55%) 0%, hsl(195 100% 45%) 100%)',
              }}
            >
              <Brain className="w-5 h-5 text-background" />
            </div>
          </div>
          <span className="font-display text-xl font-bold tracking-wide">
            <span className="gradient-text">EUGINE</span>
            <span className="text-muted-foreground text-sm ml-1">v4.0</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            {l.nav.howItWorks}
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            {l.nav.plans}
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            {l.nav.login}
          </button>
          <LanguageSelector />
          <button 
            onClick={() => navigate('/auth')}
            className="btn-primary text-sm py-2.5 px-5"
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
      <section className="relative px-6 lg:px-12 pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            <span className="text-foreground italic">{l.hero.title}</span>
            <br />
            <span className="gradient-text italic">{l.hero.titleHighlight}</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10">
            {l.hero.subtitle}
          </p>

          {/* Hero Image/Video Placeholder */}
          <div className="relative max-w-4xl mx-auto mb-10">
            <div 
              className="relative rounded-2xl overflow-hidden neon-border p-1"
              style={{ background: 'linear-gradient(135deg, hsla(185, 90%, 55%, 0.1) 0%, hsla(210, 40%, 8%, 0.9) 100%)' }}
            >
              <div className="bg-card/80 backdrop-blur-xl rounded-xl p-8 sm:p-12">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                  {/* Dashboard Preview Mockup */}
                  <div className="relative w-full max-w-md">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-muted-foreground">Real Madrid vs Barcelona</span>
                        <span className="text-xs text-primary font-medium">Live</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-12 h-12 mx-auto bg-slate-600/50 rounded-full flex items-center justify-center mb-2">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-foreground font-bold text-sm">Real Madrid</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-12 h-12 mx-auto bg-slate-600/50 rounded-full flex items-center justify-center mb-2">
                            <Trophy className="w-6 h-6 text-accent" />
                          </div>
                          <p className="text-foreground font-bold text-sm">Barcelona</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Prediction Score</span>
                          <span className="text-lg font-bold text-primary">87%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: '87%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                      className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center animate-glow cursor-pointer pointer-events-auto hover:scale-110 transition-transform"
                      onClick={() => navigate('/auth')}
                    >
                      <Play className="w-8 h-8 text-background ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/auth')}
            className="btn-primary text-base sm:text-lg py-4 px-10 inline-flex items-center gap-2"
          >
            {l.hero.cta}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Steps Section - Full Width Images */}
      <section id="how-it-works" className="relative py-0">
        <div className="w-full">
          {/* Step 1 */}
          <div className="relative w-full">
            <img 
              src={step1Image} 
              alt={l.steps.step1.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Step 2 */}
          <div className="relative w-full">
            <img 
              src={step2Image} 
              alt={l.steps.step2.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Step 3 */}
          <div className="relative w-full">
            <img 
              src={step3Image} 
              alt={l.steps.step3.title}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-12 italic">
            {l.pricing.title}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Day Use - Special */}
            <div className="relative glass-card p-6 flex flex-col border-2 border-success/50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-success text-background text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {l.pricing.dayUse.badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-2">
                <span className="text-success font-display font-bold text-sm tracking-widest">{l.pricing.dayUse.name}</span>
                <div className="mt-2">
                  <span className="text-4xl font-black text-foreground">{l.pricing.dayUse.price}</span>
                  <span className="text-muted-foreground">{l.pricing.dayUse.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-grow mb-6">
                {l.pricing.dayUse.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full py-3 text-sm mt-auto rounded-lg font-semibold bg-success text-background hover:bg-success/90 transition-colors"
              >
                {l.pricing.dayUse.cta}
              </button>
            </div>

            {/* Basic */}
            <div className="glass-card p-6 flex flex-col">
              <div className="text-center mb-6">
                <span className="text-primary font-display font-bold text-sm tracking-widest">{l.pricing.basic.name}</span>
                <div className="mt-2">
                  <span className="text-4xl font-black text-foreground">{l.pricing.basic.price}</span>
                  <span className="text-muted-foreground">{l.pricing.basic.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-grow mb-6">
                {l.pricing.basic.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="btn-outline w-full py-3 text-sm mt-auto"
              >
                {l.pricing.basic.cta}
              </button>
            </div>

            {/* Advanced - Featured */}
            <div className="relative glass-card p-6 flex flex-col neon-border scale-[1.02]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-accent text-background text-xs font-bold px-4 py-1 rounded-full">
                  {l.pricing.advanced.badge}
                </span>
              </div>
              <div className="text-center mb-6">
                <span className="gradient-text font-display font-bold text-sm tracking-widest">{l.pricing.advanced.name}</span>
                <div className="mt-2">
                  <span className="text-4xl font-black text-foreground">{l.pricing.advanced.price}</span>
                  <span className="text-muted-foreground">{l.pricing.advanced.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-grow mb-6">
                {l.pricing.advanced.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="btn-primary w-full py-3 text-sm mt-auto"
              >
                {l.pricing.advanced.cta}
              </button>
            </div>

            {/* Premium - Promo */}
            <div className="relative glass-card p-6 flex flex-col border-2 border-warning/50 overflow-hidden">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-warning text-background text-xs font-bold px-4 py-1 rounded-full animate-pulse">
                  {l.pricing.premium.badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-2">
                <span className="text-warning font-display font-bold text-sm tracking-widest">{l.pricing.premium.name}</span>
                <div className="mt-2 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground line-through">{l.pricing.premium.originalPrice}</span>
                  <span className="text-3xl font-black text-warning">{l.pricing.premium.price}</span>
                  <span className="text-muted-foreground text-sm">{l.pricing.premium.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-grow mb-6">
                {l.pricing.premium.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full py-3 text-sm mt-auto rounded-lg font-semibold bg-warning text-background hover:bg-warning/90 transition-colors"
              >
                {l.pricing.premium.cta}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 lg:px-12 py-12 border-t border-border/50">
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

          <p className="text-center text-muted-foreground text-xs mt-8">
            {l.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
