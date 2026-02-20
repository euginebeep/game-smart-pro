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

    // Quando a edge function retorna 4xx/5xx, o response body pode estar em error.context ou data
    // Verificar múltiplas fontes para o dailyLimitReached flag
    const responseData = data || {};
    const errorContext = error?.context;
    
    // Tentar extrair dados do erro (para status 429)
    let errorBody: any = null;
    if (error && !data) {
      // Tentar parsear o body do erro se disponível
      try {
        if (typeof error === 'object' && 'message' in error) {
          // Verificar se a mensagem contém indicação de limite
          if (error.message?.includes('429') || error.message?.includes('Limite')) {
            errorBody = { dailyLimitReached: true };
          }
        }
      } catch {
        // Ignorar erros de parsing
      }
    }
    
    // Verificar se é erro de limite diário
    const isDailyLimitReached = responseData.dailyLimitReached || errorBody?.dailyLimitReached;
    
    if (isDailyLimitReached) {
      const fetchError: FetchOddsError = {
        message: responseData.error || 'Limite diário de buscas atingido',
        dailyLimitReached: true,
        remaining: 0,
        isTrial: responseData.isTrial ?? true
      };
      throw fetchError;
    }

    if (error) {
      // Verificar se o erro menciona limite diário no texto
      const errorMessage = typeof error === 'object' && 'message' in error 
        ? (error as any).message 
        : String(error);
      
      if (errorMessage.includes('Limite') || errorMessage.includes('limit') || errorMessage.includes('429')) {
        const fetchError: FetchOddsError = {
          message: 'Limite diário de buscas atingido. Assine um plano para buscas ilimitadas.',
          dailyLimitReached: true,
          remaining: 0,
          isTrial: true
        };
        throw fetchError;
      }
      
      console.error('Erro ao chamar edge function:', error);
      throw new Error(errorMessage || 'Erro ao buscar odds');
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
      userTier: data.userTier,
      smartAccumulators: data.smartAccumulators || [],
    } as any;

  } catch (error) {
    console.error('Erro ao buscar odds:', error);
    throw error;
  }
}