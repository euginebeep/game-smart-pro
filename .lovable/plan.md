
# WhatsApp: Enviar Imagem PNG em vez de Texto

## Objetivo
Quando o usuario clicar em "WhatsApp", gerar a mesma imagem PNG do relatorio (identica ao botao "Imagem") e compartilhar via WhatsApp usando a Web Share API do navegador, em vez de enviar apenas texto.

## Abordagem Tecnica

### Por que mudar a abordagem
- Atualmente o WhatsApp envia apenas texto via `wa.me/?text=...`
- O usuario quer enviar a mesma imagem PNG gerada pelo botao "Imagem"
- Para compartilhar imagens no WhatsApp, usaremos a **Web Share API** (`navigator.share`) que permite enviar arquivos diretamente
- Fallback: se o navegador nao suportar Web Share API (desktop antigo), baixa o PNG e abre o WhatsApp com texto resumido

### Mudancas no `src/components/ReportExportSection.tsx`

1. **Extrair logica de geracao de PNG** para uma funcao reutilizavel `generateReportCanvas()` que retorna o canvas
2. **Reescrever `shareViaWhatsApp()`**:
   - Chamar `generateReportCanvas()` para gerar o canvas
   - Converter canvas para Blob (PNG)
   - Criar um `File` a partir do Blob
   - Usar `navigator.share({ files: [file], title, text })` para abrir o compartilhamento nativo (que inclui WhatsApp)
   - Se `navigator.canShare` nao estiver disponivel, fazer fallback: baixar o PNG + abrir wa.me com texto
3. **Adicionar estado `sharingWhatsApp`** para mostrar loading no botao durante a geracao da imagem
4. **`exportAsImage()`** passara a usar a mesma funcao `generateReportCanvas()` para evitar duplicacao

### Fluxo do Usuario
1. Clica no botao WhatsApp
2. Ve o spinner enquanto a imagem e gerada (mesmo processo do PNG)
3. Abre o menu de compartilhamento nativo do celular/desktop
4. Seleciona WhatsApp e envia a imagem diretamente

### Detalhes de Implementacao

```text
shareViaWhatsApp()
  |
  v
generateReportCanvas()  -- mesma logica do exportAsImage
  |
  v
canvas.toBlob('image/png')
  |
  v
navigator.canShare({files}) ?
  |--- SIM --> navigator.share({files, title, text})
  |--- NAO --> download PNG + window.open(wa.me)
```

### Traducoes
- Nenhuma nova chave necessaria, o botao ja esta traduzido em todos os idiomas
