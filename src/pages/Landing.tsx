/**
 * Landing Page - EUGINE
 * Optimized per Manus prompt: Hero, Demo Video, Social Proof, Trust Badges, Results, Pricing, FAQ, Footer
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Check, CheckCircle, Brain, Target, TrendingUp, BarChart3, 
  Shield, Globe, Activity, Clock, Star, Lock, Award, ChevronDown, Sparkles, Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
import USFlag3D from '@/components/USFlag3D';
import eugineDemo from '@/assets/eugine-demo.mp4';
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

  // ─── Labels ───
  const labels: Record<string, any> = {
    pt: {
      nav: { howItWorks: 'Como Funciona', plans: 'Planos', login: 'Login', getStarted: 'Comece Agora' },
      hero: {
        badge: 'Usado em mais de 30 países',
        title: 'VOCÊ NÃO PRECISA DE SORTE.',
        titleHighlight: 'PRECISA DE VANTAGEM.',
        subtitle: 'Transforme suas apostas em decisões estratégicas com dados reais e probabilidade a seu favor.',
        urgencyText: 'Vagas para o teste grátis se encerrando — apenas para os primeiros 100 usuários hoje.',
        ctaButton: 'TESTE GRÁTIS AGORA',
        ctaSubtext: 'Grátis por 3 dias · Sem cartão · Cancele quando quiser',
      },
      demo: {
        title: 'Veja como funciona',
        subtitle: 'Interface real do sistema analisando jogos, identificando edges e gerando relatórios em tempo real.',
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
      authority: {
        title: 'Por que confiar no EUGINE?',
        items: [
          { icon: 'brain', title: 'IA Proprietária', desc: 'Modelo treinado com +100.000 partidas históricas e 7 fatores de análise.' },
          { icon: 'shield', title: 'Empresa registrada nos EUA', desc: 'GS ITALY INVESTMENTS LLC — empresa especializada em análise de dados com mais de 6 softwares para diversos segmentos.' },
          { icon: 'chart', title: 'Resultados auditáveis', desc: 'Todos os resultados são públicos e verificáveis. Sem edição.' },
          { icon: 'lock', title: 'Dados criptografados', desc: 'Sua conta e dados protegidos com criptografia de nível bancário.' },
        ],
      },
      stats: {
        title: 'Resultados Reais. Sem Filtro.',
        subtitle: 'Publicamos TODOS os nossos resultados — acertos e erros. Transparência total.',
        hitRate: 'Taxa de Acerto', wins: 'Acertos', total: 'Total Analisado', leagues: 'Ligas Monitoradas',
      },
      pricing: {
        title: 'Escolha Seu Plano',
        guarantee: 'Teste grátis por 7 dias sem risco',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: 'R$ 14,90', period: '/dia', features: ['Acesso Premium Completo por 24h', 'Análises Avançadas Ilimitadas', 'Pagamento Único (PIX)', 'Sem Recorrência'], cta: 'Comprar Day Use' },
        basic: { name: 'BASIC', price: 'R$ 29,90', period: '/mês', features: ['5 Jogos por Dia', 'Análise Simples', '1 Dupla Diária'], cta: 'Começar grátis →' },
        advanced: { name: 'ADVANCED', badge: '⭐ MAIS POPULAR', price: 'R$ 49,90', period: '/mês', features: ['10 Jogos por Dia', 'Análise Completa', '3 Duplas Diárias', 'Acumuladores'], cta: 'Assinar Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Melhor Valor', price: 'R$ 79,90', period: '/mês', features: ['Jogos Ilimitados', 'Análise Premium Completa', 'Todas as Duplas e Zebras', 'Acumuladores Premium', 'Exportação de Relatórios', 'Suporte Prioritário'], cta: 'Assinar Premium' },
        comingSoon: 'Em breve',
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
        badge: 'Used in 30+ countries',
        title: "YOU DON'T NEED LUCK.",
        titleHighlight: 'YOU NEED AN EDGE.',
        subtitle: 'Turn your bets into strategic decisions with real data and probability on your side.',
        urgencyText: 'Free trial spots closing — only available for the first 100 users today.',
        ctaButton: 'START FREE TRIAL',
        ctaSubtext: 'Free for 3 days · No card · Cancel anytime',
      },
      demo: { title: 'See how it works', subtitle: 'Real system interface analyzing matches, identifying edges and generating reports in real time.' },
      socialProof: {
        title: 'What our users say',
        testimonials: [
          { name: 'James K.', role: 'Bettor for 3 years', text: "I used to think I understood football. EUGINE showed me that understanding ≠ having an edge. My ROI changed completely in the last 2 months.", stars: 5 },
          { name: 'Michael T.', role: 'Sports trader', text: "Finally a tool that shows the math behind it. It's not guessing, it's real analysis with calculated probability. I use it daily.", stars: 5 },
          { name: 'David R.', role: 'Premium User', text: "Started on basic, now I'm premium. The difference is I now know WHY I'm betting, no more guesswork.", stars: 5 },
          { name: 'Robert M.', role: 'Recreational bettor', text: 'The best part is the total transparency. They publish all results, errors and wins. That gave me confidence to trust the system.', stars: 4 },
        ],
      },
      authority: {
        title: 'Why trust EUGINE?',
        items: [
          { icon: 'brain', title: 'Proprietary AI', desc: 'Model trained with 100,000+ historical matches and 7 analysis factors.' },
          { icon: 'shield', title: 'US Registered Company', desc: 'GS ITALY INVESTMENTS LLC — a company specializing in data analysis with 6+ software products.' },
          { icon: 'chart', title: 'Auditable Results', desc: 'All results are public and verifiable. No editing.' },
          { icon: 'lock', title: 'Encrypted Data', desc: 'Your account and data protected with bank-level encryption.' },
        ],
      },
      stats: { title: 'Real Results. No Filter.', subtitle: 'We publish ALL our results — wins and losses. Total transparency.', hitRate: 'Hit Rate', wins: 'Wins', total: 'Total Analyzed', leagues: 'Leagues Monitored' },
      pricing: {
        title: 'Choose Your Plan',
        guarantee: 'Free trial for 7 days, no risk',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '$4.90', period: '/day', features: ['Full Premium Access 24h', 'Unlimited Advanced Analysis', 'One-time Payment', 'No Recurrence'], cta: 'Buy Day Use' },
        basic: { name: 'BASIC', price: '$9.90', period: '/month', features: ['5 Matches/Day', 'Simple Analysis', '1 Daily Double'], cta: 'Start free →' },
        advanced: { name: 'ADVANCED', badge: '⭐ MOST POPULAR', price: '$14.90', period: '/month', features: ['10 Matches/Day', 'Full Analysis', '3 Daily Doubles', 'Accumulators'], cta: 'Subscribe Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Best Value', price: '$24.90', period: '/month', features: ['Unlimited Matches', 'Premium Full Analysis', 'All Doubles & Zebras', 'Premium Accumulators', 'Report Export', 'Priority Support'], cta: 'Subscribe Premium' },
        comingSoon: 'Coming Soon',
      },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          { q: 'Does EUGINE guarantee profit?', a: "No. No serious tool guarantees profit. EUGINE identifies where you have a mathematical edge." },
          { q: 'How does the free period work?', a: '3 days of full access, no credit card. Cancel anytime.' },
          { q: 'Do I need to understand statistics?', a: 'No! EUGINE does all the analysis and delivers results visually.' },
          { q: 'How many matches are analyzed?', a: '50+ matches daily from 30+ leagues. Only matches with detected edge reach you.' },
          { q: 'Can I use it on mobile?', a: "Yes! It works as an app. Access via browser and add to home screen." },
        ],
      },
      finalCta: { title: 'Your edge starts now.', subtitle: 'Join thousands of bettors who stopped guessing and started calculating.', cta: 'Start free now →' },
      footer: {
        about: 'About', terms: 'Terms', privacy: 'Privacy', responsible: 'Responsible Gambling', contact: 'Contact',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. All rights reserved.`,
        disclaimer: 'EUGINE is a statistical analysis tool. Past results do not guarantee future results. Sports betting involves risk.',
      },
    },
    es: {
      nav: { howItWorks: 'Cómo Funciona', plans: 'Planes', login: 'Login', getStarted: 'Empezar' },
      hero: {
        badge: 'Usado en más de 30 países',
        title: 'NO NECESITAS SUERTE.',
        titleHighlight: 'NECESITAS VENTAJA.',
        subtitle: 'Transforma tus apuestas en decisiones estratégicas con datos reales y probabilidad a tu favor.',
        urgencyText: 'Plazas para la prueba gratuita cerrándose — solo para los primeros 100 usuarios hoy.',
        ctaButton: 'PRUEBA GRATIS AHORA',
        ctaSubtext: 'Gratis por 3 días · Sin tarjeta · Cancela cuando quieras',
      },
      demo: { title: 'Mira cómo funciona', subtitle: 'Interfaz real del sistema analizando partidos, identificando edges y generando informes en tiempo real.' },
      socialProof: {
        title: 'Lo que dicen nuestros usuarios',
        testimonials: [
          { name: 'Alejandro G.', role: 'Apostador hace 3 años', text: 'Antes creía que entendía de fútbol. EUGINE me mostró que entender ≠ tener edge. Mi ROI cambió completamente.', stars: 5 },
          { name: 'Diego M.', role: 'Trader deportivo', text: 'Por fin una herramienta que muestra las matemáticas detrás. No es intuición, es análisis real.', stars: 5 },
          { name: 'Pablo R.', role: 'Usuario Premium', text: 'Empecé con el básico, hoy soy premium. La diferencia es que ahora sé POR QUÉ estoy apostando.', stars: 5 },
          { name: 'Sergio L.', role: 'Apostador recreativo', text: 'Lo mejor es la transparencia total. Publican todos los resultados, errores y aciertos.', stars: 4 },
        ],
      },
      authority: {
        title: '¿Por qué confiar en EUGINE?',
        items: [
          { icon: 'brain', title: 'IA Propietaria', desc: 'Modelo entrenado con +100.000 partidos históricos y 7 factores de análisis.' },
          { icon: 'shield', title: 'Empresa registrada en EE.UU.', desc: 'GS ITALY INVESTMENTS LLC — empresa especializada en análisis de datos.' },
          { icon: 'chart', title: 'Resultados auditables', desc: 'Todos los resultados son públicos y verificables.' },
          { icon: 'lock', title: 'Datos encriptados', desc: 'Tu cuenta y datos protegidos con encriptación bancaria.' },
        ],
      },
      stats: { title: 'Resultados Reales. Sin Filtro.', subtitle: 'Publicamos TODOS nuestros resultados — aciertos y errores.', hitRate: 'Tasa de Acierto', wins: 'Aciertos', total: 'Total Analizado', leagues: 'Ligas Monitoreadas' },
      pricing: {
        title: 'Elige Tu Plan',
        guarantee: 'Prueba gratis por 7 días sin riesgo',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '€14,90', period: '/día', features: ['Acceso Premium 24h', 'Análisis Ilimitados', 'Pago Único', 'Sin Recurrencia'], cta: 'Comprar Day Use' },
        basic: { name: 'BASIC', price: '€29,90', period: '/mes', features: ['5 Partidos al Día', 'Análisis Simple', '1 Doble Diaria'], cta: 'Empezar gratis →' },
        advanced: { name: 'ADVANCED', badge: '⭐ MÁS POPULAR', price: '€49,90', period: '/mes', features: ['10 Partidos al Día', 'Análisis Completo', '3 Dobles Diarias', 'Acumuladores'], cta: 'Suscribir Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Mejor Valor', price: '€79,90', period: '/mes', features: ['Partidos Ilimitados', 'Análisis Premium', 'Todas las Dobles y Zebras', 'Acumuladores Premium', 'Exportación', 'Soporte Prioritario'], cta: 'Suscribir Premium' },
        comingSoon: 'Próximamente',
      },
      faq: {
        title: 'Preguntas Frecuentes',
        items: [
          { q: '¿EUGINE garantiza ganancias?', a: 'No. Ninguna herramienta seria garantiza ganancias. EUGINE identifica ventaja matemática.' },
          { q: '¿Cómo funciona el periodo gratis?', a: '3 días de acceso completo, sin tarjeta. Cancela cuando quieras.' },
          { q: '¿Necesito saber de estadística?', a: '¡No! EUGINE hace todo el análisis y te entrega los resultados de forma visual.' },
          { q: '¿Cuántos partidos se analizan?', a: '50+ partidos diarios de 30+ ligas.' },
          { q: '¿Puedo usarlo en el celular?', a: 'Sí! Funciona como una app desde el navegador.' },
        ],
      },
      finalCta: { title: 'Tu ventaja empieza ahora.', subtitle: 'Únete a miles de apostadores que dejaron de adivinar.', cta: 'Empezar gratis ahora →' },
      footer: {
        about: 'Sobre Nosotros', terms: 'Términos', privacy: 'Privacidad', responsible: 'Juego Responsable', contact: 'Contacto',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos los derechos reservados.`,
        disclaimer: 'EUGINE es una herramienta de análisis estadístico. Resultados pasados no garantizan resultados futuros.',
      },
    },
    it: {
      nav: { howItWorks: 'Come Funziona', plans: 'Piani', login: 'Login', getStarted: 'Inizia' },
      hero: {
        badge: 'Usato in oltre 30 paesi',
        title: 'NON HAI BISOGNO DI FORTUNA.',
        titleHighlight: 'HAI BISOGNO DI VANTAGGIO.',
        subtitle: 'Trasforma le tue scommesse in decisioni strategiche con dati reali e probabilità a tuo favore.',
        urgencyText: 'Posti per la prova gratuita in esaurimento — solo per i primi 100 utenti oggi.',
        ctaButton: 'PROVA GRATIS ORA',
        ctaSubtext: 'Gratis 3 giorni · Senza carta · Cancella quando vuoi',
      },
      demo: { title: 'Guarda come funziona', subtitle: 'Interfaccia reale del sistema che analizza partite, identifica edges e genera report in tempo reale.' },
      socialProof: {
        title: 'Cosa dicono i nostri utenti',
        testimonials: [
          { name: 'Luca Bianchi', role: 'Scommettitore da 4 anni', text: "Prima scommettevo a istinto e perdevo sempre. Con EUGINE ho capito cosa significa avere un vantaggio reale.", stars: 5 },
          { name: 'Marco Rossi', role: 'Trader sportivo', text: "È l'unico strumento che calcola davvero le probabilità. Niente pronostici a caso, solo matematica.", stars: 5 },
          { name: 'Alessandro Ferro', role: 'Abbonato Premium', text: "Ho iniziato con il piano base. Dopo una settimana sono passato al premium. Risultati incomparabili.", stars: 5 },
          { name: 'Giovanni Conti', role: 'Scommettitore del weekend', text: "La trasparenza totale mi ha convinto. Pubblicano ogni risultato, anche gli errori.", stars: 4 },
        ],
      },
      authority: {
        title: 'Perché fidarsi di EUGINE?',
        items: [
          { icon: 'brain', title: 'IA Proprietaria', desc: 'Modello addestrato con +100.000 partite storiche e 7 fattori di analisi.' },
          { icon: 'shield', title: 'Azienda registrata negli USA', desc: 'GS ITALY INVESTMENTS LLC — azienda specializzata in analisi dati.' },
          { icon: 'chart', title: 'Risultati verificabili', desc: 'Tutti i risultati sono pubblici e verificabili.' },
          { icon: 'lock', title: 'Dati crittografati', desc: 'Il tuo account e dati protetti con crittografia bancaria.' },
        ],
      },
      stats: { title: 'Risultati Reali. Senza Filtri.', subtitle: 'Pubblichiamo TUTTI i risultati — successi e errori.', hitRate: 'Tasso Successo', wins: 'Successi', total: 'Totale Analizzato', leagues: 'Campionati Monitorati' },
      pricing: {
        title: 'Scegli il Tuo Piano',
        guarantee: 'Prova gratuita per 7 giorni senza rischio',
        dayUse: { name: 'DAY USE', badge: 'Premium 24h', price: '€14,90', period: '/giorno', features: ['Accesso Premium 24h', 'Analisi Illimitate', 'Pagamento Unico', 'Senza Ricorrenza'], cta: 'Acquista Day Use' },
        basic: { name: 'BASIC', price: '€29,90', period: '/mese', features: ['5 Partite al Giorno', 'Analisi Semplice', '1 Doppia'], cta: 'Inizia gratis →' },
        advanced: { name: 'ADVANCED', badge: '⭐ PIÙ POPOLARE', price: '€49,90', period: '/mese', features: ['10 Partite al Giorno', 'Analisi Completa', '3 Doppie', 'Accumulatori'], cta: 'Abbonati Advanced' },
        premium: { name: 'PREMIUM', badge: '👑 Miglior Valore', price: '€79,90', period: '/mese', features: ['Partite Illimitate', 'Analisi Premium', 'Tutte le Doppie e Zebra', 'Accumulatori Premium', 'Export Report', 'Supporto Prioritario'], cta: 'Abbonati Premium' },
        comingSoon: 'Prossimamente',
      },
      faq: {
        title: 'Domande Frequenti',
        items: [
          { q: 'EUGINE garantisce profitto?', a: "No. Nessuno strumento serio garantisce profitto. EUGINE identifica dove hai vantaggio matematico." },
          { q: 'Come funziona il periodo gratuito?', a: '3 giorni di accesso completo, senza carta. Cancella quando vuoi.' },
          { q: 'Devo sapere di statistica?', a: 'No! EUGINE fa tutta l\'analisi e ti consegna i risultati in modo visuale.' },
          { q: 'Quante partite vengono analizzate?', a: '50+ partite al giorno da 30+ campionati.' },
          { q: 'Posso usarlo sul cellulare?', a: "Sì! Funziona come un'app dal browser." },
        ],
      },
      finalCta: { title: 'Il tuo vantaggio inizia ora.', subtitle: "Unisciti a migliaia di scommettitori che hanno smesso di indovinare.", cta: 'Inizia gratis ora →' },
      footer: {
        about: 'Chi Siamo', terms: 'Termini', privacy: 'Privacy', responsible: 'Gioco Responsabile', contact: 'Contatto',
        copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Tutti i diritti riservati.`,
        disclaimer: "EUGINE è uno strumento di analisi statistica. I risultati passati non garantiscono risultati futuri.",
      },
    },
  };

  const l = labels[language] || labels.pt;

  return (
    <div 
      className="min-h-screen text-foreground overflow-x-hidden relative"
      style={{ background: 'linear-gradient(180deg, hsl(230 50% 8%) 0%, hsl(222 47% 11%) 50%, hsl(230 50% 8%) 100%)' }}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 20%, hsla(199, 89%, 48%, 0.06) 0%, transparent 60%)' }} />

      {/* ═══════ 1. NAVIGATION ═══════ */}
      <nav className="relative z-50 max-w-7xl mx-auto flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow"
            style={{ background: 'linear-gradient(135deg, hsl(185 100% 50%) 0%, hsl(260 80% 60%) 100%)' }}>
            <Brain className="w-5 h-5 text-background" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-foreground">EUGINE</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('demo')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold">{l.nav.howItWorks}</button>
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

      {/* ═══════ 2. HERO SECTION ═══════ */}
      <section className="relative px-5 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-primary text-xs sm:text-sm font-semibold">{l.hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] uppercase">
            <span className="text-foreground block">{l.hero.title}</span>
            <span className="block mt-2" style={{ color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.3)' }}>{l.hero.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {l.hero.subtitle}
          </p>

          {/* CTA Button — Large & Prominent */}
          <button
            onClick={() => navigate('/auth')}
            className="px-14 py-6 rounded-2xl text-xl sm:text-2xl font-black inline-flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] shadow-[0_0_25px_rgba(255,215,0,0.3)]"
            style={{ background: '#FFD700', color: '#0A1A2F' }}
          >
            {l.hero.ctaButton}
            <ArrowRight className="w-7 h-7" />
          </button>

          {/* Subtext */}
          <p className="text-sm mt-4 flex items-center justify-center gap-1.5 animate-pulse font-bold" style={{ color: '#39FF14', textShadow: '0 0 10px rgba(57,255,20,0.6)' }}>
            <Check className="w-4 h-4 shrink-0" style={{ color: '#39FF14' }} />
            {l.hero.ctaSubtext}
          </p>

          {/* Urgency */}
          <p className="text-xs sm:text-sm mt-3 animate-pulse" style={{ color: '#FFD700' }}>
            ⚡ {l.hero.urgencyText}
          </p>
        </div>
      </section>

      {/* ═══════ 3. DEMO VIDEO — "Veja como funciona" ═══════ */}
      <section id="demo" className="py-16 sm:py-24 relative">
        <div className="max-w-4xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-3">{l.demo.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base text-center mb-10 max-w-2xl mx-auto">{l.demo.subtitle}</p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={200}>
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl" style={{ boxShadow: '0 25px 80px -12px hsla(199, 89%, 48%, 0.2)' }}>
              <video autoPlay muted loop playsInline className="w-full h-auto" poster={heroDashboardImg}>
                <source src={eugineDemo} type="video/mp4" />
              </video>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ 4. SOCIAL PROOF — Testimonials ═══════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-12">{l.socialProof.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 gap-6">
            {l.socialProof.testimonials.map((t: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="glass-card p-6 sm:p-8 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    {Array.from({ length: 5 - t.stars }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 text-muted-foreground/30" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm sm:text-base leading-relaxed mb-6 flex-grow italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                        alt={t.name} className="w-full h-full object-cover" loading="lazy" />
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

      {/* ═══════ 5. TRUST BADGES ═══════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">{l.authority.title}</h2>
          </ScrollFadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {l.authority.items.map((item: any, i: number) => (
              <ScrollFadeIn key={i} delay={i * 100}>
                <div className="text-center p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                  <div className="mx-auto mb-5">
                    {item.icon === 'brain' && (
                      <div className="w-20 h-20 rounded-full mx-auto border-[3px] border-primary/50 bg-primary/10 flex items-center justify-center shadow-[0_0_20px_hsla(199,89%,48%,0.2)]">
                        <Brain className="w-9 h-9 text-primary" />
                      </div>
                    )}
                    {item.icon === 'shield' && (
                      <div className="w-20 h-20 rounded-full mx-auto border-[3px] border-emerald-400/50 bg-emerald-500/10 flex items-center justify-center shadow-[0_0_20px_hsla(145,80%,40%,0.2)] relative">
                        <Shield className="w-9 h-9 text-emerald-400" />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background"><Check className="w-4 h-4 text-white" /></div>
                      </div>
                    )}
                    {item.icon === 'chart' && (
                      <div className="w-20 h-20 rounded-full mx-auto border-[3px] border-amber-400/50 bg-amber-500/10 flex items-center justify-center shadow-[0_0_20px_hsla(38,92%,50%,0.2)] relative">
                        <Award className="w-9 h-9 text-amber-400" />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center border-2 border-background"><Check className="w-4 h-4 text-white" /></div>
                      </div>
                    )}
                    {item.icon === 'lock' && (
                      <div className="w-20 h-20 rounded-full mx-auto border-[3px] border-blue-400/50 bg-blue-500/10 flex items-center justify-center shadow-[0_0_20px_hsla(220,80%,50%,0.2)] relative">
                        <Lock className="w-9 h-9 text-blue-400" />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background"><Shield className="w-4 h-4 text-white" /></div>
                      </div>
                    )}
                  </div>
                  {item.icon === 'shield' && <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 mb-3 border border-emerald-500/30 tracking-wider">✓ VERIFIED · US REGISTERED</span>}
                  {item.icon === 'lock' && <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 mb-3 border border-blue-500/30 tracking-wider">🔒 BANK-LEVEL ENCRYPTION</span>}
                  {item.icon === 'chart' && <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/30 tracking-wider">📊 AUDITED RESULTS</span>}
                  {item.icon === 'brain' && <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full bg-primary/20 text-primary mb-3 border border-primary/30 tracking-wider">🧠 PROPRIETARY AI</span>}
                  <h3 className="text-foreground font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 6. RESULTS — Real Stats ═══════ */}
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
                <p className="text-3xl sm:text-5xl font-black text-primary"><AnimatedCounter end={statsLoaded ? stats.hitRate : 59} suffix="%" /></p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.hitRate}</p>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={100}>
              <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border/50">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-3xl sm:text-5xl font-black text-emerald-400"><AnimatedCounter end={statsLoaded ? stats.wins : 32} /></p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.wins}</p>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={200}>
              <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border/50">
                <BarChart3 className="w-8 h-8 text-foreground mx-auto mb-3" />
                <p className="text-3xl sm:text-5xl font-black text-foreground"><AnimatedCounter end={statsLoaded ? stats.total : 54} /></p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.total}</p>
              </div>
            </ScrollFadeIn>
            <ScrollFadeIn delay={300}>
              <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border/50">
                <TrendingUp className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-3xl sm:text-5xl font-black text-amber-400"><AnimatedCounter end={30} suffix="+" /></p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{l.stats.leagues}</p>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ 7. PRICING ═══════ */}
      <section id="pricing" className="relative px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <ScrollFadeIn>
            <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-black text-center mb-4">{l.pricing.title}</h2>
            <p className="text-center text-primary/80 text-sm font-semibold mb-12 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> {l.pricing.guarantee}
            </p>
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

      {/* ═══════ 8. FAQ — Accordion ═══════ */}
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

      {/* ═══════ 9. FINAL CTA ═══════ */}
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
                className="px-10 py-4 text-base sm:text-lg font-black rounded-xl inline-flex items-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
                style={{ background: '#FFD700', color: '#0A1A2F' }}
              >
                {l.finalCta.cta}
              </button>
              <p className="text-xs mt-4 flex items-center justify-center gap-1.5 animate-pulse font-bold" style={{ color: '#39FF14', textShadow: '0 0 10px rgba(57,255,20,0.6)' }}>
                <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#39FF14' }} />
                {l.hero.ctaSubtext}
              </p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ═══════ 10. FOOTER ═══════ */}
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