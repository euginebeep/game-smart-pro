/**
 * Landing Page B — LIGHT THEME (A/B Test variant)
 * White backgrounds, Montserrat/Poppins, gold accents, clean premium style
 * Same content structure + multilingual as Landing.tsx
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Brain, Target, TrendingUp, BarChart3,
  Shield, Globe, Activity, Clock, Star, Lock, Award, ChevronDown, Zap,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';

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
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── FAQ ───
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden mb-3" style={{ borderColor: '#E8EAED' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-sm sm:text-base" style={{ color: '#0A1A2F' }}>{question}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: '#FFD700' }} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: '#5a6c7d', background: '#F8F9FA', borderTop: '1px solid #E8EAED' }}>
          {answer}
        </div>
      )}
    </div>
  );
}

// ─── Color constants ───
const C = {
  navy: '#0A1A2F',
  navyMid: '#1a3a52',
  gold: '#FFD700',
  goldHover: '#FFC700',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  textSecondary: '#5a6c7d',
  border: '#E8EAED',
  green: '#22C55E',
};

export default function LandingB() {
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

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const displayHitRate = statsLoaded ? stats.hitRate : 65;

  // ─── Labels (same multilingual content as Landing A) ───
  const labels: Record<string, any> = {
    pt: {
      nav: { howItWorks: 'Como Funciona', plans: 'Planos', faq: 'FAQ', login: 'Login', getStarted: 'Comece Agora' },
      hero: { badge: '✓ Usado em mais de 30 países', title: 'VOCÊ NÃO PRECISA DE SORTE.', titleHighlight: 'PRECISA DE VANTAGEM.', subtitle: 'Transforme suas apostas em decisões estratégicas com dados reais e probabilidade a seu favor.', ctaButton: 'TESTE GRÁTIS AGORA', ctaSubtext: '✓ Grátis por 7 dias · Sem cartão · Cancele quando quiser', urgency: '⚠️ Vagas para o teste grátis se encerrando', stats: ['30+ ligas monitoradas', '50+ jogos analisados por dia', 'Odds em tempo real'], aiLabel: 'EUGINE AI', proLabel: 'Apostador profissional', aiAdvantage: 'Vantagem da IA' },
      liveMatches: { title: 'Jogos com Vantagem Agora', matches: [{ league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' }, { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' }, { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' }, { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' }], hitRate: 'Taxa de Acerto', avgEdge: 'Edge Médio Detectado', usersOnline: 'Usuários Online Agora' },
      problem: { title: 'Isso Acontece com 87% dos Apostadores', subtitle: 'Você provavelmente já passou por isso:', items: ['Você analisa o jogo por 2 minutos, mas a casa de apostas usou 47 variáveis estatísticas para definir a odd', 'Segue palpites de grupos sem saber que 92% dos tipsters não têm histórico auditável', 'Aposta $50 no \'feeling\' e não percebe que a probabilidade implícita já está contra você', 'Acerta 3, erra 4 — e no fim do mês o saldo é sempre negativo'], conclusion: 'O problema não é apostar. É apostar sem vantagem matemática comprovada.', explanation: 'A maioria aposta por impulso. Por emoção. Por palpite de grupo. O EUGINE calcula. Quando a probabilidade real é MAIOR que a odd oferecida, existe valor. Onde existe valor, existe vantagem no longo prazo.' },
      steps: { title: 'Veja Como Funciona em 3 Passos', items: [{ title: 'Escaneamos 50+ jogos por dia', desc: 'Analisamos todas as principais ligas do mundo, comparando odds de múltiplas casas com nosso modelo de probabilidade proprietário. Cada card mostra o jogo, as odds e o nível de confiança. Verde = vantagem detectada.' }, { title: 'Encontramos onde a casa ERRA', desc: 'Quando nossa probabilidade calculada é MAIOR que a odd oferecida, existe valor. Aí você recebe o alerta com a % exata de vantagem.' }, { title: 'Você aposta SÓ com vantagem', desc: 'Cada sugestão mostra QUANTO de edge você tem. No longo prazo, vantagem consistente = resultado consistente. 7 fatores analisados. 100% transparente.' }] },
      socialProof: { title: 'O que Dizem Nossos Usuários', testimonials: [{ name: 'Carlos M.', role: 'Apostador há 3 anos', text: 'Antes eu achava que entendia de futebol. O EUGINE me mostrou que entender ≠ ter edge. Meu ROI mudou completamente.', stars: 5 }, { name: 'Rafael S.', role: 'Trader esportivo', text: 'Finalmente uma ferramenta que mostra a matemática por trás. Não é palpite, é análise de verdade.', stars: 5 }, { name: 'Fernando L.', role: 'Usuário Premium', text: 'Comecei no básico, hoje sou premium. A diferença é que agora eu sei POR QUE estou apostando.', stars: 5 }, { name: 'Thiago R.', role: 'Apostador recreativo', text: 'O melhor é a transparência total. Eles publicam todos os resultados, erros e acertos.', stars: 4 }] },
      authority: { title: 'Por que Confiar no EUGINE?', items: [{ icon: 'brain', title: 'IA Proprietária', desc: 'Modelo treinado com +100.000 partidas históricas e 7 fatores de análise.' }, { icon: 'shield', title: 'Empresa Registrada nos EUA', desc: 'GS ITALY INVESTMENTS LLC — empresa especializada em análise de dados.' }, { icon: 'chart', title: 'Resultados Auditáveis', desc: 'Todos os resultados são públicos e verificáveis. Sem edição.' }, { icon: 'lock', title: 'Dados Criptografados', desc: 'Sua conta protegida com criptografia de nível bancário.' }], quote: '"Você não precisa ganhar todas. Só precisa ter vantagem."', quoteAuthor: '— Princípio do Value Betting' },
      pricing: { title: 'Escolha Seu Plano', guarantee: 'Teste grátis por 7 dias sem risco', basic: { name: 'BASIC', price: 'R$ 29,90', period: '/mês', features: ['5 Jogos por Dia', 'Análise Simples', '1 Dupla Diária', 'Suporte por Email'], cta: 'Começar grátis →' }, advanced: { name: 'ADVANCED', badge: 'MAIS POPULAR', price: 'R$ 49,90', period: '/mês', features: ['10 Jogos por Dia', 'Análise Completa', '3 Duplas Diárias', 'Acumuladores', 'Suporte Prioritário'], cta: 'Assinar Advanced' }, premium: { name: 'PREMIUM', badge: 'MELHOR VALOR', price: 'R$ 79,90', period: '/mês', features: ['Jogos Ilimitados', 'Análise Premium Completa', 'Todas as Duplas e Zebras', 'Acumuladores Premium', 'Exportação de Relatórios', 'Suporte Prioritário 24/7'], cta: 'Assinar Premium' } },
      faq: { title: 'Perguntas Frequentes', items: [{ q: 'O EUGINE garante lucro?', a: 'Não. Nenhuma ferramenta pode garantir lucro. O EUGINE identifica oportunidades com vantagem matemática, mas o resultado depende da sua disciplina e gestão de banca.' }, { q: 'Como funciona o período grátis?', a: 'Você tem 7 dias de acesso completo, sem cartão de crédito. Pode cancelar a qualquer momento.' }, { q: 'Preciso entender de estatística?', a: 'Não! O EUGINE faz toda a análise e te entrega o resultado de forma visual e simples.' }, { q: 'Quantos jogos são analisados por dia?', a: 'Analisamos 50+ jogos diariamente de mais de 30 ligas ao redor do mundo.' }, { q: 'Posso usar no celular?', a: 'Sim! Funciona como um app no navegador. Sem download necessário.' }] },
      finalCta: { title: 'Sua Vantagem Começa Agora', subtitle: 'Junte-se a milhares de apostadores que pararam de adivinhar e começaram a calcular.', cta: 'Começar Grátis Agora →', ctaSubtext: 'Grátis por 7 dias · Sem cartão · Cancele quando quiser' },
      footer: { product: 'Produto', legal: 'Legal', howItWorks: 'Como Funciona', plans: 'Planos', app: 'App', terms: 'Termos de Uso', privacy: 'Política de Privacidade', responsible: 'Jogo Responsável', about: 'Sobre Nós', copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos os direitos reservados.`, disclaimer: 'O EUGINE é uma ferramenta de análise estatística. Resultados passados não garantem resultados futuros. Apostas esportivas envolvem risco de perda. Aposte com responsabilidade e apenas valores que você pode perder.' },
    },
    en: {
      nav: { howItWorks: 'How It Works', plans: 'Plans', faq: 'FAQ', login: 'Login', getStarted: 'Get Started' },
      hero: { badge: '✓ Used in 30+ countries', title: "YOU DON'T NEED LUCK.", titleHighlight: 'YOU NEED AN EDGE.', subtitle: 'Turn your bets into strategic decisions with real data and probability on your side.', ctaButton: 'START FREE TRIAL', ctaSubtext: '✓ Free for 7 days · No card · Cancel anytime', urgency: '⚠️ Free trial spots closing', stats: ['30+ leagues monitored', '50+ matches analyzed daily', 'Real-time odds'], aiLabel: 'EUGINE AI', proLabel: 'Professional bettor', aiAdvantage: 'AI Advantage' },
      liveMatches: { title: 'Matches with Edge Now', matches: [{ league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' }, { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' }, { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' }, { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' }], hitRate: 'Hit Rate', avgEdge: 'Average Edge', usersOnline: 'Users Online' },
      problem: { title: 'This Happens to 87% of Bettors', subtitle: "You've probably been through this:", items: ['You analyze the match for 2 minutes, but the bookmaker used 47 statistical variables', "You follow tips from groups without knowing 92% don't have auditable records", "You bet $50 on 'feeling' without realizing implied probability is against you", 'You hit 3, miss 4 — and the balance is always negative'], conclusion: "The problem isn't betting. It's betting without a proven mathematical edge.", explanation: 'Most bet on impulse. EUGINE calculates. When real probability is HIGHER than the odds, there is value.' },
      steps: { title: 'See How It Works in 3 Steps', items: [{ title: 'We scan 50+ matches daily', desc: 'We analyze all major leagues, comparing odds with our proprietary probability model. Green = edge detected.' }, { title: 'We find where the house is WRONG', desc: 'When our calculated probability is HIGHER than the offered odds, there is value.' }, { title: 'You only bet WITH an edge', desc: 'Each suggestion shows HOW MUCH edge you have. 7 factors analyzed. 100% transparent.' }] },
      socialProof: { title: 'What Our Users Say', testimonials: [{ name: 'James K.', role: 'Bettor for 3 years', text: "EUGINE showed me that understanding ≠ having an edge. My ROI changed completely.", stars: 5 }, { name: 'Michael T.', role: 'Sports trader', text: "Finally a tool that shows the math behind it. Real analysis with calculated probability.", stars: 5 }, { name: 'David R.', role: 'Premium User', text: "Now I know WHY I'm betting.", stars: 5 }, { name: 'Robert M.', role: 'Recreational bettor', text: 'Total transparency. They publish all results.', stars: 4 }] },
      authority: { title: 'Why Trust EUGINE?', items: [{ icon: 'brain', title: 'Proprietary AI', desc: '100,000+ historical matches and 7 analysis factors.' }, { icon: 'shield', title: 'US Registered Company', desc: 'GS ITALY INVESTMENTS LLC.' }, { icon: 'chart', title: 'Auditable Results', desc: 'All results are public and verifiable.' }, { icon: 'lock', title: 'Encrypted Data', desc: 'Bank-level encryption.' }], quote: '"You don\'t need to win them all. You just need an edge."', quoteAuthor: '— Value Betting Principle' },
      pricing: { title: 'Choose Your Plan', guarantee: 'Free trial for 7 days, no risk', basic: { name: 'BASIC', price: '$9.90', period: '/month', features: ['5 Matches/Day', 'Simple Analysis', '1 Daily Double', 'Email Support'], cta: 'Start free →' }, advanced: { name: 'ADVANCED', badge: 'MOST POPULAR', price: '$14.90', period: '/month', features: ['10 Matches/Day', 'Full Analysis', '3 Daily Doubles', 'Accumulators', 'Priority Support'], cta: 'Subscribe Advanced' }, premium: { name: 'PREMIUM', badge: 'BEST VALUE', price: '$24.90', period: '/month', features: ['Unlimited Matches', 'Premium Full Analysis', 'All Doubles & Zebras', 'Premium Accumulators', 'Report Export', 'Priority Support 24/7'], cta: 'Subscribe Premium' } },
      faq: { title: 'Frequently Asked Questions', items: [{ q: 'Does EUGINE guarantee profit?', a: 'No. EUGINE identifies mathematical edge opportunities.' }, { q: 'How does the free period work?', a: '7 days full access, no credit card.' }, { q: 'Do I need statistics knowledge?', a: 'No! EUGINE does all the analysis.' }, { q: 'How many matches?', a: '50+ daily from 30+ leagues.' }, { q: 'Mobile?', a: 'Yes! Works as an app via browser.' }] },
      finalCta: { title: 'Your Edge Starts Now', subtitle: 'Join thousands who stopped guessing and started calculating.', cta: 'Start Free Now →', ctaSubtext: 'Free for 7 days · No card · Cancel anytime' },
      footer: { product: 'Product', legal: 'Legal', howItWorks: 'How It Works', plans: 'Plans', app: 'App', terms: 'Terms', privacy: 'Privacy', responsible: 'Responsible Gambling', about: 'About', copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. All rights reserved.`, disclaimer: 'EUGINE is a statistical analysis tool. Past results do not guarantee future results. Sports betting involves risk.' },
    },
    es: {
      nav: { howItWorks: 'Cómo Funciona', plans: 'Planes', faq: 'FAQ', login: 'Login', getStarted: 'Empezar' },
      hero: { badge: '✓ Usado en más de 30 países', title: 'NO NECESITAS SUERTE.', titleHighlight: 'NECESITAS VENTAJA.', subtitle: 'Transforma tus apuestas en decisiones estratégicas con datos reales y probabilidad a tu favor.', ctaButton: 'PRUEBA GRATIS AHORA', ctaSubtext: '✓ Gratis por 7 días · Sin tarjeta · Cancela cuando quieras', urgency: '⚠️ Plazas cerrándose', stats: ['30+ ligas monitoreadas', '50+ partidos por día', 'Odds en tiempo real'], aiLabel: 'EUGINE AI', proLabel: 'Apostador profesional', aiAdvantage: 'Ventaja IA' },
      liveMatches: { title: 'Partidos con Ventaja Ahora', matches: [{ league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' }, { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' }, { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' }, { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' }], hitRate: 'Tasa de Acierto', avgEdge: 'Edge Medio', usersOnline: 'Usuarios Online' },
      problem: { title: 'Esto le Pasa al 87% de los Apostadores', subtitle: 'Probablemente ya te pasó:', items: ['Analizas el partido 2 minutos, pero la casa usó 47 variables', 'Sigues tips sin saber que el 92% no tiene historial auditable', 'Apuestas $50 por "feeling" sin ver la probabilidad implícita', 'Aciertas 3, fallas 4 — saldo siempre negativo'], conclusion: 'El problema no es apostar. Es apostar sin ventaja matemática.', explanation: 'La mayoría apuesta por impulso. EUGINE calcula. Cuando la probabilidad real es MAYOR, hay valor.' },
      steps: { title: 'Cómo Funciona en 3 Pasos', items: [{ title: 'Escaneamos 50+ partidos/día', desc: 'Comparamos odds con nuestro modelo propietario.' }, { title: 'Encontramos dónde ERRA la casa', desc: 'Cuando nuestra probabilidad es MAYOR que la odd, hay valor.' }, { title: 'Apuestas SOLO con ventaja', desc: '7 factores analizados. 100% transparente.' }] },
      socialProof: { title: 'Lo que Dicen Nuestros Usuarios', testimonials: [{ name: 'Alejandro G.', role: 'Apostador 3 años', text: 'Mi ROI cambió completamente con EUGINE.', stars: 5 }, { name: 'Diego M.', role: 'Trader deportivo', text: 'Matemáticas reales, no intuición.', stars: 5 }, { name: 'Pablo R.', role: 'Usuario Premium', text: 'Ahora sé POR QUÉ apuesto.', stars: 5 }, { name: 'Sergio L.', role: 'Apostador recreativo', text: 'Transparencia total.', stars: 4 }] },
      authority: { title: '¿Por qué Confiar en EUGINE?', items: [{ icon: 'brain', title: 'IA Propietaria', desc: '+100.000 partidos históricos.' }, { icon: 'shield', title: 'Empresa EE.UU.', desc: 'GS ITALY INVESTMENTS LLC.' }, { icon: 'chart', title: 'Resultados Auditables', desc: 'Públicos y verificables.' }, { icon: 'lock', title: 'Datos Encriptados', desc: 'Encriptación bancaria.' }], quote: '"No necesitas ganar todas. Solo ventaja."', quoteAuthor: '— Principio del Value Betting' },
      pricing: { title: 'Elige Tu Plan', guarantee: 'Prueba gratis 7 días', basic: { name: 'BASIC', price: '€29,90', period: '/mes', features: ['5 Partidos/Día', 'Análisis Simple', '1 Doble', 'Soporte Email'], cta: 'Empezar gratis →' }, advanced: { name: 'ADVANCED', badge: 'MÁS POPULAR', price: '€49,90', period: '/mes', features: ['10 Partidos/Día', 'Análisis Completo', '3 Dobles', 'Acumuladores', 'Soporte Prioritario'], cta: 'Suscribir Advanced' }, premium: { name: 'PREMIUM', badge: 'MEJOR VALOR', price: '€79,90', period: '/mes', features: ['Ilimitados', 'Análisis Premium', 'Todas las Dobles', 'Acumuladores Premium', 'Exportación', 'Soporte 24/7'], cta: 'Suscribir Premium' } },
      faq: { title: 'Preguntas Frecuentes', items: [{ q: '¿Garantiza ganancias?', a: 'No. Identifica ventaja matemática.' }, { q: '¿Cómo funciona la prueba?', a: '7 días gratis, sin tarjeta.' }, { q: '¿Necesito estadística?', a: 'No!' }, { q: '¿Cuántos partidos?', a: '50+ diarios.' }, { q: '¿En celular?', a: 'Sí, desde el navegador.' }] },
      finalCta: { title: 'Tu Ventaja Empieza Ahora', subtitle: 'Únete a miles que dejaron de adivinar.', cta: 'Empezar Gratis →', ctaSubtext: 'Gratis 7 días · Sin tarjeta · Cancela cuando quieras' },
      footer: { product: 'Producto', legal: 'Legal', howItWorks: 'Cómo Funciona', plans: 'Planes', app: 'App', terms: 'Términos', privacy: 'Privacidad', responsible: 'Juego Responsable', about: 'Sobre', copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC.`, disclaimer: 'EUGINE es una herramienta de análisis estadístico.' },
    },
    it: {
      nav: { howItWorks: 'Come Funziona', plans: 'Piani', faq: 'FAQ', login: 'Login', getStarted: 'Inizia' },
      hero: { badge: '✓ Usato in oltre 30 paesi', title: 'NON HAI BISOGNO DI FORTUNA.', titleHighlight: 'HAI BISOGNO DI VANTAGGIO.', subtitle: 'Trasforma le tue scommesse in decisioni strategiche con dati reali e probabilità a tuo favore.', ctaButton: 'PROVA GRATIS ORA', ctaSubtext: '✓ Gratis 7 giorni · Senza carta · Cancella quando vuoi', urgency: '⚠️ Posti in esaurimento', stats: ['30+ campionati monitorati', '50+ partite/giorno', 'Quote in tempo reale'], aiLabel: 'EUGINE AI', proLabel: 'Scommettitore professionista', aiAdvantage: 'Vantaggio IA' },
      liveMatches: { title: 'Partite con Vantaggio Ora', matches: [{ league: 'La Liga', edge: '+8.2%', home: 'Barcelona', away: 'R. Madrid', bet: 'Over 2.5' }, { league: 'EPL', edge: '+12.4%', home: 'Liverpool', away: 'Arsenal', bet: '1X' }, { league: 'Ligue 1', edge: '+5.7%', home: 'PSG', away: 'Marseille', bet: 'BTTS' }, { league: 'Serie A', edge: '+9.1%', home: 'Inter', away: 'Juventus', bet: 'Under 3.5' }], hitRate: 'Tasso Successo', avgEdge: 'Edge Medio', usersOnline: 'Utenti Online' },
      problem: { title: "Succede all'87% degli Scommettitori", subtitle: 'Probabilmente è successo anche a te:', items: ['Analizzi 2 minuti, il bookmaker ha usato 47 variabili', "Segui pronostici senza storico verificabile", "Scommetti €50 per 'feeling'", 'Indovini 3, sbagli 4 — saldo negativo'], conclusion: 'Il problema non è scommettere. È scommettere senza vantaggio.', explanation: 'La maggior parte scommette per impulso. EUGINE calcola.' },
      steps: { title: 'Come Funziona in 3 Passi', items: [{ title: '50+ partite analizzate/giorno', desc: 'Confrontiamo quote con il nostro modello proprietario.' }, { title: 'Troviamo dove SBAGLIA il bookmaker', desc: 'Quando la probabilità è MAGGIORE della quota, c\'è valore.' }, { title: 'Scommetti SOLO con vantaggio', desc: '7 fattori. 100% trasparente.' }] },
      socialProof: { title: 'Cosa Dicono i Nostri Utenti', testimonials: [{ name: 'Luca B.', role: 'Scommettitore 4 anni', text: 'Con EUGINE ho capito il vantaggio reale.', stars: 5 }, { name: 'Marco R.', role: 'Trader sportivo', text: 'Calcola davvero le probabilità.', stars: 5 }, { name: 'Alessandro F.', role: 'Abbonato Premium', text: 'Risultati incomparabili.', stars: 5 }, { name: 'Giovanni C.', role: 'Scommettitore weekend', text: 'Trasparenza totale.', stars: 4 }] },
      authority: { title: 'Perché Fidarsi di EUGINE?', items: [{ icon: 'brain', title: 'IA Proprietaria', desc: '+100.000 partite.' }, { icon: 'shield', title: 'Azienda USA', desc: 'GS ITALY INVESTMENTS LLC.' }, { icon: 'chart', title: 'Risultati Verificabili', desc: 'Tutti pubblici.' }, { icon: 'lock', title: 'Dati Crittografati', desc: 'Crittografia bancaria.' }], quote: '"Non devi vincere tutte. Devi avere vantaggio."', quoteAuthor: '— Principio del Value Betting' },
      pricing: { title: 'Scegli il Tuo Piano', guarantee: 'Prova gratis 7 giorni', basic: { name: 'BASIC', price: '€29,90', period: '/mese', features: ['5 Partite/Giorno', 'Analisi Semplice', '1 Doppia', 'Supporto Email'], cta: 'Inizia gratis →' }, advanced: { name: 'ADVANCED', badge: 'PIÙ POPOLARE', price: '€49,90', period: '/mese', features: ['10 Partite/Giorno', 'Analisi Completa', '3 Doppie', 'Accumulatori', 'Supporto Prioritario'], cta: 'Abbonati Advanced' }, premium: { name: 'PREMIUM', badge: 'MIGLIOR VALORE', price: '€79,90', period: '/mese', features: ['Illimitate', 'Analisi Premium', 'Tutte le Doppie', 'Accumulatori Premium', 'Export Report', 'Supporto 24/7'], cta: 'Abbonati Premium' } },
      faq: { title: 'Domande Frequenti', items: [{ q: 'Garantisce profitto?', a: 'No. Identifica vantaggio matematico.' }, { q: 'Come funziona la prova?', a: '7 giorni gratis, senza carta.' }, { q: 'Devo sapere di statistica?', a: 'No!' }, { q: 'Quante partite?', a: '50+ al giorno.' }, { q: 'Sul cellulare?', a: 'Sì, dal browser.' }] },
      finalCta: { title: 'Il Tuo Vantaggio Inizia Ora', subtitle: 'Unisciti a migliaia che hanno smesso di indovinare.', cta: 'Inizia Gratis →', ctaSubtext: 'Gratis 7 giorni · Senza carta · Cancella quando vuoi' },
      footer: { product: 'Prodotto', legal: 'Legale', howItWorks: 'Come Funziona', plans: 'Piani', app: 'App', terms: 'Termini', privacy: 'Privacy', responsible: 'Gioco Responsabile', about: 'Chi Siamo', copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC.`, disclaimer: 'EUGINE è uno strumento di analisi statistica.' },
    },
  };

  const l = labels[language] || labels.pt;

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'brain': return <Brain className="w-8 h-8" style={{ color: C.gold }} />;
      case 'shield': return <Shield className="w-8 h-8" style={{ color: C.gold }} />;
      case 'chart': return <BarChart3 className="w-8 h-8" style={{ color: C.gold }} />;
      case 'lock': return <Lock className="w-8 h-8" style={{ color: C.gold }} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'Poppins', 'Inter', sans-serif", background: C.white, color: C.navy }}>

      {/* ═══════ NAV ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10" style={{ height: 64, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.navy }}>
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-bold text-lg tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>EUGINE</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('b-how')} className="text-sm hover:opacity-70 transition-opacity" style={{ color: C.textSecondary }}>{l.nav.howItWorks}</button>
          <button onClick={() => scrollTo('b-pricing')} className="text-sm hover:opacity-70 transition-opacity" style={{ color: C.textSecondary }}>{l.nav.plans}</button>
          <button onClick={() => scrollTo('b-faq')} className="text-sm hover:opacity-70 transition-opacity" style={{ color: C.textSecondary }}>{l.nav.faq}</button>
          <button onClick={() => navigate('/auth')} className="text-sm hover:opacity-70 transition-opacity" style={{ color: C.textSecondary }}>{l.nav.login}</button>
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90" style={{ background: C.gold, color: C.navy }}>{l.nav.getStarted}</button>
        </div>
        <div className="md:hidden flex items-center gap-3">
          <LanguageSelector />
          <button onClick={() => navigate('/auth')} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: C.gold, color: C.navy }}>{l.nav.getStarted}</button>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="pt-16" style={{ background: `linear-gradient(180deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: '80px 20px 64px' }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="text-white text-xs font-medium">{l.hero.badge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.2] mb-6 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="text-white block">{l.hero.title}</span>
              <span className="block mt-2" style={{ color: C.gold }}>{l.hero.titleHighlight}</span>
            </h1>
            <p className="text-base sm:text-xl mb-8 leading-relaxed" style={{ color: '#E8EAED' }}>{l.hero.subtitle}</p>
            <button onClick={() => navigate('/auth')} className="px-8 py-4 rounded-lg text-base font-bold transition-all hover:opacity-90" style={{ background: C.gold, color: C.navy, fontFamily: "'Montserrat', sans-serif" }}>{l.hero.ctaButton}</button>
            <p className="text-xs mt-3" style={{ color: '#E8EAED' }}>{l.hero.ctaSubtext}</p>
            <p className="text-xs mt-2 font-semibold" style={{ color: C.gold }}>{l.hero.urgency}</p>
            <div className="flex flex-col gap-2 mt-6">
              {l.hero.stats.map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#E8EAED' }}>
                  <Zap className="w-4 h-4 shrink-0" style={{ color: C.gold }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right: Dashboard preview */}
          <div className="lg:pl-8">
            <div className="rounded-xl p-6 sm:p-8" style={{ background: `linear-gradient(180deg, ${C.navyMid}, ${C.navy})`, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{l.hero.aiLabel}</span>
                  <span className="font-bold text-2xl" style={{ color: C.gold }}>{displayHitRate}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${displayHitRate}%`, background: C.gold }} />
                </div>
              </div>
              <div>
                <span className="text-xs" style={{ color: '#E8EAED' }}>{l.hero.proLabel}</span>
                <div className="w-full h-2.5 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: '42%', background: 'rgba(255,255,255,0.3)' }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: '#a0a8b0' }}>~42%</span>
                  <span className="text-sm font-bold" style={{ color: C.gold }}>+{displayHitRate - 42}% {l.hero.aiAdvantage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ LIVE MATCHES ═══════ */}
      <section style={{ background: C.lightGray, padding: '64px 20px' }}>
        <div className="max-w-6xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.liveMatches.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {l.liveMatches.matches.map((m: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 80}>
                <div className="rounded-lg p-4 transition-all hover:shadow-md" style={{ background: C.white, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: C.textSecondary }}>{m.league}</span>
                    <span className="text-xs font-bold" style={{ color: C.gold }}>{m.edge}</span>
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: C.navy }}>{m.home} × {m.away}</p>
                  <p className="text-xs font-bold" style={{ color: C.textSecondary }}>{m.bet}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { val: <AnimatedCounter end={statsLoaded ? stats.hitRate : 65} suffix="%" />, label: l.liveMatches.hitRate },
              { val: <><span>+</span><AnimatedCounter end={124} suffix="%" /></>, label: l.liveMatches.avgEdge },
              { val: <AnimatedCounter end={97} />, label: l.liveMatches.usersOnline },
            ].map((s, i) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="text-center rounded-lg p-6" style={{ background: C.white, border: `1px solid ${C.border}` }}>
                  <p className="text-3xl sm:text-4xl font-bold" style={{ color: C.gold }}>{s.val}</p>
                  <p className="text-xs mt-2" style={{ color: C.textSecondary }}>{s.label}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PROBLEM ═══════ */}
      <section style={{ background: C.white, padding: '64px 20px' }}>
        <div className="max-w-3xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.problem.title}</h2>
            <p className="text-center mb-12" style={{ color: C.textSecondary }}>{l.problem.subtitle}</p>
          </ScrollFadeIn>
          <div className="space-y-4 mb-8">
            {l.problem.items.map((item: string, i: number) => (
              <ScrollFadeIn key={i} delay={i * 80}>
                <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" style={{ color: C.gold }} />
                  <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>{item}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
          <ScrollFadeIn delay={400}>
            <div className="rounded-lg p-6" style={{ background: C.navy }}>
              <p className="text-white font-bold text-base mb-3">{l.problem.conclusion}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#E8EAED' }}>{l.problem.explanation}</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ 3 STEPS ═══════ */}
      <section id="b-how" style={{ background: C.lightGray, padding: '64px 20px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.steps.title}</h2>
          </ScrollFadeIn>
          <div className="space-y-12">
            {l.steps.items.map((step: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 150}>
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: C.gold, color: C.navy, fontFamily: "'Montserrat', sans-serif" }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>{step.desc}</p>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section style={{ background: C.white, padding: '64px 20px' }}>
        <div className="max-w-6xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.socialProof.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {l.socialProof.testimonials.map((t: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="rounded-lg p-6 h-full flex flex-col" style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: C.gold, color: C.navy }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: C.navy }}>{t.name}</p>
                      <p className="text-xs" style={{ color: C.textSecondary }}>{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, si) => <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    {Array.from({ length: 5 - t.stars }).map((_, si) => <Star key={si} className="w-4 h-4 text-gray-300" />)}
                  </div>
                  <p className="text-sm leading-relaxed italic flex-grow" style={{ color: C.textSecondary }}>&ldquo;{t.text}&rdquo;</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TRUST ═══════ */}
      <section style={{ background: `linear-gradient(180deg, ${C.navy}, ${C.navyMid})`, padding: '64px 20px' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>{l.authority.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {l.authority.items.map((item: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="rounded-lg p-6" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div className="mb-3">{getIcon(item.icon)}</div>
                  <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#E8EAED' }}>{item.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
          <ScrollFadeIn delay={400}>
            <div className="text-center mt-12">
              <p className="text-white text-lg sm:text-xl font-semibold italic mb-2">{l.authority.quote}</p>
              <p className="text-sm" style={{ color: '#a0a8b0' }}>{l.authority.quoteAuthor}</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="b-pricing" style={{ background: C.lightGray, padding: '64px 20px' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.pricing.title}</h2>
            <p className="text-center text-sm mb-12" style={{ color: C.textSecondary }}>{l.pricing.guarantee}</p>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Basic */}
            <ScrollFadeIn delay={0}>
              <div className="rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ background: C.white, border: `2px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div className="pb-6 mb-6" style={{ borderBottom: `2px solid ${C.border}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.navy}10` }}>
                    <Zap className="w-6 h-6" style={{ color: C.navy }} />
                  </div>
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.pricing.basic.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold" style={{ color: C.navy }}>{l.pricing.basic.price}</span>
                    <span className="text-sm font-medium" style={{ color: C.textSecondary }}>{l.pricing.basic.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-grow mb-8">
                  {l.pricing.basic.features.map((f: string, i: number) => <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: C.navy }}><div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.green}15` }}><Check className="w-3.5 h-3.5" style={{ color: C.green }} /></div><span>{f}</span></li>)}
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full py-3.5 rounded-xl font-bold transition-all hover:opacity-90 text-white text-sm" style={{ background: C.navy }}>{l.pricing.basic.cta}</button>
              </div>
            </ScrollFadeIn>
            {/* Advanced — HIGHLIGHTED */}
            <ScrollFadeIn delay={100}>
              <div className="relative rounded-2xl p-8 flex flex-col h-full sm:-mt-6 sm:pb-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1" style={{ background: `linear-gradient(180deg, ${C.white} 0%, #FFFDF5 100%)`, border: `2px solid ${C.gold}`, boxShadow: '0 8px 40px rgba(255,215,0,0.2), 0 4px 20px rgba(0,0,0,0.08)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="text-xs font-bold px-5 py-2 rounded-full shadow-lg" style={{ background: `linear-gradient(135deg, ${C.gold}, #FFC700)`, color: C.navy }}>{l.pricing.advanced.badge}</span></div>
                <div className="pb-6 mb-6 pt-3" style={{ borderBottom: `2px solid ${C.gold}40` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.gold}20` }}>
                    <Star className="w-6 h-6" style={{ color: C.gold }} />
                  </div>
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.pricing.advanced.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold" style={{ color: C.navy }}>{l.pricing.advanced.price}</span>
                    <span className="text-sm font-medium" style={{ color: C.textSecondary }}>{l.pricing.advanced.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-grow mb-8">
                  {l.pricing.advanced.features.map((f: string, i: number) => <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: C.navy }}><div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.gold}25` }}><Check className="w-3.5 h-3.5" style={{ color: C.gold }} /></div><span>{f}</span></li>)}
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full py-3.5 rounded-xl font-bold transition-all hover:opacity-90 text-sm shadow-lg" style={{ background: `linear-gradient(135deg, ${C.gold}, #FFC700)`, color: C.navy, boxShadow: '0 4px 16px rgba(255,215,0,0.3)' }}>{l.pricing.advanced.cta}</button>
              </div>
            </ScrollFadeIn>
            {/* Premium */}
            <ScrollFadeIn delay={200}>
              <div className="relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ background: C.navy, border: `2px solid ${C.navyMid}`, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="text-xs font-bold px-5 py-2 rounded-full" style={{ background: C.white, color: C.navy, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{l.pricing.premium.badge}</span></div>
                <div className="pb-6 mb-6 pt-3" style={{ borderBottom: '2px solid rgba(255,255,255,0.15)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Award className="w-6 h-6" style={{ color: C.gold }} />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>{l.pricing.premium.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{l.pricing.premium.price}</span>
                    <span className="text-sm font-medium" style={{ color: '#a0a8b0' }}>{l.pricing.premium.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-grow mb-8">
                  {l.pricing.premium.features.map((f: string, i: number) => <li key={i} className="flex items-center gap-3 text-sm font-medium text-white"><div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.gold}30` }}><Check className="w-3.5 h-3.5" style={{ color: C.gold }} /></div><span>{f}</span></li>)}
                </ul>
                <button onClick={() => navigate('/auth')} className="w-full py-3.5 rounded-xl font-bold transition-all hover:opacity-90 text-sm" style={{ background: C.gold, color: C.navy }}>{l.pricing.premium.cta}</button>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="b-faq" style={{ background: C.white, padding: '64px 20px' }}>
        <div className="max-w-2xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Montserrat', sans-serif", color: C.navy }}>{l.faq.title}</h2>
          </ScrollFadeIn>
          {l.faq.items.map((item: any, i: number) => (
            <ScrollFadeIn key={i} delay={i * 50}>
              <FAQItem question={item.q} answer={item.a} />
            </ScrollFadeIn>
          ))}
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section style={{ background: `linear-gradient(180deg, ${C.navy}, ${C.navyMid})`, padding: '64px 20px' }}>
        <div className="max-w-2xl mx-auto text-center">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>{l.finalCta.title}</h2>
            <p className="text-base mb-8" style={{ color: '#E8EAED' }}>{l.finalCta.subtitle}</p>
            <button onClick={() => navigate('/auth')} className="px-8 py-4 rounded-lg text-base font-bold transition-all hover:opacity-90" style={{ background: C.gold, color: C.navy, fontFamily: "'Montserrat', sans-serif" }}>{l.finalCta.cta}</button>
            <p className="text-xs mt-4" style={{ color: '#E8EAED' }}>{l.finalCta.ctaSubtext}</p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ background: C.navy, padding: '48px 20px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.navyMid }}><span className="text-white font-bold text-sm">E</span></div>
                <span className="text-white font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>EUGINE</span>
              </div>
              <p className="text-xs" style={{ color: '#a0a8b0' }}>Análise de Apostas com IA</p>
            </div>
            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">{l.footer.product}</h4>
              <div className="space-y-2">
                <button onClick={() => scrollTo('b-how')} className="block text-xs hover:text-white transition-colors" style={{ color: '#a0a8b0' }}>{l.footer.howItWorks}</button>
                <button onClick={() => scrollTo('b-pricing')} className="block text-xs hover:text-white transition-colors" style={{ color: '#a0a8b0' }}>{l.footer.plans}</button>
                <span className="block text-xs" style={{ color: '#a0a8b0' }}>{l.footer.app}</span>
              </div>
            </div>
            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">{l.footer.legal}</h4>
              <div className="space-y-2">
                <a href="/termos-de-uso" className="block text-xs hover:text-white transition-colors" style={{ color: '#a0a8b0' }}>{l.footer.terms}</a>
                <a href="/politica-de-privacidade" className="block text-xs hover:text-white transition-colors" style={{ color: '#a0a8b0' }}>{l.footer.privacy}</a>
                <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="block text-xs hover:text-white transition-colors" style={{ color: '#a0a8b0' }}>{l.footer.responsible}</a>
              </div>
            </div>
            {/* About */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">{l.footer.about}</h4>
              <p className="text-xs" style={{ color: '#a0a8b0' }}>GS ITALY INVESTMENTS LLC</p>
            </div>
          </div>
          <div className="pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#808A94' }}>{l.footer.disclaimer}</p>
            <p className="text-xs" style={{ color: '#808A94' }}>{l.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
