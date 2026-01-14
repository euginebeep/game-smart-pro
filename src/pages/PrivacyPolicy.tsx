import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
            Política de Privacidade
          </h1>
          <p className="text-slate-400">Última atualização: 14 de Janeiro de 2026</p>
        </div>

        {/* Content */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introdução</h2>
            <p className="leading-relaxed">
              O EUGINE Analytics, uma empresa do Grupo GS ITALYINVESTMENTS, está comprometido em proteger sua privacidade. 
              Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Informações que Coletamos</h2>
            <p className="leading-relaxed mb-3">
              Coletamos as seguintes informações quando você usa nosso serviço:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-emerald-400">Informações de Cadastro:</h3>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Endereço de e-mail</li>
                  <li>Número de telefone</li>
                  <li>Senha (armazenada de forma criptografada)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Informações de Uso:</h3>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Data e hora de acesso</li>
                  <li>Páginas visitadas</li>
                  <li>Interações com o sistema</li>
                  <li>Dispositivo e navegador utilizados</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Como Usamos suas Informações</h2>
            <p className="leading-relaxed">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Fornecer e manter nossos serviços</li>
              <li>Personalizar sua experiência</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
              <li>Processar transações e gerenciar sua conta</li>
              <li>Melhorar nossos algoritmos e análises</li>
              <li>Prevenir fraudes e garantir a segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Proteção de Dados</h2>
            <p className="leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Autenticação segura com tokens JWT</li>
              <li>Acesso restrito a dados pessoais</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e recuperação de desastres</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Compartilhamento de Dados</h2>
            <p className="leading-relaxed">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Para proteger nossos direitos legais</li>
              <li>Com prestadores de serviços essenciais (processamento de pagamentos, hospedagem)</li>
              <li>Em caso de fusão ou aquisição da empresa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Seus Direitos</h2>
            <p className="leading-relaxed">
              Você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>Acesso:</strong> Solicitar uma cópia dos dados que mantemos sobre você</li>
              <li><strong>Correção:</strong> Corrigir informações imprecisas ou incompletas</li>
              <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies e Tecnologias Similares</h2>
            <p className="leading-relaxed">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Manter você conectado à sua conta</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar o uso do serviço</li>
              <li>Melhorar a performance do sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Retenção de Dados</h2>
            <p className="leading-relaxed">
              Mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços 
              ou conforme exigido por lei. Após o encerramento da conta, seus dados serão excluídos 
              dentro de 90 dias, exceto quando houver obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Menores de Idade</h2>
            <p className="leading-relaxed">
              Nossos serviços são destinados apenas a pessoas maiores de 18 anos. Não coletamos 
              intencionalmente informações de menores de idade. Se tomarmos conhecimento de que 
              coletamos dados de um menor, excluiremos essas informações imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Alterações nesta Política</h2>
            <p className="leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
              alterações significativas por e-mail ou através de um aviso em nosso serviço. 
              Recomendamos revisar esta política regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contato</h2>
            <p className="leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
              entre em contato conosco através dos canais oficiais do Grupo GS ITALYINVESTMENTS.
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