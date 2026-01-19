import { useState, useMemo } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface GameFiltersProps {
  games: Game[];
  onFilteredGames: (filtered: Game[]) => void;
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

/**
 * GameFilters Component - Provides filtering capabilities for the games list
 * Supports filtering by league, confidence level, and search term
 * Premium users get access to additional filter options
 */
export function GameFilters({ games, onFilteredGames, userTier = 'free' }: GameFiltersProps) {
  const { language } = useLanguage();
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique leagues from games for the filter dropdown
  const availableLeagues = useMemo(() => {
    const leagues = new Set(games.map(game => game.league));
    return Array.from(leagues).sort();
  }, [games]);

  // Labels based on language
  const labels = {
    pt: {
      filters: 'Filtros',
      leagues: 'Ligas',
      confidence: 'Confiança',
      search: 'Buscar time...',
      all: 'Todas',
      high: 'Alta (80%+)',
      medium: 'Média (65-79%)',
      low: 'Baixa (<65%)',
      clearAll: 'Limpar filtros',
      selected: 'selecionadas',
      noResults: 'Nenhum resultado',
      premiumOnly: 'Premium',
    },
    en: {
      filters: 'Filters',
      leagues: 'Leagues',
      confidence: 'Confidence',
      search: 'Search team...',
      all: 'All',
      high: 'High (80%+)',
      medium: 'Medium (65-79%)',
      low: 'Low (<65%)',
      clearAll: 'Clear filters',
      selected: 'selected',
      noResults: 'No results',
      premiumOnly: 'Premium',
    },
    es: {
      filters: 'Filtros',
      leagues: 'Ligas',
      confidence: 'Confianza',
      search: 'Buscar equipo...',
      all: 'Todas',
      high: 'Alta (80%+)',
      medium: 'Media (65-79%)',
      low: 'Baja (<65%)',
      clearAll: 'Limpiar filtros',
      selected: 'seleccionadas',
      noResults: 'Sin resultados',
      premiumOnly: 'Premium',
    },
    it: {
      filters: 'Filtri',
      leagues: 'Leghe',
      confidence: 'Fiducia',
      search: 'Cerca squadra...',
      all: 'Tutte',
      high: 'Alta (80%+)',
      medium: 'Media (65-79%)',
      low: 'Bassa (<65%)',
      clearAll: 'Cancella filtri',
      selected: 'selezionate',
      noResults: 'Nessun risultato',
      premiumOnly: 'Premium',
    },
  };

  const l = labels[language] || labels.pt;

  // Apply filters and notify parent component
  useMemo(() => {
    let filtered = [...games];

    // Filter by search term (team name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        game =>
          game.homeTeam.toLowerCase().includes(term) ||
          game.awayTeam.toLowerCase().includes(term)
      );
    }

    // Filter by selected leagues
    if (selectedLeagues.length > 0) {
      filtered = filtered.filter(game => selectedLeagues.includes(game.league));
    }

    // Filter by confidence level (Premium/Advanced feature)
    if (confidenceFilter !== 'all' && (userTier === 'premium' || userTier === 'advanced')) {
      filtered = filtered.filter(game => {
        const confidence = game.analysis?.confidence || 0;
        switch (confidenceFilter) {
          case 'high':
            return confidence >= 80;
          case 'medium':
            return confidence >= 65 && confidence < 80;
          case 'low':
            return confidence < 65;
          default:
            return true;
        }
      });
    }

    onFilteredGames(filtered);
  }, [games, searchTerm, selectedLeagues, confidenceFilter, userTier, onFilteredGames]);

  const toggleLeague = (league: string) => {
    setSelectedLeagues(prev =>
      prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
    );
  };

  const clearAllFilters = () => {
    setSelectedLeagues([]);
    setConfidenceFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedLeagues.length > 0 || confidenceFilter !== 'all' || searchTerm.trim();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder={l.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500"
        />
      </div>

      {/* League Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-slate-900/50 border-slate-600/50 text-white hover:bg-slate-800/50"
          >
            <Filter className="w-4 h-4 mr-2" />
            {l.leagues}
            {selectedLeagues.length > 0 && (
              <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {selectedLeagues.length}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-900 border-slate-700 max-h-[300px] overflow-y-auto">
          <DropdownMenuLabel className="text-slate-400">{l.leagues}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          {availableLeagues.length === 0 ? (
            <div className="px-2 py-4 text-center text-slate-500 text-sm">
              {l.noResults}
            </div>
          ) : (
            availableLeagues.map(league => (
              <DropdownMenuCheckboxItem
                key={league}
                checked={selectedLeagues.includes(league)}
                onCheckedChange={() => toggleLeague(league)}
                className="text-white hover:bg-slate-800"
              >
                {league}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confidence Filter (Premium/Advanced Only) */}
      {(userTier === 'premium' || userTier === 'advanced') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-slate-900/50 border-slate-600/50 text-white hover:bg-slate-800/50"
            >
              {l.confidence}
              {confidenceFilter !== 'all' && (
                <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  1
                </Badge>
              )}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-slate-900 border-slate-700">
            <DropdownMenuLabel className="text-slate-400">{l.confidence}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuCheckboxItem
              checked={confidenceFilter === 'all'}
              onCheckedChange={() => setConfidenceFilter('all')}
              className="text-white hover:bg-slate-800"
            >
              {l.all}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={confidenceFilter === 'high'}
              onCheckedChange={() => setConfidenceFilter('high')}
              className="text-emerald-400 hover:bg-slate-800"
            >
              {l.high}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={confidenceFilter === 'medium'}
              onCheckedChange={() => setConfidenceFilter('medium')}
              className="text-yellow-400 hover:bg-slate-800"
            >
              {l.medium}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={confidenceFilter === 'low'}
              onCheckedChange={() => setConfidenceFilter('low')}
              className="text-orange-400 hover:bg-slate-800"
            >
              {l.low}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          <X className="w-4 h-4 mr-1" />
          {l.clearAll}
        </Button>
      )}
    </div>
  );
}
