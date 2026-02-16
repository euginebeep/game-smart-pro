/**
 * Landing Page - EUGINE
 * Optimized for paid traffic (TikTok, Meta, Google, Native Ads)
 * 80%+ mobile traffic — every element must justify its existence
 */

import { useState, useEffect, useRef } from 'react';
import USFlag3D from '@/components/USFlag3D';
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
  Clock,
  Download,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { ActiveUsersCounter } from '@/components/ActiveUsersCounter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Real app screenshots
import stepCardsImg from '@/assets/step-cards.png';
import stepAnalysisMainImg from '@/assets/step-analysis-main.png';
import stepAnalysisFactorsImg from '@/assets/step-analysis-factors.png';

// ScrollFadeIn component for scroll-triggered animations
function ScrollFadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState(1);
  const [stats, setStats] = useState({ hitRate: 0, wins: 0, total: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  
  // Lead capture state
  const [leadEmail, setLeadEmail] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!standalone);
    
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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
  async function handlePwaInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

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
        title: 'Pare de apostar no escuro.',
        titleHighlight: 'Aposte só quando a matemática está do seu lado.',
        subtitle: 'O EUGINE analisa mais de 50 jogos por dia e encontra quando a probabilidade REAL é maior que a odd oferecida. Sem emoção. Sem achismo. Só vantagem.',
        emailPlaceholder: 'Seu melhor e-mail',
        ctaButton: 'Ver análise grátis',
        ctaSubtext: 'Grátis. Sem cartão de crédito. Cancele quando quiser.',
        emailError: 'Digite um e-mail válido',
        trust1: '30+ ligas',
        trust2: '50+ jogos/dia',
        trust3: 'Odds em tempo real',
        hitRateLabel: 'de acerto nos últimos 30 dias',
        socialProof: 'Mais de 50 jogos analisados hoje. Só os com vantagem chegam até você.',
      },
      mechanism: {
        problem: 'A maioria aposta por impulso. Por emoção. Por palpite de grupo.',
        solution: 'O EUGINE calcula. Quando a probabilidade real é MAIOR que a odd oferecida, existe valor. Onde existe valor, existe vantagem no longo prazo.',
        discipline: 'Se não há vantagem matemática, NÃO apostamos. Disciplina é o que separa quem lucra de quem perde.',
      },
      steps: {
        title: 'Como o EUGINE encontra sua vantagem',
        step1: {
          title: '1. Varremos 50+ jogos',
          heading: 'Varremos 50+ jogos por dia',
          shortDesc: 'Analisamos todas as principais ligas, comparando odds de múltiplas casas com nosso modelo de probabilidade.',
        },
        step2: {
          title: '2. Encontramos onde a casa erra',
          heading: 'Encontramos onde a casa erra',
          shortDesc: 'Quando nossa probabilidade calculada é maior que a odd oferecida, existe valor. Aí você recebe o alerta.',
        },
        step3: {
          title: '3. Você aposta com vantagem',
          heading: 'Você aposta com vantagem',
          shortDesc: 'Cada sugestão mostra QUANTO de edge você tem. Ao longo do tempo, vantagem consistente = resultado consistente.',
        },
      },
      impactPhrase: 'Você não precisa ganhar todas. Só precisa ter vantagem.',
      closingLine: 'Inteligência supera sorte. Dados superam opinião. Disciplina supera impulso.',
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
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7,77', period: '/dia', features: ['Acesso Premium Completo por 24h', 'Análises Avançadas Ilimitadas', 'Pagamento Único (PIX)', 'Sem Recorrência'], cta: 'Comprar Day Use' },
        basic: { name: 'BASIC', price: '$29,90', period: '/mês', features: ['5 Jogos por Dia', 'Análise Simples', '1 Dupla Diária'], cta: 'Começar grátis →' },
        advanced: { name: 'ADVANCED', badge: 'MAIS POPULAR', price: '$49,90', period: '/mês', features: ['10 Jogos por Dia', 'Análise Completa', '3 Duplas Diárias', 'Acumuladores'], cta: 'Assinar Advanced' },
        premium: { name: 'PREMIUM', badge: 'Melhor Valor', price: '$79,90', period: '/mês', features: ['Jogos Ilimitados', 'Análise Premium Completa', 'Todas as Duplas e Zebras', 'Acumuladores Premium', 'Exportação de Relatórios', 'Suporte Prioritário'], cta: 'Assinar Premium' },
        comingSoon: 'Em breve',
      },
      footer: {
        about: 'Sobre Nós',
        terms: 'Termos de Uso',
        privacy: 'Política de Privacidade',
        responsible: 'Jogo Responsável',
        contact: 'Contato',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos os direitos reservados.`,
        disclaimer: 'O EUGINE é uma ferramenta de análise estatística. Resultados passados não garantem resultados futuros. Apostas esportivas envolvem risco de perda. Aposte com responsabilidade e apenas valores que você pode perder. O EUGINE não é uma casa de apostas e não processa transações financeiras de apostas. Se precisar de ajuda com apostas problemáticas, procure apoio em jogadoresanonimos.com.br',
      },
    },
    en: {
      nav: { howItWorks: 'How It Works', plans: 'Plans', login: 'Login', getStarted: 'Get Started' },
      hero: {
        title: 'Stop guessing.',
        titleHighlight: 'Bet only when the math is on your side.',
        subtitle: "EUGINE scans 50+ matches daily and detects when the REAL probability is higher than the bookmaker's odds. No emotion. No guesswork. Just edge.",
        emailPlaceholder: 'Your best email',
        ctaButton: 'See free analysis',
        ctaSubtext: 'Free. No credit card. Cancel anytime.',
        emailError: 'Enter a valid email',
        trust1: '30+ leagues',
        trust2: '50+ matches/day',
        trust3: 'Real-time odds',
        hitRateLabel: 'hit rate in the last 30 days',
        socialProof: '50+ matches analyzed today. Only those with edge reach you.',
      },
      mechanism: {
        problem: 'Most people bet on impulse. On emotion. On group tips.',
        solution: "EUGINE calculates. When the real probability is HIGHER than the offered odds, there's value. Where there's value, there's long-term edge.",
        discipline: "If there's no mathematical edge, we DON'T bet. Discipline separates winners from losers.",
      },
      steps: {
        title: 'How EUGINE finds your edge',
        step1: { title: '1. We scan 50+ matches', heading: 'We scan 50+ matches daily', shortDesc: 'We analyze all major leagues, comparing odds from multiple bookmakers with our probability model.' },
        step2: { title: '2. We find where the bookmaker is wrong', heading: 'We find where the bookmaker is wrong', shortDesc: "When our calculated probability exceeds the offered odds, there's value. That's when you get the alert." },
        step3: { title: '3. You bet with the edge', heading: 'You bet with the edge', shortDesc: 'Each pick shows HOW MUCH edge you have. Over time, consistent edge = consistent results.' },
      },
      impactPhrase: "You don't need to win every bet. You just need the edge.",
      closingLine: 'Intelligence beats luck. Data beats opinion. Discipline beats impulse.',
      stats: { title: 'Full Transparency', subtitle: 'We publish all our results. No editing. No filter.', hitRate: 'Hit Rate', wins: 'Wins', total: 'Total Analyzed', leagues: 'Leagues Monitored', soon: 'Coming soon' },
      pricing: {
        title: 'Choose the Perfect Plan for You',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7.77', period: '/day', features: ['Full Premium Access for 24h', 'Unlimited Advanced Analysis', 'One-Time Payment', 'No Recurring Charges'], cta: 'Buy Day Use' },
        basic: { name: 'BASIC', price: '$29.90', period: '/month', features: ['5 Games per Day', 'Simple Analysis', '1 Daily Double'], cta: 'Start free →' },
        advanced: { name: 'ADVANCED', badge: 'MOST POPULAR', price: '$49.90', period: '/month', features: ['10 Games per Day', 'Complete Analysis', '3 Daily Doubles', 'Accumulators'], cta: 'Subscribe Advanced' },
        premium: { name: 'PREMIUM', badge: 'Best Value', price: '$79.90', period: '/month', features: ['Unlimited Games', 'Full Premium Analysis', 'All Doubles and Zebras', 'Premium Accumulators', 'Report Export', 'Priority Support'], cta: 'Subscribe Premium' },
        comingSoon: 'Coming soon',
      },
      footer: {
        about: 'About Us', terms: 'Terms of Use', privacy: 'Privacy Policy', responsible: 'Responsible Gambling', contact: 'Contact',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. All rights reserved.`,
        disclaimer: "EUGINE is a statistical analysis tool. Past results do not guarantee future performance. Sports betting involves risk of loss. Bet responsibly and only with money you can afford to lose. EUGINE is not a bookmaker and does not process betting transactions. If you need help with problem gambling, visit begambleaware.org",
      },
    },
    es: {
      nav: { howItWorks: 'Cómo Funciona', plans: 'Planes', login: 'Iniciar Sesión', getStarted: 'Comenzar' },
      hero: {
        title: 'Deja de apostar a ciegas.',
        titleHighlight: 'Apuesta solo cuando la matemática está de tu lado.',
        subtitle: 'EUGINE analiza más de 50 partidos al día y detecta cuando la probabilidad REAL es mayor que la cuota ofrecida. Sin emoción. Sin intuición. Solo ventaja.',
        emailPlaceholder: 'Tu mejor correo',
        ctaButton: 'Ver análisis gratis',
        ctaSubtext: 'Gratis. Sin tarjeta. Cancela cuando quieras.',
        emailError: 'Ingresa un correo válido',
        trust1: '30+ ligas',
        trust2: '50+ partidos/día',
        trust3: 'Cuotas en tiempo real',
        hitRateLabel: 'de acierto en los últimos 30 días',
        socialProof: 'Más de 50 partidos analizados hoy. Solo los que tienen ventaja llegan a ti.',
      },
      mechanism: {
        problem: 'La mayoría apuesta por impulso. Por emoción. Por pálpitos.',
        solution: 'EUGINE calcula. Cuando la probabilidad real es MAYOR que la cuota ofrecida, hay valor. Donde hay valor, hay ventaja a largo plazo.',
        discipline: 'Si no hay ventaja matemática, NO apostamos. La disciplina separa a los que ganan de los que pierden.',
      },
      steps: {
        title: 'Cómo EUGINE encuentra tu ventaja',
        step1: { title: '1. Escaneamos 50+ partidos', heading: 'Escaneamos 50+ partidos al día', shortDesc: 'Analizamos todas las ligas principales, comparando cuotas de múltiples casas con nuestro modelo de probabilidad.' },
        step2: { title: '2. Encontramos donde la casa se equivoca', heading: 'Encontramos donde la casa se equivoca', shortDesc: 'Cuando nuestra probabilidad calculada es mayor que la cuota ofrecida, hay valor. Ahí recibes la alerta.' },
        step3: { title: '3. Apuestas con ventaja', heading: 'Apuestas con ventaja', shortDesc: 'Cada sugerencia muestra CUÁNTA ventaja tienes. Con el tiempo, ventaja consistente = resultado consistente.' },
      },
      impactPhrase: 'No necesitas ganar todas. Solo necesitas tener ventaja.',
      closingLine: 'La inteligencia supera a la suerte. Los datos superan a la opinión. La disciplina supera al impulso.',
      stats: { title: 'Transparencia Total', subtitle: 'Publicamos todos nuestros resultados. Sin edición. Sin filtro.', hitRate: 'Tasa de Acierto', wins: 'Aciertos', total: 'Total Analizado', leagues: 'Ligas Monitoreadas', soon: 'Próximamente' },
      pricing: {
        title: 'Elige el Plan Perfecto para Ti',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7,77', period: '/día', features: ['Acceso Premium Completo por 24h', 'Análisis Avanzados Ilimitados', 'Pago Único', 'Sin Recurrencia'], cta: 'Comprar Day Use' },
        basic: { name: 'BASIC', price: '$29,90', period: '/mes', features: ['5 Juegos por Día', 'Análisis Simple', '1 Doble Diario'], cta: 'Empezar gratis →' },
        advanced: { name: 'ADVANCED', badge: 'MÁS POPULAR', price: '$49,90', period: '/mes', features: ['10 Juegos por Día', 'Análisis Completo', '3 Dobles Diarios', 'Acumuladores'], cta: 'Suscribir Advanced' },
        premium: { name: 'PREMIUM', badge: 'Mejor Valor', price: '$79,90', period: '/mes', features: ['Juegos Ilimitados', 'Análisis Premium Completo', 'Todas las Dobles y Zebras', 'Acumuladores Premium', 'Exportación de Informes', 'Soporte Prioritario'], cta: 'Suscribir Premium' },
        comingSoon: 'Próximamente',
      },
      footer: {
        about: 'Sobre Nosotros', terms: 'Términos de Uso', privacy: 'Política de Privacidad', responsible: 'Juego Responsable', contact: 'Contacto',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos los derechos reservados.`,
        disclaimer: 'EUGINE es una herramienta de análisis estadístico. Los resultados pasados no garantizan resultados futuros. Las apuestas deportivas conllevan riesgo de pérdida. Apuesta con responsabilidad y solo con dinero que puedas permitirte perder. Si necesitas ayuda, visita jugarbien.es',
      },
    },
    it: {
      nav: { howItWorks: 'Come Funziona', plans: 'Piani', login: 'Accedi', getStarted: 'Inizia Ora' },
      hero: {
        title: 'Smetti di scommettere al buio.',
        titleHighlight: 'Scommetti solo quando la matematica è dalla tua parte.',
        subtitle: 'EUGINE analizza oltre 50 partite al giorno e rileva quando la probabilità REALE è superiore alla quota offerta. Nessuna emozione. Nessuna intuizione. Solo vantaggio.',
        emailPlaceholder: 'La tua email migliore',
        ctaButton: 'Vedi analisi gratis',
        ctaSubtext: 'Gratis. Senza carta di credito. Cancella quando vuoi.',
        emailError: 'Inserisci una email valida',
        trust1: '30+ campionati',
        trust2: '50+ partite/giorno',
        trust3: 'Quote in tempo reale',
        hitRateLabel: 'di successo negli ultimi 30 giorni',
        socialProof: 'Oltre 50 partite analizzate oggi. Solo quelle con vantaggio arrivano a te.',
      },
      mechanism: {
        problem: 'La maggior parte scommette per impulso. Per emozione. Per istinto.',
        solution: "EUGINE calcola. Quando la probabilità reale è SUPERIORE alla quota offerta, c'è valore. Dove c'è valore, c'è un vantaggio a lungo termine.",
        discipline: 'Se non c\'è vantaggio matematico, NON scommettiamo. La disciplina separa chi guadagna da chi perde.',
      },
      steps: {
        title: 'Come EUGINE trova il tuo vantaggio',
        step1: { title: '1. Analizziamo 50+ partite', heading: 'Analizziamo 50+ partite al giorno', shortDesc: 'Analizziamo tutti i principali campionati, confrontando quote di più bookmaker con il nostro modello di probabilità.' },
        step2: { title: '2. Troviamo dove il bookmaker sbaglia', heading: 'Troviamo dove il bookmaker sbaglia', shortDesc: "Quando la nostra probabilità calcolata supera la quota offerta, c'è valore. È allora che ricevi l'avviso." },
        step3: { title: '3. Scommetti con vantaggio', heading: 'Scommetti con vantaggio', shortDesc: 'Ogni suggerimento mostra QUANTO vantaggio hai. Nel tempo, vantaggio costante = risultato costante.' },
      },
      impactPhrase: 'Non devi vincere ogni scommessa. Devi solo avere il vantaggio.',
      closingLine: "L'intelligenza batte la fortuna. I dati battono l'opinione. La disciplina batte l'impulso.",
      stats: { title: 'Trasparenza Totale', subtitle: 'Pubblichiamo tutti i nostri risultati. Senza modifiche. Senza filtri.', hitRate: 'Tasso di Successo', wins: 'Successi', total: 'Totale Analizzato', leagues: 'Campionati Monitorati', soon: 'In arrivo' },
      pricing: {
        title: 'Scegli il Piano Perfetto per Te',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7,77', period: '/giorno', features: ['Accesso Premium Completo per 24h', 'Analisi Avanzate Illimitate', 'Pagamento Unico', 'Senza Ricorrenza'], cta: 'Acquista Day Use' },
        basic: { name: 'BASIC', price: '$29,90', period: '/mese', features: ['5 Partite al Giorno', 'Analisi Semplice', '1 Doppia Giornaliera'], cta: 'Inizia gratis →' },
        advanced: { name: 'ADVANCED', badge: 'PIÙ POPOLARE', price: '$49,90', period: '/mese', features: ['10 Partite al Giorno', 'Analisi Completa', '3 Doppie Giornaliere', 'Accumulatori'], cta: 'Abbonati Advanced' },
        premium: { name: 'PREMIUM', badge: 'Miglior Valore', price: '$79,90', period: '/mese', features: ['Partite Illimitate', 'Analisi Premium Completa', 'Tutte le Doppie e Zebra', 'Accumulatori Premium', 'Esportazione Report', 'Supporto Prioritario'], cta: 'Abbonati Premium' },
        comingSoon: 'Prossimamente',
      },
      footer: {
        about: 'Chi Siamo', terms: 'Termini di Uso', privacy: 'Politica sulla Privacy', responsible: 'Gioco Responsabile', contact: 'Contatto',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Tutti i diritti riservati.`,
        disclaimer: "EUGINE è uno strumento di analisi statistica. I risultati passati non garantiscono risultati futuri. Le scommesse sportive comportano rischio di perdita. Scommetti responsabilmente e solo con denaro che puoi permetterti di perdere. Se hai bisogno di aiuto, visita giocaresponsabile.it",
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
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            <span className="text-foreground block">{l.hero.title}</span>
            <span className={`block mt-1 ${
              language === 'pt' ? 'text-[hsl(120,100%,35%)]' :
              language === 'es' ? 'text-[hsl(0,100%,45%)]' :
              language === 'it' ? 'text-[hsl(145,100%,32%)]' :
              'text-[hsl(220,100%,50%)]'
            }`}>{l.hero.titleHighlight}</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed px-2">
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
            <p className="text-muted-foreground/80 text-[10px] sm:text-xs mt-2 text-center">
              {l.hero.socialProof}
            </p>
          </div>

          <div className="mt-6">
            <ActiveUsersCounter />
          </div>

          {/* PWA Install CTA — Android/Chrome */}
          {deferredPrompt && !isStandalone && (
            <div className="mt-6 animate-fade-in">
              <button
                onClick={handlePwaInstall}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-sm font-semibold"
              >
                <Smartphone className="w-5 h-5" />
                <Download className="w-4 h-4" />
                {language === 'pt' ? 'Instalar App no celular' :
                 language === 'es' ? 'Instalar App en el móvil' :
                 language === 'it' ? 'Installa App sul telefono' :
                 'Install App on your phone'}
              </button>
              <p className="text-muted-foreground/60 text-[10px] mt-1.5">
                {language === 'pt' ? 'Acesse como um app. Sem baixar nada.' :
                 language === 'es' ? 'Accede como una app. Sin descargar nada.' :
                 language === 'it' ? 'Accedi come un\'app. Senza scaricare nulla.' :
                 'Access like an app. No download needed.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Mechanism — Impact copy */}
      <section className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ScrollFadeIn>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              {l.mechanism.problem}
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p className="text-foreground font-bold text-lg sm:text-xl mb-6 leading-relaxed">
              {l.mechanism.solution}
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={400}>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 sm:p-6 inline-block">
              <p className="text-primary font-bold text-sm sm:text-base">
                {l.mechanism.discipline}
              </p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* How It Works — Visual steps */}
      <section id="how-it-works" className="relative px-5 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-4">
            {l.steps.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base text-center mb-12 max-w-2xl mx-auto">
            {language === 'pt' ? 'Veja como funciona na prática — telas reais do sistema' :
             language === 'es' ? 'Mira cómo funciona en la práctica — pantallas reales del sistema' :
             language === 'it' ? 'Guarda come funziona nella pratica — schermate reali del sistema' :
             'See how it works in practice — real screenshots from the system'}
          </p>

          {/* Step 1 — Game Selection */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-14">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-xl shadow-primary/5">
                <img src={stepCardsImg} alt="EUGINE game cards" className="w-full h-auto" loading="lazy" />
              </div>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-3">
                {language === 'pt' ? 'PASSO 1' : language === 'es' ? 'PASO 1' : language === 'it' ? 'PASSO 1' : 'STEP 1'}
              </span>
              <h3 className="text-foreground font-bold text-xl sm:text-2xl mb-3">{stepData[0]?.heading}</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-3">
                {stepData[0]?.shortDesc}
              </p>
              <p className="text-muted-foreground/70 text-xs sm:text-sm leading-relaxed">
                {language === 'pt' ? '↑ Cada card mostra o jogo, as odds e o nível de confiança do EUGINE. Verde = vantagem detectada.' :
                 language === 'es' ? '↑ Cada tarjeta muestra el partido, las cuotas y el nivel de confianza de EUGINE. Verde = ventaja detectada.' :
                 language === 'it' ? '↑ Ogni card mostra la partita, le quote e il livello di fiducia di EUGINE. Verde = vantaggio rilevato.' :
                 '↑ Each card shows the match, odds and EUGINE confidence level. Green = edge detected.'}
              </p>
            </div>
          </div>

          {/* Step 2 — Full Analysis */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-14">
            <div className="w-full md:w-1/2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-3">
                {language === 'pt' ? 'PASSO 2' : language === 'es' ? 'PASO 2' : language === 'it' ? 'PASSO 2' : 'STEP 2'}
              </span>
              <h3 className="text-foreground font-bold text-xl sm:text-2xl mb-3">{stepData[1]?.heading}</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-3">
                {stepData[1]?.shortDesc}
              </p>
              <p className="text-muted-foreground/70 text-xs sm:text-sm leading-relaxed">
                {language === 'pt' ? '↑ A análise compara a probabilidade da casa com a do EUGINE. A barra verde mostra sua vantagem real (edge).' :
                 language === 'es' ? '↑ El análisis compara la probabilidad de la casa con la de EUGINE. La barra verde muestra tu ventaja real (edge).' :
                 language === 'it' ? '↑ L\'analisi confronta la probabilità del bookmaker con quella di EUGINE. La barra verde mostra il tuo vantaggio reale (edge).' :
                 '↑ The analysis compares the bookmaker\'s probability with EUGINE\'s. The green bar shows your real edge.'}
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-xl shadow-primary/5">
                <img src={stepAnalysisMainImg} alt="EUGINE analysis" className="w-full h-auto" loading="lazy" />
              </div>
            </div>
          </div>

          {/* Step 3 — Factors & Decision */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-xl shadow-primary/5">
                <img src={stepAnalysisFactorsImg} alt="EUGINE analysis factors" className="w-full h-auto" loading="lazy" />
              </div>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-3">
                {language === 'pt' ? 'PASSO 3' : language === 'es' ? 'PASO 3' : language === 'it' ? 'PASSO 3' : 'STEP 3'}
              </span>
              <h3 className="text-foreground font-bold text-xl sm:text-2xl mb-3">{stepData[2]?.heading}</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-3">
                {stepData[2]?.shortDesc}
              </p>
              <p className="text-muted-foreground/70 text-xs sm:text-sm leading-relaxed">
                {language === 'pt' ? '↑ Veja os 7 fatores que o EUGINE analisa: forma, H2H, odds, gols, posse, cantos e cartões. Tudo transparente.' :
                 language === 'es' ? '↑ Mira los 7 factores que EUGINE analiza: forma, H2H, cuotas, goles, posesión, córners y tarjetas. Todo transparente.' :
                 language === 'it' ? '↑ Guarda i 7 fattori che EUGINE analizza: forma, H2H, quote, gol, possesso, calci d\'angolo e cartellini. Tutto trasparente.' :
                 '↑ See the 7 factors EUGINE analyzes: form, H2H, odds, goals, possession, corners and cards. Fully transparent.'}
              </p>
            </div>
          </div>

          {/* CTA after How It Works */}
          <ScrollFadeIn className="mt-16">
            <div className="max-w-lg mx-auto text-center p-8 rounded-2xl border border-primary/20 bg-card/60" style={{ boxShadow: '0 0 40px hsla(199, 89%, 48%, 0.1)' }}>
              <h3 className="text-foreground font-bold text-xl sm:text-2xl mb-3">
                {language === 'pt' ? 'Comece agora — é grátis' :
                 language === 'es' ? 'Empieza ahora — es gratis' :
                 language === 'it' ? 'Inizia ora — è gratis' :
                 'Start now — it\'s free'}
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                {language === 'pt' ? 'Receba análises com vantagem matemática no seu email.' :
                 language === 'es' ? 'Recibe análisis con ventaja matemática en tu correo.' :
                 language === 'it' ? 'Ricevi analisi con vantaggio matematico nella tua email.' :
                 'Get analyses with mathematical edge in your inbox.'}
              </p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder={l.hero.emailPlaceholder}
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLeadCapture()}
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary/80 border border-border text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleLeadCapture}
                  disabled={leadLoading}
                  className="btn-primary px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center gap-2"
                >
                  {leadLoading ? '⏳' : <><ArrowRight className="w-4 h-4" /> {language === 'pt' ? 'Começar' : language === 'es' ? 'Empezar' : language === 'it' ? 'Inizia' : 'Start'}</>}
                </button>
              </div>
              <p className="text-muted-foreground/50 text-xs mt-3">{l.hero.ctaSubtext}</p>
            </div>
          </ScrollFadeIn>
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

      {/* Impact Phrase */}
      <section className="py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xl sm:text-2xl font-black text-foreground italic">
            &ldquo;{l.impactPhrase}&rdquo;
          </p>
        </div>
      </section>

      {/* Pricing Section — Simplified for ads */}
      <section id="pricing" className="relative px-5 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Closing line */}
          <p className="text-sm text-muted-foreground text-center max-w-md mx-auto mb-8">
            {l.closingLine}
          </p>

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
              <p className="text-muted-foreground text-xs mt-1 inline-flex items-center gap-1">by <USFlag3D className="w-4 h-3" /> GS ITALY INVESTMENTS LLC <USFlag3D className="w-4 h-3" /></p>
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

            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground/60 max-w-3xl mx-auto text-center leading-relaxed">
                {l.footer.disclaimer}
              </p>
            </div>

            <p className="text-muted-foreground/40 text-xs inline-flex items-center gap-1">
              <USFlag3D className="w-3.5 h-2.5" /> {l.footer.copyright} <USFlag3D className="w-3.5 h-2.5" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
