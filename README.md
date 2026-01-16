# EUGINE Analytics

Sistema de Análise de Apostas Esportivas desenvolvido pela GS ItalyInvestments.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ ([instalar via nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm ou bun

### Instalação

```bash
# 1. Clonar o repositório
git clone <YOUR_GIT_URL>
cd eugine-analytics

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, TypeScript, Vite |
| Estilização | Tailwind CSS, shadcn/ui |
| Estado | React Query (TanStack) |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth |
| Pagamentos | Stripe |
| API de Odds | API-Football |

## 📁 Estrutura do Projeto

```
eugine-analytics/
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # Custom hooks (useAuth, useAdmin)
│   ├── contexts/       # Context providers
│   ├── services/       # Serviços de API
│   ├── integrations/   # Cliente Supabase (auto-gerado)
│   └── types/          # TypeScript types
├── supabase/
│   ├── functions/      # Edge Functions (Deno)
│   └── config.toml     # Configuração Supabase
├── docs/               # Documentação técnica
└── public/             # Assets estáticos
```

## 🔧 Configuração de Ambiente

As variáveis de ambiente são gerenciadas automaticamente pelo Lovable Cloud:

```env
VITE_SUPABASE_URL=<auto>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto>
VITE_SUPABASE_PROJECT_ID=<auto>
```

### Secrets (Backend)

Configurados via Lovable Cloud Dashboard:

| Secret | Descrição |
|--------|-----------|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `API_FOOTBALL_KEY` | Chave da API-Football |
| `RESEND_API_KEY` | Chave para envio de emails |

## 📦 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run test     # Executar testes
npm run lint     # Linting do código
```

## 🗄️ Banco de Dados

### Tabelas Principais

- `profiles` - Perfis de usuário e dados de assinatura
- `daily_searches` - Controle de buscas diárias
- `active_sessions` - Sessões ativas (single-device)
- `subscription_plans` - Planos de assinatura
- `user_roles` - Roles de usuário (admin/user)
- `odds_cache` - Cache de odds da API

### Funções SQL

- `increment_search_count(user_id)` - Incrementa contador de buscas
- `get_remaining_searches(user_id)` - Retorna buscas restantes
- `has_role(user_id, role)` - Verifica role do usuário

## ⚡ Edge Functions

| Função | Rota | Descrição |
|--------|------|-----------|
| `fetch-odds` | POST | Busca odds da API-Football |
| `check-subscription` | GET | Verifica status da assinatura |
| `validate-session` | POST | Valida sessão ativa |
| `create-checkout` | POST | Cria sessão Stripe Checkout |
| `customer-portal` | POST | Acesso ao portal Stripe |
| `stripe-webhook` | POST | Webhook do Stripe |
| `admin-users` | GET/POST | Gerenciamento de usuários |
| `send-trial-reminder` | POST | Emails de lembrete trial |

## 🔐 Segurança

- **RLS (Row Level Security)** em todas as tabelas
- **Hash SHA-256** para tokens de sessão
- **Single-device** enforcement
- **Rate limiting** por tier de assinatura
- **JWT validation** via `getClaims()` nas Edge Functions

## 💳 Planos de Assinatura

| Plano | Buscas/Dia | Preço |
|-------|------------|-------|
| Trial | 3 | Grátis (3 dias) |
| Basic | 1 | R$ 29,90/mês |
| Advanced | 3 | R$ 49,90/mês |
| Premium | 6 | R$ 89,90/mês |

## 🚢 Deploy

### Deploy Automático (Lovable)

1. Faça commit das alterações
2. Push para o repositório GitHub conectado
3. Lovable detecta e deploya automaticamente

### Deploy Manual

```bash
# Build de produção
npm run build

# Os arquivos estarão em dist/
```

## 📚 Documentação Adicional

- [Especificação Técnica Completa](docs/EUGINE_TECHNICAL_SPECIFICATION.md)
- [Versão HTML para PDF](public/docs/eugine-specs.html)

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -m 'feat: adiciona nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Abra um Pull Request

## 📄 Licença

© 2015-2026 GS ItalyInvestments. Todos os direitos reservados.
