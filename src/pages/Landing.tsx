/**
 * Landing Page - EUGINE
 * Matching Manus reference exactly: Hero with comparison bar, Live matches, Problem section, 3 Steps, Testimonials, Trust, Stats quote, Pricing (3 plans), FAQ, Final CTA, Footer
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Check, CheckCircle, Brain, Target, TrendingUp, BarChart3, 
  Shield, Globe, Activity, Clock, Star, Lock, Award, ChevronDown, Sparkles, Zap,
  AlertTriangle, Users, MessageCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
import USFlag3D from '@/components/USFlag3D';
import { useActiveUsersCount } from '@/hooks/useActiveUsersCount';

function LiveUsersCount() {
  const count = useActiveUsersCount();
  return <span>{count}</span>;
}

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
    <div ref={ref} className={className} style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
    }}>
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

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await supabase.from('bet_stats').select('*');
        if (data && data.length > 0) {
          const totalBets = data.reduce((sum: number, s: any) => sum + (s.total_bets || 0), 0);
          const totalWins = data.reduce((sum: number, s: any) => sum + (s.wins || 0), 0);
          const hitRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0;
          setStats({ hitRate, wins: totalWins, total: totalBets });
          if (totalBets > 0) setStatsLoaded(true);
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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayHitRate = statsLoaded ? stats.hitRate : 65;
  const displayEdge = 12.4;

  // ─── Labels (only PT shown for brevity, others follow same structure) ───
  const labels: Record<string, any> = {
    pt: {
      nav: { howItWorks: 'Como Funciona', plans: 'Planos', faq: 'FAQ', login: 'Login', getStarted: 'Comece Agora' },
      hero: {
        badge: '✓ Usado em mais de 30 países',
        title: 'VOCÊ NÃO PRECISA DE SORTE.',
        titleHighlight: 'PRECISA DE VANTAGEM.',
        subtitle: 'Transforme suas apostas em decisões estratégicas com dados reais e probabilidade a seu favor.',
        ctaButton: 'TESTE GRÁTIS AGORA',
        ctaSubtext: '✓ Grátis por 7 dias · Sem cartão · Cancele quando quiser',
        urgency: '⚠️ Vagas para o teste grátis se encerrando',
        stats: ['30+ ligas monitoradas', '50+ jogos analisados por dia', 'Odds em tempo real'],
        aiLabel: 'EUGINE AI',
        proLabel: 'Apostador profissional',
        aiAdvantage: 'Vantagem da IA',
      },
      liveMatches: {
        title: 'Jogos com Vantagem Agora',
        matches: [
          { league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' },
          { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' },
          { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' },
          { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' },
        ],
        hitRate: 'Taxa de Acerto',
        avgEdge: 'Edge Médio Detectado',
        usersOnline: 'Usuários Online Agora',
      },
      problem: {
        title: 'Isso Acontece com 87% dos Apostadores',
        subtitle: 'Você provavelmente já passou por isso:',
        items: [
          'Você analisa o jogo por 2 minutos, mas a casa de apostas usou 47 variáveis estatísticas para definir a odd',
          'Segue palpites de grupos sem saber que 92% dos tipsters não têm histórico auditável',
          'Aposta $50 no \'feeling\' e não percebe que a probabilidade implícita já está contra você',
          'Acerta 3, erra 4 — e no fim do mês o saldo é sempre negativo',
        ],
        conclusion: 'O problema não é apostar. É apostar sem vantagem matemática comprovada.',
        explanation: 'A maioria aposta por impulso. Por emoção. Por palpite de grupo. O EUGINE calcula. Quando a probabilidade real é MAIOR que a odd oferecida, existe valor. Onde existe valor, existe vantagem no longo prazo.',
      },
      steps: {
        title: 'Veja Como Funciona em 3 Passos',
        items: [
          { title: 'Escaneamos 50+ jogos por dia', desc: 'Analisamos todas as principais ligas do mundo, comparando odds de múltiplas casas com nosso modelo de probabilidade proprietário. Cada card mostra o jogo, as odds e o nível de confiança. Verde = vantagem detectada.' },
          { title: 'Encontramos onde a casa ERRA', desc: 'Quando nossa probabilidade calculada é MAIOR que a odd oferecida, existe valor. Aí você recebe o alerta com a % exata de vantagem. A análise compara a probabilidade da casa com a do EUGINE.' },
          { title: 'Você aposta SÓ com vantagem', desc: 'Cada sugestão mostra QUANTO de edge você tem. No longo prazo, vantagem consistente = resultado consistente. Veja os 7 fatores analisados: forma, H2H, odds, gols, posse, cantos e cartões. 100% transparente.' },
        ],
      },
      socialProof: {
        title: 'O que Dizem Nossos Usuários',
        testimonials: [
          { name: 'Carlos M.', role: 'Apostador há 3 anos', text: 'Antes eu achava que entendia de futebol. O EUGINE me mostrou que entender ≠ ter edge. Meu ROI mudou completamente nos últimos 2 meses.', stars: 5 },
          { name: 'Rafael S.', role: 'Trader esportivo', text: 'Finalmente uma ferramenta que mostra a matemática por trás. Não é palpite, é análise de verdade com probabilidade calculada. Uso todo dia.', stars: 5 },
          { name: 'Fernando L.', role: 'Usuário Premium', text: 'Comecei no básico, hoje sou premium. A diferença é que agora eu sei POR QUE estou apostando, não fico no achismo.', stars: 5 },
          { name: 'Thiago R.', role: 'Apostador recreativo', text: 'O melhor é a transparência total. Eles publicam todos os resultados, erros e acertos. Isso me deu confiança pra confiar no sistema.', stars: 4 },
        ],
      },
      authority: {
        title: 'Por que Confiar no EUGINE?',
        items: [
          { icon: 'brain', title: 'IA Proprietária', desc: 'Modelo treinado com +100.000 partidas históricas e 7 fatores de análise.' },
          { icon: 'shield', title: 'Empresa Registrada nos EUA', desc: 'GS ITALY INVESTMENTS LLC — empresa especializada em análise de dados.' },
          { icon: 'chart', title: 'Resultados Auditáveis', desc: 'Todos os resultados são públicos e verificáveis. Sem edição.' },
          { icon: 'lock', title: 'Dados Criptografados', desc: 'Sua conta protegida com criptografia de nível bancário.' },
        ],
        quote: '"Você não precisa ganhar todas. Só precisa ter vantagem."',
        quoteAuthor: '— Princípio do Value Betting',
      },
      pricing: {
        title: 'Escolha Seu Plano',
        guarantee: 'Teste grátis por 7 dias sem risco',
        basic: { name: 'BASIC', price: 'R$ 29,90', period: '/mês', features: ['5 Jogos por Dia', 'Análise Simples', '1 Dupla Diária', 'Suporte por Email'], cta: 'Começar grátis →' },
        advanced: { name: 'ADVANCED', badge: 'MAIS POPULAR', price: 'R$ 49,90', period: '/mês', features: ['10 Jogos por Dia', 'Análise Completa', '3 Duplas Diárias', 'Acumuladores', 'Suporte Prioritário'], cta: 'Assinar Advanced' },
        premium: { name: 'PREMIUM', badge: 'MELHOR VALOR', price: 'R$ 79,90', period: '/mês', features: ['Jogos Ilimitados', 'Análise Premium Completa', 'Todas as Duplas e Zebras', 'Acumuladores Premium', 'Exportação de Relatórios', 'Suporte Prioritário 24/7'], cta: 'Assinar Premium' },
      },
      faq: {
        title: 'Perguntas Frequentes',
        items: [
          { q: 'O EUGINE garante lucro?', a: 'Não. Nenhuma ferramenta pode garantir lucro. O EUGINE identifica oportunidades com vantagem matemática, mas o resultado depende da sua disciplina e gestão de banca.' },
          { q: 'Como funciona o período grátis?', a: 'Você tem 7 dias de acesso completo, sem cartão de crédito. Pode cancelar a qualquer momento, sem compromisso.' },
          { q: 'Preciso entender de estatística?', a: 'Não! O EUGINE faz toda a análise e te entrega o resultado de forma visual e simples. Basta seguir as indicações de vantagem.' },
          { q: 'Quantos jogos são analisados por dia?', a: 'Analisamos 50+ jogos diariamente de mais de 30 ligas ao redor do mundo. Apenas os jogos com vantagem detectada chegam até você.' },
          { q: 'Posso usar no celular?', a: 'Sim! O EUGINE funciona como um app no seu celular. Basta acessar pelo navegador e adicionar à tela inicial. Sem download necessário.' },
        ],
      },
      finalCta: {
        title: 'Sua Vantagem Começa Agora',
        subtitle: 'Junte-se a milhares de apostadores que pararam de adivinhar e começaram a calcular.',
        cta: 'Começar Grátis Agora →',
        ctaSubtext: 'Grátis por 7 dias · Sem cartão · Cancele quando quiser',
      },
      footer: {
        about: 'Sobre Nós', terms: 'Termos de Uso', privacy: 'Política de Privacidade', responsible: 'Jogo Responsável', contact: 'Contato',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos os direitos reservados.`,
        disclaimer: 'O EUGINE é uma ferramenta de análise estatística. Resultados passados não garantem resultados futuros. Apostas esportivas envolvem risco de perda. Aposte com responsabilidade e apenas valores que você pode perder.',
      },
    },
    en: {
      nav: { howItWorks: 'How It Works', plans: 'Plans', faq: 'FAQ', login: 'Login', getStarted: 'Get Started' },
      hero: {
        badge: '✓ Used in 30+ countries',
        title: "YOU DON'T NEED LUCK.",
        titleHighlight: 'YOU NEED AN EDGE.',
        subtitle: 'Turn your bets into strategic decisions with real data and probability on your side.',
        ctaButton: 'START FREE TRIAL',
        ctaSubtext: '✓ Free for 7 days · No card · Cancel anytime',
        urgency: '⚠️ Free trial spots closing',
        stats: ['30+ leagues monitored', '50+ matches analyzed daily', 'Real-time odds'],
        aiLabel: 'EUGINE AI',
        proLabel: 'Professional bettor',
        aiAdvantage: 'AI Advantage',
      },
      liveMatches: {
        title: 'Matches with Edge Now',
        matches: [
          { league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' },
          { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' },
          { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' },
          { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' },
        ],
        hitRate: 'Hit Rate',
        avgEdge: 'Average Edge Detected',
        usersOnline: 'Users Online Now',
      },
      problem: {
        title: 'This Happens to 87% of Bettors',
        subtitle: "You've probably been through this:",
        items: [
          'You analyze the match for 2 minutes, but the bookmaker used 47 statistical variables to set the odds',
          "You follow tips from groups without knowing that 92% of tipsters don't have an auditable track record",
          "You bet $50 on 'feeling' without realizing the implied probability is already against you",
          'You hit 3, miss 4 — and at the end of the month the balance is always negative',
        ],
        conclusion: "The problem isn't betting. It's betting without a proven mathematical edge.",
        explanation: 'Most bet on impulse. On emotion. On group tips. EUGINE calculates. When the real probability is HIGHER than the offered odds, there is value. Where there is value, there is long-term edge.',
      },
      steps: {
        title: 'See How It Works in 3 Steps',
        items: [
          { title: 'We scan 50+ matches daily', desc: "We analyze all major leagues, comparing odds from multiple bookmakers with our proprietary probability model. Each card shows the match, odds and confidence level. Green = edge detected." },
          { title: 'We find where the house is WRONG', desc: 'When our calculated probability is HIGHER than the offered odds, there is value. Then you receive the alert with the exact % of advantage.' },
          { title: 'You only bet WITH an edge', desc: 'Each suggestion shows HOW MUCH edge you have. In the long run, consistent edge = consistent results. See the 7 factors analyzed: form, H2H, odds, goals, possession, corners and cards. 100% transparent.' },
        ],
      },
      socialProof: {
        title: 'What Our Users Say',
        testimonials: [
          { name: 'James K.', role: 'Bettor for 3 years', text: "I used to think I understood football. EUGINE showed me that understanding ≠ having an edge. My ROI changed completely.", stars: 5 },
          { name: 'Michael T.', role: 'Sports trader', text: "Finally a tool that shows the math behind it. Not guessing, real analysis with calculated probability.", stars: 5 },
          { name: 'David R.', role: 'Premium User', text: "Started on basic, now I'm premium. The difference is I now know WHY I'm betting.", stars: 5 },
          { name: 'Robert M.', role: 'Recreational bettor', text: 'The best part is the total transparency. They publish all results, errors and wins.', stars: 4 },
        ],
      },
      authority: {
        title: 'Why Trust EUGINE?',
        items: [
          { icon: 'brain', title: 'Proprietary AI', desc: 'Model trained with 100,000+ historical matches and 7 analysis factors.' },
          { icon: 'shield', title: 'US Registered Company', desc: 'GS ITALY INVESTMENTS LLC — specializing in data analysis.' },
          { icon: 'chart', title: 'Auditable Results', desc: 'All results are public and verifiable.' },
          { icon: 'lock', title: 'Encrypted Data', desc: 'Your account protected with bank-level encryption.' },
        ],
        quote: '"You don\'t need to win them all. You just need an edge."',
        quoteAuthor: '— Value Betting Principle',
      },
      pricing: {
        title: 'Choose Your Plan',
        guarantee: 'Free trial for 7 days, no risk',
        basic: { name: 'BASIC', price: '$9.90', period: '/month', features: ['5 Matches/Day', 'Simple Analysis', '1 Daily Double', 'Email Support'], cta: 'Start free →' },
        advanced: { name: 'ADVANCED', badge: 'MOST POPULAR', price: '$14.90', period: '/month', features: ['10 Matches/Day', 'Full Analysis', '3 Daily Doubles', 'Accumulators', 'Priority Support'], cta: 'Subscribe Advanced' },
        premium: { name: 'PREMIUM', badge: 'BEST VALUE', price: '$24.90', period: '/month', features: ['Unlimited Matches', 'Premium Full Analysis', 'All Doubles & Zebras', 'Premium Accumulators', 'Report Export', 'Priority Support 24/7'], cta: 'Subscribe Premium' },
      },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          { q: 'Does EUGINE guarantee profit?', a: "No. No serious tool guarantees profit. EUGINE identifies mathematical edge opportunities." },
          { q: 'How does the free period work?', a: '7 days of full access, no credit card. Cancel anytime.' },
          { q: 'Do I need to understand statistics?', a: 'No! EUGINE does all the analysis and delivers results visually.' },
          { q: 'How many matches are analyzed?', a: '50+ matches daily from 30+ leagues worldwide.' },
          { q: 'Can I use it on mobile?', a: "Yes! Works as an app via browser." },
        ],
      },
      finalCta: { title: 'Your Edge Starts Now', subtitle: 'Join thousands of bettors who stopped guessing and started calculating.', cta: 'Start Free Now →', ctaSubtext: 'Free for 7 days · No card · Cancel anytime' },
      footer: {
        about: 'About', terms: 'Terms', privacy: 'Privacy', responsible: 'Responsible Gambling', contact: 'Contact',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. All rights reserved.`,
        disclaimer: 'EUGINE is a statistical analysis tool. Past results do not guarantee future results. Sports betting involves risk.',
      },
    },
    es: {
      nav: { howItWorks: 'Cómo Funciona', plans: 'Planes', faq: 'FAQ', login: 'Login', getStarted: 'Empezar' },
      hero: {
        badge: '✓ Usado en más de 30 países',
        title: 'NO NECESITAS SUERTE.',
        titleHighlight: 'NECESITAS VENTAJA.',
        subtitle: 'Transforma tus apuestas en decisiones estratégicas con datos reales y probabilidad a tu favor.',
        ctaButton: 'PRUEBA GRATIS AHORA',
        ctaSubtext: '✓ Gratis por 7 días · Sin tarjeta · Cancela cuando quieras',
        urgency: '⚠️ Plazas para la prueba gratuita cerrándose',
        stats: ['30+ ligas monitoreadas', '50+ partidos analizados por día', 'Odds en tiempo real'],
        aiLabel: 'EUGINE AI', proLabel: 'Apostador profesional', aiAdvantage: 'Ventaja de la IA',
      },
      liveMatches: { title: 'Partidos con Ventaja Ahora', matches: [{ league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' }, { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' }, { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' }, { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' }], hitRate: 'Tasa de Acierto', avgEdge: 'Edge Medio Detectado', usersOnline: 'Usuarios Online Ahora' },
      problem: { title: 'Esto le Pasa al 87% de los Apostadores', subtitle: 'Probablemente ya te pasó:', items: ['Analizas el partido por 2 minutos, pero la casa usó 47 variables estadísticas', 'Sigues tips de grupos sin saber que el 92% no tiene historial auditable', 'Apuestas $50 por "feeling" sin ver que la probabilidad implícita está en contra', 'Aciertas 3, fallas 4 — y al final del mes el saldo es siempre negativo'], conclusion: 'El problema no es apostar. Es apostar sin ventaja matemática comprobada.', explanation: 'La mayoría apuesta por impulso. EUGINE calcula. Cuando la probabilidad real es MAYOR que la odd, existe valor.' },
      steps: { title: 'Mira Cómo Funciona en 3 Pasos', items: [{ title: 'Escaneamos 50+ partidos por día', desc: 'Analizamos todas las principales ligas, comparando odds con nuestro modelo propietario.' }, { title: 'Encontramos donde la casa ERRA', desc: 'Cuando nuestra probabilidad es MAYOR que la odd ofrecida, existe valor.' }, { title: 'Apuestas SOLO con ventaja', desc: 'Cada sugerencia muestra CUÁNTO edge tienes. 7 factores analizados. 100% transparente.' }] },
      socialProof: { title: 'Lo que Dicen Nuestros Usuarios', testimonials: [{ name: 'Alejandro G.', role: 'Apostador hace 3 años', text: 'EUGINE me mostró que entender ≠ tener edge. Mi ROI cambió completamente.', stars: 5 }, { name: 'Diego M.', role: 'Trader deportivo', text: 'Por fin una herramienta con matemáticas reales. No intuición.', stars: 5 }, { name: 'Pablo R.', role: 'Usuario Premium', text: 'Ahora sé POR QUÉ estoy apostando.', stars: 5 }, { name: 'Sergio L.', role: 'Apostador recreativo', text: 'La transparencia total me convenció.', stars: 4 }] },
      authority: { title: '¿Por qué Confiar en EUGINE?', items: [{ icon: 'brain', title: 'IA Propietaria', desc: 'Modelo entrenado con +100.000 partidos.' }, { icon: 'shield', title: 'Empresa en EE.UU.', desc: 'GS ITALY INVESTMENTS LLC.' }, { icon: 'chart', title: 'Resultados Auditables', desc: 'Todos públicos y verificables.' }, { icon: 'lock', title: 'Datos Encriptados', desc: 'Encriptación bancaria.' }], quote: '"No necesitas ganar todas. Solo necesitas ventaja."', quoteAuthor: '— Principio del Value Betting' },
      pricing: { title: 'Elige Tu Plan', guarantee: 'Prueba gratis por 7 días', basic: { name: 'BASIC', price: '€29,90', period: '/mes', features: ['5 Partidos/Día', 'Análisis Simple', '1 Doble Diaria', 'Soporte Email'], cta: 'Empezar gratis →' }, advanced: { name: 'ADVANCED', badge: 'MÁS POPULAR', price: '€49,90', period: '/mes', features: ['10 Partidos/Día', 'Análisis Completo', '3 Dobles', 'Acumuladores', 'Soporte Prioritario'], cta: 'Suscribir Advanced' }, premium: { name: 'PREMIUM', badge: 'MEJOR VALOR', price: '€79,90', period: '/mes', features: ['Partidos Ilimitados', 'Análisis Premium', 'Todas las Dobles', 'Acumuladores Premium', 'Exportación', 'Soporte 24/7'], cta: 'Suscribir Premium' } },
      faq: { title: 'Preguntas Frecuentes', items: [{ q: '¿EUGINE garantiza ganancias?', a: 'No. Identifica ventaja matemática.' }, { q: '¿Cómo funciona la prueba?', a: '7 días gratis, sin tarjeta.' }, { q: '¿Necesito saber estadística?', a: 'No! EUGINE hace todo.' }, { q: '¿Cuántos partidos?', a: '50+ diarios de 30+ ligas.' }, { q: '¿En el celular?', a: 'Sí, como app desde el navegador.' }] },
      finalCta: { title: 'Tu Ventaja Empieza Ahora', subtitle: 'Únete a miles que dejaron de adivinar.', cta: 'Empezar Gratis →', ctaSubtext: 'Gratis 7 días · Sin tarjeta · Cancela cuando quieras' },
      footer: { about: 'Sobre', terms: 'Términos', privacy: 'Privacidad', responsible: 'Juego Responsable', contact: 'Contacto', copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC.`, disclaimer: 'EUGINE es una herramienta de análisis estadístico.' },
    },
    it: {
      nav: { howItWorks: 'Come Funziona', plans: 'Piani', faq: 'FAQ', login: 'Login', getStarted: 'Inizia' },
      hero: {
        badge: '✓ Usato in oltre 30 paesi',
        title: 'NON HAI BISOGNO DI FORTUNA.',
        titleHighlight: 'HAI BISOGNO DI VANTAGGIO.',
        subtitle: 'Trasforma le tue scommesse in decisioni strategiche con dati reali e probabilità a tuo favore.',
        ctaButton: 'PROVA GRATIS ORA',
        ctaSubtext: '✓ Gratis 7 giorni · Senza carta · Cancella quando vuoi',
        urgency: '⚠️ Posti per la prova in esaurimento',
        stats: ['30+ campionati monitorati', '50+ partite analizzate al giorno', 'Quote in tempo reale'],
        aiLabel: 'EUGINE AI', proLabel: 'Scommettitore professionista', aiAdvantage: 'Vantaggio IA',
      },
      liveMatches: { title: 'Partite con Vantaggio Ora', matches: [{ league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' }, { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' }, { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' }, { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' }], hitRate: 'Tasso Successo', avgEdge: 'Edge Medio', usersOnline: 'Utenti Online Ora' },
      problem: { title: "Questo Succede all'87% degli Scommettitori", subtitle: 'Probabilmente è successo anche a te:', items: ['Analizzi la partita per 2 minuti, ma il bookmaker ha usato 47 variabili', "Segui pronostici di gruppi senza sapere che il 92% non ha storico verificabile", "Scommetti €50 per 'feeling' senza vedere che la probabilità implicita è contro di te", 'Indovini 3, sbagli 4 — e a fine mese il saldo è sempre negativo'], conclusion: 'Il problema non è scommettere. È scommettere senza vantaggio matematico.', explanation: 'La maggior parte scommette per impulso. EUGINE calcola. Quando la probabilità reale è MAGGIORE della quota, c\'è valore.' },
      steps: { title: 'Come Funziona in 3 Passi', items: [{ title: 'Analizziamo 50+ partite al giorno', desc: 'Confrontiamo quote di più bookmaker con il nostro modello proprietario.' }, { title: 'Troviamo dove il bookmaker SBAGLIA', desc: 'Quando la nostra probabilità è MAGGIORE della quota, c\'è valore.' }, { title: 'Scommetti SOLO con vantaggio', desc: 'Ogni suggerimento mostra QUANTO edge hai. 7 fattori. 100% trasparente.' }] },
      socialProof: { title: 'Cosa Dicono i Nostri Utenti', testimonials: [{ name: 'Luca B.', role: 'Scommettitore da 4 anni', text: 'Con EUGINE ho capito cosa significa avere un vantaggio reale.', stars: 5 }, { name: 'Marco R.', role: 'Trader sportivo', text: "L'unico strumento che calcola davvero le probabilità.", stars: 5 }, { name: 'Alessandro F.', role: 'Abbonato Premium', text: 'Risultati incomparabili da quando uso il premium.', stars: 5 }, { name: 'Giovanni C.', role: 'Scommettitore del weekend', text: 'La trasparenza totale mi ha convinto.', stars: 4 }] },
      authority: { title: 'Perché Fidarsi di EUGINE?', items: [{ icon: 'brain', title: 'IA Proprietaria', desc: '+100.000 partite storiche.' }, { icon: 'shield', title: 'Azienda USA', desc: 'GS ITALY INVESTMENTS LLC.' }, { icon: 'chart', title: 'Risultati Verificabili', desc: 'Tutti pubblici.' }, { icon: 'lock', title: 'Dati Crittografati', desc: 'Crittografia bancaria.' }], quote: '"Non devi vincere tutte. Devi solo avere vantaggio."', quoteAuthor: '— Principio del Value Betting' },
      pricing: { title: 'Scegli il Tuo Piano', guarantee: 'Prova gratis 7 giorni', basic: { name: 'BASIC', price: '€29,90', period: '/mese', features: ['5 Partite/Giorno', 'Analisi Semplice', '1 Doppia', 'Supporto Email'], cta: 'Inizia gratis →' }, advanced: { name: 'ADVANCED', badge: 'PIÙ POPOLARE', price: '€49,90', period: '/mese', features: ['10 Partite/Giorno', 'Analisi Completa', '3 Doppie', 'Accumulatori', 'Supporto Prioritario'], cta: 'Abbonati Advanced' }, premium: { name: 'PREMIUM', badge: 'MIGLIOR VALORE', price: '€79,90', period: '/mese', features: ['Partite Illimitate', 'Analisi Premium', 'Tutte le Doppie', 'Accumulatori Premium', 'Export Report', 'Supporto 24/7'], cta: 'Abbonati Premium' } },
      faq: { title: 'Domande Frequenti', items: [{ q: 'EUGINE garantisce profitto?', a: 'No. Identifica vantaggio matematico.' }, { q: 'Come funziona la prova?', a: '7 giorni gratis, senza carta.' }, { q: 'Devo sapere di statistica?', a: 'No! EUGINE fa tutto.' }, { q: 'Quante partite?', a: '50+ al giorno da 30+ campionati.' }, { q: 'Sul cellulare?', a: "Sì, come app dal browser." }] },
      finalCta: { title: 'Il Tuo Vantaggio Inizia Ora', subtitle: 'Unisciti a migliaia che hanno smesso di indovinare.', cta: 'Inizia Gratis →', ctaSubtext: 'Gratis 7 giorni · Senza carta · Cancella quando vuoi' },
      footer: { about: 'Chi Siamo', terms: 'Termini', privacy: 'Privacy', responsible: 'Gioco Responsabile', contact: 'Contatto', copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC.`, disclaimer: "EUGINE è uno strumento di analisi statistica." },
    },
  };

  const l = labels[language] || labels.pt;

  const getAuthorityIcon = (icon: string) => {
    switch (icon) {
      case 'brain': return <Brain className="w-8 h-8 text-primary" />;
      case 'shield': return <Shield className="w-8 h-8 text-emerald-400" />;
      case 'chart': return <Award className="w-8 h-8 text-amber-400" />;
      case 'lock': return <Lock className="w-8 h-8 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div 
      className="min-h-screen text-foreground overflow-x-hidden relative"
      style={{ background: 'linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(217 33% 17%) 50%, hsl(222 47% 11%) 100%)' }}
    >

      {/* ═══════ 1. NAVIGATION ═══════ */}
      <nav className="relative z-50 max-w-7xl mx-auto flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'hsl(222 47% 20%)' }}>
            <span className="text-primary font-bold text-sm">E</span>
          </div>
          <span className="font-bold text-lg tracking-wide text-foreground">EUGINE</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{l.nav.howItWorks}</button>
          <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{l.nav.plans}</button>
          <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{l.nav.faq}</button>
          <button onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{l.nav.login}</button>
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90" style={{ background: '#FFD700', color: '#0A1A2F' }}>{l.nav.getStarted}</button>
        </div>
        <div className="md:hidden flex items-center gap-3">
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: '#FFD700', color: '#0A1A2F' }}>{l.nav.getStarted}</button>
        </div>
      </nav>

      {/* ═══════ 2. HERO — Two columns like Manus ═══════ */}
      <section className="relative px-5 pt-12 pb-16 lg:pt-20 lg:pb-28">
        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-8">
              <span className="text-muted-foreground text-xs sm:text-sm font-medium">{l.hero.badge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] uppercase">
              <span className="text-foreground block">{l.hero.title}</span>
              <span className="block mt-2" style={{ color: '#FFD700' }}>{l.hero.titleHighlight}</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              {l.hero.subtitle}
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-12 py-5 rounded-lg text-lg sm:text-xl font-black inline-flex items-center gap-3 transition-all hover:opacity-90"
              style={{ background: '#FFD700', color: '#0A1A2F' }}
            >
              {l.hero.ctaButton}
            </button>
            <p className="text-muted-foreground text-sm mt-4">{l.hero.ctaSubtext}</p>
            <p className="text-sm mt-2 font-medium" style={{ color: '#FFD700' }}>{l.hero.urgency}</p>

            {/* Quick stats */}
            <div className="flex flex-col gap-2 mt-8">
              {l.hero.stats.map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Zap className="w-4 h-4 text-primary shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Comparison Card */}
          <div className="lg:pl-8">
            <div className="rounded-2xl p-6 sm:p-8 border border-border/50" style={{ background: 'hsl(222 47% 14%)' }}>
              {/* AI vs Pro comparison */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-bold text-sm">{l.hero.aiLabel}</span>
                  <span className="text-primary font-black text-lg">{displayHitRate}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden mb-1">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${displayHitRate}%`, background: 'linear-gradient(90deg, hsl(199 89% 48%), hsl(160 70% 40%))' }} />
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">{l.hero.proLabel}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                  <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: '42%' }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground text-xs">~42%</span>
                  <span className="text-primary font-bold text-sm">+{displayHitRate - 42}% {l.hero.aiAdvantage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 3. LIVE MATCHES — "Jogos com Vantagem Agora" ═══════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">{l.liveMatches.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {l.liveMatches.matches.map((m: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 80}>
                <div className="rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all" style={{ background: 'hsl(222 47% 14%)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium">{m.league}</span>
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">{m.edge}</span>
                  </div>
                  <p className="text-foreground font-semibold text-sm mb-1">{m.home} × {m.away}</p>
                  <p className="text-primary text-xs font-bold">{m.bet}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          {/* Inline stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <ScrollFadeIn delay={0}>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-primary"><AnimatedCounter end={statsLoaded ? stats.hitRate : 65} suffix="%" /></p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{l.liveMatches.hitRate}</p>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={100}>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">+<AnimatedCounter end={displayEdge * 10} suffix="%" prefix="" /></p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{l.liveMatches.avgEdge}</p>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={200}>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-foreground"><LiveUsersCount /></p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{l.liveMatches.usersOnline}</p>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ 4. PROBLEM / AGITATION ═══════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">{l.problem.title}</h2>
            <p className="text-muted-foreground text-center mb-10">{l.problem.subtitle}</p>
          </ScrollFadeIn>
          <div className="space-y-4 mb-10">
            {l.problem.items.map((item: string, i: number) => (
              <ScrollFadeIn key={i} delay={i * 80}>
                <div className="flex items-start gap-4 p-5 rounded-xl border border-border/50" style={{ background: 'hsl(222 47% 14%)' }}>
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
          <ScrollFadeIn delay={400}>
            <p className="text-foreground font-bold text-center text-base sm:text-lg mb-4">{l.problem.conclusion}</p>
            <p className="text-muted-foreground text-center text-sm leading-relaxed">{l.problem.explanation}</p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ 5. 3 STEPS — "Como Funciona" ═══════ */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">{l.steps.title}</h2>
          </ScrollFadeIn>
          <div className="space-y-8">
            {l.steps.items.map((step: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 150}>
                <div className="flex gap-5 sm:gap-8">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg" style={{ background: 'linear-gradient(135deg, hsl(199 89% 48%), hsl(160 70% 40%))', color: '#fff' }}>
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 6. TESTIMONIALS ═══════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">{l.socialProof.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 gap-6">
            {l.socialProof.testimonials.map((t: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="p-6 sm:p-8 h-full flex flex-col rounded-xl border border-border/50" style={{ background: 'hsl(222 47% 14%)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-foreground font-bold text-sm" style={{ background: 'hsl(222 47% 20%)' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-foreground font-semibold text-sm">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    {Array.from({ length: 5 - t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 text-muted-foreground/30" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 7. TRUST / AUTHORITY ═══════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">{l.authority.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {l.authority.items.map((item: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="text-center p-6 rounded-xl border border-border/50" style={{ background: 'hsl(222 47% 14%)' }}>
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-secondary/50">
                    {getAuthorityIcon(item.icon)}
                  </div>
                  <h3 className="text-foreground font-bold text-sm mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          {/* Value Betting Quote */}
          <ScrollFadeIn delay={400}>
            <div className="text-center mt-8">
              <p className="text-foreground text-lg sm:text-xl font-bold italic mb-2">{l.authority.quote}</p>
              <p className="text-muted-foreground text-sm">{l.authority.quoteAuthor}</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ 8. PRICING — 3 plans ═══════ */}
      <section id="pricing" className="relative px-5 py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">{l.pricing.title}</h2>
            <p className="text-center text-muted-foreground text-sm mb-12">{l.pricing.guarantee}</p>
          </ScrollFadeIn>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Basic */}
            <ScrollFadeIn delay={0}>
              <div className="rounded-xl p-8 flex flex-col border border-border/50 h-full" style={{ background: 'hsl(222 47% 14%)' }}>
                <div className="text-center mb-6">
                  <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.basic.name}</h3>
                  <div><span className="text-foreground text-3xl sm:text-4xl font-black">{l.pricing.basic.price}</span><span className="text-muted-foreground text-sm">{l.pricing.basic.period}</span></div>
                </div>
                <button onClick={() => navigate('/auth')} className="w-full py-3 rounded-lg font-bold mb-6 transition-all hover:opacity-90" style={{ background: '#FFD700', color: '#0A1A2F' }}>{l.pricing.basic.cta}</button>
                <ul className="space-y-3 flex-grow">
                  {l.pricing.basic.features.map((f: string, i: number) => (<li key={i} className="flex items-center gap-3 text-muted-foreground text-sm"><Check className="w-4 h-4 text-primary shrink-0" /><span>{f}</span></li>))}
                </ul>
              </div>
            </ScrollFadeIn>

            {/* Advanced — HIGHLIGHTED */}
            <ScrollFadeIn delay={100}>
              <div className="relative rounded-xl p-8 flex flex-col border-2 border-primary h-full sm:-mt-4 sm:mb-[-16px]" style={{ background: 'hsl(222 47% 14%)', boxShadow: '0 0 40px hsla(199, 89%, 48%, 0.15)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">{l.pricing.advanced.badge}</span></div>
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.advanced.name}</h3>
                  <div><span className="text-foreground text-3xl sm:text-4xl font-black">{l.pricing.advanced.price}</span><span className="text-muted-foreground text-sm">{l.pricing.advanced.period}</span></div>
                </div>
                <button onClick={() => navigate('/auth')} className="w-full py-3 rounded-lg font-bold mb-6 transition-all hover:opacity-90" style={{ background: '#FFD700', color: '#0A1A2F' }}>{l.pricing.advanced.cta}</button>
                <ul className="space-y-3 flex-grow">
                  {l.pricing.advanced.features.map((f: string, i: number) => (<li key={i} className="flex items-center gap-3 text-foreground text-sm"><Check className="w-4 h-4 text-primary shrink-0" /><span>{f}</span></li>))}
                </ul>
              </div>
            </ScrollFadeIn>

            {/* Premium */}
            <ScrollFadeIn delay={200}>
              <div className="relative rounded-xl p-8 flex flex-col border border-border/50 h-full" style={{ background: 'hsl(222 47% 14%)' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap" style={{ background: '#FFD700', color: '#0A1A2F' }}>{l.pricing.premium.badge}</span></div>
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-foreground font-bold text-xl mb-4">{l.pricing.premium.name}</h3>
                  <div><span className="text-foreground text-3xl sm:text-4xl font-black">{l.pricing.premium.price}</span><span className="text-muted-foreground text-sm">{l.pricing.premium.period}</span></div>
                </div>
                <button onClick={() => navigate('/auth')} className="w-full py-3 rounded-lg font-bold mb-6 transition-all hover:opacity-90" style={{ background: '#FFD700', color: '#0A1A2F' }}>{l.pricing.premium.cta}</button>
                <ul className="space-y-3 flex-grow">
                  {l.pricing.premium.features.map((f: string, i: number) => (<li key={i} className="flex items-center gap-3 text-foreground text-sm"><Check className="w-4 h-4 text-primary shrink-0" /><span>{f}</span></li>))}
                </ul>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ 9. FAQ ═══════ */}
      <section id="faq" className="py-16 sm:py-20">
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

      {/* ═══════ 10. FINAL CTA ═══════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground mb-4">{l.finalCta.title}</h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">{l.finalCta.subtitle}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="px-10 py-4 text-base sm:text-lg font-black rounded-lg inline-flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: '#FFD700', color: '#0A1A2F' }}
            >
              {l.finalCta.cta}
            </button>
            <p className="text-muted-foreground text-sm mt-4">{l.finalCta.ctaSubtext}</p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ 11. FOOTER ═══════ */}
      <footer className="relative px-5 py-12" style={{ background: '#0A1A2F' }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm" style={{ color: '#7EB8D0' }}>
            <a href="/about" className="hover:text-white transition-colors">{l.footer.about}</a>
            <a href="/termos-de-uso" className="hover:text-white transition-colors">{l.footer.terms}</a>
            <a href="/politica-de-privacidade" className="hover:text-white transition-colors">{l.footer.privacy}</a>
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{l.footer.responsible}</a>
          </div>
          <p className="text-[10px] sm:text-xs max-w-2xl leading-relaxed" style={{ color: '#808A94' }}>{l.footer.disclaimer}</p>
          <p className="text-xs" style={{ color: '#808A94' }}>{l.footer.copyright}</p>
        </div>
      </footer>

    </div>
  );
}
