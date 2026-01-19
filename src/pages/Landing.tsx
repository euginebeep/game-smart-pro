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

// Import step images
import step1Image from '@/assets/step1-escolha-jogo.png';
import step2Image from '@/assets/step2-receba-analise.png';
import step3Image from '@/assets/step3-decida-confianca.png';

export default function Landing() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState(1);

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
        subtitle: 'Nossa IA analiza más de 40 mercados e 7 fatores por jogo para te dar a melhor recomendação. Simples, direto e lucrativo.',
        cta: 'RECEBER ANÁLISE GRÁTIS',
      },
      steps: {
        title: 'Entenda a Análise em 3 Passos Simples',
        step1: { title: '1. Escolha o Jogo' },
        step2: { title: '2. Receba a Análise' },
        step3: { title: '3. Decida com Confiança' },
      },
      pricing: {
        title: 'Escolha o Plano Perfeito para Você',
        dayUse: {
          name: 'DAY USE',
          badge: 'Acesso 24h',
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
          price: 'R$49',
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
          price: 'R$99',
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
          price: 'R$199',
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
        step1: { title: '1. Choose the Game' },
        step2: { title: '2. Receive the Analysis' },
        step3: { title: '3. Decide with Confidence' },
      },
      pricing: {
        title: 'Choose the Perfect Plan for You',
        dayUse: {
          name: 'DAY USE',
          badge: '24h Access',
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
          price: '$49',
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
          price: '$99',
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
          price: '$199',
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
        step1: { title: '1. Elige el Juego' },
        step2: { title: '2. Recibe el Análisis' },
        step3: { title: '3. Decide con Confianza' },
      },
      pricing: {
        title: 'Elige el Plan Perfecto para Ti',
        dayUse: {
          name: 'DAY USE',
          badge: 'Acceso 24h',
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
          price: '$49',
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
          price: '$99',
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
          price: '$199',
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
        titleHighlight: "VINCERE CON L'ANALISI DEI DATI.",
        subtitle: "La nostra IA analizza oltre 40 mercati e 7 fattori per partita per darti la migliore raccomandazione. Semplice, diretto e redditizio.",
        cta: 'OTTIENI ANALISI GRATIS',
      },
      steps: {
        title: "Comprendi l'Analisi in 3 Semplici Passi",
        step1: { title: '1. Scegli la Partita' },
        step2: { title: "2. Ricevi l'Analisi" },
        step3: { title: '3. Decidi con Fiducia' },
      },
      pricing: {
        title: 'Scegli il Piano Perfetto per Te',
        dayUse: {
          name: 'DAY USE',
          badge: 'Accesso 24h',
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
          price: '€49',
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
          price: '€99',
          period: '/mese',
          features: [
            'Analisi Completa di Tutte le Partite',
            'Più di 40 Mercati',
            "Insights Esclusivi dell'IA",
            'Supporto Prioritario',
          ],
          cta: 'Abbonati Advanced',
        },
        premium: {
          name: 'PREMIUM',
          price: '€199',
          period: '/mese',
          features: [
            "Tutto dell'Advanced +",
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

  const stepImages = [step1Image, step2Image, step3Image];
  const stepTitles = [l.steps.step1.title, l.steps.step2.title, l.steps.step3.title];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Circuit Pattern Background */}
      <div className="fixed inset-0 circuit-pattern pointer-events-none opacity-50" />
      
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

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            <span className="text-foreground">{l.hero.title}</span>
            <br />
            <span className="text-foreground">{l.hero.titleHighlight}</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10">
            {l.hero.subtitle}
          </p>

          {/* Hero Video/Dashboard Preview */}
          <div className="relative max-w-3xl mx-auto mb-10">
            <div 
              className="relative rounded-2xl overflow-hidden p-2.5"
              style={{ 
                background: 'linear-gradient(145deg, hsla(185, 100%, 50%, 0.2), hsla(260, 80%, 60%, 0.2))',
                boxShadow: '0 0 30px hsla(185, 100%, 50%, 0.1)'
              }}
            >
              <div className="bg-card rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
                {/* Dashboard Preview Image */}
                <img 
                  src={step1Image} 
                  alt="EUGINE Dashboard" 
                  className="w-full h-full object-cover opacity-80"
                />
                
                {/* Play Button Overlay */}
                <button 
                  onClick={() => navigate('/auth')}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div 
                    className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center animate-glow cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </button>
              </div>
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
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-10">
            {l.steps.title}
          </h2>

          {/* Tab Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5 mb-10">
            {stepTitles.map((title, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx + 1)}
                className={`tab-button ${activeTab === idx + 1 ? 'active' : ''}`}
              >
                {title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative">
            {stepImages.map((img, idx) => (
              <div 
                key={idx}
                className={`tab-content ${activeTab === idx + 1 ? 'active' : ''}`}
              >
                <img 
                  src={img} 
                  alt={stepTitles[idx]}
                  className="w-full h-auto rounded-lg"
                />
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
            <div className="relative glass-card p-8 flex flex-col border-2 border-success/50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-success text-success-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {l.pricing.dayUse.badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-4">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.dayUse.name}</h3>
                <div className="text-primary text-5xl font-black">
                  {l.pricing.dayUse.price}
                  <span className="text-muted-foreground text-lg font-semibold">{l.pricing.dayUse.period}</span>
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
                className="w-full py-4 mt-auto rounded-lg font-bold bg-success text-success-foreground hover:bg-success/90 transition-all hover:shadow-lg"
              >
                {l.pricing.dayUse.cta}
              </button>
            </div>

            {/* Basic */}
            <div className="glass-card p-8 flex flex-col border-2 border-transparent">
              <div className="text-center mb-6">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.basic.name}</h3>
                <div className="text-primary text-5xl font-black">
                  {l.pricing.basic.price}
                  <span className="text-muted-foreground text-lg font-semibold">{l.pricing.basic.period}</span>
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
                className="btn-outline w-full py-4 mt-auto"
              >
                {l.pricing.basic.cta}
              </button>
            </div>

            {/* Advanced - Featured */}
            <div className="relative glass-card p-8 flex flex-col price-card-highlighted">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  {l.pricing.advanced.badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-4">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.advanced.name}</h3>
                <div className="text-primary text-5xl font-black">
                  {l.pricing.advanced.price}
                  <span className="text-muted-foreground text-lg font-semibold">{l.pricing.advanced.period}</span>
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
                className="btn-primary w-full py-4 mt-auto"
              >
                {l.pricing.advanced.cta}
              </button>
            </div>

            {/* Premium */}
            <div className="glass-card p-8 flex flex-col border-2 border-transparent">
              <div className="text-center mb-6">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.premium.name}</h3>
                <div className="text-primary text-5xl font-black">
                  {l.pricing.premium.price}
                  <span className="text-muted-foreground text-lg font-semibold">{l.pricing.premium.period}</span>
                </div>
              </div>
              <ul className="space-y-4 flex-grow mb-8">
                {l.pricing.premium.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="btn-outline w-full py-4 mt-auto"
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