/**
 * Landing Page - EUGINE v5.0
 * Framework AIDA: Attention → Interest → Desire → Action
 * Mental Triggers: Urgency, Scarcity, Authority, Social Proof, Reciprocity
 * Optimized for paid traffic (TikTok, Meta, Google, Native Ads)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Smartphone,
  Star,
  Users,
  Lock,
  Award,
  ChevronDown,
  Play,
  AlertTriangle,
  Sparkles,
  Eye,
  Timer,
  MessageCircle,
  ThumbsUp,
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
import heroDashboardImg from '@/assets/hero-dashboard.png';

// ─── Animated Counter ───
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// ─── ScrollFadeIn ───
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

// ─── FAQ Accordion ───
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden transition-all">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors">
        <span className="text-foreground font-semibold text-sm sm:text-base pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed animate-fade-in-up">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [stats, setStats] = useState({ hitRate: 0, wins: 0, total: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!standalone);
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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
      } catch {}
    }
    loadStats();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    if (utmSource) {
      sessionStorage.setItem('utm_source', utmSource);
      sessionStorage.setItem('utm_campaign', params.get('utm_campaign') || '');
      sessionStorage.setItem('utm_medium', params.get('utm_medium') || '');
    }
  }, []);

  async function handlePwaInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // ─── Labels (only PT shown for brevity, others follow same pattern) ───
  const labels: Record<string, any> = {
    pt: {
      nav: { howItWorks: 'Como Funciona', plans: 'Planos', login: 'Login', getStarted: 'Comece Agora' },
      hero: {
        badge: '🔥 Usado em mais de 30 países',
        title: 'Pare de perder dinheiro em apostas.',
        titleHighlight: 'Comece a apostar com vantagem matemática.',
        subtitle: 'O EUGINE escaneia 50+ jogos por dia e mostra EXATAMENTE onde a probabilidade real é maior que a odd. Você só aposta quando tem edge.',
        emailPlaceholder: 'Seu melhor e-mail',
        ctaButton: 'Quero minha vantagem →',
        ctaSubtext: '✅ Grátis por 3 dias · Sem cartão · Cancele quando quiser',
        emailError: 'Digite um e-mail válido',
        trust1: '30+ ligas',
        trust2: '50+ jogos/dia',
        trust3: 'Odds em tempo real',
        hitRateLabel: 'de acerto nos últimos 30 dias',
        liveNow: 'analisando jogos agora',
      },
      problem: {
        title: 'Você conhece essa história?',
        items: [
          'Aposta por impulso e perde no final do jogo',
          'Segue "guru" de grupo que acerta 1 e erra 5',
          'Não sabe diferenciar aposta boa de aposta ruim',
          'Ganha às vezes, mas no total está negativo',
        ],
        conclusion: 'O problema não é apostar. É apostar SEM DADOS.',
      },
      mechanism: {
        title: 'Como o EUGINE transforma suas apostas',
        problem: 'A maioria aposta por impulso. Por emoção. Por palpite de grupo.',
        solution: 'O EUGINE calcula. Quando a probabilidade real é MAIOR que a odd oferecida, existe valor. Onde existe valor, existe vantagem no longo prazo.',
        discipline: 'Se não há vantagem matemática, NÃO apostamos. Disciplina é o que separa quem lucra de quem perde.',
      },
      steps: {
        title: 'Veja como funciona em 3 passos',
        subtitle: 'Telas reais do sistema — sem enrolação',
        step1: { heading: '1. Escaneamos 50+ jogos por dia', shortDesc: 'Analisamos todas as principais ligas do mundo, comparando odds de múltiplas casas com nosso modelo de probabilidade proprietário.', annotation: 'Cada card mostra o jogo, as odds e o nível de confiança. Verde = vantagem detectada.', trigger: 'Enquanto você lê isso, o EUGINE já está analisando os jogos de amanhã.' },
        step2: { heading: '2. Encontramos onde a casa ERRA', shortDesc: 'Quando nossa probabilidade calculada é MAIOR que a odd oferecida, existe valor. Aí você recebe o alerta com a % exata de vantagem.', annotation: 'A análise compara a probabilidade da casa com a do EUGINE. A barra verde mostra seu edge real.', trigger: 'A casa de apostas calcula rápido. O EUGINE calcula melhor.' },
        step3: { heading: '3. Você aposta SÓ com vantagem', shortDesc: 'Cada sugestão mostra QUANTO de edge você tem. No longo prazo, vantagem consistente = resultado consistente.', annotation: 'Veja os 7 fatores analisados: forma, H2H, odds, gols, posse, cantos e cartões. 100% transparente.', trigger: 'Imagine abrir o app e saber exatamente onde está a vantagem.' },
      },
      socialProof: {
        title: 'O que dizem nossos usuários',
        testimonials: [
          { name: 'Carlos M.', role: 'Apostador há 3 anos', text: 'Antes eu achava que entendia de futebol. O EUGINE me mostrou que entender ≠ ter edge. Meu ROI mudou completamente nos últimos 2 meses.', stars: 5 },
          { name: 'Rafael S.', role: 'Trader esportivo', text: 'Finalmente uma ferramenta que mostra a matemática por trás. Não é palpite, é análise de verdade com probabilidade calculada. Uso todo dia.', stars: 5 },
          { name: 'Fernando L.', role: 'Usuário Premium', text: 'Comecei no básico, hoje sou premium. A diferença é que agora eu sei POR QUE estou apostando, não fico no achismo.', stars: 5 },
          { name: 'Thiago R.', role: 'Apostador recreativo', text: 'O melhor é a transparência total. Eles publicam todos os resultados, erros e acertos. Isso me deu confiança pra confiar no sistema.', stars: 4 },
        ],
      },
      stats: {
        title: 'Resultados Reais. Sem Filtro.',
        subtitle: 'Publicamos TODOS os nossos resultados — acertos e erros. Transparência total.',
        hitRate: 'Taxa de Acerto',
        wins: 'Acertos',
        total: 'Total Analisado',
        leagues: 'Ligas Monitoradas',
      },
      authority: {
        title: 'Por que confiar no EUGINE?',
        items: [
          { icon: 'brain', title: 'IA Proprietária', desc: 'Modelo treinado com +100.000 partidas históricas e 7 fatores de análise.' },
          { icon: 'shield', title: 'Empresa registrada nos EUA', desc: 'GS ITALY INVESTMENTS LLC — empresa especializada em análise de dados com mais de 6 softwares para diversos segmentos.' },
          { icon: 'chart', title: 'Resultados auditáveis', desc: 'Todos os resultados são públicos e verificáveis. Sem edição.' },
          { icon: 'lock', title: 'Dados criptografados', desc: 'Sua conta e dados protegidos com criptografia de nível bancário.' },
        ],
      },
      urgency: {
        title: '⚠️ Vagas limitadas para o plano gratuito',
        subtitle: 'Para manter a qualidade das análises, limitamos o número de usuários gratuitos.',
        cta: 'Garantir minha vaga grátis →',
      },
      faq: {
        title: 'Perguntas Frequentes',
        items: [
          { q: 'O EUGINE garante lucro?', a: 'Não. Nenhuma ferramenta séria garante lucro. O EUGINE identifica onde você tem vantagem matemática. No longo prazo, apostar com edge positivo tende a gerar resultado positivo, mas cada aposta individual tem risco.' },
          { q: 'Como funciona o período grátis?', a: 'Você tem 3 dias de acesso completo, sem cartão de crédito. Pode cancelar a qualquer momento, sem compromisso.' },
          { q: 'Preciso entender de estatística?', a: 'Não! O EUGINE faz toda a análise e te entrega o resultado de forma visual e simples. Basta seguir as indicações de vantagem.' },
          { q: 'Quantos jogos são analisados por dia?', a: 'Analisamos 50+ jogos diariamente de mais de 30 ligas ao redor do mundo. Apenas os jogos com vantagem detectada chegam até você.' },
          { q: 'Posso usar no celular?', a: 'Sim! O EUGINE funciona como um app no seu celular. Basta acessar pelo navegador e adicionar à tela inicial. Sem download necessário.' },
        ],
      },
      impactPhrase: 'Você não precisa ganhar todas. Só precisa ter vantagem.',
      closingLine: 'Inteligência supera sorte. Dados superam opinião. Disciplina supera impulso.',
      pricing: {
        title: 'Escolha Seu Plano',
        guarantee: '🔒 Teste grátis por 7 dias sem risco',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7,77', period: '/dia', features: ['Acesso Premium Completo por 24h', 'Análises Avançadas Ilimitadas', 'Pagamento Único (PIX)', 'Sem Recorrência'], cta: 'Comprar Day Use' },
        basic: { name: 'BASIC', price: '$29,90', period: '/mês', features: ['5 Jogos por Dia', 'Análise Simples', '1 Dupla Diária'], cta: 'Começar grátis →' },
        advanced: { name: 'ADVANCED', badge: '⭐ MAIS POPULAR', price: '$49,90', period: '/mês', features: ['10 Jogos por Dia', 'Análise Completa', '3 Duplas Diárias', 'Acumuladores'], cta: 'Assinar Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Melhor Valor', price: '$79,90', period: '/mês', features: ['Jogos Ilimitados', 'Análise Premium Completa', 'Todas as Duplas e Zebras', 'Acumuladores Premium', 'Exportação de Relatórios', 'Suporte Prioritário'], cta: 'Assinar Premium' },
        comingSoon: 'Em breve',
      },
      finalCta: {
        title: 'Sua vantagem começa agora.',
        subtitle: 'Junte-se a milhares de apostadores que pararam de adivinhar e começaram a calcular.',
        cta: 'Começar grátis agora →',
      },
      footer: {
        about: 'Sobre Nós', terms: 'Termos de Uso', privacy: 'Política de Privacidade', responsible: 'Jogo Responsável', contact: 'Contato',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos os direitos reservados.`,
        disclaimer: 'O EUGINE é uma ferramenta de análise estatística. Resultados passados não garantem resultados futuros. Apostas esportivas envolvem risco de perda. Aposte com responsabilidade e apenas valores que você pode perder. O EUGINE não é uma casa de apostas e não processa transações financeiras de apostas. Se precisar de ajuda com apostas problemáticas, procure apoio em jogadoresanonimos.com.br',
      },
    },
    en: {
      nav: { howItWorks: 'How It Works', plans: 'Plans', login: 'Login', getStarted: 'Get Started' },
      hero: {
        badge: '🔥 Used in 30+ countries',
        title: 'Stop losing money on bets.',
        titleHighlight: 'Start betting with mathematical edge.',
        subtitle: "EUGINE scans 50+ matches daily and shows EXACTLY where the real probability beats the bookmaker's odds. You only bet when you have edge.",
        emailPlaceholder: 'Your best email',
        ctaButton: 'Get my edge →',
        ctaSubtext: '✅ Free for 3 days · No card · Cancel anytime',
        emailError: 'Enter a valid email',
        trust1: '30+ leagues', trust2: '50+ matches/day', trust3: 'Real-time odds',
        hitRateLabel: 'hit rate in the last 30 days',
        liveNow: 'analyzing matches now',
      },
      problem: {
        title: 'Sound familiar?',
        items: ['Bet on impulse and lose at the last minute', 'Follow tipsters who hit 1 and miss 5', "Can't tell a good bet from a bad one", 'Win sometimes, but overall in the red'],
        conclusion: "The problem isn't betting. It's betting WITHOUT DATA.",
      },
      mechanism: {
        title: 'How EUGINE transforms your bets',
        problem: 'Most people bet on impulse. On emotion. On group tips.',
        solution: "EUGINE calculates. When the real probability is HIGHER than the offered odds, there's value. Where there's value, there's long-term edge.",
        discipline: "If there's no mathematical edge, we DON'T bet. Discipline separates winners from losers.",
      },
      steps: {
        title: 'See how it works in 3 steps',
        subtitle: 'Real screenshots from the system — no fluff',
        step1: { heading: '1. We scan 50+ matches daily', shortDesc: 'We analyze all major leagues worldwide, comparing odds from multiple bookmakers with our proprietary probability model.', annotation: 'Each card shows the match, odds and confidence level. Green = edge detected.', trigger: "While you read this, EUGINE is already analyzing tomorrow's matches." },
        step2: { heading: '2. We find where the bookmaker is WRONG', shortDesc: "When our calculated probability EXCEEDS the offered odds, there's value. Then you get the alert with the exact % of edge.", annotation: "The analysis compares the bookmaker's probability with EUGINE's. The green bar shows your real edge.", trigger: 'The bookmaker calculates fast. EUGINE calculates better.' },
        step3: { heading: '3. You ONLY bet with edge', shortDesc: 'Each pick shows HOW MUCH edge you have. Over time, consistent edge = consistent results.', annotation: 'See the 7 analyzed factors: form, H2H, odds, goals, possession, corners and cards. 100% transparent.', trigger: 'Imagine opening the app and knowing exactly where the edge is.' },
      },
      socialProof: {
        title: 'What our users say',
        testimonials: [
          { name: 'James W.', role: 'Bettor for 4 years', text: "I used to rely on gut feeling. EUGINE changed everything — now I only place bets when the numbers back it up. Game changer.", stars: 5 },
          { name: 'Mike R.', role: 'Sports trader', text: "This is the first tool I've seen that actually shows the math. No hype, no tips — just cold, hard probability analysis.", stars: 5 },
          { name: 'David K.', role: 'Premium subscriber', text: "Went from losing monthly to actually being profitable. The edge detection is incredibly accurate and transparent.", stars: 5 },
          { name: 'Chris B.', role: 'Weekend bettor', text: "Love that they publish every single result — wins AND losses. That level of honesty is rare in this space.", stars: 4 },
        ],
      },
      stats: { title: 'Real Results. No Filter.', subtitle: 'We publish ALL results — hits and misses. Total transparency.', hitRate: 'Hit Rate', wins: 'Wins', total: 'Total Analyzed', leagues: 'Leagues Monitored' },
      authority: {
        title: 'Why trust EUGINE?',
        items: [
          { icon: 'brain', title: 'Proprietary AI', desc: 'Model trained with 100,000+ historical matches and 7 analysis factors.' },
          { icon: 'shield', title: 'US-registered company', desc: 'GS ITALY INVESTMENTS LLC — a data analytics company with 6+ software products across multiple industries.' },
          { icon: 'chart', title: 'Auditable results', desc: 'All results are public and verifiable. No editing.' },
          { icon: 'lock', title: 'Encrypted data', desc: 'Your account and data protected with bank-level encryption.' },
        ],
      },
      urgency: { title: '⚠️ Limited spots for the free plan', subtitle: 'To maintain analysis quality, we limit free users.', cta: 'Secure my free spot →' },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          { q: 'Does EUGINE guarantee profit?', a: "No. No serious tool guarantees profit. EUGINE identifies where you have mathematical edge. Long-term, betting with positive edge tends to yield positive results, but each individual bet carries risk." },
          { q: 'How does the free trial work?', a: "You get 3 days of full access, no credit card. Cancel anytime, no commitment." },
          { q: 'Do I need statistics knowledge?', a: "No! EUGINE does all the analysis and delivers results visually and simply. Just follow the edge indicators." },
          { q: 'How many matches are analyzed daily?', a: "We analyze 50+ matches daily from 30+ leagues worldwide. Only matches with detected edge reach you." },
          { q: 'Can I use it on mobile?', a: "Yes! EUGINE works like an app on your phone. Just access via browser and add to home screen. No download needed." },
        ],
      },
      impactPhrase: "You don't need to win every bet. You just need the edge.",
      closingLine: 'Intelligence beats luck. Data beats opinion. Discipline beats impulse.',
      pricing: {
        title: 'Choose Your Plan',
        guarantee: '🔒 Free trial for 7 days — zero risk',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7.77', period: '/day', features: ['Full Premium Access for 24h', 'Unlimited Advanced Analysis', 'One-Time Payment', 'No Recurring Charges'], cta: 'Buy Day Use' },
        basic: { name: 'BASIC', price: '$29.90', period: '/month', features: ['5 Games per Day', 'Simple Analysis', '1 Daily Double'], cta: 'Start free →' },
        advanced: { name: 'ADVANCED', badge: '⭐ MOST POPULAR', price: '$49.90', period: '/month', features: ['10 Games per Day', 'Complete Analysis', '3 Daily Doubles', 'Accumulators'], cta: 'Subscribe Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Best Value', price: '$79.90', period: '/month', features: ['Unlimited Games', 'Full Premium Analysis', 'All Doubles and Zebras', 'Premium Accumulators', 'Report Export', 'Priority Support'], cta: 'Subscribe Premium' },
        comingSoon: 'Coming soon',
      },
      finalCta: { title: 'Your edge starts now.', subtitle: 'Join thousands of bettors who stopped guessing and started calculating.', cta: 'Start free now →' },
      footer: {
        about: 'About Us', terms: 'Terms of Use', privacy: 'Privacy Policy', responsible: 'Responsible Gambling', contact: 'Contact',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. All rights reserved.`,
        disclaimer: "EUGINE is a statistical analysis tool. Past results do not guarantee future performance. Sports betting involves risk of loss. Bet responsibly and only with money you can afford to lose. EUGINE is not a bookmaker and does not process betting transactions. If you need help with problem gambling, visit begambleaware.org",
      },
    },
    es: {
      nav: { howItWorks: 'Cómo Funciona', plans: 'Planes', login: 'Iniciar Sesión', getStarted: 'Comenzar' },
      hero: {
        badge: '🔥 Usado en más de 30 países',
        title: 'Deja de perder dinero en apuestas.',
        titleHighlight: 'Apuesta solo con ventaja matemática.',
        subtitle: 'EUGINE escanea 50+ partidos al día y muestra EXACTAMENTE dónde la probabilidad real supera la cuota. Solo apuestas cuando tienes edge.',
        emailPlaceholder: 'Tu mejor correo',
        ctaButton: 'Quiero mi ventaja →',
        ctaSubtext: '✅ Gratis 3 días · Sin tarjeta · Cancela cuando quieras',
        emailError: 'Ingresa un correo válido',
        trust1: '30+ ligas', trust2: '50+ partidos/día', trust3: 'Cuotas en tiempo real',
        hitRateLabel: 'de acierto en los últimos 30 días',
        liveNow: 'analizando partidos ahora',
      },
      problem: {
        title: '¿Te suena familiar?',
        items: ['Apuestas por impulso y pierdes al final', 'Sigues a "gurús" que aciertan 1 y fallan 5', 'No sabes diferenciar una apuesta buena de una mala', 'Ganas a veces, pero en total estás en negativo'],
        conclusion: 'El problema no es apostar. Es apostar SIN DATOS.',
      },
      mechanism: {
        title: 'Cómo EUGINE transforma tus apuestas',
        problem: 'La mayoría apuesta por impulso. Por emoción. Por pálpitos.',
        solution: 'EUGINE calcula. Cuando la probabilidad real es MAYOR que la cuota ofrecida, hay valor. Donde hay valor, hay ventaja a largo plazo.',
        discipline: 'Si no hay ventaja matemática, NO apostamos. La disciplina separa a los que ganan de los que pierden.',
      },
      steps: {
        title: 'Mira cómo funciona en 3 pasos',
        subtitle: 'Pantallas reales del sistema — sin rodeos',
        step1: { heading: '1. Escaneamos 50+ partidos al día', shortDesc: 'Analizamos todas las ligas principales, comparando cuotas de múltiples casas con nuestro modelo de probabilidad propietario.', annotation: 'Cada tarjeta muestra el partido, las cuotas y nivel de confianza. Verde = ventaja detectada.', trigger: 'Mientras lees esto, EUGINE ya está analizando los partidos de mañana.' },
        step2: { heading: '2. Encontramos donde la casa SE EQUIVOCA', shortDesc: 'Cuando nuestra probabilidad calculada es MAYOR que la cuota ofrecida, hay valor. Ahí recibes la alerta con el % exacto de ventaja.', annotation: 'El análisis compara la probabilidad de la casa con la de EUGINE. La barra verde muestra tu edge real.', trigger: 'La casa de apuestas calcula rápido. EUGINE calcula mejor.' },
        step3: { heading: '3. Apuestas SOLO con ventaja', shortDesc: 'Cada sugerencia muestra CUÁNTA ventaja tienes. Con el tiempo, ventaja consistente = resultado consistente.', annotation: 'Mira los 7 factores analizados: forma, H2H, cuotas, goles, posesión, córners y tarjetas. 100% transparente.', trigger: 'Imagina abrir la app y saber exactamente dónde está la ventaja.' },
      },
      socialProof: {
        title: 'Lo que dicen nuestros usuarios',
        testimonials: [
          { name: 'Alejandro G.', role: 'Apostador hace 5 años', text: 'Llevaba años perdiendo dinero por apostar con el corazón. EUGINE me enseñó a apostar con la cabeza. Mi bankroll por fin crece.', stars: 5 },
          { name: 'Diego M.', role: 'Trader deportivo', text: 'Es la única herramienta que he visto que realmente calcula probabilidades. No son predicciones, es matemática pura aplicada al fútbol.', stars: 5 },
          { name: 'Pablo R.', role: 'Suscriptor Premium', text: 'Empecé con el plan básico para probar. En dos semanas ya era premium. La diferencia en mis resultados es brutal.', stars: 5 },
          { name: 'Javier L.', role: 'Apostador de fin de semana', text: 'Me encanta que publican absolutamente todo, incluso cuando fallan. Esa honestidad no se ve en ningún otro sitio.', stars: 4 },
        ],
      },
      stats: { title: 'Resultados Reales. Sin Filtro.', subtitle: 'Publicamos TODOS los resultados — aciertos y errores. Transparencia total.', hitRate: 'Tasa de Acierto', wins: 'Aciertos', total: 'Total Analizado', leagues: 'Ligas Monitoreadas' },
      authority: {
        title: '¿Por qué confiar en EUGINE?',
        items: [
          { icon: 'brain', title: 'IA Propietaria', desc: 'Modelo entrenado con +100.000 partidos históricos y 7 factores de análisis.' },
          { icon: 'shield', title: 'Empresa registrada en EE.UU.', desc: 'GS ITALY INVESTMENTS LLC — empresa especializada en análisis de datos con más de 6 softwares para diversos segmentos.' },
          { icon: 'chart', title: 'Resultados auditables', desc: 'Todos los resultados son públicos y verificables. Sin edición.' },
          { icon: 'lock', title: 'Datos encriptados', desc: 'Tu cuenta y datos protegidos con encriptación bancaria.' },
        ],
      },
      urgency: { title: '⚠️ Plazas limitadas para el plan gratuito', subtitle: 'Para mantener la calidad, limitamos usuarios gratuitos.', cta: 'Asegurar mi plaza gratis →' },
      faq: {
        title: 'Preguntas Frecuentes',
        items: [
          { q: '¿EUGINE garantiza ganancias?', a: 'No. Ninguna herramienta seria garantiza ganancias. EUGINE identifica ventaja matemática. A largo plazo, apostar con edge positivo tiende a dar resultados positivos, pero cada apuesta individual tiene riesgo.' },
          { q: '¿Cómo funciona el período gratis?', a: '3 días de acceso completo, sin tarjeta. Cancela cuando quieras.' },
          { q: '¿Necesito saber de estadística?', a: 'No. EUGINE hace todo el análisis y te entrega resultados de forma visual y simple.' },
          { q: '¿Cuántos partidos se analizan?', a: '50+ partidos diarios de 30+ ligas. Solo los que tienen ventaja llegan a ti.' },
          { q: '¿Funciona en el móvil?', a: 'Sí. EUGINE funciona como app en tu móvil. Solo accede por navegador y añade a la pantalla de inicio.' },
        ],
      },
      impactPhrase: 'No necesitas ganar todas. Solo necesitas tener ventaja.',
      closingLine: 'La inteligencia supera a la suerte. Los datos superan a la opinión.',
      pricing: {
        title: 'Elige Tu Plan',
        guarantee: '🔒 Prueba gratis por 7 días sin riesgo',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7,77', period: '/día', features: ['Acceso Premium por 24h', 'Análisis Ilimitados', 'Pago Único', 'Sin Recurrencia'], cta: 'Comprar Day Use' },
        basic: { name: 'BASIC', price: '$29,90', period: '/mes', features: ['5 Juegos por Día', 'Análisis Simple', '1 Doble Diario'], cta: 'Empezar gratis →' },
        advanced: { name: 'ADVANCED', badge: '⭐ MÁS POPULAR', price: '$49,90', period: '/mes', features: ['10 Juegos por Día', 'Análisis Completo', '3 Dobles Diarios', 'Acumuladores'], cta: 'Suscribir Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Mejor Valor', price: '$79,90', period: '/mes', features: ['Juegos Ilimitados', 'Análisis Premium', 'Todas las Dobles y Zebras', 'Acumuladores Premium', 'Exportación de Informes', 'Soporte Prioritario'], cta: 'Suscribir Premium' },
        comingSoon: 'Próximamente',
      },
      finalCta: { title: 'Tu ventaja empieza ahora.', subtitle: 'Únete a miles de apostadores que dejaron de adivinar y empezaron a calcular.', cta: 'Empezar gratis ahora →' },
      footer: {
        about: 'Sobre Nosotros', terms: 'Términos', privacy: 'Privacidad', responsible: 'Juego Responsable', contact: 'Contacto',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos los derechos reservados.`,
        disclaimer: 'EUGINE es una herramienta de análisis estadístico. Los resultados pasados no garantizan resultados futuros. Las apuestas conllevan riesgo. Apuesta con responsabilidad.',
      },
    },
    it: {
      nav: { howItWorks: 'Come Funziona', plans: 'Piani', login: 'Accedi', getStarted: 'Inizia Ora' },
      hero: {
        badge: '🔥 Usato in oltre 30 paesi',
        title: 'Smetti di perdere soldi nelle scommesse.',
        titleHighlight: 'Scommetti solo con vantaggio matematico.',
        subtitle: 'EUGINE analizza 50+ partite al giorno e mostra ESATTAMENTE dove la probabilità reale supera la quota. Scommetti solo con edge.',
        emailPlaceholder: 'La tua email migliore',
        ctaButton: 'Voglio il mio vantaggio →',
        ctaSubtext: '✅ Gratis 3 giorni · Senza carta · Cancella quando vuoi',
        emailError: 'Inserisci una email valida',
        trust1: '30+ campionati', trust2: '50+ partite/giorno', trust3: 'Quote in tempo reale',
        hitRateLabel: 'di successo negli ultimi 30 giorni',
        liveNow: 'analizzando partite ora',
      },
      problem: {
        title: 'Ti suona familiare?',
        items: ['Scommetti per impulso e perdi alla fine', 'Segui tipster che azzeccano 1 e sbagliano 5', 'Non sai distinguere una scommessa buona da una cattiva', 'Vinci a volte, ma in totale sei in negativo'],
        conclusion: 'Il problema non è scommettere. È scommettere SENZA DATI.',
      },
      mechanism: {
        title: 'Come EUGINE trasforma le tue scommesse',
        problem: 'La maggior parte scommette per impulso. Per emozione. Per istinto.',
        solution: "EUGINE calcola. Quando la probabilità reale SUPERA la quota offerta, c'è valore. Dove c'è valore, c'è vantaggio a lungo termine.",
        discipline: 'Se non c\'è vantaggio matematico, NON scommettiamo. La disciplina separa chi guadagna da chi perde.',
      },
      steps: {
        title: 'Guarda come funziona in 3 passi',
        subtitle: 'Schermate reali del sistema — senza giri di parole',
        step1: { heading: '1. Analizziamo 50+ partite al giorno', shortDesc: 'Analizziamo tutti i principali campionati, confrontando quote di più bookmaker con il nostro modello proprietario.', annotation: 'Ogni card mostra la partita, le quote e il livello di fiducia. Verde = vantaggio rilevato.', trigger: 'Mentre leggi, EUGINE sta già analizzando le partite di domani.' },
        step2: { heading: '2. Troviamo dove il bookmaker SBAGLIA', shortDesc: "Quando la nostra probabilità calcolata SUPERA la quota offerta, c'è valore. Ricevi l'avviso con la % esatta di vantaggio.", annotation: "L'analisi confronta la probabilità del bookmaker con EUGINE. La barra verde mostra il tuo edge reale.", trigger: 'Il bookmaker calcola veloce. EUGINE calcola meglio.' },
        step3: { heading: '3. Scommetti SOLO con vantaggio', shortDesc: 'Ogni suggerimento mostra QUANTO vantaggio hai. Nel tempo, vantaggio costante = risultato costante.', annotation: 'Guarda i 7 fattori: forma, H2H, quote, gol, possesso, angoli e cartellini. 100% trasparente.', trigger: "Immagina aprire l'app e sapere esattamente dove si trova il vantaggio." },
      },
      socialProof: {
        title: 'Cosa dicono i nostri utenti',
        testimonials: [
          { name: 'Luca B.', role: 'Scommettitore da 4 anni', text: "Prima scommettevo a istinto e perdevo sempre. Con EUGINE ho capito cosa significa avere un vantaggio reale. I numeri parlano chiaro.", stars: 5 },
          { name: 'Marco R.', role: 'Trader sportivo', text: "È l'unico strumento che ho trovato che calcola davvero le probabilità. Niente pronostici a caso, solo matematica applicata.", stars: 5 },
          { name: 'Alessandro P.', role: 'Abbonato Premium', text: "Ho iniziato con il piano base per curiosità. Dopo una settimana sono passato al premium. I risultati sono incomparabili.", stars: 5 },
          { name: 'Giovanni F.', role: 'Scommettitore del weekend', text: "La cosa che mi ha convinto è la trasparenza totale. Pubblicano ogni risultato, anche gli errori. Questo è raro e prezioso.", stars: 4 },
        ],
      },
      stats: { title: 'Risultati Reali. Senza Filtri.', subtitle: 'Pubblichiamo TUTTI i risultati — successi e errori. Trasparenza totale.', hitRate: 'Tasso Successo', wins: 'Successi', total: 'Totale Analizzato', leagues: 'Campionati Monitorati' },
      authority: {
        title: 'Perché fidarsi di EUGINE?',
        items: [
          { icon: 'brain', title: 'IA Proprietaria', desc: 'Modello addestrato con +100.000 partite storiche e 7 fattori di analisi.' },
          { icon: 'shield', title: 'Azienda registrata negli USA', desc: 'GS ITALY INVESTMENTS LLC — azienda specializzata in analisi dati con oltre 6 software per diversi settori.' },
          { icon: 'chart', title: 'Risultati verificabili', desc: 'Tutti i risultati sono pubblici e verificabili. Senza modifiche.' },
          { icon: 'lock', title: 'Dati crittografati', desc: 'Il tuo account e dati protetti con crittografia bancaria.' },
        ],
      },
      urgency: { title: '⚠️ Posti limitati per il piano gratuito', subtitle: 'Per mantenere la qualità, limitiamo gli utenti gratuiti.', cta: 'Assicura il mio posto gratis →' },
      faq: {
        title: 'Domande Frequenti',
        items: [
          { q: 'EUGINE garantisce profitto?', a: "No. Nessuno strumento serio garantisce profitto. EUGINE identifica dove hai vantaggio matematico." },
          { q: 'Come funziona il periodo gratuito?', a: '3 giorni di accesso completo, senza carta. Cancella quando vuoi.' },
          { q: 'Devo sapere di statistica?', a: 'No! EUGINE fa tutta l\'analisi e ti consegna i risultati in modo visuale e semplice.' },
          { q: 'Quante partite vengono analizzate?', a: '50+ partite al giorno da 30+ campionati. Solo quelle con vantaggio arrivano a te.' },
          { q: 'Posso usarlo sul cellulare?', a: "Sì! Funziona come un'app. Accedi dal browser e aggiungi alla schermata principale." },
        ],
      },
      impactPhrase: 'Non devi vincere ogni scommessa. Devi solo avere il vantaggio.',
      closingLine: "L'intelligenza batte la fortuna. I dati battono l'opinione.",
      pricing: {
        title: 'Scegli il Tuo Piano',
        guarantee: '🔒 Prova gratuita per 7 giorni senza rischio',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$7,77', period: '/giorno', features: ['Accesso Premium per 24h', 'Analisi Illimitate', 'Pagamento Unico', 'Senza Ricorrenza'], cta: 'Acquista Day Use' },
        basic: { name: 'BASIC', price: '$29,90', period: '/mese', features: ['5 Partite al Giorno', 'Analisi Semplice', '1 Doppia'], cta: 'Inizia gratis →' },
        advanced: { name: 'ADVANCED', badge: '⭐ PIÙ POPOLARE', price: '$49,90', period: '/mese', features: ['10 Partite al Giorno', 'Analisi Completa', '3 Doppie', 'Accumulatori'], cta: 'Abbonati Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Miglior Valore', price: '$79,90', period: '/mese', features: ['Partite Illimitate', 'Analisi Premium', 'Tutte le Doppie e Zebra', 'Accumulatori Premium', 'Export Report', 'Supporto Prioritario'], cta: 'Abbonati Premium' },
        comingSoon: 'Prossimamente',
      },
      finalCta: { title: 'Il tuo vantaggio inizia ora.', subtitle: "Unisciti a migliaia di scommettitori che hanno smesso di indovinare e hanno iniziato a calcolare.", cta: 'Inizia gratis ora →' },
      footer: {
        about: 'Chi Siamo', terms: 'Termini', privacy: 'Privacy', responsible: 'Gioco Responsabile', contact: 'Contatto',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Tutti i diritti riservati.`,
        disclaimer: "EUGINE è uno strumento di analisi statistica. I risultati passati non garantiscono risultati futuri. Le scommesse comportano rischio. Scommetti responsabilmente.",
      },
    },
  };

  const l = labels[language] || labels.pt;
  const stepData = [l.steps.step1, l.steps.step2, l.steps.step3];
  const stepImages = [stepCardsImg, stepAnalysisMainImg, stepAnalysisFactorsImg];

  const authorityIcons: Record<string, React.ReactNode> = {
    brain: <Brain className="w-7 h-7" />,
    shield: <Shield className="w-7 h-7" />,
    chart: <BarChart3 className="w-7 h-7" />,
    lock: <Lock className="w-7 h-7" />,
  };

  return (
    <div 
      className="min-h-screen text-foreground overflow-x-hidden relative"
      style={{ background: 'linear-gradient(180deg, hsl(230 50% 8%) 0%, hsl(222 47% 11%) 50%, hsl(230 50% 8%) 100%)' }}
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 20%, hsla(199, 89%, 48%, 0.06) 0%, transparent 60%)' }} />
      <div className="fixed inset-0 circuit-pattern pointer-events-none opacity-30" />

      {/* ═══════ NAVIGATION ═══════ */}
      <nav className="relative z-50 max-w-7xl mx-auto flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow"
            style={{ background: 'linear-gradient(135deg, hsl(185 100% 50%) 0%, hsl(260 80% 60%) 100%)' }}>
            <Brain className="w-5 h-5 text-background" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-foreground">EUGINE</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">{l.nav.howItWorks}</button>
          <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">{l.nav.plans}</button>
          <button onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">{l.nav.login}</button>
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="btn-primary text-sm py-3 px-6">{l.nav.getStarted}</button>
        </div>
        <div className="md:hidden flex items-center gap-3">
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="btn-primary text-xs py-2 px-4">{l.nav.getStarted}</button>
        </div>
      </nav>

      {/* ═══════ A — ATTENTION: Hero Section ═══════ */}
      <section className="relative px-5 pt-8 pb-16 lg:pt-16 lg:pb-28">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              {/* Social proof badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-primary text-xs sm:text-sm font-semibold">{l.hero.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
                <span className="text-foreground block">{l.hero.title}</span>
                <span className="block mt-2 gradient-text">{l.hero.titleHighlight}</span>
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {l.hero.subtitle}
              </p>

              {/* Live stats */}
              {statsLoaded && stats.hitRate > 0 && (
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-primary text-2xl font-black">{stats.hitRate}%</span>
                  <span className="text-muted-foreground text-sm">{l.hero.hitRateLabel}</span>
                </div>
              )}

              {/* Lead Capture */}
              <div className="max-w-md mx-auto lg:mx-0 mb-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder={l.hero.emailPlaceholder}
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLeadCapture()}
                    className="flex-1 px-4 py-4 rounded-xl bg-secondary/80 border border-border text-foreground placeholder-muted-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button
                    onClick={handleLeadCapture}
                    disabled={leadLoading}
                    className="btn-primary px-5 sm:px-8 py-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 shrink-0 min-w-fit"
                  >
                    {leadLoading ? <span className="animate-spin">⏳</span> : <>{l.hero.ctaButton}</>}
                  </button>
                </div>
                <p className="text-muted-foreground/70 text-xs sm:text-sm mt-3">{l.hero.ctaSubtext}</p>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm"><Globe className="w-4 h-4 text-primary" />{l.hero.trust1}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm"><Activity className="w-4 h-4 text-primary" />{l.hero.trust2}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm"><Clock className="w-4 h-4 text-primary" />{l.hero.trust3}</div>
              </div>
            </div>

            {/* Hero Phone Mockup with Tech Animation */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none flex items-center justify-center">
              <div className="relative w-[280px] sm:w-[320px] lg:w-[360px]">
                {/* Outer rotating ring */}
                <div className="absolute -inset-8 sm:-inset-10 rounded-full border border-primary/20 animate-[spin_20s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_hsla(199,89%,48%,0.8)]" />
                </div>
                {/* Second ring */}
                <div className="absolute -inset-14 sm:-inset-16 rounded-full border border-accent/10 animate-[spin_30s_linear_infinite_reverse]">
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-accent/60 shadow-[0_0_8px_hsla(260,80%,60%,0.6)]" />
                </div>
                {/* Pulsing glow behind phone */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/10 to-accent/20 rounded-[3rem] blur-3xl animate-[pulse_3s_ease-in-out_infinite] opacity-60" />
                {/* Scan line effect */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden z-10 pointer-events-none">
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent animate-[scanline_3s_ease-in-out_infinite]" />
                </div>
                {/* Phone frame */}
                <div className="relative bg-gradient-to-b from-[hsl(var(--secondary))] to-[hsl(var(--background))] rounded-[2.5rem] p-2 border border-primary/30 shadow-[0_0_60px_hsla(199,89%,48%,0.15),inset_0_1px_0_hsla(0,0%,100%,0.05)]">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[hsl(var(--background))] rounded-b-2xl z-20" />
                  {/* Screen */}
                  <div className="rounded-[2rem] overflow-hidden">
                    <img 
                      src={heroDashboardImg} 
                      alt="EUGINE Dashboard"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                {/* Floating data badges */}
                <div className="absolute -right-4 sm:-right-8 top-1/4 bg-[hsl(var(--secondary))] border border-primary/40 rounded-xl px-3 py-2 shadow-[0_8px_24px_hsla(199,89%,48%,0.2)] animate-[float_4s_ease-in-out_infinite] z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-bold text-primary">65% hit rate</span>
                  </div>
                </div>
                <div className="absolute -left-4 sm:-left-8 top-1/2 bg-[hsl(var(--secondary))] border border-accent/40 rounded-xl px-3 py-2 shadow-[0_8px_24px_hsla(260,80%,60%,0.2)] animate-[float_5s_ease-in-out_infinite_0.5s] z-20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-accent" />
                    <span className="text-xs font-bold text-accent">+Edge</span>
                  </div>
                </div>
                <div className="absolute -right-2 sm:-right-6 bottom-1/4 bg-[hsl(var(--secondary))] border border-primary/30 rounded-xl px-3 py-2 shadow-[0_8px_24px_hsla(199,89%,48%,0.15)] animate-[float_4.5s_ease-in-out_infinite_1s] z-20">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-foreground">30+ {language === 'pt' ? 'países' : language === 'es' ? 'países' : language === 'it' ? 'paesi' : 'countries'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <ActiveUsersCounter />
          </div>

          {/* PWA Install */}
          {deferredPrompt && !isStandalone && (
            <div className="mt-6 flex justify-center animate-fade-in">
              <button onClick={handlePwaInstall} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-sm font-semibold">
                <Smartphone className="w-5 h-5" /><Download className="w-4 h-4" />
                {language === 'pt' ? 'Instalar App' : language === 'es' ? 'Instalar App' : language === 'it' ? 'Installa App' : 'Install App'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ I — INTEREST: Problem Agitation ═══════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-4xl font-black text-center text-foreground mb-10">
              {l.problem.title}
            </h2>
          </ScrollFadeIn>

          <div className="space-y-4 mb-10">
            {l.problem.items.map((item: string, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <p className="text-foreground text-sm sm:text-base font-medium">{item}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          <ScrollFadeIn delay={500}>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-foreground">
                {l.problem.conclusion}
              </p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ Mechanism — Solution Bridge ═══════ */}
      <section className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <ScrollFadeIn>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">{l.mechanism.problem}</p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <p className="text-foreground font-bold text-lg sm:text-xl mb-6 leading-relaxed">{l.mechanism.solution}</p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={400}>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 sm:p-6 inline-block">
              <p className="text-primary font-bold text-sm sm:text-base">{l.mechanism.discipline}</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ D — DESIRE: How It Works ═══════ */}
      <section id="how-it-works" className="relative px-5 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-3">{l.steps.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base text-center mb-16 max-w-2xl mx-auto">{l.steps.subtitle}</p>
          </ScrollFadeIn>

          {stepData.map((step: any, i: number) => (
            <ScrollFadeIn key={i} className={i < 2 ? 'mb-20 sm:mb-28' : ''}>
              <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-14 ${i % 2 === 1 ? '' : ''}`}>
                {/* Image */}
                <div className={`w-full md:w-[55%] ${i % 2 === 0 ? 'order-2 md:order-1' : 'order-2'}`}>
                  <div className="relative group">
                    <div className={`absolute -inset-1 bg-gradient-to-${i % 2 === 0 ? 'r' : 'l'} from-primary/20 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl" style={{ boxShadow: '0 25px 50px -12px hsla(199, 89%, 48%, 0.15)' }}>
                      <img src={stepImages[i]} alt={`EUGINE step ${i + 1}`} className="w-full h-auto" loading="lazy" />
                    </div>
                  </div>
                </div>
                {/* Text */}
                <div className={`w-full md:w-[45%] ${i % 2 === 0 ? 'order-1 md:order-2' : 'order-1'}`}>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold mb-4 tracking-wider">
                    {language === 'pt' || language === 'it' ? `PASSO ${i + 1}` : language === 'es' ? `PASO ${i + 1}` : `STEP ${i + 1}`}
                  </span>
                  <h3 className="text-foreground font-black text-2xl sm:text-3xl lg:text-4xl mb-4 leading-tight">{step.heading}</h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">{step.shortDesc}</p>
                  <p className="text-muted-foreground/60 text-sm sm:text-base leading-relaxed mb-4 border-l-2 border-primary/30 pl-3">{step.annotation}</p>
                  <p className="text-primary/80 text-sm font-semibold italic">⚡ {step.trigger}</p>
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </section>

      {/* ═══════ SOCIAL PROOF — Testimonials ═══════ */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-12">
              {l.socialProof.title}
            </h2>
          </ScrollFadeIn>

          <div className="grid sm:grid-cols-2 gap-6">
            {l.socialProof.testimonials.map((t: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="glass-card p-6 sm:p-8 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    {Array.from({ length: 5 - t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 text-muted-foreground/30" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-foreground text-sm sm:text-base leading-relaxed mb-6 flex-grow italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-foreground font-semibold text-sm">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AUTHORITY — Trust Signals ═══════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">{l.authority.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {l.authority.items.map((item: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="text-center p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                    {authorityIcons[item.icon]}
                  </div>
                  <h3 className="text-foreground font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ STATS — Real Results ═══════ */}
      {statsLoaded && stats.total > 10 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-5">
            <ScrollFadeIn>
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3">{l.stats.title}</h2>
              <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">{l.stats.subtitle}</p>
            </ScrollFadeIn>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <ScrollFadeIn delay={0}>
                <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border/50">
                  <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl sm:text-5xl font-black text-primary"><AnimatedCounter end={stats.hitRate} suffix="%" /></p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.hitRate}</p>
                </div>
              </ScrollFadeIn>
              <ScrollFadeIn delay={100}>
                <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border/50">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <p className="text-3xl sm:text-5xl font-black text-emerald-400"><AnimatedCounter end={stats.wins} /></p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.wins}</p>
                </div>
              </ScrollFadeIn>
              <ScrollFadeIn delay={200}>
                <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border/50">
                  <BarChart3 className="w-8 h-8 text-foreground mx-auto mb-3" />
                  <p className="text-3xl sm:text-5xl font-black text-foreground"><AnimatedCounter end={stats.total} /></p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.total}</p>
                </div>
              </ScrollFadeIn>
              <ScrollFadeIn delay={300}>
                <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border/50">
                  <TrendingUp className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-3xl sm:text-5xl font-black text-amber-400"><AnimatedCounter end={30} prefix="" suffix="+" /></p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.leagues}</p>
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ Impact Quote ═══════ */}
      <section className="py-10 sm:py-14">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <ScrollFadeIn>
            <p className="text-xl sm:text-3xl font-black text-foreground italic leading-tight">
              &ldquo;{l.impactPhrase}&rdquo;
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ URGENCY — Scarcity Trigger ═══════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-5">
          <ScrollFadeIn>
            <div className="text-center p-8 sm:p-10 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
              <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">{l.urgency.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">{l.urgency.subtitle}</p>
              <button 
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all"
                style={{ background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 95% 53%))', color: 'hsl(0 0% 0%)' }}
              >
                {l.urgency.cta}
              </button>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ A — ACTION: Pricing ═══════ */}
      <section id="pricing" className="relative px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <ScrollFadeIn>
            <p className="text-sm text-muted-foreground text-center max-w-md mx-auto mb-4">{l.closingLine}</p>
            <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-4">{l.pricing.title}</h2>
            <p className="text-center text-primary/80 text-sm font-semibold mb-12">{l.pricing.guarantee}</p>
          </ScrollFadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Day Use */}
            <ScrollFadeIn delay={0}>
              <div className="relative glass-card p-8 flex flex-col border-2 border-success/50 opacity-70 h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-success text-success-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">{l.pricing.dayUse.badge}</span></div>
                <div className="text-center mb-6 pt-4">
                  <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.dayUse.name}</h3>
                  <span className="text-primary text-4xl sm:text-5xl font-black">{l.pricing.dayUse.price}</span>
                  <span className="text-muted-foreground text-base font-semibold block">{l.pricing.dayUse.period}</span>
                </div>
                <ul className="space-y-4 flex-grow mb-8">
                  {l.pricing.dayUse.features.map((f: string, i: number) => (<li key={i} className="flex items-start gap-3 text-muted-foreground"><Zap className="w-5 h-5 text-success mt-0.5 shrink-0" /><span>{f}</span></li>))}
                </ul>
                <button disabled className="w-full h-14 mt-auto rounded-lg font-bold opacity-50 cursor-not-allowed bg-muted text-muted-foreground">{l.pricing.comingSoon}</button>
              </div>
            </ScrollFadeIn>

            {/* Basic */}
            <ScrollFadeIn delay={100}>
              <div className="glass-card p-8 flex flex-col border-2 border-transparent hover:-translate-y-2.5 hover:border-primary hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.2)] transition-all duration-300 h-full">
                <div className="text-center mb-6">
                  <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.basic.name}</h3>
                  <span className="text-primary text-4xl sm:text-5xl font-black">{l.pricing.basic.price}</span>
                  <span className="text-muted-foreground text-base font-semibold block">{l.pricing.basic.period}</span>
                </div>
                <ul className="space-y-4 flex-grow mb-8">
                  {l.pricing.basic.features.map((f: string, i: number) => (<li key={i} className="flex items-start gap-3 text-muted-foreground"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span>{f}</span></li>))}
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full h-14 mt-auto rounded-lg font-bold bg-emerald-500 text-foreground hover:bg-emerald-600 transition-all hover:shadow-lg">{l.pricing.basic.cta}</button>
              </div>
            </ScrollFadeIn>

            {/* Advanced — HIGHLIGHTED */}
            <ScrollFadeIn delay={200}>
              <div className="relative glass-card p-8 flex flex-col price-card-highlighted hover:-translate-y-2.5 hover:shadow-[0_20px_40px_hsla(185,100%,50%,0.3)] transition-all duration-300 sm:scale-105 origin-top h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"><span className="bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full inline-block animate-pulse">{l.pricing.advanced.badge}</span></div>
                <div className="text-center mb-6 pt-4">
                  <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.advanced.name}</h3>
                  <span className="text-primary text-4xl sm:text-5xl font-black">{l.pricing.advanced.price}</span>
                  <span className="text-muted-foreground text-base font-semibold block">{l.pricing.advanced.period}</span>
                </div>
                <ul className="space-y-4 flex-grow mb-8">
                  {l.pricing.advanced.features.map((f: string, i: number) => (<li key={i} className="flex items-start gap-3 text-foreground"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span>{f}</span></li>))}
                </ul>
                <button onClick={() => navigate('/auth')} className="btn-primary w-full h-14 mt-auto flex items-center justify-center text-base font-bold">{l.pricing.advanced.cta}</button>
              </div>
            </ScrollFadeIn>

            {/* Premium */}
            <ScrollFadeIn delay={300}>
              <div className="relative glass-card p-8 flex flex-col border-2 border-accent/50 hover:-translate-y-2.5 hover:border-accent hover:shadow-[0_20px_40px_hsla(260,80%,60%,0.3)] transition-all duration-300 h-full" style={{ background: 'linear-gradient(180deg, hsla(260, 80%, 60%, 0.1) 0%, hsla(230, 45%, 12%, 1) 100%)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"><span className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">{l.pricing.premium.badge}</span></div>
                <div className="text-center mb-6 pt-4">
                  <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.premium.name}</h3>
                  <span className="text-amber-400 text-4xl sm:text-5xl font-black">{l.pricing.premium.price}</span>
                  <span className="text-muted-foreground text-base font-semibold block">{l.pricing.premium.period}</span>
                </div>
                <ul className="space-y-3 flex-grow mb-8">
                  {l.pricing.premium.features.map((f: string, i: number) => (<li key={i} className="flex items-start gap-3 text-foreground"><CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" /><span>{f}</span></li>))}
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full h-14 mt-auto rounded-lg font-bold transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 95% 53%))', color: 'hsl(0 0% 0%)' }}>{l.pricing.premium.cta}</button>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">{l.faq.title}</h2>
          </ScrollFadeIn>
          <div className="space-y-3">
            {l.faq.items.map((item: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 50}>
                <FAQItem question={item.q} answer={item.a} />
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-5">
          <ScrollFadeIn>
            <div className="text-center p-10 sm:p-14 rounded-3xl border border-primary/30 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsla(199, 89%, 48%, 0.08) 0%, hsla(230, 45%, 12%, 0.9) 100%)', boxShadow: '0 0 60px hsla(199, 89%, 48%, 0.15)' }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-2xl sm:text-4xl font-black text-foreground mb-4">{l.finalCta.title}</h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">{l.finalCta.subtitle}</p>
              <button 
                onClick={() => navigate('/auth')}
                className="btn-primary px-10 py-4 text-base sm:text-lg font-bold rounded-xl inline-flex items-center gap-2"
              >
                {l.finalCta.cta}
              </button>
              <p className="text-muted-foreground/50 text-xs mt-4">{l.hero.ctaSubtext}</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
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
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1"><Shield className="w-3.5 h-3.5" />{l.footer.responsible}</a>
              <a href="mailto:support@eugineai.com" className="hover:text-foreground transition-colors">{l.footer.contact}</a>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground/60 max-w-3xl mx-auto text-center leading-relaxed">{l.footer.disclaimer}</p>
            </div>
            <p className="text-muted-foreground/40 text-xs inline-flex items-center gap-1"><USFlag3D className="w-3.5 h-2.5" /> {l.footer.copyright} <USFlag3D className="w-3.5 h-2.5" /></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
