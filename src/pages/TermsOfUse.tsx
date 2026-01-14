import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
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
        <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-8 text-slate-300">
          
          {/* Preâmbulo */}
          <section>
            <p className="leading-relaxed text-slate-200 font-medium">
              LEIA ATENTAMENTE ESTES TERMOS DE USO ANTES DE ACESSAR OU UTILIZAR A PLATAFORMA EUGINE ANALYTICS. 
              AO ACESSAR OU UTILIZAR OS SERVIÇOS, VOCÊ DECLARA QUE LEU, COMPREENDEU E CONCORDA EM ESTAR VINCULADO 
              A ESTES TERMOS. CASO NÃO CONCORDE COM QUALQUER DISPOSIÇÃO AQUI ESTABELECIDA, INTERROMPA IMEDIATAMENTE 
              O ACESSO À PLATAFORMA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. DEFINIÇÕES E INTERPRETAÇÃO</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">1.1.</strong> Para fins destes Termos de Uso, aplicam-se as seguintes definições:
              </p>
              <ul className="space-y-2 ml-6">
                <li><strong className="text-emerald-400">"Empresa"</strong> ou <strong className="text-emerald-400">"GS ITALYINVESTMENTS"</strong>: refere-se à GS ITALYINVESTMENTS, pessoa jurídica devidamente constituída e existente sob as leis do Estado da Flórida, Estados Unidos da América, com operações ininterruptas desde 2015, sendo a única titular, proprietária e operadora da Plataforma EUGINE Analytics.</li>
                <li><strong className="text-emerald-400">"Plataforma"</strong> ou <strong className="text-emerald-400">"EUGINE Analytics"</strong>: designa o produto de tecnologia, software e sistema de análise de dados esportivos desenvolvido, mantido e operado exclusivamente pela GS ITALYINVESTMENTS, incluindo todas as suas funcionalidades, interfaces, algoritmos, APIs e infraestrutura tecnológica.</li>
                <li><strong className="text-emerald-400">"Usuário"</strong>: qualquer pessoa física ou jurídica que acesse, utilize ou interaja com a Plataforma, independentemente de possuir conta registrada.</li>
                <li><strong className="text-emerald-400">"Serviços"</strong>: todos os recursos, funcionalidades, análises, dados e informações disponibilizados através da Plataforma.</li>
                <li><strong className="text-emerald-400">"Conteúdo"</strong>: todo material disponibilizado na Plataforma, incluindo, mas não se limitando a, textos, gráficos, dados, análises, algoritmos, software, marcas e elementos visuais.</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">1.2.</strong> A EUGINE Analytics é uma plataforma tecnológica e NÃO constitui pessoa jurídica autônoma, 
                sendo integralmente de propriedade da GS ITALYINVESTMENTS, que assume toda e qualquer responsabilidade 
                legal, operacional e regulatória relacionada à sua operação.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. ACEITAÇÃO DOS TERMOS</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">2.1.</strong> Ao acessar ou utilizar a Plataforma EUGINE Analytics, o Usuário manifesta sua concordância 
                integral e irrestrita com todos os termos e condições aqui estabelecidos, bem como com nossa Política de Privacidade, 
                que é incorporada a estes Termos por referência.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">2.2.</strong> A GS ITALYINVESTMENTS reserva-se o direito de modificar, alterar, adicionar ou remover 
                qualquer disposição destes Termos a qualquer momento, a seu exclusivo critério. Tais modificações entrarão 
                em vigor imediatamente após sua publicação na Plataforma.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">2.3.</strong> O uso continuado da Plataforma após a publicação de alterações constitui aceitação 
                tácita dos novos termos. É responsabilidade do Usuário revisar periodicamente estes Termos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. DESCRIÇÃO DOS SERVIÇOS</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">3.1.</strong> A EUGINE Analytics é uma plataforma tecnológica proprietária que oferece serviços de 
                análise de dados esportivos, processamento de informações estatísticas e geração de insights baseados 
                em algoritmos proprietários desenvolvidos pela GS ITALYINVESTMENTS.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">3.2.</strong> Os Serviços incluem, sem limitação:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Análise algorítmica de odds e mercados esportivos</li>
                <li>Processamento de dados estatísticos em tempo real</li>
                <li>Geração de relatórios analíticos e tendências de mercado</li>
                <li>Ferramentas de visualização de dados e dashboards</li>
                <li>Sistemas de alertas e notificações personalizadas</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">3.3.</strong> Os Serviços são fornecidos exclusivamente para fins informativos, educacionais e de 
                entretenimento. A GS ITALYINVESTMENTS não oferece, direta ou indiretamente, serviços de apostas, 
                consultoria financeira, recomendação de investimentos ou qualquer forma de aconselhamento profissional.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. PERÍODO DE AVALIAÇÃO E ASSINATURA</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">4.1.</strong> A GS ITALYINVESTMENTS poderá, a seu exclusivo critério, oferecer período de avaliação 
                gratuito ("Trial") para novos Usuários, conforme condições e prazos estabelecidos no momento do registro.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">4.2.</strong> O acesso aos recursos premium da Plataforma após o término do período de avaliação 
                está condicionado à contratação de plano de assinatura, conforme tabela de preços vigente.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">4.3.</strong> A GS ITALYINVESTMENTS reserva-se o direito de modificar preços, planos e condições 
                de assinatura a qualquer momento, mediante aviso prévio aos Usuários ativos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. CONTA DO USUÁRIO E SEGURANÇA</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">5.1.</strong> Para acessar determinados recursos da Plataforma, o Usuário deverá criar uma conta, 
                fornecendo informações verdadeiras, precisas, atuais e completas.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">5.2.</strong> O Usuário é integralmente responsável por:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Todas as atividades realizadas em sua conta</li>
                <li>Notificar imediatamente a GS ITALYINVESTMENTS sobre qualquer uso não autorizado</li>
                <li>Atualizar suas informações cadastrais sempre que necessário</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">5.3.</strong> A GS ITALYINVESTMENTS reserva-se o direito de suspender ou encerrar contas que 
                violem estes Termos, sem aviso prévio e sem direito a reembolso.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. PROPRIEDADE INTELECTUAL</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">6.1.</strong> A Plataforma EUGINE Analytics, incluindo, sem limitação, sua marca, nome, logotipo, 
                design, interface, código-fonte, algoritmos, metodologias, banco de dados, documentação e todo o Conteúdo, 
                são de propriedade exclusiva da GS ITALYINVESTMENTS ou de seus licenciadores, estando protegidos pelas 
                leis de propriedade intelectual dos Estados Unidos e tratados internacionais aplicáveis.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">6.2.</strong> Nenhuma disposição destes Termos transfere ao Usuário qualquer direito de propriedade 
                intelectual sobre a Plataforma ou seu Conteúdo. É concedida ao Usuário apenas uma licença limitada, 
                não exclusiva, intransferível e revogável para uso pessoal da Plataforma.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">6.3.</strong> É expressamente proibido, sem autorização prévia por escrito da GS ITALYINVESTMENTS:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Reproduzir, distribuir, modificar ou criar obras derivadas do Conteúdo</li>
                <li>Realizar engenharia reversa, descompilar ou desmontar qualquer componente da Plataforma</li>
                <li>Remover ou alterar avisos de direitos autorais ou marcas registradas</li>
                <li>Utilizar a Plataforma para fins comerciais não autorizados</li>
                <li>Coletar dados da Plataforma por meios automatizados (scraping, crawling)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. CONDUTA DO USUÁRIO</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">7.1.</strong> Ao utilizar a Plataforma, o Usuário compromete-se a:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Cumprir todas as leis e regulamentos aplicáveis em sua jurisdição</li>
                <li>Não utilizar a Plataforma para atividades ilegais ou fraudulentas</li>
                <li>Não interferir na operação normal da Plataforma ou de seus sistemas</li>
                <li>Não transmitir vírus, malware ou código malicioso</li>
                <li>Não compartilhar credenciais de acesso com terceiros</li>
                <li>Respeitar os direitos de propriedade intelectual de terceiros</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">7.2.</strong> A violação de qualquer disposição desta seção poderá resultar no encerramento imediato 
                do acesso à Plataforma, sem prejuízo de outras medidas legais cabíveis.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. ISENÇÃO DE GARANTIAS</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">8.1.</strong> A PLATAFORMA EUGINE ANALYTICS E TODOS OS SERVIÇOS SÃO FORNECIDOS "NO ESTADO EM QUE SE ENCONTRAM" 
                (AS IS) E "CONFORME DISPONIBILIDADE" (AS AVAILABLE), SEM GARANTIAS DE QUALQUER NATUREZA, EXPRESSAS OU IMPLÍCITAS.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">8.2.</strong> A GS ITALYINVESTMENTS NÃO GARANTE QUE:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Os Serviços serão ininterruptos, seguros ou livres de erros</li>
                <li>Os resultados obtidos através da Plataforma serão precisos ou confiáveis</li>
                <li>A qualidade dos Serviços atenderá às expectativas do Usuário</li>
                <li>Quaisquer erros no software serão corrigidos</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">8.3.</strong> O USUÁRIO RECONHECE EXPRESSAMENTE QUE AS ANÁLISES E INFORMAÇÕES FORNECIDAS PELA 
                PLATAFORMA NÃO CONSTITUEM GARANTIA DE RESULTADOS ESPECÍFICOS, LUCROS OU GANHOS FINANCEIROS.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">9. LIMITAÇÃO DE RESPONSABILIDADE</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">9.1.</strong> NA EXTENSÃO MÁXIMA PERMITIDA PELA LEI APLICÁVEL, A GS ITALYINVESTMENTS, SEUS DIRETORES, 
                FUNCIONÁRIOS, AGENTES, PARCEIROS E LICENCIADORES NÃO SERÃO RESPONSÁVEIS POR:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos</li>
                <li>Perda de lucros, receitas, dados, uso ou outras perdas intangíveis</li>
                <li>Quaisquer perdas financeiras decorrentes de decisões baseadas nas informações da Plataforma</li>
                <li>Interrupções, atrasos ou falhas nos Serviços</li>
                <li>Ações de terceiros ou eventos de força maior</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">9.2.</strong> EM NENHUMA HIPÓTESE A RESPONSABILIDADE TOTAL DA GS ITALYINVESTMENTS EXCEDERÁ O VALOR 
                EFETIVAMENTE PAGO PELO USUÁRIO PELOS SERVIÇOS NOS DOZE (12) MESES ANTERIORES À OCORRÊNCIA DO EVENTO 
                QUE DEU ORIGEM À RECLAMAÇÃO.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">9.3.</strong> O USUÁRIO RECONHECE QUE APOSTAS ESPORTIVAS ENVOLVEM RISCO SUBSTANCIAL DE PERDA FINANCEIRA 
                E QUE A UTILIZAÇÃO DA PLATAFORMA É DE SUA EXCLUSIVA RESPONSABILIDADE.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">10. INDENIZAÇÃO</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">10.1.</strong> O Usuário concorda em indenizar, defender e isentar a GS ITALYINVESTMENTS, seus diretores, 
                funcionários, agentes e parceiros de quaisquer reclamações, perdas, danos, responsabilidades, custos 
                e despesas (incluindo honorários advocatícios) decorrentes de:
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                <li>Violação destes Termos pelo Usuário</li>
                <li>Violação de direitos de terceiros pelo Usuário</li>
                <li>Uso indevido ou não autorizado da Plataforma</li>
                <li>Qualquer conteúdo enviado ou transmitido pelo Usuário através da Plataforma</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">11. ENCERRAMENTO</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">11.1.</strong> A GS ITALYINVESTMENTS poderá, a seu exclusivo critério e sem aviso prévio, suspender 
                ou encerrar o acesso do Usuário à Plataforma, por qualquer motivo, incluindo, sem limitação, violação 
                destes Termos.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">11.2.</strong> O Usuário poderá encerrar sua conta a qualquer momento, mediante solicitação através 
                dos canais oficiais de atendimento.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">11.3.</strong> As disposições relativas a propriedade intelectual, limitação de responsabilidade, 
                indenização, lei aplicável e foro permanecerão em vigor após o encerramento destes Termos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">12. DISPOSIÇÕES GERAIS</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">12.1.</strong> <strong>Integralidade do Acordo:</strong> Estes Termos, juntamente com a Política de 
                Privacidade, constituem o acordo integral entre o Usuário e a GS ITALYINVESTMENTS com relação ao uso 
                da Plataforma, substituindo quaisquer acordos anteriores.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.2.</strong> <strong>Independência das Cláusulas:</strong> Se qualquer disposição destes Termos for 
                considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.3.</strong> <strong>Renúncia:</strong> A omissão ou tolerância da GS ITALYINVESTMENTS em exigir 
                o cumprimento de qualquer disposição destes Termos não constituirá renúncia ao direito de fazê-lo 
                posteriormente.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.4.</strong> <strong>Cessão:</strong> O Usuário não poderá ceder ou transferir estes Termos ou 
                quaisquer direitos aqui estabelecidos sem o consentimento prévio por escrito da GS ITALYINVESTMENTS.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">13. LEI APLICÁVEL E FORO</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">13.1.</strong> Estes Termos serão regidos e interpretados de acordo com as leis do Estado da Flórida, 
                Estados Unidos da América, sem consideração a conflitos de princípios legais.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">13.2.</strong> Qualquer disputa, controvérsia ou reclamação decorrente destes Termos ou relacionada 
                a eles, incluindo sua validade, interpretação, execução ou rescisão, será submetida à jurisdição 
                exclusiva dos tribunais estaduais e federais localizados no Estado da Flórida, Estados Unidos da América.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">13.3.</strong> O Usuário renuncia expressamente a qualquer objeção quanto ao foro ou à jurisdição 
                estabelecida nesta cláusula.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">14. CONTATO</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">14.1.</strong> Para questões, dúvidas ou solicitações relacionadas a estes Termos de Uso, 
                o Usuário poderá entrar em contato com a GS ITALYINVESTMENTS através dos canais oficiais de atendimento 
                disponibilizados na Plataforma.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">14.2.</strong> Todas as notificações legais deverão ser enviadas aos endereços oficiais da 
                GS ITALYINVESTMENTS, Estado da Flórida, Estados Unidos da América.
              </p>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-700 space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <p className="text-sm text-slate-400 leading-relaxed">
                <strong className="text-white block mb-2">DECLARAÇÃO DE ENTIDADE RESPONSÁVEL</strong>
                A Plataforma EUGINE Analytics é um produto tecnológico desenvolvido, operado e mantido exclusivamente 
                pela <strong className="text-emerald-400">GS ITALYINVESTMENTS</strong>, empresa estabelecida no Estado da Flórida, 
                Estados Unidos da América, desde 2015. Toda a infraestrutura tecnológica, processamento de dados, 
                operações, compliance regulatório e obrigações legais relacionadas à Plataforma são de responsabilidade 
                integral da GS ITALYINVESTMENTS.
              </p>
            </div>
            <p className="text-sm text-slate-500 text-center">
              EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
