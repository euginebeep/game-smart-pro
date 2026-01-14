import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Termos de Uso
          </h1>
          <p className="text-slate-400">Última atualização: 14 de Janeiro de 2026</p>
        </div>

        {/* Content */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Aceitação dos Termos</h2>
            <p className="leading-relaxed">
              Ao acessar e usar o sistema EUGINE Analytics, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Descrição do Serviço</h2>
            <p className="leading-relaxed">
              O EUGINE Analytics é um sistema inteligente de análise de odds esportivas que fornece informações e análises 
              para fins educacionais e informativos. O serviço inclui:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Análise de odds em tempo real</li>
              <li>Sugestões de apostas baseadas em algoritmos</li>
              <li>Estatísticas e tendências de mercado</li>
              <li>Acumuladores e combinações de apostas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Período de Teste</h2>
            <p className="leading-relaxed">
              Novos usuários têm direito a um período de teste gratuito de 10 dias. Após o término do período de teste, 
              o acesso aos recursos premium será restrito até a assinatura de um plano pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Uso Responsável</h2>
            <p className="leading-relaxed">
              O EUGINE Analytics é fornecido apenas para fins educacionais e de entretenimento. Você reconhece que:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Apostas esportivas envolvem riscos financeiros significativos</li>
              <li>Não garantimos lucros ou resultados específicos</li>
              <li>Você deve apostar apenas valores que pode perder</li>
              <li>É sua responsabilidade verificar a legalidade das apostas em sua jurisdição</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Conta do Usuário</h2>
            <p className="leading-relaxed">
              Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Fornecer informações precisas e atualizadas</li>
              <li>Não compartilhar suas credenciais de acesso</li>
              <li>Notificar imediatamente qualquer uso não autorizado</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Propriedade Intelectual</h2>
            <p className="leading-relaxed">
              Todo o conteúdo, incluindo mas não limitado a textos, gráficos, logos, algoritmos e software, 
              são propriedade do EUGINE Analytics e do Grupo GS ITALYINVESTMENTS. É proibida a reprodução, 
              distribuição ou modificação sem autorização prévia por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Limitação de Responsabilidade</h2>
            <p className="leading-relaxed">
              O EUGINE Analytics não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Perdas financeiras resultantes de apostas</li>
              <li>Interrupções no serviço ou erros técnicos</li>
              <li>Decisões tomadas com base nas análises fornecidas</li>
              <li>Danos diretos ou indiretos decorrentes do uso do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Modificações dos Termos</h2>
            <p className="leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
              imediatamente após a publicação. O uso continuado do serviço após as modificações constitui aceitação 
              dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Contato</h2>
            <p className="leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato conosco através dos canais oficiais 
              do Grupo GS ITALYINVESTMENTS.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-500 text-center">
              EUGINE v3.0 • uma Empresa do Grupo GS ITALYINVESTMENTS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}