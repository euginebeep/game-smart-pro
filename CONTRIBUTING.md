# Guia de Contribuição - EUGINE

Obrigado por considerar contribuir para o EUGINE! Este documento fornece diretrizes para garantir um processo de contribuição suave e consistente.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Relatando Bugs](#relatando-bugs)

---

## Código de Conduta

Este projeto segue um código de conduta que esperamos que todos os contribuidores sigam. Por favor, seja respeitoso e profissional em todas as interações.

---

## Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório pelo GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/eugine.git
cd eugine

# Adicione o upstream
git remote add upstream https://github.com/original/eugine.git
```

### 2. Crie uma Branch

```bash
# Mantenha seu fork atualizado
git fetch upstream
git checkout main
git merge upstream/main

# Crie uma branch para sua contribuição
git checkout -b feat/nome-da-feature
```

### 3. Faça suas Alterações

- Siga os padrões de código descritos abaixo
- Adicione testes quando aplicável
- Atualize a documentação se necessário

### 4. Commit e Push

```bash
git add .
git commit -m "feat: descrição clara da mudança"
git push origin feat/nome-da-feature
```

---

## Padrões de Código

### TypeScript

- Use `strict` mode
- Prefira interfaces sobre types para objetos
- Use nomes descritivos em inglês
- Documente funções complexas com JSDoc

```typescript
/**
 * Calcula a probabilidade implícita a partir das odds
 * @param odds - Odds decimais do mercado
 * @returns Probabilidade em porcentagem (0-100)
 */
function calculateImpliedProbability(odds: number): number {
  if (odds <= 0) return 0;
  return Math.round((1 / odds) * 100);
}
```

### React

- Use functional components com hooks
- Prefira composição sobre herança
- Extraia lógica complexa para custom hooks
- Memoize componentes pesados com `React.memo`

### CSS / Tailwind

- Use design tokens do sistema (`bg-primary`, `text-foreground`)
- Evite classes customizadas quando possível
- Mantenha responsividade em mente (mobile-first)

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `GameCard.tsx` |
| Hooks | camelCase + use prefix | `useAuth.tsx` |
| Funções | camelCase, verbo | `fetchGameData()` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Interfaces | PascalCase + I prefix (opcional) | `Game`, `IGameProps` |

---

## Processo de Pull Request

1. **Antes de abrir o PR:**
   - Execute `npm run lint` e corrija erros
   - Execute `npm run test` e garanta que passam
   - Atualize a documentação se necessário

2. **No PR:**
   - Use título descritivo seguindo Conventional Commits
   - Descreva o que foi alterado e por quê
   - Referencie issues relacionadas (#123)
   - Adicione screenshots para mudanças visuais

3. **Revisão:**
   - Aguarde revisão de pelo menos 1 mantenedor
   - Responda a comentários construtivamente
   - Faça ajustes solicitados em commits adicionais

---

## Relatando Bugs

Ao relatar um bug, inclua:

1. **Descrição clara** do problema
2. **Passos para reproduzir**
3. **Comportamento esperado** vs **comportamento atual**
4. **Screenshots** (se aplicável)
5. **Ambiente** (browser, OS, versão do app)

---

## Dúvidas?

Se tiver dúvidas sobre como contribuir, abra uma issue com a tag `question` ou entre em contato com a equipe de desenvolvimento.

---

<div align="center">
  <p>Obrigado por contribuir! 🙏</p>
</div>
