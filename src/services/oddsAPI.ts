import type { Game, OddsResponse, BettingAnalysis } from '../types/game';
import { supabase } from '@/integrations/supabase/client';

// Função de análise apenas para exibição no frontend
// A lógica real está protegida no backend
export function analyzeBet(game: Game & { analysis?: BettingAnalysis }): BettingAnalysis {
  // Se já veio com análise do backend, usar ela
  if (game.analysis) {
    return game.analysis;
  }
  
  // Fallback genérico (não expõe lógica real)
  return {
    type: 'ANÁLISE INDISPONÍVEL',
    reason: 'Erro ao carregar análise',
    profit: 0
  };
}

export interface FetchOddsError {
  message: string;
  dailyLimitReached?: boolean;
  remaining?: number;
  isTrial?: boolean;
}

export async function fetchOdds(language: string = 'pt'): Promise<OddsResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase.functions.invoke('fetch-odds', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: { lang: language }
    });

    // Tratar erros - pode vir do error ou do data
    const responseData = data || {};
    
    // Verificar se é erro de limite diário (pode vir em data mesmo com error)
    if (responseData.dailyLimitReached || (error && responseData.dailyLimitReached)) {
      const fetchError: FetchOddsError = {
        message: responseData.error || 'Limite diário de buscas atingido',
        dailyLimitReached: true,
        remaining: 0,
        isTrial: responseData.isTrial ?? true
      };
      throw fetchError;
    }

    if (error) {
      console.error('Erro ao chamar edge function:', error);
      throw new Error(error.message || 'Erro ao buscar odds');
    }

    if (responseData.error) {
      throw new Error(responseData.error);
    }

    // Converter datas de string para Date
    const games: Game[] = data.games.map((game: any) => ({
      ...game,
      startTime: new Date(game.startTime),
      analysis: game.analysis
    }));

    return {
      games,
      remaining: data.remaining,
      isToday: data.isToday,
      alertMessage: data.alertMessage,
      foundDate: new Date(data.foundDate),
      dailySearchesRemaining: data.dailySearchesRemaining,
      isTrial: data.isTrial,
      userTier: data.userTier
    };

  } catch (error) {
    console.error('Erro ao buscar odds:', error);
    throw error;
  }
}