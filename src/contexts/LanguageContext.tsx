import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('eugine-language');
    return (saved as Language) || 'pt';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === language) return;
    
    // Start transition
    setIsTransitioning(true);
    
    // After fade out, change language
    setTimeout(() => {
      setLanguageState(lang);
      localStorage.setItem('eugine-language', lang);
      
      // After language change, fade back in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  }, [language]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTransitioning }}>
      <div className={`transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

// Translations object
const translations: Record<Language, any> = {
  pt: {
    auth: {
      systemName: "Sistema Inteligente Eugine Analytics",
      login: "Login",
      register: "Cadastrar",
      email: "Email",
      emailPlaceholder: "seu@email.com",
      phone: "Telefone",
      phonePlaceholder: "(11) 99999-9999",
      password: "Senha",
      passwordPlaceholder: "••••••••",
      enter: "Entrar",
      createAccount: "Criar Conta",
      loading: "Aguarde...",
      trialMessage: "Ganhe",
      trialDays: "10 dias grátis",
      trialSuffix: "de acesso ao criar sua conta!",
      termsPrefix: "Ao continuar, você concorda com nossos",
      termsOfUse: "Termos de Uso",
      and: "e",
      privacyPolicy: "Política de Privacidade",
      errors: {
        invalidEmail: "Email inválido",
        phoneMin: "Telefone deve ter pelo menos 10 dígitos",
        passwordMin: "Senha deve ter pelo menos 6 caracteres",
        passwordRequired: "Senha é obrigatória",
        loginError: "Erro no login",
        invalidCredentials: "Email ou senha incorretos",
        registerError: "Erro no cadastro",
        emailExists: "Este email já está cadastrado. Tente fazer login.",
        genericError: "Ocorreu um erro inesperado. Tente novamente.",
      },
      success: {
        accountCreated: "Conta criada!",
        accountCreatedDesc: "Você já pode acessar o sistema.",
      },
    },
    common: {
      back: "Voltar",
      lastUpdate: "Última atualização",
      error: "Erro",
    },
    terms: {
      title: "Termos de Uso",
      readCarefully: "LEIA ATENTAMENTE ESTES TERMOS DE USO ANTES DE ACESSAR OU UTILIZAR A PLATAFORMA EUGINE ANALYTICS. AO ACESSAR OU UTILIZAR OS SERVIÇOS, VOCÊ DECLARA QUE LEU, COMPREENDEU E CONCORDA EM ESTAR VINCULADO A ESTES TERMOS. CASO NÃO CONCORDE COM QUALQUER DISPOSIÇÃO AQUI ESTABELECIDA, INTERROMPA IMEDIATAMENTE O ACESSO À PLATAFORMA.",
      section1: {
        title: "1. DEFINIÇÕES E INTERPRETAÇÃO",
        intro: "Para fins destes Termos de Uso, aplicam-se as seguintes definições:",
        company: "refere-se à GS ITALYINVESTMENTS, pessoa jurídica devidamente constituída e existente sob as leis do Estado da Flórida, Estados Unidos da América, com operações ininterruptas desde 2015, sendo a única titular, proprietária e operadora da Plataforma EUGINE Analytics.",
        platform: "designa o produto de tecnologia, software e sistema de análise de dados esportivos desenvolvido, mantido e operado exclusivamente pela GS ITALYINVESTMENTS, incluindo todas as suas funcionalidades, interfaces, algoritmos, APIs e infraestrutura tecnológica.",
        user: "qualquer pessoa física ou jurídica que acesse, utilize ou interaja com a Plataforma, independentemente de possuir conta registrada.",
        services: "todos os recursos, funcionalidades, análises, dados e informações disponibilizados através da Plataforma.",
        content: "todo material disponibilizado na Plataforma, incluindo, mas não se limitando a, textos, gráficos, dados, análises, algoritmos, software, marcas e elementos visuais.",
        clarification: "A EUGINE Analytics é uma plataforma tecnológica e NÃO constitui pessoa jurídica autônoma, sendo integralmente de propriedade da GS ITALYINVESTMENTS, que assume toda e qualquer responsabilidade legal, operacional e regulatória relacionada à sua operação.",
      },
      section2: {
        title: "2. ACEITAÇÃO DOS TERMOS",
        p1: "Ao acessar ou utilizar a Plataforma EUGINE Analytics, o Usuário manifesta sua concordância integral e irrestrita com todos os termos e condições aqui estabelecidos, bem como com nossa Política de Privacidade, que é incorporada a estes Termos por referência.",
        p2: "A GS ITALYINVESTMENTS reserva-se o direito de modificar, alterar, adicionar ou remover qualquer disposição destes Termos a qualquer momento, a seu exclusivo critério. Tais modificações entrarão em vigor imediatamente após sua publicação na Plataforma.",
        p3: "O uso continuado da Plataforma após a publicação de alterações constitui aceitação tácita dos novos termos. É responsabilidade do Usuário revisar periodicamente estes Termos.",
      },
      section3: {
        title: "3. DESCRIÇÃO DOS SERVIÇOS",
        p1: "A EUGINE Analytics é uma plataforma tecnológica proprietária que oferece serviços de análise de dados esportivos, processamento de informações estatísticas e geração de insights baseados em algoritmos proprietários desenvolvidos pela GS ITALYINVESTMENTS.",
        p2: "Os Serviços incluem, sem limitação:",
        list: [
          "Análise algorítmica de odds e mercados esportivos",
          "Processamento de dados estatísticos em tempo real",
          "Geração de relatórios analíticos e tendências de mercado",
          "Ferramentas de visualização de dados e dashboards",
          "Sistemas de alertas e notificações personalizadas",
        ],
        p3: "Os Serviços são fornecidos exclusivamente para fins informativos, educacionais e de entretenimento. A GS ITALYINVESTMENTS não oferece, direta ou indiretamente, serviços de apostas, consultoria financeira, recomendação de investimentos ou qualquer forma de aconselhamento profissional.",
      },
      section4: {
        title: "4. PERÍODO DE AVALIAÇÃO E ASSINATURA",
        p1: "A GS ITALYINVESTMENTS poderá, a seu exclusivo critério, oferecer período de avaliação gratuito (\"Trial\") para novos Usuários, conforme condições e prazos estabelecidos no momento do registro.",
        p2: "O acesso aos recursos premium da Plataforma após o término do período de avaliação está condicionado à contratação de plano de assinatura, conforme tabela de preços vigente.",
        p3: "A GS ITALYINVESTMENTS reserva-se o direito de modificar preços, planos e condições de assinatura a qualquer momento, mediante aviso prévio aos Usuários ativos.",
      },
      section5: {
        title: "5. CONTA DO USUÁRIO E SEGURANÇA",
        p1: "Para acessar determinados recursos da Plataforma, o Usuário deverá criar uma conta, fornecendo informações verdadeiras, precisas, atuais e completas.",
        p2: "O Usuário é integralmente responsável por:",
        list: [
          "Manter a confidencialidade de suas credenciais de acesso",
          "Todas as atividades realizadas em sua conta",
          "Notificar imediatamente a GS ITALYINVESTMENTS sobre qualquer uso não autorizado",
          "Atualizar suas informações cadastrais sempre que necessário",
        ],
        p3: "A GS ITALYINVESTMENTS reserva-se o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio e sem direito a reembolso.",
      },
      section6: {
        title: "6. PROPRIEDADE INTELECTUAL",
        p1: "A Plataforma EUGINE Analytics, incluindo, sem limitação, sua marca, nome, logotipo, design, interface, código-fonte, algoritmos, metodologias, banco de dados, documentação e todo o Conteúdo, são de propriedade exclusiva da GS ITALYINVESTMENTS ou de seus licenciadores, estando protegidos pelas leis de propriedade intelectual dos Estados Unidos e tratados internacionais aplicáveis.",
        p2: "Nenhuma disposição destes Termos transfere ao Usuário qualquer direito de propriedade intelectual sobre a Plataforma ou seu Conteúdo. É concedida ao Usuário apenas uma licença limitada, não exclusiva, intransferível e revogável para uso pessoal da Plataforma.",
        p3: "É expressamente proibido, sem autorização prévia por escrito da GS ITALYINVESTMENTS:",
        list: [
          "Reproduzir, distribuir, modificar ou criar obras derivadas do Conteúdo",
          "Realizar engenharia reversa, descompilar ou desmontar qualquer componente da Plataforma",
          "Remover ou alterar avisos de direitos autorais ou marcas registradas",
          "Utilizar a Plataforma para fins comerciais não autorizados",
          "Coletar dados da Plataforma por meios automatizados (scraping, crawling)",
        ],
      },
      section7: {
        title: "7. CONDUTA DO USUÁRIO",
        p1: "Ao utilizar a Plataforma, o Usuário compromete-se a:",
        list: [
          "Cumprir todas as leis e regulamentos aplicáveis em sua jurisdição",
          "Não utilizar a Plataforma para atividades ilegais ou fraudulentas",
          "Não interferir na operação normal da Plataforma ou de seus sistemas",
          "Não transmitir vírus, malware ou código malicioso",
          "Não compartilhar credenciais de acesso com terceiros",
          "Respeitar os direitos de propriedade intelectual de terceiros",
        ],
        p2: "A violação de qualquer disposição desta seção poderá resultar no encerramento imediato do acesso à Plataforma, sem prejuízo de outras medidas legais cabíveis.",
      },
      section8: {
        title: "8. ISENÇÃO DE GARANTIAS",
        p1: "A PLATAFORMA EUGINE ANALYTICS E TODOS OS SERVIÇOS SÃO FORNECIDOS \"NO ESTADO EM QUE SE ENCONTRAM\" (AS IS) E \"CONFORME DISPONIBILIDADE\" (AS AVAILABLE), SEM GARANTIAS DE QUALQUER NATUREZA, EXPRESSAS OU IMPLÍCITAS.",
        p2: "A GS ITALYINVESTMENTS NÃO GARANTE QUE:",
        list: [
          "Os Serviços serão ininterruptos, seguros ou livres de erros",
          "Os resultados obtidos através da Plataforma serão precisos ou confiáveis",
          "A qualidade dos Serviços atenderá às expectativas do Usuário",
          "Quaisquer erros no software serão corrigidos",
        ],
        p3: "O USUÁRIO RECONHECE EXPRESSAMENTE QUE AS ANÁLISES E INFORMAÇÕES FORNECIDAS PELA PLATAFORMA NÃO CONSTITUEM GARANTIA DE RESULTADOS ESPECÍFICOS, LUCROS OU GANHOS FINANCEIROS.",
      },
      section9: {
        title: "9. LIMITAÇÃO DE RESPONSABILIDADE",
        p1: "NA EXTENSÃO MÁXIMA PERMITIDA PELA LEI APLICÁVEL, A GS ITALYINVESTMENTS, SEUS DIRETORES, FUNCIONÁRIOS, AGENTES, PARCEIROS E LICENCIADORES NÃO SERÃO RESPONSÁVEIS POR:",
        list: [
          "Danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos",
          "Perda de lucros, receitas, dados, uso ou outras perdas intangíveis",
          "Quaisquer perdas financeiras decorrentes de decisões baseadas nas informações da Plataforma",
          "Interrupções, atrasos ou falhas nos Serviços",
          "Ações de terceiros ou eventos de força maior",
        ],
        p2: "EM NENHUMA HIPÓTESE A RESPONSABILIDADE TOTAL DA GS ITALYINVESTMENTS EXCEDERÁ O VALOR EFETIVAMENTE PAGO PELO USUÁRIO PELOS SERVIÇOS NOS DOZE (12) MESES ANTERIORES À OCORRÊNCIA DO EVENTO QUE DEU ORIGEM À RECLAMAÇÃO.",
        p3: "O USUÁRIO RECONHECE QUE APOSTAS ESPORTIVAS ENVOLVEM RISCO SUBSTANCIAL DE PERDA FINANCEIRA E QUE A UTILIZAÇÃO DA PLATAFORMA É DE SUA EXCLUSIVA RESPONSABILIDADE.",
      },
      section10: {
        title: "10. INDENIZAÇÃO",
        p1: "O Usuário concorda em indenizar, defender e isentar a GS ITALYINVESTMENTS, seus diretores, funcionários, agentes e parceiros de quaisquer reclamações, perdas, danos, responsabilidades, custos e despesas (incluindo honorários advocatícios) decorrentes de:",
        list: [
          "Violação destes Termos pelo Usuário",
          "Violação de direitos de terceiros pelo Usuário",
          "Uso indevido ou não autorizado da Plataforma",
          "Qualquer conteúdo enviado ou transmitido pelo Usuário através da Plataforma",
        ],
      },
      section11: {
        title: "11. ENCERRAMENTO",
        p1: "A GS ITALYINVESTMENTS poderá, a seu exclusivo critério e sem aviso prévio, suspender ou encerrar o acesso do Usuário à Plataforma, por qualquer motivo, incluindo, sem limitação, violação destes Termos.",
        p2: "O Usuário poderá encerrar sua conta a qualquer momento, mediante solicitação através dos canais oficiais de atendimento.",
        p3: "As disposições relativas a propriedade intelectual, limitação de responsabilidade, indenização, lei aplicável e foro permanecerão em vigor após o encerramento destes Termos.",
      },
      section12: {
        title: "12. DISPOSIÇÕES GERAIS",
        agreement: "Estes Termos, juntamente com a Política de Privacidade, constituem o acordo integral entre o Usuário e a GS ITALYINVESTMENTS com relação ao uso da Plataforma, substituindo quaisquer acordos anteriores.",
        severability: "Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.",
        waiver: "A omissão ou tolerância da GS ITALYINVESTMENTS em exigir o cumprimento de qualquer disposição destes Termos não constituirá renúncia ao direito de fazê-lo posteriormente.",
        assignment: "O Usuário não poderá ceder ou transferir estes Termos ou quaisquer direitos aqui estabelecidos sem o consentimento prévio por escrito da GS ITALYINVESTMENTS.",
      },
      section13: {
        title: "13. LEI APLICÁVEL E FORO",
        p1: "Estes Termos serão regidos e interpretados de acordo com as leis do Estado da Flórida, Estados Unidos da América, sem consideração a conflitos de princípios legais.",
        p2: "Qualquer disputa, controvérsia ou reclamação decorrente destes Termos ou relacionada a eles, incluindo sua validade, interpretação, execução ou rescisão, será submetida à jurisdição exclusiva dos tribunais estaduais e federais localizados no Estado da Flórida, Estados Unidos da América.",
        p3: "O Usuário renuncia expressamente a qualquer objeção quanto ao foro ou à jurisdição estabelecida nesta cláusula.",
      },
      section14: {
        title: "14. CONTATO",
        p1: "Para questões, dúvidas ou solicitações relacionadas a estes Termos de Uso, o Usuário poderá entrar em contato com a GS ITALYINVESTMENTS através dos canais oficiais de atendimento disponibilizados na Plataforma.",
        p2: "Todas as notificações legais deverão ser enviadas aos endereços oficiais da GS ITALYINVESTMENTS, Estado da Flórida, Estados Unidos da América.",
      },
      declaration: {
        title: "DECLARAÇÃO DE ENTIDADE RESPONSÁVEL",
        text: "A Plataforma EUGINE Analytics é um produto tecnológico desenvolvido, operado e mantido exclusivamente pela GS ITALYINVESTMENTS, empresa estabelecida no Estado da Flórida, Estados Unidos da América, desde 2015. Toda a infraestrutura tecnológica, processamento de dados, operações, compliance regulatório e obrigações legais relacionadas à Plataforma são de responsabilidade integral da GS ITALYINVESTMENTS.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
    privacy: {
      title: "Política de Privacidade",
      section1: {
        title: "1. Introdução",
        text: "A GS ITALYINVESTMENTS, proprietária e operadora da Plataforma EUGINE Analytics, está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais.",
      },
      section2: {
        title: "2. Informações que Coletamos",
        intro: "Coletamos as seguintes informações quando você usa nosso serviço:",
        registration: "Informações de Cadastro:",
        registrationList: [
          "Endereço de e-mail",
          "Número de telefone",
          "Senha (armazenada de forma criptografada)",
        ],
        usage: "Informações de Uso:",
        usageList: [
          "Data e hora de acesso",
          "Páginas visitadas",
          "Interações com o sistema",
          "Dispositivo e navegador utilizados",
        ],
      },
      section3: {
        title: "3. Como Usamos suas Informações",
        intro: "Utilizamos suas informações para:",
        list: [
          "Fornecer e manter nossos serviços",
          "Personalizar sua experiência",
          "Enviar comunicações importantes sobre o serviço",
          "Processar transações e gerenciar sua conta",
          "Melhorar nossos algoritmos e análises",
          "Prevenir fraudes e garantir a segurança",
        ],
      },
      section4: {
        title: "4. Proteção de Dados",
        intro: "Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:",
        list: [
          "Criptografia de dados em trânsito e em repouso",
          "Autenticação segura com tokens JWT",
          "Acesso restrito a dados pessoais",
          "Monitoramento contínuo de segurança",
          "Backups regulares e recuperação de desastres",
        ],
      },
      section5: {
        title: "5. Compartilhamento de Dados",
        intro: "Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:",
        list: [
          "Quando exigido por lei ou ordem judicial",
          "Para proteger nossos direitos legais",
          "Com prestadores de serviços essenciais (processamento de pagamentos, hospedagem)",
          "Em caso de fusão ou aquisição da empresa",
        ],
      },
      section6: {
        title: "6. Seus Direitos",
        intro: "Você tem os seguintes direitos em relação aos seus dados pessoais:",
        access: "Solicitar uma cópia dos dados que mantemos sobre você",
        correction: "Corrigir informações imprecisas ou incompletas",
        deletion: "Solicitar a exclusão de seus dados pessoais",
        portability: "Receber seus dados em formato estruturado",
        opposition: "Opor-se ao processamento de seus dados",
      },
      section7: {
        title: "7. Cookies e Tecnologias Similares",
        intro: "Utilizamos cookies e tecnologias similares para:",
        list: [
          "Manter você conectado à sua conta",
          "Lembrar suas preferências",
          "Analisar o uso do serviço",
          "Melhorar a performance do sistema",
        ],
      },
      section8: {
        title: "8. Retenção de Dados",
        text: "Mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços ou conforme exigido por lei. Após o encerramento da conta, seus dados serão excluídos dentro de 90 dias, exceto quando houver obrigação legal de retenção.",
      },
      section9: {
        title: "9. Menores de Idade",
        text: "Nossos serviços são destinados apenas a pessoas maiores de 18 anos. Não coletamos intencionalmente informações de menores de idade. Se tomarmos conhecimento de que coletamos dados de um menor, excluiremos essas informações imediatamente.",
      },
      section10: {
        title: "10. Alterações nesta Política",
        text: "Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas por e-mail ou através de um aviso em nosso serviço. Recomendamos revisar esta política regularmente.",
      },
      section11: {
        title: "11. Lei Aplicável e Foro",
        p1: "Esta Política de Privacidade será regida e interpretada de acordo com as leis do Estado da Flórida, Estados Unidos da América.",
        p2: "Qualquer disputa relacionada a esta política será submetida à jurisdição exclusiva dos tribunais estaduais e federais localizados no Estado da Flórida, EUA.",
      },
      section12: {
        title: "12. Contato",
        text: "Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato com a GS ITALYINVESTMENTS através dos canais oficiais de atendimento disponibilizados na Plataforma.",
      },
      declaration: {
        title: "CONTROLADOR DE DADOS",
        text: "A GS ITALYINVESTMENTS, estabelecida no Estado da Flórida, Estados Unidos da América, desde 2015, é a controladora de dados responsável pelo processamento de suas informações pessoais através da Plataforma EUGINE Analytics.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
  },
  en: {
    auth: {
      systemName: "Eugine Analytics Intelligent System",
      login: "Login",
      register: "Sign Up",
      email: "Email",
      emailPlaceholder: "your@email.com",
      phone: "Phone",
      phonePlaceholder: "+1 (555) 123-4567",
      password: "Password",
      passwordPlaceholder: "••••••••",
      enter: "Sign In",
      createAccount: "Create Account",
      loading: "Please wait...",
      trialMessage: "Get",
      trialDays: "10 free days",
      trialSuffix: "of access when you create your account!",
      termsPrefix: "By continuing, you agree to our",
      termsOfUse: "Terms of Use",
      and: "and",
      privacyPolicy: "Privacy Policy",
      errors: {
        invalidEmail: "Invalid email",
        phoneMin: "Phone must have at least 10 digits",
        passwordMin: "Password must have at least 6 characters",
        passwordRequired: "Password is required",
        loginError: "Login error",
        invalidCredentials: "Invalid email or password",
        registerError: "Registration error",
        emailExists: "This email is already registered. Try logging in.",
        genericError: "An unexpected error occurred. Please try again.",
      },
      success: {
        accountCreated: "Account created!",
        accountCreatedDesc: "You can now access the system.",
      },
    },
    common: {
      back: "Back",
      lastUpdate: "Last updated",
      error: "Error",
    },
    terms: {
      title: "Terms of Use",
      readCarefully: "PLEASE READ THESE TERMS OF USE CAREFULLY BEFORE ACCESSING OR USING THE EUGINE ANALYTICS PLATFORM. BY ACCESSING OR USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE WITH ANY PROVISION HEREIN, IMMEDIATELY DISCONTINUE ACCESS TO THE PLATFORM.",
      section1: {
        title: "1. DEFINITIONS AND INTERPRETATION",
        intro: "For the purposes of these Terms of Use, the following definitions apply:",
        company: "refers to GS ITALYINVESTMENTS, a legal entity duly incorporated and existing under the laws of the State of Florida, United States of America, with uninterrupted operations since 2015, being the sole owner, proprietor, and operator of the EUGINE Analytics Platform.",
        platform: "designates the technology product, software, and sports data analysis system developed, maintained, and operated exclusively by GS ITALYINVESTMENTS, including all its features, interfaces, algorithms, APIs, and technological infrastructure.",
        user: "any natural or legal person who accesses, uses, or interacts with the Platform, regardless of having a registered account.",
        services: "all resources, features, analyses, data, and information made available through the Platform.",
        content: "all material made available on the Platform, including but not limited to texts, graphics, data, analyses, algorithms, software, trademarks, and visual elements.",
        clarification: "EUGINE Analytics is a technological platform and DOES NOT constitute an autonomous legal entity, being wholly owned by GS ITALYINVESTMENTS, which assumes all legal, operational, and regulatory responsibility related to its operation.",
      },
      section2: {
        title: "2. ACCEPTANCE OF TERMS",
        p1: "By accessing or using the EUGINE Analytics Platform, the User manifests full and unrestricted agreement with all terms and conditions established herein, as well as our Privacy Policy, which is incorporated into these Terms by reference.",
        p2: "GS ITALYINVESTMENTS reserves the right to modify, alter, add, or remove any provision of these Terms at any time, at its sole discretion. Such modifications will take effect immediately upon publication on the Platform.",
        p3: "Continued use of the Platform after the publication of changes constitutes tacit acceptance of the new terms. It is the User's responsibility to periodically review these Terms.",
      },
      section3: {
        title: "3. DESCRIPTION OF SERVICES",
        p1: "EUGINE Analytics is a proprietary technological platform that offers sports data analysis services, statistical information processing, and insight generation based on proprietary algorithms developed by GS ITALYINVESTMENTS.",
        p2: "The Services include, without limitation:",
        list: [
          "Algorithmic analysis of odds and sports markets",
          "Real-time statistical data processing",
          "Generation of analytical reports and market trends",
          "Data visualization tools and dashboards",
          "Customized alert and notification systems",
        ],
        p3: "The Services are provided exclusively for informational, educational, and entertainment purposes. GS ITALYINVESTMENTS does not offer, directly or indirectly, betting services, financial advice, investment recommendations, or any form of professional counseling.",
      },
      section4: {
        title: "4. TRIAL PERIOD AND SUBSCRIPTION",
        p1: "GS ITALYINVESTMENTS may, at its sole discretion, offer a free trial period (\"Trial\") for new Users, according to conditions and terms established at the time of registration.",
        p2: "Access to premium Platform features after the trial period ends is conditional upon subscribing to a paid plan, according to the current price list.",
        p3: "GS ITALYINVESTMENTS reserves the right to modify prices, plans, and subscription conditions at any time, with prior notice to active Users.",
      },
      section5: {
        title: "5. USER ACCOUNT AND SECURITY",
        p1: "To access certain Platform features, the User must create an account, providing true, accurate, current, and complete information.",
        p2: "The User is fully responsible for:",
        list: [
          "Maintaining the confidentiality of access credentials",
          "All activities performed on their account",
          "Immediately notifying GS ITALYINVESTMENTS of any unauthorized use",
          "Updating registration information whenever necessary",
        ],
        p3: "GS ITALYINVESTMENTS reserves the right to suspend or terminate accounts that violate these Terms, without prior notice and without right to refund.",
      },
      section6: {
        title: "6. INTELLECTUAL PROPERTY",
        p1: "The EUGINE Analytics Platform, including without limitation its brand, name, logo, design, interface, source code, algorithms, methodologies, database, documentation, and all Content, are exclusively owned by GS ITALYINVESTMENTS or its licensors, protected by United States intellectual property laws and applicable international treaties.",
        p2: "No provision of these Terms transfers to the User any intellectual property rights over the Platform or its Content. The User is granted only a limited, non-exclusive, non-transferable, and revocable license for personal use of the Platform.",
        p3: "Without prior written authorization from GS ITALYINVESTMENTS, the following is expressly prohibited:",
        list: [
          "Reproducing, distributing, modifying, or creating derivative works from the Content",
          "Reverse engineering, decompiling, or disassembling any component of the Platform",
          "Removing or altering copyright notices or trademarks",
          "Using the Platform for unauthorized commercial purposes",
          "Collecting data from the Platform by automated means (scraping, crawling)",
        ],
      },
      section7: {
        title: "7. USER CONDUCT",
        p1: "When using the Platform, the User agrees to:",
        list: [
          "Comply with all applicable laws and regulations in their jurisdiction",
          "Not use the Platform for illegal or fraudulent activities",
          "Not interfere with the normal operation of the Platform or its systems",
          "Not transmit viruses, malware, or malicious code",
          "Not share access credentials with third parties",
          "Respect the intellectual property rights of third parties",
        ],
        p2: "Violation of any provision in this section may result in immediate termination of access to the Platform, without prejudice to other applicable legal measures.",
      },
      section8: {
        title: "8. DISCLAIMER OF WARRANTIES",
        p1: "THE EUGINE ANALYTICS PLATFORM AND ALL SERVICES ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE,\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.",
        p2: "GS ITALYINVESTMENTS DOES NOT WARRANT THAT:",
        list: [
          "The Services will be uninterrupted, secure, or error-free",
          "The results obtained through the Platform will be accurate or reliable",
          "The quality of the Services will meet the User's expectations",
          "Any software errors will be corrected",
        ],
        p3: "THE USER EXPRESSLY ACKNOWLEDGES THAT THE ANALYSES AND INFORMATION PROVIDED BY THE PLATFORM DO NOT CONSTITUTE A GUARANTEE OF SPECIFIC RESULTS, PROFITS, OR FINANCIAL GAINS.",
      },
      section9: {
        title: "9. LIMITATION OF LIABILITY",
        p1: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GS ITALYINVESTMENTS, ITS DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, AND LICENSORS SHALL NOT BE LIABLE FOR:",
        list: [
          "Direct, indirect, incidental, special, consequential, or punitive damages",
          "Loss of profits, revenue, data, use, or other intangible losses",
          "Any financial losses arising from decisions based on Platform information",
          "Interruptions, delays, or failures in the Services",
          "Actions of third parties or force majeure events",
        ],
        p2: "IN NO EVENT SHALL THE TOTAL LIABILITY OF GS ITALYINVESTMENTS EXCEED THE AMOUNT ACTUALLY PAID BY THE USER FOR THE SERVICES IN THE TWELVE (12) MONTHS PRECEDING THE OCCURRENCE OF THE EVENT GIVING RISE TO THE CLAIM.",
        p3: "THE USER ACKNOWLEDGES THAT SPORTS BETTING INVOLVES SUBSTANTIAL RISK OF FINANCIAL LOSS AND THAT USE OF THE PLATFORM IS AT THE USER'S SOLE RESPONSIBILITY.",
      },
      section10: {
        title: "10. INDEMNIFICATION",
        p1: "The User agrees to indemnify, defend, and hold harmless GS ITALYINVESTMENTS, its directors, employees, agents, and partners from any claims, losses, damages, liabilities, costs, and expenses (including attorney fees) arising from:",
        list: [
          "Violation of these Terms by the User",
          "Violation of third-party rights by the User",
          "Improper or unauthorized use of the Platform",
          "Any content sent or transmitted by the User through the Platform",
        ],
      },
      section11: {
        title: "11. TERMINATION",
        p1: "GS ITALYINVESTMENTS may, at its sole discretion and without prior notice, suspend or terminate the User's access to the Platform, for any reason, including, without limitation, violation of these Terms.",
        p2: "The User may terminate their account at any time by requesting through official support channels.",
        p3: "Provisions relating to intellectual property, limitation of liability, indemnification, applicable law, and jurisdiction shall survive the termination of these Terms.",
      },
      section12: {
        title: "12. GENERAL PROVISIONS",
        agreement: "These Terms, together with the Privacy Policy, constitute the entire agreement between the User and GS ITALYINVESTMENTS regarding use of the Platform, superseding any prior agreements.",
        severability: "If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force and effect.",
        waiver: "The failure or tolerance of GS ITALYINVESTMENTS to enforce any provision of these Terms shall not constitute a waiver of the right to do so later.",
        assignment: "The User may not assign or transfer these Terms or any rights established herein without prior written consent from GS ITALYINVESTMENTS.",
      },
      section13: {
        title: "13. GOVERNING LAW AND JURISDICTION",
        p1: "These Terms shall be governed and interpreted in accordance with the laws of the State of Florida, United States of America, without regard to conflict of law principles.",
        p2: "Any dispute, controversy, or claim arising from or relating to these Terms, including their validity, interpretation, performance, or termination, shall be submitted to the exclusive jurisdiction of state and federal courts located in the State of Florida, United States of America.",
        p3: "The User expressly waives any objection to the venue or jurisdiction established in this clause.",
      },
      section14: {
        title: "14. CONTACT",
        p1: "For questions, inquiries, or requests related to these Terms of Use, the User may contact GS ITALYINVESTMENTS through the official support channels provided on the Platform.",
        p2: "All legal notices must be sent to the official addresses of GS ITALYINVESTMENTS, State of Florida, United States of America.",
      },
      declaration: {
        title: "RESPONSIBLE ENTITY DECLARATION",
        text: "The EUGINE Analytics Platform is a technological product developed, operated, and maintained exclusively by GS ITALYINVESTMENTS, a company established in the State of Florida, United States of America, since 2015. All technological infrastructure, data processing, operations, regulatory compliance, and legal obligations related to the Platform are the sole responsibility of GS ITALYINVESTMENTS.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
    privacy: {
      title: "Privacy Policy",
      section1: {
        title: "1. Introduction",
        text: "GS ITALYINVESTMENTS, owner and operator of the EUGINE Analytics Platform, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information.",
      },
      section2: {
        title: "2. Information We Collect",
        intro: "We collect the following information when you use our service:",
        registration: "Registration Information:",
        registrationList: [
          "Email address",
          "Phone number",
          "Password (stored encrypted)",
        ],
        usage: "Usage Information:",
        usageList: [
          "Date and time of access",
          "Pages visited",
          "System interactions",
          "Device and browser used",
        ],
      },
      section3: {
        title: "3. How We Use Your Information",
        intro: "We use your information to:",
        list: [
          "Provide and maintain our services",
          "Personalize your experience",
          "Send important service communications",
          "Process transactions and manage your account",
          "Improve our algorithms and analyses",
          "Prevent fraud and ensure security",
        ],
      },
      section4: {
        title: "4. Data Protection",
        intro: "We implement technical and organizational security measures to protect your information, including:",
        list: [
          "Encryption of data in transit and at rest",
          "Secure authentication with JWT tokens",
          "Restricted access to personal data",
          "Continuous security monitoring",
          "Regular backups and disaster recovery",
        ],
      },
      section5: {
        title: "5. Data Sharing",
        intro: "We do not sell, rent, or share your personal information with third parties, except:",
        list: [
          "When required by law or court order",
          "To protect our legal rights",
          "With essential service providers (payment processing, hosting)",
          "In case of company merger or acquisition",
        ],
      },
      section6: {
        title: "6. Your Rights",
        intro: "You have the following rights regarding your personal data:",
        access: "Request a copy of the data we hold about you",
        correction: "Correct inaccurate or incomplete information",
        deletion: "Request deletion of your personal data",
        portability: "Receive your data in a structured format",
        opposition: "Object to the processing of your data",
      },
      section7: {
        title: "7. Cookies and Similar Technologies",
        intro: "We use cookies and similar technologies to:",
        list: [
          "Keep you logged into your account",
          "Remember your preferences",
          "Analyze service usage",
          "Improve system performance",
        ],
      },
      section8: {
        title: "8. Data Retention",
        text: "We retain your personal information for as long as necessary to provide our services or as required by law. After account termination, your data will be deleted within 90 days, except when there is a legal obligation for retention.",
      },
      section9: {
        title: "9. Minors",
        text: "Our services are intended only for persons 18 years of age or older. We do not intentionally collect information from minors. If we become aware that we have collected data from a minor, we will immediately delete such information.",
      },
      section10: {
        title: "10. Changes to This Policy",
        text: "We may update this Privacy Policy periodically. We will notify you of significant changes by email or through a notice on our service. We recommend reviewing this policy regularly.",
      },
      section11: {
        title: "11. Governing Law and Jurisdiction",
        p1: "This Privacy Policy shall be governed and interpreted in accordance with the laws of the State of Florida, United States of America.",
        p2: "Any dispute related to this policy shall be submitted to the exclusive jurisdiction of state and federal courts located in the State of Florida, USA.",
      },
      section12: {
        title: "12. Contact",
        text: "To exercise your rights or clarify questions about this Privacy Policy, contact GS ITALYINVESTMENTS through the official support channels provided on the Platform.",
      },
      declaration: {
        title: "DATA CONTROLLER",
        text: "GS ITALYINVESTMENTS, established in the State of Florida, United States of America, since 2015, is the data controller responsible for processing your personal information through the EUGINE Analytics Platform.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
  },
  es: {
    auth: {
      systemName: "Sistema Inteligente Eugine Analytics",
      login: "Iniciar Sesión",
      register: "Registrarse",
      email: "Correo",
      emailPlaceholder: "tu@correo.com",
      phone: "Teléfono",
      phonePlaceholder: "+34 612 345 678",
      password: "Contraseña",
      passwordPlaceholder: "••••••••",
      enter: "Entrar",
      createAccount: "Crear Cuenta",
      loading: "Espere...",
      trialMessage: "Obtén",
      trialDays: "10 días gratis",
      trialSuffix: "de acceso al crear tu cuenta!",
      termsPrefix: "Al continuar, aceptas nuestros",
      termsOfUse: "Términos de Uso",
      and: "y",
      privacyPolicy: "Política de Privacidad",
      errors: {
        invalidEmail: "Correo inválido",
        phoneMin: "El teléfono debe tener al menos 10 dígitos",
        passwordMin: "La contraseña debe tener al menos 6 caracteres",
        passwordRequired: "La contraseña es obligatoria",
        loginError: "Error de inicio de sesión",
        invalidCredentials: "Correo o contraseña incorrectos",
        registerError: "Error de registro",
        emailExists: "Este correo ya está registrado. Intenta iniciar sesión.",
        genericError: "Ocurrió un error inesperado. Inténtalo de nuevo.",
      },
      success: {
        accountCreated: "¡Cuenta creada!",
        accountCreatedDesc: "Ya puedes acceder al sistema.",
      },
    },
    common: {
      back: "Volver",
      lastUpdate: "Última actualización",
      error: "Error",
    },
    terms: {
      title: "Términos de Uso",
      readCarefully: "LEA ATENTAMENTE ESTOS TÉRMINOS DE USO ANTES DE ACCEDER O UTILIZAR LA PLATAFORMA EUGINE ANALYTICS. AL ACCEDER O UTILIZAR LOS SERVICIOS, USTED DECLARA QUE HA LEÍDO, COMPRENDIDO Y ACEPTA ESTAR VINCULADO A ESTOS TÉRMINOS. SI NO ESTÁ DE ACUERDO CON ALGUNA DISPOSICIÓN AQUÍ ESTABLECIDA, INTERRUMPA INMEDIATAMENTE EL ACCESO A LA PLATAFORMA.",
      section1: {
        title: "1. DEFINICIONES E INTERPRETACIÓN",
        intro: "Para los fines de estos Términos de Uso, se aplican las siguientes definiciones:",
        company: "se refiere a GS ITALYINVESTMENTS, persona jurídica debidamente constituida y existente bajo las leyes del Estado de Florida, Estados Unidos de América, con operaciones ininterrumpidas desde 2015, siendo la única titular, propietaria y operadora de la Plataforma EUGINE Analytics.",
        platform: "designa el producto tecnológico, software y sistema de análisis de datos deportivos desarrollado, mantenido y operado exclusivamente por GS ITALYINVESTMENTS, incluyendo todas sus funcionalidades, interfaces, algoritmos, APIs e infraestructura tecnológica.",
        user: "cualquier persona física o jurídica que acceda, utilice o interactúe con la Plataforma, independientemente de tener una cuenta registrada.",
        services: "todos los recursos, funcionalidades, análisis, datos e información disponibles a través de la Plataforma.",
        content: "todo material disponible en la Plataforma, incluyendo, pero no limitado a, textos, gráficos, datos, análisis, algoritmos, software, marcas y elementos visuales.",
        clarification: "EUGINE Analytics es una plataforma tecnológica y NO constituye una persona jurídica autónoma, siendo íntegramente propiedad de GS ITALYINVESTMENTS, que asume toda la responsabilidad legal, operativa y regulatoria relacionada con su operación.",
      },
      section2: {
        title: "2. ACEPTACIÓN DE LOS TÉRMINOS",
        p1: "Al acceder o utilizar la Plataforma EUGINE Analytics, el Usuario manifiesta su conformidad integral e irrestricta con todos los términos y condiciones aquí establecidos, así como con nuestra Política de Privacidad, que se incorpora a estos Términos por referencia.",
        p2: "GS ITALYINVESTMENTS se reserva el derecho de modificar, alterar, agregar o eliminar cualquier disposición de estos Términos en cualquier momento, a su exclusivo criterio. Tales modificaciones entrarán en vigor inmediatamente después de su publicación en la Plataforma.",
        p3: "El uso continuado de la Plataforma después de la publicación de cambios constituye aceptación tácita de los nuevos términos. Es responsabilidad del Usuario revisar periódicamente estos Términos.",
      },
      section3: {
        title: "3. DESCRIPCIÓN DE LOS SERVICIOS",
        p1: "EUGINE Analytics es una plataforma tecnológica propietaria que ofrece servicios de análisis de datos deportivos, procesamiento de información estadística y generación de insights basados en algoritmos propietarios desarrollados por GS ITALYINVESTMENTS.",
        p2: "Los Servicios incluyen, sin limitación:",
        list: [
          "Análisis algorítmico de cuotas y mercados deportivos",
          "Procesamiento de datos estadísticos en tiempo real",
          "Generación de informes analíticos y tendencias de mercado",
          "Herramientas de visualización de datos y dashboards",
          "Sistemas de alertas y notificaciones personalizadas",
        ],
        p3: "Los Servicios se proporcionan exclusivamente con fines informativos, educativos y de entretenimiento. GS ITALYINVESTMENTS no ofrece, directa o indirectamente, servicios de apuestas, asesoría financiera, recomendaciones de inversión o cualquier forma de asesoramiento profesional.",
      },
      section4: {
        title: "4. PERÍODO DE PRUEBA Y SUSCRIPCIÓN",
        p1: "GS ITALYINVESTMENTS podrá, a su exclusivo criterio, ofrecer un período de prueba gratuito (\"Trial\") para nuevos Usuarios, según las condiciones y plazos establecidos en el momento del registro.",
        p2: "El acceso a los recursos premium de la Plataforma después del término del período de prueba está condicionado a la contratación de un plan de suscripción, según la tabla de precios vigente.",
        p3: "GS ITALYINVESTMENTS se reserva el derecho de modificar precios, planes y condiciones de suscripción en cualquier momento, con aviso previo a los Usuarios activos.",
      },
      section5: {
        title: "5. CUENTA DEL USUARIO Y SEGURIDAD",
        p1: "Para acceder a ciertos recursos de la Plataforma, el Usuario deberá crear una cuenta, proporcionando información verdadera, precisa, actual y completa.",
        p2: "El Usuario es íntegramente responsable de:",
        list: [
          "Mantener la confidencialidad de sus credenciales de acceso",
          "Todas las actividades realizadas en su cuenta",
          "Notificar inmediatamente a GS ITALYINVESTMENTS sobre cualquier uso no autorizado",
          "Actualizar su información de registro cuando sea necesario",
        ],
        p3: "GS ITALYINVESTMENTS se reserva el derecho de suspender o cancelar cuentas que violen estos Términos, sin previo aviso y sin derecho a reembolso.",
      },
      section6: {
        title: "6. PROPIEDAD INTELECTUAL",
        p1: "La Plataforma EUGINE Analytics, incluyendo, sin limitación, su marca, nombre, logotipo, diseño, interfaz, código fuente, algoritmos, metodologías, base de datos, documentación y todo el Contenido, son propiedad exclusiva de GS ITALYINVESTMENTS o sus licenciantes, protegidos por las leyes de propiedad intelectual de Estados Unidos y tratados internacionales aplicables.",
        p2: "Ninguna disposición de estos Términos transfiere al Usuario ningún derecho de propiedad intelectual sobre la Plataforma o su Contenido. Se concede al Usuario únicamente una licencia limitada, no exclusiva, intransferible y revocable para uso personal de la Plataforma.",
        p3: "Sin autorización previa por escrito de GS ITALYINVESTMENTS, está expresamente prohibido:",
        list: [
          "Reproducir, distribuir, modificar o crear obras derivadas del Contenido",
          "Realizar ingeniería inversa, descompilar o desmontar cualquier componente de la Plataforma",
          "Eliminar o alterar avisos de derechos de autor o marcas registradas",
          "Utilizar la Plataforma para fines comerciales no autorizados",
          "Recopilar datos de la Plataforma por medios automatizados (scraping, crawling)",
        ],
      },
      section7: {
        title: "7. CONDUCTA DEL USUARIO",
        p1: "Al utilizar la Plataforma, el Usuario se compromete a:",
        list: [
          "Cumplir con todas las leyes y regulaciones aplicables en su jurisdicción",
          "No utilizar la Plataforma para actividades ilegales o fraudulentas",
          "No interferir con la operación normal de la Plataforma o sus sistemas",
          "No transmitir virus, malware o código malicioso",
          "No compartir credenciales de acceso con terceros",
          "Respetar los derechos de propiedad intelectual de terceros",
        ],
        p2: "La violación de cualquier disposición de esta sección podrá resultar en la terminación inmediata del acceso a la Plataforma, sin perjuicio de otras medidas legales aplicables.",
      },
      section8: {
        title: "8. EXENCIÓN DE GARANTÍAS",
        p1: "LA PLATAFORMA EUGINE ANALYTICS Y TODOS LOS SERVICIOS SE PROPORCIONAN \"TAL CUAL\" (AS IS) Y \"SEGÚN DISPONIBILIDAD\" (AS AVAILABLE), SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS O IMPLÍCITAS.",
        p2: "GS ITALYINVESTMENTS NO GARANTIZA QUE:",
        list: [
          "Los Servicios serán ininterrumpidos, seguros o libres de errores",
          "Los resultados obtenidos a través de la Plataforma serán precisos o confiables",
          "La calidad de los Servicios cumplirá con las expectativas del Usuario",
          "Cualquier error en el software será corregido",
        ],
        p3: "EL USUARIO RECONOCE EXPRESAMENTE QUE LOS ANÁLISIS E INFORMACIÓN PROPORCIONADOS POR LA PLATAFORMA NO CONSTITUYEN GARANTÍA DE RESULTADOS ESPECÍFICOS, GANANCIAS O BENEFICIOS FINANCIEROS.",
      },
      section9: {
        title: "9. LIMITACIÓN DE RESPONSABILIDAD",
        p1: "EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE, GS ITALYINVESTMENTS, SUS DIRECTORES, EMPLEADOS, AGENTES, SOCIOS Y LICENCIANTES NO SERÁN RESPONSABLES POR:",
        list: [
          "Daños directos, indirectos, incidentales, especiales, consecuentes o punitivos",
          "Pérdida de ganancias, ingresos, datos, uso u otras pérdidas intangibles",
          "Cualquier pérdida financiera derivada de decisiones basadas en información de la Plataforma",
          "Interrupciones, retrasos o fallos en los Servicios",
          "Acciones de terceros o eventos de fuerza mayor",
        ],
        p2: "EN NINGÚN CASO LA RESPONSABILIDAD TOTAL DE GS ITALYINVESTMENTS EXCEDERÁ EL MONTO EFECTIVAMENTE PAGADO POR EL USUARIO POR LOS SERVICIOS EN LOS DOCE (12) MESES ANTERIORES A LA OCURRENCIA DEL EVENTO QUE DIO ORIGEN A LA RECLAMACIÓN.",
        p3: "EL USUARIO RECONOCE QUE LAS APUESTAS DEPORTIVAS IMPLICAN UN RIESGO SUSTANCIAL DE PÉRDIDA FINANCIERA Y QUE EL USO DE LA PLATAFORMA ES DE SU EXCLUSIVA RESPONSABILIDAD.",
      },
      section10: {
        title: "10. INDEMNIZACIÓN",
        p1: "El Usuario acepta indemnizar, defender y eximir de responsabilidad a GS ITALYINVESTMENTS, sus directores, empleados, agentes y socios de cualquier reclamación, pérdida, daño, responsabilidad, costo y gasto (incluidos honorarios de abogados) derivados de:",
        list: [
          "Violación de estos Términos por el Usuario",
          "Violación de derechos de terceros por el Usuario",
          "Uso indebido o no autorizado de la Plataforma",
          "Cualquier contenido enviado o transmitido por el Usuario a través de la Plataforma",
        ],
      },
      section11: {
        title: "11. TERMINACIÓN",
        p1: "GS ITALYINVESTMENTS podrá, a su exclusivo criterio y sin previo aviso, suspender o terminar el acceso del Usuario a la Plataforma, por cualquier motivo, incluyendo, sin limitación, violación de estos Términos.",
        p2: "El Usuario podrá cancelar su cuenta en cualquier momento mediante solicitud a través de los canales oficiales de atención.",
        p3: "Las disposiciones relativas a propiedad intelectual, limitación de responsabilidad, indemnización, ley aplicable y jurisdicción permanecerán vigentes después de la terminación de estos Términos.",
      },
      section12: {
        title: "12. DISPOSICIONES GENERALES",
        agreement: "Estos Términos, junto con la Política de Privacidad, constituyen el acuerdo completo entre el Usuario y GS ITALYINVESTMENTS con respecto al uso de la Plataforma, sustituyendo cualquier acuerdo anterior.",
        severability: "Si alguna disposición de estos Términos se considera inválida o inaplicable, las demás disposiciones permanecerán en pleno vigor y efecto.",
        waiver: "La omisión o tolerancia de GS ITALYINVESTMENTS para exigir el cumplimiento de cualquier disposición de estos Términos no constituirá una renuncia al derecho de hacerlo posteriormente.",
        assignment: "El Usuario no podrá ceder o transferir estos Términos o cualquier derecho aquí establecido sin el consentimiento previo por escrito de GS ITALYINVESTMENTS.",
      },
      section13: {
        title: "13. LEY APLICABLE Y JURISDICCIÓN",
        p1: "Estos Términos se regirán e interpretarán de acuerdo con las leyes del Estado de Florida, Estados Unidos de América, sin considerar conflictos de principios legales.",
        p2: "Cualquier disputa, controversia o reclamación derivada de estos Términos o relacionada con ellos, incluyendo su validez, interpretación, ejecución o terminación, se someterá a la jurisdicción exclusiva de los tribunales estatales y federales ubicados en el Estado de Florida, Estados Unidos de América.",
        p3: "El Usuario renuncia expresamente a cualquier objeción respecto al foro o jurisdicción establecida en esta cláusula.",
      },
      section14: {
        title: "14. CONTACTO",
        p1: "Para preguntas, consultas o solicitudes relacionadas con estos Términos de Uso, el Usuario podrá contactar a GS ITALYINVESTMENTS a través de los canales oficiales de atención disponibles en la Plataforma.",
        p2: "Todas las notificaciones legales deberán enviarse a las direcciones oficiales de GS ITALYINVESTMENTS, Estado de Florida, Estados Unidos de América.",
      },
      declaration: {
        title: "DECLARACIÓN DE ENTIDAD RESPONSABLE",
        text: "La Plataforma EUGINE Analytics es un producto tecnológico desarrollado, operado y mantenido exclusivamente por GS ITALYINVESTMENTS, empresa establecida en el Estado de Florida, Estados Unidos de América, desde 2015. Toda la infraestructura tecnológica, procesamiento de datos, operaciones, cumplimiento regulatorio y obligaciones legales relacionadas con la Plataforma son responsabilidad exclusiva de GS ITALYINVESTMENTS.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
    privacy: {
      title: "Política de Privacidad",
      section1: {
        title: "1. Introducción",
        text: "GS ITALYINVESTMENTS, propietaria y operadora de la Plataforma EUGINE Analytics, está comprometida a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos su información personal.",
      },
      section2: {
        title: "2. Información que Recopilamos",
        intro: "Recopilamos la siguiente información cuando utiliza nuestro servicio:",
        registration: "Información de Registro:",
        registrationList: [
          "Dirección de correo electrónico",
          "Número de teléfono",
          "Contraseña (almacenada de forma cifrada)",
        ],
        usage: "Información de Uso:",
        usageList: [
          "Fecha y hora de acceso",
          "Páginas visitadas",
          "Interacciones con el sistema",
          "Dispositivo y navegador utilizados",
        ],
      },
      section3: {
        title: "3. Cómo Usamos su Información",
        intro: "Utilizamos su información para:",
        list: [
          "Proporcionar y mantener nuestros servicios",
          "Personalizar su experiencia",
          "Enviar comunicaciones importantes sobre el servicio",
          "Procesar transacciones y gestionar su cuenta",
          "Mejorar nuestros algoritmos y análisis",
          "Prevenir fraudes y garantizar la seguridad",
        ],
      },
      section4: {
        title: "4. Protección de Datos",
        intro: "Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo:",
        list: [
          "Cifrado de datos en tránsito y en reposo",
          "Autenticación segura con tokens JWT",
          "Acceso restringido a datos personales",
          "Monitoreo continuo de seguridad",
          "Copias de seguridad regulares y recuperación ante desastres",
        ],
      },
      section5: {
        title: "5. Compartición de Datos",
        intro: "No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:",
        list: [
          "Cuando lo exija la ley o una orden judicial",
          "Para proteger nuestros derechos legales",
          "Con proveedores de servicios esenciales (procesamiento de pagos, hosting)",
          "En caso de fusión o adquisición de la empresa",
        ],
      },
      section6: {
        title: "6. Sus Derechos",
        intro: "Usted tiene los siguientes derechos respecto a sus datos personales:",
        access: "Solicitar una copia de los datos que mantenemos sobre usted",
        correction: "Corregir información inexacta o incompleta",
        deletion: "Solicitar la eliminación de sus datos personales",
        portability: "Recibir sus datos en formato estructurado",
        opposition: "Oponerse al procesamiento de sus datos",
      },
      section7: {
        title: "7. Cookies y Tecnologías Similares",
        intro: "Utilizamos cookies y tecnologías similares para:",
        list: [
          "Mantenerlo conectado a su cuenta",
          "Recordar sus preferencias",
          "Analizar el uso del servicio",
          "Mejorar el rendimiento del sistema",
        ],
      },
      section8: {
        title: "8. Retención de Datos",
        text: "Conservamos su información personal durante el tiempo necesario para proporcionar nuestros servicios o según lo exija la ley. Después de la cancelación de la cuenta, sus datos se eliminarán dentro de 90 días, excepto cuando exista obligación legal de retención.",
      },
      section9: {
        title: "9. Menores de Edad",
        text: "Nuestros servicios están destinados únicamente a personas mayores de 18 años. No recopilamos intencionalmente información de menores. Si tenemos conocimiento de que hemos recopilado datos de un menor, eliminaremos esa información inmediatamente.",
      },
      section10: {
        title: "10. Cambios en esta Política",
        text: "Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos por correo electrónico o mediante un aviso en nuestro servicio. Recomendamos revisar esta política regularmente.",
      },
      section11: {
        title: "11. Ley Aplicable y Jurisdicción",
        p1: "Esta Política de Privacidad se regirá e interpretará de acuerdo con las leyes del Estado de Florida, Estados Unidos de América.",
        p2: "Cualquier disputa relacionada con esta política se someterá a la jurisdicción exclusiva de los tribunales estatales y federales ubicados en el Estado de Florida, EE.UU.",
      },
      section12: {
        title: "12. Contacto",
        text: "Para ejercer sus derechos o aclarar dudas sobre esta Política de Privacidad, contacte a GS ITALYINVESTMENTS a través de los canales oficiales de atención disponibles en la Plataforma.",
      },
      declaration: {
        title: "CONTROLADOR DE DATOS",
        text: "GS ITALYINVESTMENTS, establecida en el Estado de Florida, Estados Unidos de América, desde 2015, es la controladora de datos responsable del procesamiento de su información personal a través de la Plataforma EUGINE Analytics.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
  },
  it: {
    auth: {
      systemName: "Sistema Intelligente Eugine Analytics",
      login: "Accedi",
      register: "Registrati",
      email: "Email",
      emailPlaceholder: "tua@email.com",
      phone: "Telefono",
      phonePlaceholder: "+39 333 123 4567",
      password: "Password",
      passwordPlaceholder: "••••••••",
      enter: "Entra",
      createAccount: "Crea Account",
      loading: "Attendere...",
      trialMessage: "Ottieni",
      trialDays: "10 giorni gratis",
      trialSuffix: "di accesso creando il tuo account!",
      termsPrefix: "Continuando, accetti i nostri",
      termsOfUse: "Termini di Utilizzo",
      and: "e",
      privacyPolicy: "Informativa sulla Privacy",
      errors: {
        invalidEmail: "Email non valida",
        phoneMin: "Il telefono deve avere almeno 10 cifre",
        passwordMin: "La password deve avere almeno 6 caratteri",
        passwordRequired: "La password è obbligatoria",
        loginError: "Errore di accesso",
        invalidCredentials: "Email o password non corretti",
        registerError: "Errore di registrazione",
        emailExists: "Questa email è già registrata. Prova ad accedere.",
        genericError: "Si è verificato un errore imprevisto. Riprova.",
      },
      success: {
        accountCreated: "Account creato!",
        accountCreatedDesc: "Ora puoi accedere al sistema.",
      },
    },
    common: {
      back: "Indietro",
      lastUpdate: "Ultimo aggiornamento",
      error: "Errore",
    },
    terms: {
      title: "Termini di Utilizzo",
      readCarefully: "LEGGERE ATTENTAMENTE QUESTI TERMINI DI UTILIZZO PRIMA DI ACCEDERE O UTILIZZARE LA PIATTAFORMA EUGINE ANALYTICS. ACCEDENDO O UTILIZZANDO I SERVIZI, DICHIARI DI AVER LETTO, COMPRESO E ACCETTATO DI ESSERE VINCOLATO DA QUESTI TERMINI. SE NON SEI D'ACCORDO CON QUALSIASI DISPOSIZIONE QUI STABILITA, INTERROMPI IMMEDIATAMENTE L'ACCESSO ALLA PIATTAFORMA.",
      section1: {
        title: "1. DEFINIZIONI E INTERPRETAZIONE",
        intro: "Ai fini dei presenti Termini di Utilizzo, si applicano le seguenti definizioni:",
        company: "si riferisce a GS ITALYINVESTMENTS, persona giuridica debitamente costituita ed esistente secondo le leggi dello Stato della Florida, Stati Uniti d'America, con operazioni ininterrotte dal 2015, essendo l'unica titolare, proprietaria e operatrice della Piattaforma EUGINE Analytics.",
        platform: "designa il prodotto tecnologico, software e sistema di analisi dati sportivi sviluppato, mantenuto e gestito esclusivamente da GS ITALYINVESTMENTS, incluse tutte le sue funzionalità, interfacce, algoritmi, API e infrastruttura tecnologica.",
        user: "qualsiasi persona fisica o giuridica che acceda, utilizzi o interagisca con la Piattaforma, indipendentemente dal possesso di un account registrato.",
        services: "tutte le risorse, funzionalità, analisi, dati e informazioni disponibili attraverso la Piattaforma.",
        content: "tutto il materiale disponibile sulla Piattaforma, inclusi, ma non limitati a, testi, grafici, dati, analisi, algoritmi, software, marchi ed elementi visivi.",
        clarification: "EUGINE Analytics è una piattaforma tecnologica e NON costituisce una persona giuridica autonoma, essendo interamente di proprietà di GS ITALYINVESTMENTS, che assume ogni e qualsiasi responsabilità legale, operativa e normativa relativa alla sua operazione.",
      },
      section2: {
        title: "2. ACCETTAZIONE DEI TERMINI",
        p1: "Accedendo o utilizzando la Piattaforma EUGINE Analytics, l'Utente manifesta il proprio accordo integrale e incondizionato con tutti i termini e le condizioni qui stabiliti, nonché con la nostra Informativa sulla Privacy, che è incorporata nei presenti Termini per riferimento.",
        p2: "GS ITALYINVESTMENTS si riserva il diritto di modificare, alterare, aggiungere o rimuovere qualsiasi disposizione dei presenti Termini in qualsiasi momento, a sua esclusiva discrezione. Tali modifiche entreranno in vigore immediatamente dopo la loro pubblicazione sulla Piattaforma.",
        p3: "L'uso continuato della Piattaforma dopo la pubblicazione delle modifiche costituisce accettazione tacita dei nuovi termini. È responsabilità dell'Utente rivedere periodicamente questi Termini.",
      },
      section3: {
        title: "3. DESCRIZIONE DEI SERVIZI",
        p1: "EUGINE Analytics è una piattaforma tecnologica proprietaria che offre servizi di analisi dati sportivi, elaborazione di informazioni statistiche e generazione di insights basati su algoritmi proprietari sviluppati da GS ITALYINVESTMENTS.",
        p2: "I Servizi includono, senza limitazione:",
        list: [
          "Analisi algoritmica di quote e mercati sportivi",
          "Elaborazione di dati statistici in tempo reale",
          "Generazione di report analitici e tendenze di mercato",
          "Strumenti di visualizzazione dati e dashboard",
          "Sistemi di avvisi e notifiche personalizzate",
        ],
        p3: "I Servizi sono forniti esclusivamente a scopo informativo, educativo e di intrattenimento. GS ITALYINVESTMENTS non offre, direttamente o indirettamente, servizi di scommesse, consulenza finanziaria, raccomandazioni di investimento o qualsiasi forma di consulenza professionale.",
      },
      section4: {
        title: "4. PERIODO DI PROVA E ABBONAMENTO",
        p1: "GS ITALYINVESTMENTS può, a sua esclusiva discrezione, offrire un periodo di prova gratuito (\"Trial\") per i nuovi Utenti, secondo le condizioni e i termini stabiliti al momento della registrazione.",
        p2: "L'accesso alle funzionalità premium della Piattaforma dopo il termine del periodo di prova è subordinato alla sottoscrizione di un piano di abbonamento, secondo il listino prezzi vigente.",
        p3: "GS ITALYINVESTMENTS si riserva il diritto di modificare prezzi, piani e condizioni di abbonamento in qualsiasi momento, previo avviso agli Utenti attivi.",
      },
      section5: {
        title: "5. ACCOUNT UTENTE E SICUREZZA",
        p1: "Per accedere a determinate funzionalità della Piattaforma, l'Utente dovrà creare un account, fornendo informazioni vere, accurate, attuali e complete.",
        p2: "L'Utente è interamente responsabile di:",
        list: [
          "Mantenere la riservatezza delle proprie credenziali di accesso",
          "Tutte le attività svolte sul proprio account",
          "Notificare immediatamente GS ITALYINVESTMENTS di qualsiasi uso non autorizzato",
          "Aggiornare le proprie informazioni di registrazione quando necessario",
        ],
        p3: "GS ITALYINVESTMENTS si riserva il diritto di sospendere o chiudere gli account che violano questi Termini, senza preavviso e senza diritto a rimborso.",
      },
      section6: {
        title: "6. PROPRIETÀ INTELLETTUALE",
        p1: "La Piattaforma EUGINE Analytics, inclusi, senza limitazione, il suo marchio, nome, logo, design, interfaccia, codice sorgente, algoritmi, metodologie, database, documentazione e tutto il Contenuto, sono di proprietà esclusiva di GS ITALYINVESTMENTS o dei suoi licenzianti, protetti dalle leggi sulla proprietà intellettuale degli Stati Uniti e dai trattati internazionali applicabili.",
        p2: "Nessuna disposizione di questi Termini trasferisce all'Utente alcun diritto di proprietà intellettuale sulla Piattaforma o sul suo Contenuto. All'Utente viene concessa solo una licenza limitata, non esclusiva, non trasferibile e revocabile per l'uso personale della Piattaforma.",
        p3: "Senza previa autorizzazione scritta di GS ITALYINVESTMENTS, è espressamente vietato:",
        list: [
          "Riprodurre, distribuire, modificare o creare opere derivate dal Contenuto",
          "Effettuare reverse engineering, decompilare o disassemblare qualsiasi componente della Piattaforma",
          "Rimuovere o alterare avvisi di copyright o marchi registrati",
          "Utilizzare la Piattaforma per scopi commerciali non autorizzati",
          "Raccogliere dati dalla Piattaforma con mezzi automatizzati (scraping, crawling)",
        ],
      },
      section7: {
        title: "7. CONDOTTA DELL'UTENTE",
        p1: "Utilizzando la Piattaforma, l'Utente si impegna a:",
        list: [
          "Rispettare tutte le leggi e i regolamenti applicabili nella propria giurisdizione",
          "Non utilizzare la Piattaforma per attività illegali o fraudolente",
          "Non interferire con il normale funzionamento della Piattaforma o dei suoi sistemi",
          "Non trasmettere virus, malware o codice maligno",
          "Non condividere le credenziali di accesso con terzi",
          "Rispettare i diritti di proprietà intellettuale di terzi",
        ],
        p2: "La violazione di qualsiasi disposizione di questa sezione può comportare la cessazione immediata dell'accesso alla Piattaforma, fatto salvo il diritto di adottare altre misure legali applicabili.",
      },
      section8: {
        title: "8. ESCLUSIONE DI GARANZIE",
        p1: "LA PIATTAFORMA EUGINE ANALYTICS E TUTTI I SERVIZI SONO FORNITI \"COSÌ COME SONO\" (AS IS) E \"COME DISPONIBILI\" (AS AVAILABLE), SENZA GARANZIE DI ALCUN TIPO, ESPLICITE O IMPLICITE.",
        p2: "GS ITALYINVESTMENTS NON GARANTISCE CHE:",
        list: [
          "I Servizi saranno ininterrotti, sicuri o privi di errori",
          "I risultati ottenuti attraverso la Piattaforma saranno accurati o affidabili",
          "La qualità dei Servizi soddisferà le aspettative dell'Utente",
          "Eventuali errori nel software saranno corretti",
        ],
        p3: "L'UTENTE RICONOSCE ESPRESSAMENTE CHE LE ANALISI E LE INFORMAZIONI FORNITE DALLA PIATTAFORMA NON COSTITUISCONO GARANZIA DI RISULTATI SPECIFICI, PROFITTI O GUADAGNI FINANZIARI.",
      },
      section9: {
        title: "9. LIMITAZIONE DI RESPONSABILITÀ",
        p1: "NELLA MISURA MASSIMA CONSENTITA DALLA LEGGE APPLICABILE, GS ITALYINVESTMENTS, I SUOI DIRIGENTI, DIPENDENTI, AGENTI, PARTNER E LICENZIANTI NON SARANNO RESPONSABILI PER:",
        list: [
          "Danni diretti, indiretti, incidentali, speciali, consequenziali o punitivi",
          "Perdita di profitti, ricavi, dati, uso o altre perdite intangibili",
          "Qualsiasi perdita finanziaria derivante da decisioni basate sulle informazioni della Piattaforma",
          "Interruzioni, ritardi o guasti nei Servizi",
          "Azioni di terzi o eventi di forza maggiore",
        ],
        p2: "IN NESSUN CASO LA RESPONSABILITÀ TOTALE DI GS ITALYINVESTMENTS SUPERERÀ L'IMPORTO EFFETTIVAMENTE PAGATO DALL'UTENTE PER I SERVIZI NEI DODICI (12) MESI PRECEDENTI IL VERIFICARSI DELL'EVENTO CHE HA DATO ORIGINE AL RECLAMO.",
        p3: "L'UTENTE RICONOSCE CHE LE SCOMMESSE SPORTIVE COMPORTANO UN RISCHIO SOSTANZIALE DI PERDITA FINANZIARIA E CHE L'UTILIZZO DELLA PIATTAFORMA È DI SUA ESCLUSIVA RESPONSABILITÀ.",
      },
      section10: {
        title: "10. INDENNIZZO",
        p1: "L'Utente accetta di indennizzare, difendere e manlevare GS ITALYINVESTMENTS, i suoi dirigenti, dipendenti, agenti e partner da qualsiasi reclamo, perdita, danno, responsabilità, costo e spesa (incluse le spese legali) derivanti da:",
        list: [
          "Violazione di questi Termini da parte dell'Utente",
          "Violazione dei diritti di terzi da parte dell'Utente",
          "Uso improprio o non autorizzato della Piattaforma",
          "Qualsiasi contenuto inviato o trasmesso dall'Utente attraverso la Piattaforma",
        ],
      },
      section11: {
        title: "11. RISOLUZIONE",
        p1: "GS ITALYINVESTMENTS può, a sua esclusiva discrezione e senza preavviso, sospendere o terminare l'accesso dell'Utente alla Piattaforma, per qualsiasi motivo, inclusa, senza limitazione, la violazione di questi Termini.",
        p2: "L'Utente può chiudere il proprio account in qualsiasi momento mediante richiesta attraverso i canali ufficiali di assistenza.",
        p3: "Le disposizioni relative alla proprietà intellettuale, limitazione di responsabilità, indennizzo, legge applicabile e foro competente rimarranno in vigore dopo la risoluzione di questi Termini.",
      },
      section12: {
        title: "12. DISPOSIZIONI GENERALI",
        agreement: "Questi Termini, insieme all'Informativa sulla Privacy, costituiscono l'intero accordo tra l'Utente e GS ITALYINVESTMENTS relativamente all'uso della Piattaforma, sostituendo qualsiasi accordo precedente.",
        severability: "Se qualsiasi disposizione di questi Termini viene ritenuta non valida o inapplicabile, le restanti disposizioni rimarranno pienamente in vigore.",
        waiver: "L'omissione o la tolleranza di GS ITALYINVESTMENTS nell'esigere il rispetto di qualsiasi disposizione di questi Termini non costituirà rinuncia al diritto di farlo successivamente.",
        assignment: "L'Utente non può cedere o trasferire questi Termini o qualsiasi diritto qui stabilito senza il previo consenso scritto di GS ITALYINVESTMENTS.",
      },
      section13: {
        title: "13. LEGGE APPLICABILE E FORO COMPETENTE",
        p1: "Questi Termini saranno regolati e interpretati in conformità con le leggi dello Stato della Florida, Stati Uniti d'America, senza riguardo ai conflitti di principi giuridici.",
        p2: "Qualsiasi controversia, disputa o reclamo derivante da questi Termini o ad essi correlata, inclusa la loro validità, interpretazione, esecuzione o risoluzione, sarà sottoposta alla giurisdizione esclusiva dei tribunali statali e federali situati nello Stato della Florida, Stati Uniti d'America.",
        p3: "L'Utente rinuncia espressamente a qualsiasi obiezione relativa al foro o alla giurisdizione stabilita in questa clausola.",
      },
      section14: {
        title: "14. CONTATTO",
        p1: "Per domande, richieste o informazioni relative a questi Termini di Utilizzo, l'Utente può contattare GS ITALYINVESTMENTS attraverso i canali ufficiali di assistenza disponibili sulla Piattaforma.",
        p2: "Tutte le notifiche legali devono essere inviate agli indirizzi ufficiali di GS ITALYINVESTMENTS, Stato della Florida, Stati Uniti d'America.",
      },
      declaration: {
        title: "DICHIARAZIONE DI ENTITÀ RESPONSABILE",
        text: "La Piattaforma EUGINE Analytics è un prodotto tecnologico sviluppato, gestito e mantenuto esclusivamente da GS ITALYINVESTMENTS, società stabilita nello Stato della Florida, Stati Uniti d'America, dal 2015. Tutta l'infrastruttura tecnologica, l'elaborazione dei dati, le operazioni, la conformità normativa e gli obblighi legali relativi alla Piattaforma sono di esclusiva responsabilità di GS ITALYINVESTMENTS.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
    privacy: {
      title: "Informativa sulla Privacy",
      section1: {
        title: "1. Introduzione",
        text: "GS ITALYINVESTMENTS, proprietaria e operatrice della Piattaforma EUGINE Analytics, si impegna a proteggere la tua privacy. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, conserviamo e proteggiamo le tue informazioni personali.",
      },
      section2: {
        title: "2. Informazioni che Raccogliamo",
        intro: "Raccogliamo le seguenti informazioni quando utilizzi il nostro servizio:",
        registration: "Informazioni di Registrazione:",
        registrationList: [
          "Indirizzo email",
          "Numero di telefono",
          "Password (conservata in forma crittografata)",
        ],
        usage: "Informazioni di Utilizzo:",
        usageList: [
          "Data e ora di accesso",
          "Pagine visitate",
          "Interazioni con il sistema",
          "Dispositivo e browser utilizzati",
        ],
      },
      section3: {
        title: "3. Come Utilizziamo le Tue Informazioni",
        intro: "Utilizziamo le tue informazioni per:",
        list: [
          "Fornire e mantenere i nostri servizi",
          "Personalizzare la tua esperienza",
          "Inviare comunicazioni importanti sul servizio",
          "Elaborare transazioni e gestire il tuo account",
          "Migliorare i nostri algoritmi e analisi",
          "Prevenire frodi e garantire la sicurezza",
        ],
      },
      section4: {
        title: "4. Protezione dei Dati",
        intro: "Implementiamo misure di sicurezza tecniche e organizzative per proteggere le tue informazioni, tra cui:",
        list: [
          "Crittografia dei dati in transito e a riposo",
          "Autenticazione sicura con token JWT",
          "Accesso limitato ai dati personali",
          "Monitoraggio continuo della sicurezza",
          "Backup regolari e disaster recovery",
        ],
      },
      section5: {
        title: "5. Condivisione dei Dati",
        intro: "Non vendiamo, noleggiamo o condividiamo le tue informazioni personali con terzi, tranne:",
        list: [
          "Quando richiesto dalla legge o da un ordine del tribunale",
          "Per proteggere i nostri diritti legali",
          "Con fornitori di servizi essenziali (elaborazione pagamenti, hosting)",
          "In caso di fusione o acquisizione dell'azienda",
        ],
      },
      section6: {
        title: "6. I Tuoi Diritti",
        intro: "Hai i seguenti diritti riguardo ai tuoi dati personali:",
        access: "Richiedere una copia dei dati che conserviamo su di te",
        correction: "Correggere informazioni inesatte o incomplete",
        deletion: "Richiedere la cancellazione dei tuoi dati personali",
        portability: "Ricevere i tuoi dati in formato strutturato",
        opposition: "Opporti al trattamento dei tuoi dati",
      },
      section7: {
        title: "7. Cookie e Tecnologie Simili",
        intro: "Utilizziamo cookie e tecnologie simili per:",
        list: [
          "Mantenerti connesso al tuo account",
          "Ricordare le tue preferenze",
          "Analizzare l'utilizzo del servizio",
          "Migliorare le prestazioni del sistema",
        ],
      },
      section8: {
        title: "8. Conservazione dei Dati",
        text: "Conserviamo le tue informazioni personali per il tempo necessario a fornire i nostri servizi o come richiesto dalla legge. Dopo la chiusura dell'account, i tuoi dati saranno cancellati entro 90 giorni, salvo obbligo legale di conservazione.",
      },
      section9: {
        title: "9. Minori",
        text: "I nostri servizi sono destinati esclusivamente a persone di età pari o superiore a 18 anni. Non raccogliamo intenzionalmente informazioni da minori. Se veniamo a conoscenza di aver raccolto dati da un minore, cancelleremo immediatamente tali informazioni.",
      },
      section10: {
        title: "10. Modifiche a questa Informativa",
        text: "Potremmo aggiornare periodicamente questa Informativa sulla Privacy. Ti informeremo di modifiche significative tramite email o avviso sul nostro servizio. Ti consigliamo di rivedere regolarmente questa informativa.",
      },
      section11: {
        title: "11. Legge Applicabile e Foro Competente",
        p1: "Questa Informativa sulla Privacy sarà regolata e interpretata in conformità con le leggi dello Stato della Florida, Stati Uniti d'America.",
        p2: "Qualsiasi controversia relativa a questa informativa sarà sottoposta alla giurisdizione esclusiva dei tribunali statali e federali situati nello Stato della Florida, USA.",
      },
      section12: {
        title: "12. Contatto",
        text: "Per esercitare i tuoi diritti o chiarire dubbi su questa Informativa sulla Privacy, contatta GS ITALYINVESTMENTS attraverso i canali ufficiali di assistenza disponibili sulla Piattaforma.",
      },
      declaration: {
        title: "TITOLARE DEL TRATTAMENTO",
        text: "GS ITALYINVESTMENTS, stabilita nello Stato della Florida, Stati Uniti d'America, dal 2015, è il titolare del trattamento responsabile dell'elaborazione delle tue informazioni personali attraverso la Piattaforma EUGINE Analytics.",
      },
      footer: "EUGINE Analytics™ • Powered by GS ITALYINVESTMENTS • Florida, USA • Since 2015",
    },
  },
};
