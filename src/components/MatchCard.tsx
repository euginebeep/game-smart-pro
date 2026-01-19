import { useState, useMemo } from 'react';
import { Lock, ChevronRight, Settings2 } from 'lucide-react';
import { Game } from '@/types/game';
import { analyzeBet } from '@/services/oddsAPI';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GameCard } from '@/components/GameCard';

interface MatchCardProps {
  game: Game;
  delay: number;
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

export function MatchCard({ game, delay, userTier = 'free' }: MatchCardProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const { t, language } = useLanguage();

  const analysis = useMemo(() => analyzeBet(game), [game]);

  // Tier configuration
  const tierConfig = {
    premium: {
      label: 'PREMIUM',
      borderColor: 'border-l-blue-500',
      bgGradient: 'from-blue-500/10 via-transparent to-transparent',
      iconColor: 'text-blue-400',
      showValue: true,
      showFullConfidence: true,
      buttonLabel: t('matchCard.viewFullAnalysis'),
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    advanced: {
      label: 'ADVANCED',
      borderColor: 'border-l-emerald-500',
      bgGradient: 'from-emerald-500/10 via-transparent to-transparent',
      iconColor: 'text-emerald-400',
      showValue: false,
      showFullConfidence: true,
      buttonLabel: t('matchCard.viewAnalysis'),
      buttonStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    basic: {
      label: 'BASIC',
      borderColor: 'border-l-purple-500',
      bgGradient: 'from-purple-500/10 via-transparent to-transparent',
      iconColor: 'text-purple-400',
      showValue: false,
      showFullConfidence: false,
      buttonLabel: t('matchCard.unlockAnalysis'),
      buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    free: {
      label: 'FREE',
      borderColor: 'border-l-gray-500',
      bgGradient: 'from-gray-500/10 via-transparent to-transparent',
      iconColor: 'text-gray-400',
      showValue: false,
      showFullConfidence: false,
      buttonLabel: t('matchCard.unlockAnalysis'),
      buttonStyle: 'bg-gray-600 hover:bg-gray-700 text-white',
    },
  };

  const config = tierConfig[userTier];
  const isLocked = userTier === 'free' || userTier === 'basic';

  // Format betting suggestion text
  const getBetSuggestion = () => {
    if (isLocked) {
      return {
        type: t('matchCard.finalResult'),
        detail: '**********',
      };
    }
    return {
      type: analysis.type,
      detail: analysis.reason?.split('.')[0] || '',
    };
  };

  const suggestion = getBetSuggestion();

  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${config.bgGradient} bg-slate-900/80 border border-slate-700/50 animate-fade-in-up opacity-0`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Left Border Accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.borderColor}`} />

      <div className="p-4 sm:p-5 pl-5 sm:pl-6">
        {/* Header with Tier Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings2 className={`w-4 h-4 ${config.iconColor}`} />
            <span className={`text-xs font-bold tracking-wider ${config.iconColor}`}>
              {config.label}
            </span>
          </div>
          {isLocked && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Limited</span>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Teams Section */}
          <div className="flex items-center gap-3 sm:min-w-[180px]">
            <div className="flex flex-col items-center gap-3">
              {/* Home Team */}
              <div className="flex items-center gap-2.5">
                <img
                  src={game.homeTeamLogo || `https://media.api-sports.io/football/teams/${game.homeTeamId}.png`}
                  alt={game.homeTeam}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-slate-800/50 p-1"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <span className="text-white font-semibold text-sm sm:text-base truncate max-w-[120px]">
                  {game.homeTeam}
                </span>
              </div>
              
              {/* Away Team */}
              <div className="flex items-center gap-2.5">
                <img
                  src={game.awayTeamLogo || `https://media.api-sports.io/football/teams/${game.awayTeamId}.png`}
                  alt={game.awayTeam}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-slate-800/50 p-1"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <span className="text-white font-semibold text-sm sm:text-base truncate max-w-[120px]">
                  {game.awayTeam}
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-20 w-px bg-slate-600/50 ml-3" />
          </div>

          {/* Analysis Section */}
          <div className="flex-1 space-y-2.5">
            {/* Bet Suggestion */}
            <div>
              <p className="text-slate-400 text-xs mb-0.5">{t('matchCard.suggestedBet')}:</p>
              <p className={`text-white font-bold text-base sm:text-lg ${isLocked ? 'blur-sm select-none' : ''}`}>
                {suggestion.type}
              </p>
              {isLocked && (
                <p className="text-slate-500 text-sm">**********</p>
              )}
            </div>

            {/* Confidence */}
            <div>
              <p className="text-slate-400 text-xs mb-0.5">{t('matchCard.confidence')}:</p>
              {config.showFullConfidence && analysis.confidence ? (
                <p className="text-white font-bold text-xl sm:text-2xl">
                  {analysis.confidence}%
                </p>
              ) : (
                <p className={`text-slate-500 text-sm ${isLocked ? 'blur-sm select-none' : ''}`}>
                  {isLocked ? t('matchCard.finalResult') : `${analysis.confidence || 0}%`}
                </p>
              )}
            </div>

            {/* Value */}
            <div>
              <p className="text-slate-400 text-xs mb-0.5">{t('matchCard.value')}:</p>
              {config.showValue && analysis.valuePercentage && analysis.valuePercentage > 0 ? (
                <p className="text-emerald-400 font-bold text-lg">
                  +{analysis.valuePercentage.toFixed(0)}%
                </p>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('matchCard.exclusivePremium')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="sm:ml-4">
            {isLocked ? (
              <a
                href="#pricing"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${config.buttonStyle}`}
              >
                {config.buttonLabel}
              </a>
            ) : (
              <Dialog open={showFullAnalysis} onOpenChange={setShowFullAnalysis}>
                <DialogTrigger asChild>
                  <button
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${config.buttonStyle}`}
                  >
                    {config.buttonLabel}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                  <GameCard game={game} delay={0} userTier={userTier} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
