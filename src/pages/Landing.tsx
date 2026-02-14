/**
 * Landing Page - EUGINE
 * Optimized for paid traffic (TikTok, Meta, Google, Native Ads)
 * 80%+ mobile traffic — every element must justify its existence
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Shield,
  Globe,
  Activity,
  Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { ActiveUsersCounter } from '@/components/ActiveUsersCounter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Landing() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState(1);
  const [stats, setStats] = useState({ hitRate: 0, wins: 0, total: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  
  // Lead capture state
  const [leadEmail, setLeadEmail] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await supabase.from('bet_stats').select('*');
        if (data && data.length > 0) {
          const totalBets = data.reduce((sum: number, s: any) => sum + (s.total_bets || 0), 0);
          const totalWins = data.reduce((sum: number, s: any) => sum + (s.wins || 0), 0);
          const hitRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0;
          setStats({ hitRate, wins: totalWins, total: totalBets });
          if (totalBets > 10) setStatsLoaded(true);
        }
      } catch (err) {
        // Silent
      }
    }
    loadStats();
  }, []);

  // UTM Tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    if (utmSource) {
      sessionStorage.setItem('utm_source', utmSource);
      sessionStorage.setItem('utm_campaign', params.get('utm_campaign') || '');
      sessionStorage.setItem('utm_medium', params.get('utm_medium') || '');
      sessionStorage.setItem('utm_content', params.get('utm_content') || '');
    }
  }, []);

  // Lead capture handler
  async function handleLeadCapture() {
    if (!leadEmail || !leadEmail.includes('@')) {
      toast.error(l.hero.emailError);
      return;
    }
    setLeadLoading(true);
    try {
      await supabase.from('leads' as any).upsert({
        email: leadEmail,
        source: new URLSearchParams(window.location.search).get('utm_source') || 'organic',
        campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
        medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
      }, { onConflict: 'email' });
      navigate(`/auth?email=${encodeURIComponent(leadEmail)}&source=lead`);
    } catch {
      navigate(`/auth?email=${encodeURIComponent(leadEmail)}`);
    } finally {
      setLeadLoading(false);
    }
  }

  const labels: Record<string, any> = {
    pt: {
      nav: {
        howItWorks: 'Como Funciona',
        plans: 'Planos',
        login: 'Login',
        getStarted: 'Comece Agora',
      },
      hero: {
        title: 'Encontre apostas onde',
        titleHighlight: 'VOCÊ tem vantagem sobre a casa',
        subtitle: 'O EUGINE analisa mais de 50 jogos por dia e identifica quando a probabilidade REAL é maior que o que a Bet365 oferece. Você só aposta quando tem vantagem matemática.',
        emailPlaceholder: 'Seu melhor e-mail',
        ctaButton: 'Ver análise grátis',
        ctaSubtext: 'Grátis. Sem cartão de crédito. Cancele quando quiser.',
        emailError: 'Digite um e-mail válido',
        trust1: '30+ ligas',
        trust2: '50+ jogos/dia',
        trust3: 'Odds em tempo real',
        hitRateLabel: 'de acerto nos últimos 30 dias',
      },
      steps: {
        title: 'Como o EUGINE encontra sua vantagem',
        step1: { 
          title: '1. Varremos 50+ jogos',
          heading: 'Varremos 50+ jogos por dia',
          shortDesc: 'Todo dia analisamos jogos de 30+ ligas comparando odds de múltiplas casas.',
          description: 'Todos os dias analisamos jogos de 30+ ligas buscando discrepâncias nas odds. Quanto mais jogos analisamos, mais oportunidades encontramos.',
        },
        step2: { 
          title: '2. Encontramos a vantagem',
          heading: 'Achamos sua vantagem',
          shortDesc: 'Quando a probabilidade real é maior que o que a casa oferece, você recebe a recomendação.',
          description: 'Comparamos a probabilidade que a casa calcula com a probabilidade REAL baseada em estatísticas. Quando achamos diferença, avisamos você.',
        },
        step3: { 
          title: '3. Você aposta com edge',
          heading: 'Você aposta com edge',
          shortDesc: 'Cada aposta mostra QUANTO de vantagem você tem. Disciplina + edge = lucro consistente.',
          description: 'Cada sugestão mostra exatamente QUANTO de vantagem você tem. Ao longo do tempo, isso se transforma em lucro consistente.',
        },
      },
      stats: {
        title: 'Transparência Total',
        subtitle: 'Publicamos todos os nossos resultados. Sem edição. Sem filtro.',
        hitRate: 'Taxa de Acerto',
        wins: 'Acertos',
        total: 'Total Analisado',
        leagues: 'Ligas Monitoradas',
        soon: 'Em breve',
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
          cta: 'Começar grátis →',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'MAIS POPULAR',
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
        comingSoon: 'Em breve',
      },
      footer: {
        about: 'Sobre Nós',
        terms: 'Termos de Uso',
        privacy: 'Política de Privacidade',
        responsible: 'Jogo Responsável',
        contact: 'Contato',
        copyright: `© ${new Date().getFullYear()} GS ItalyInvestments. Todos os direitos reservados.`,
        disclaimer: 'Este sistema é para fins educacionais. Aposte com responsabilidade.',
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
        title: 'Find bets where',
        titleHighlight: 'YOU have the edge over the bookmaker',
        subtitle: 'EUGINE analyzes 50+ matches daily and identifies when the REAL probability is higher than what Bet365 offers. You only bet when you have a mathematical advantage.',
        emailPlaceholder: 'Your best email',
        ctaButton: 'See free analysis',
        ctaSubtext: 'Free. No credit card. Cancel anytime.',
        emailError: 'Enter a valid email',
        trust1: '30+ leagues',
        trust2: '50+ matches/day',
        trust3: 'Real-time odds',
        hitRateLabel: 'hit rate in the last 30 days',
      },
      steps: {
        title: 'How EUGINE finds your edge',
        step1: { 
          title: '1. We scan 50+ games',
          heading: 'We scan 50+ games daily',
          shortDesc: 'Every day we analyze matches from 30+ leagues comparing odds from multiple bookmakers.',
          description: 'Every day we analyze matches from 30+ leagues looking for odds discrepancies. The more games we analyze, the more opportunities we find.',
        },
        step2: { 
          title: '2. We find the edge',
          heading: 'We find your edge',
          shortDesc: 'When the real probability is higher than what the bookmaker offers, you get the recommendation.',
          description: 'We compare the probability the bookmaker calculates with the REAL probability based on statistics. When we find a gap, we alert you.',
        },
        step3: { 
          title: '3. You bet with edge',
          heading: 'You bet with edge',
          shortDesc: 'Each bet shows HOW MUCH edge you have. Discipline + edge = consistent profit.',
          description: 'Each suggestion shows exactly HOW MUCH edge you have. Over time, this turns into consistent profit.',
        },
      },
      stats: {
        title: 'Full Transparency',
        subtitle: 'We publish all our results. No editing. No filter.',
        hitRate: 'Hit Rate',
        wins: 'Wins',
        total: 'Total Analyzed',
        leagues: 'Leagues Monitored',
        soon: 'Coming soon',
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
            'One-Time Payment',
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
          cta: 'Start free →',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'MOST POPULAR',
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
        comingSoon: 'Coming soon',
      },
      footer: {
        about: 'About Us',
        terms: 'Terms of Use',
        privacy: 'Privacy Policy',
        responsible: 'Responsible Gambling',
        contact: 'Contact',
        copyright: `© ${new Date().getFullYear()} GS ItalyInvestments. All rights reserved.`,
        disclaimer: 'This system is for educational purposes. Gamble responsibly.',
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
        title: 'Encuentra apuestas donde',
        titleHighlight: 'TÚ tienes ventaja sobre la casa',
        subtitle: 'EUGINE analiza más de 50 partidos al día e identifica cuando la probabilidad REAL es mayor que lo que ofrece Bet365. Solo apuestas cuando tienes ventaja matemática.',
        emailPlaceholder: 'Tu mejor correo',
        ctaButton: 'Ver análisis gratis',
        ctaSubtext: 'Gratis. Sin tarjeta. Cancela cuando quieras.',
        emailError: 'Ingresa un correo válido',
        trust1: '30+ ligas',
        trust2: '50+ partidos/día',
        trust3: 'Cuotas en tiempo real',
        hitRateLabel: 'de acierto en los últimos 30 días',
      },
      steps: {
        title: 'Cómo EUGINE encuentra tu ventaja',
        step1: { 
          title: '1. Escaneamos 50+ juegos',
          heading: 'Escaneamos 50+ partidos al día',
          shortDesc: 'Cada día analizamos partidos de 30+ ligas comparando cuotas de múltiples casas.',
          description: 'Cada día analizamos partidos de 30+ ligas buscando discrepancias en las cuotas. Cuantos más partidos analizamos, más oportunidades encontramos.',
        },
        step2: { 
          title: '2. Encontramos la ventaja',
          heading: 'Encontramos tu ventaja',
          shortDesc: 'Cuando la probabilidad real es mayor que lo que la casa ofrece, recibes la recomendación.',
          description: 'Comparamos la probabilidad que la casa calcula con la probabilidad REAL basada en estadísticas. Cuando encontramos una diferencia, te avisamos.',
        },
        step3: { 
          title: '3. Apuestas con ventaja',
          heading: 'Apuestas con ventaja',
          shortDesc: 'Cada apuesta muestra CUÁNTA ventaja tienes. Disciplina + ventaja = ganancia consistente.',
          description: 'Cada sugerencia muestra exactamente CUÁNTA ventaja tienes. Con el tiempo, esto se convierte en ganancia consistente.',
        },
      },
      stats: {
        title: 'Transparencia Total',
        subtitle: 'Publicamos todos nuestros resultados. Sin edición. Sin filtro.',
        hitRate: 'Tasa de Acierto',
        wins: 'Aciertos',
        total: 'Total Analizado',
        leagues: 'Ligas Monitoreadas',
        soon: 'Próximamente',
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
            'Pago Único',
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
          cta: 'Empezar gratis →',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'MÁS POPULAR',
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
        comingSoon: 'Próximamente',
      },
      footer: {
        about: 'Sobre Nosotros',
        terms: 'Términos de Uso',
        privacy: 'Política de Privacidad',
        responsible: 'Juego Responsable',
        contact: 'Contacto',
        copyright: `© ${new Date().getFullYear()} GS ItalyInvestments. Todos los derechos reservados.`,
        disclaimer: 'Este sistema es para fines educativos. Juega responsablemente.',
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
        title: 'Trova scommesse dove',
        titleHighlight: 'TU hai il vantaggio sul bookmaker',
        subtitle: "EUGINE analizza oltre 50 partite al giorno e identifica quando la probabilità REALE è superiore a quella offerta da Bet365. Scommetti solo quando hai un vantaggio matematico.",
        emailPlaceholder: 'La tua email migliore',
        ctaButton: 'Vedi analisi gratis',
        ctaSubtext: 'Gratis. Senza carta di credito. Cancella quando vuoi.',
        emailError: 'Inserisci una email valida',
        trust1: '30+ campionati',
        trust2: '50+ partite/giorno',
        trust3: 'Quote in tempo reale',
        hitRateLabel: 'di successo negli ultimi 30 giorni',
      },
      steps: {
        title: 'Come EUGINE trova il tuo vantaggio',
        step1: { 
          title: '1. Analizziamo 50+ partite',
          heading: 'Analizziamo 50+ partite al giorno',
          shortDesc: 'Ogni giorno analizziamo partite di 30+ campionati confrontando quote di più bookmaker.',
          description: 'Ogni giorno analizziamo partite di 30+ campionati cercando discrepanze nelle quote. Più partite analizziamo, più opportunità troviamo.',
        },
        step2: { 
          title: '2. Troviamo il vantaggio',
          heading: 'Troviamo il tuo vantaggio',
          shortDesc: 'Quando la probabilità reale è maggiore di quella offerta dal bookmaker, ricevi la raccomandazione.',
          description: 'Confrontiamo la probabilità calcolata dal bookmaker con la probabilità REALE basata sulle statistiche. Quando troviamo una differenza, ti avvisiamo.',
        },
        step3: { 
          title: '3. Scommetti con vantaggio',
          heading: 'Scommetti con vantaggio',
          shortDesc: 'Ogni scommessa mostra QUANTO vantaggio hai. Disciplina + vantaggio = profitto costante.',
          description: 'Ogni suggerimento mostra esattamente QUANTO vantaggio hai. Nel tempo, questo si trasforma in profitto costante.',
        },
      },
      stats: {
        title: 'Trasparenza Totale',
        subtitle: 'Pubblichiamo tutti i nostri risultati. Senza modifiche. Senza filtri.',
        hitRate: 'Tasso di Successo',
        wins: 'Successi',
        total: 'Totale Analizzato',
        leagues: 'Campionati Monitorati',
        soon: 'In arrivo',
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
            'Pagamento Unico',
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
          cta: 'Inizia gratis →',
        },
        advanced: {
          name: 'ADVANCED',
          badge: 'PIÙ POPOLARE',
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
        comingSoon: 'Prossimamente',
      },
      footer: {
        about: 'Chi Siamo',
        terms: 'Termini di Uso',
        privacy: 'Politica sulla Privacy',
        responsible: 'Gioco Responsabile',
        contact: 'Contatto',
        copyright: `© ${new Date().getFullYear()} GS ItalyInvestments. Tutti i diritti riservati.`,
        disclaimer: 'Questo sistema è a scopo educativo. Gioca responsabilmente.',
      },
    },
  };

  const l = labels[language] || labels.pt;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stepTitles = [l.steps.step1.title, l.steps.step2.title, l.steps.step3.title];
  const stepData = [
    { heading: l.steps.step1.heading, shortDesc: l.steps.step1.shortDesc, description: l.steps.step1.description },
    { heading: l.steps.step2.heading, shortDesc: l.steps.step2.shortDesc, description: l.steps.step2.description },
    { heading: l.steps.step3.heading, shortDesc: l.steps.step3.shortDesc, description: l.steps.step3.description },
  ];

  return (
    <div 
      className="min-h-screen text-foreground overflow-x-hidden relative"
      style={{ background: 'linear-gradient(180deg, hsl(230 50% 8%) 0%, hsl(222 47% 11%) 50%, hsl(230 50% 8%) 100%)' }}
    >
      {/* Subtle glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 20%, hsla(199, 89%, 48%, 0.06) 0%, transparent 60%)' }} />
      <div className="fixed inset-0 circuit-pattern pointer-events-none opacity-30" />

      {/* Navigation */}
      <nav className="relative z-50 max-w-7xl mx-auto flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow"
              style={{ background: 'linear-gradient(135deg, hsl(185 100% 50%) 0%, hsl(260 80% 60%) 100%)' }}
            >
              <Brain className="w-5 h-5 text-background" />
            </div>
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-foreground">EUGINE</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">
            {l.nav.howItWorks}
          </button>
          <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">
            {l.nav.plans}
          </button>
          <button onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">
            {l.nav.login}
          </button>
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="btn-primary text-sm py-3 px-6">
            {l.nav.getStarted}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="btn-primary text-xs py-2 px-4">
            {l.nav.getStarted}
          </button>
        </div>
      </nav>

      {/* Hero Section — Optimized for mobile */}
      <section className="relative px-5 pt-12 pb-16 lg:pt-20 lg:pb-28">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-6 leading-[1.15]">
            <span className="text-foreground block">{l.hero.title}</span>
            <span className={`block mt-1 ${
              language === 'pt' ? 'text-[hsl(120,100%,35%)]' :
              language === 'es' ? 'text-[hsl(0,100%,45%)]' :
              language === 'it' ? 'text-[hsl(145,100%,32%)]' :
              'text-[hsl(220,100%,50%)]'
            }`}>{l.hero.titleHighlight}</span>
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-8 px-2">
            {l.hero.subtitle}
          </p>

          {/* Trust Signals — mobile-friendly */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
              <Globe className="w-4 h-4 text-primary" />
              {l.hero.trust1}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
              <Activity className="w-4 h-4 text-primary" />
              {l.hero.trust2}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-primary" />
              {l.hero.trust3}
            </div>
          </div>

          {/* Live stats if available */}
          {statsLoaded && stats.hitRate > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-primary text-2xl font-black">{stats.hitRate}%</span>
              <span className="text-muted-foreground text-sm">{l.hero.hitRateLabel}</span>
            </div>
          )}

          {/* Lead Capture Form — inline */}
          <div className="max-w-md mx-auto mb-4">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={l.hero.emailPlaceholder}
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLeadCapture()}
                className="flex-1 px-4 py-3.5 rounded-xl bg-secondary/80 border border-border text-foreground placeholder-muted-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleLeadCapture}
                disabled={leadLoading}
                className="btn-primary px-5 sm:px-8 py-3.5 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap flex items-center gap-2"
              >
                {leadLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    {l.hero.ctaButton}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-muted-foreground/60 text-xs mt-3 text-center">
              {l.hero.ctaSubtext}
            </p>
          </div>

          <div className="mt-6">
            <ActiveUsersCounter />
          </div>
        </div>
      </section>

      {/* How It Works — Compact for mobile */}
      <section id="how-it-works" className="relative px-5 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-10">
            {l.steps.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stepData.map((step, idx) => (
              <div 
                key={idx}
                className="text-center p-6 rounded-2xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="text-4xl mb-4">
                  {idx === 0 ? '🔍' : idx === 1 ? '📊' : '💰'}
                </div>
                <h3 className="text-foreground font-bold text-base sm:text-lg mb-2">
                  {step.heading}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.shortDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section — Only show with real data */}
      {statsLoaded && stats.total > 10 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-4">
              {l.stats.title}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
              {l.stats.subtitle}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-5 rounded-xl bg-secondary/30 border border-border/50">
                <Target className="w-7 h-7 text-primary mx-auto mb-2" />
                <p className="text-3xl sm:text-4xl font-black text-primary">{stats.hitRate}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{l.stats.hitRate}</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-secondary/30 border border-border/50">
                <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">{stats.wins}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{l.stats.wins}</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-secondary/30 border border-border/50">
                <BarChart3 className="w-7 h-7 text-foreground mx-auto mb-2" />
                <p className="text-3xl sm:text-4xl font-black text-foreground">{stats.total}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{l.stats.total}</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-secondary/30 border border-border/50">
                <TrendingUp className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                <p className="text-3xl sm:text-4xl font-black text-amber-400">30+</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{l.stats.leagues}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section — Simplified for ads */}
      <section id="pricing" className="relative px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-12">
            {l.pricing.title}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Day Use — Disabled */}
            <div className="relative glass-card p-8 flex flex-col border-2 border-success/50 opacity-70 transition-all duration-300">
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
                {l.pricing.dayUse.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <Zap className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                disabled
                className="w-full h-14 mt-auto rounded-lg font-bold opacity-50 cursor-not-allowed bg-muted text-muted-foreground flex items-center justify-center"
              >
                {l.pricing.comingSoon}
              </button>
            </div>

            {/* Basic — Green CTA */}
            <div className="glass-card p-8 flex flex-col border-2 border-transparent transition-all duration-300 hover:-translate-y-2.5 hover:border-primary hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.2)]">
              <div className="text-center mb-6">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.basic.name}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-primary text-4xl sm:text-5xl font-black">{l.pricing.basic.price}</span>
                  <span className="text-muted-foreground text-base font-semibold">{l.pricing.basic.period}</span>
                </div>
              </div>
              <ul className="space-y-4 flex-grow mb-8">
                {l.pricing.basic.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full h-14 mt-auto rounded-lg font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all hover:shadow-lg flex items-center justify-center"
              >
                {l.pricing.basic.cta}
              </button>
            </div>

            {/* Advanced — MOST POPULAR — scaled up */}
            <div className="relative glass-card p-8 flex flex-col price-card-highlighted transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.3)] sm:scale-105 origin-top">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span 
                  className="bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full inline-block animate-pulse"
                >
                  ⭐ {l.pricing.advanced.badge}
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
                {l.pricing.advanced.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="btn-primary w-full h-14 mt-auto flex items-center justify-center text-base font-bold"
              >
                {l.pricing.advanced.cta}
              </button>
            </div>

            {/* Premium — Amber CTA, no strikethrough price */}
            <div 
              className="relative glass-card p-8 flex flex-col border-2 border-accent/50 transition-all duration-300 hover:-translate-y-2.5 hover:border-accent hover:shadow-[0_20px_40px_hsla(260,80%,60%,0.3)]" 
              style={{ background: 'linear-gradient(180deg, hsla(260, 80%, 60%, 0.1) 0%, hsla(230, 45%, 12%, 1) 100%)' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {l.pricing.premium.badge}
                </span>
              </div>
              <div className="text-center mb-6 pt-4 relative z-10">
                <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.premium.name}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-amber-400 text-4xl sm:text-5xl font-black">{l.pricing.premium.price}</span>
                  <span className="text-muted-foreground text-base font-semibold">{l.pricing.premium.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-grow mb-8 relative z-10">
                {l.pricing.premium.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full h-14 mt-auto rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all hover:shadow-lg relative z-10 flex items-center justify-center"
              >
                {l.pricing.premium.cta}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-5 py-12 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <span className="font-display text-lg font-bold text-foreground">EUGINE</span>
              <p className="text-muted-foreground text-xs mt-1">by GS ItalyInvestments</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <a href="/about" className="hover:text-foreground transition-colors">{l.footer.about}</a>
              <a href="/termos-de-uso" className="hover:text-foreground transition-colors">{l.footer.terms}</a>
              <a href="/politica-de-privacidade" className="hover:text-foreground transition-colors">{l.footer.privacy}</a>
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {l.footer.responsible}
              </a>
              <a href="mailto:support@eugineai.com" className="hover:text-foreground transition-colors">{l.footer.contact}</a>
            </div>

            <p className="text-muted-foreground/50 text-xs text-center max-w-lg">
              {l.footer.disclaimer}
            </p>

            <p className="text-muted-foreground/40 text-xs">
              {l.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
