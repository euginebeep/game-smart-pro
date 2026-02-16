import { useState } from 'react';
import { Target, BarChart3, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = {
  pt: [
    {
      icon: Target,
      title: 'O que é Value Betting?',
      text: 'Value betting é apostar APENAS quando a probabilidade real é maior que o que a casa oferece. É como comprar algo por $50 que vale $70.',
      bars: [
        { label: 'Casa', value: 43, color: 'bg-red-400' },
        { label: 'EUGINE', value: 58, color: 'bg-emerald-400' },
      ],
    },
    {
      icon: BarChart3,
      title: 'Como ler a análise',
      text: 'Cada jogo mostra: a recomendação do EUGINE, a probabilidade real, e sua VANTAGEM sobre a casa. Verde = vantagem alta. Amarelo = vantagem moderada.',
      bars: null,
    },
    {
      icon: Shield,
      title: 'Comece pela Aposta Segura',
      text: 'Se está começando, aposte na 🛡️ Aposta Segura. São jogos com alta probabilidade de ter gols. Ganhos menores mas mais consistentes.',
      bars: null,
    },
  ],
  en: [
    {
      icon: Target,
      title: 'What is Value Betting?',
      text: 'Value betting means betting ONLY when the real probability is higher than what the bookmaker offers. It\'s like buying something worth $70 for $50.',
      bars: [
        { label: 'Bookmaker', value: 43, color: 'bg-red-400' },
        { label: 'EUGINE', value: 58, color: 'bg-emerald-400' },
      ],
    },
    {
      icon: BarChart3,
      title: 'How to read the analysis',
      text: 'Each game shows: EUGINE\'s recommendation, the real probability, and your EDGE over the bookmaker. Green = high edge. Yellow = moderate edge.',
      bars: null,
    },
    {
      icon: Shield,
      title: 'Start with the Safe Bet',
      text: 'If you\'re starting out, go for the 🛡️ Safe Bet. These are matches with high probability of goals. Smaller wins but more consistent.',
      bars: null,
    },
  ],
  es: [
    {
      icon: Target,
      title: '¿Qué es Value Betting?',
      text: 'Value betting es apostar SOLO cuando la probabilidad real es mayor que lo que ofrece la casa. Es como comprar algo que vale $70 por $50.',
      bars: [
        { label: 'Casa', value: 43, color: 'bg-red-400' },
        { label: 'EUGINE', value: 58, color: 'bg-emerald-400' },
      ],
    },
    {
      icon: BarChart3,
      title: 'Cómo leer el análisis',
      text: 'Cada juego muestra: la recomendación de EUGINE, la probabilidad real y tu VENTAJA sobre la casa. Verde = ventaja alta. Amarillo = ventaja moderada.',
      bars: null,
    },
    {
      icon: Shield,
      title: 'Empieza con la Apuesta Segura',
      text: 'Si estás empezando, ve a la 🛡️ Apuesta Segura. Son partidos con alta probabilidad de goles. Ganancias menores pero más consistentes.',
      bars: null,
    },
  ],
  it: [
    {
      icon: Target,
      title: 'Cos\'è il Value Betting?',
      text: 'Value betting significa scommettere SOLO quando la probabilità reale è superiore a quella offerta dal bookmaker. È come comprare qualcosa che vale €70 per €50.',
      bars: [
        { label: 'Bookmaker', value: 43, color: 'bg-red-400' },
        { label: 'EUGINE', value: 58, color: 'bg-emerald-400' },
      ],
    },
    {
      icon: BarChart3,
      title: 'Come leggere l\'analisi',
      text: 'Ogni partita mostra: la raccomandazione di EUGINE, la probabilità reale e il tuo VANTAGGIO sul bookmaker. Verde = vantaggio alto. Giallo = vantaggio moderato.',
      bars: null,
    },
    {
      icon: Shield,
      title: 'Inizia con la Scommessa Sicura',
      text: 'Se stai iniziando, scegli la 🛡️ Scommessa Sicura. Sono partite con alta probabilità di gol. Vincite minori ma più costanti.',
      bars: null,
    },
  ],
};

const ctaLabels: Record<string, { next: string; done: string }> = {
  pt: { next: 'Próximo', done: 'Entendi, vamos lá!' },
  en: { next: 'Next', done: 'Got it, let\'s go!' },
  es: { next: 'Siguiente', done: '¡Entendido, vamos!' },
  it: { next: 'Avanti', done: 'Capito, andiamo!' },
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const currentSlides = slides[language] || slides.pt;
  const cta = ctaLabels[language] || ctaLabels.pt;
  const slide = currentSlides[step];
  const Icon = slide.icon;
  const isLast = step === currentSlides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {currentSlides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`} 
            />
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8 sm:p-10 text-center space-y-6 border border-primary/20">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
            <Icon className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{slide.title}</h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {slide.text}
          </p>

          {/* Value comparison bars (step 1) */}
          {slide.bars && (
            <div className="space-y-3 pt-2">
              {slide.bars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-20 text-right">{bar.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div 
                      className={`h-full ${bar.color} rounded-full flex items-center justify-end pr-2 transition-all duration-700`}
                      style={{ width: `${bar.value}%` }}
                    >
                      <span className="text-xs font-bold text-white">{bar.value}%</span>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-primary font-semibold mt-1">
                {language === 'pt' ? '= Sua vantagem: +15%' :
                 language === 'es' ? '= Tu ventaja: +15%' :
                 language === 'it' ? '= Il tuo vantaggio: +15%' :
                 '= Your edge: +15%'}
              </p>
            </div>
          )}

          {/* Mini card example (step 2) */}
          {step === 1 && (
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 text-left space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">Over 2.5</span>
                <span className="ml-auto text-xs bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">+12%</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{language === 'pt' ? 'Probabilidade' : language === 'es' ? 'Probabilidad' : language === 'it' ? 'Probabilità' : 'Probability'}: 58%</span>
                <span>Odd: 1.85</span>
              </div>
            </div>
          )}

          <button
            onClick={() => isLast ? onComplete() : setStep(step + 1)}
            className="btn-primary w-full py-4 text-base font-bold inline-flex items-center justify-center gap-2"
          >
            {isLast ? cta.done : cta.next}
            {!isLast && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
