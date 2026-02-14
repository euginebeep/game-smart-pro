import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import avatarPt from '@/assets/avatar-pt.png';
import avatarEn from '@/assets/avatar-en.png';
import avatarEs from '@/assets/avatar-es.png';
import avatarIt from '@/assets/avatar-it.png';

const avatarByLang: Record<string, string> = {
  pt: avatarPt,
  en: avatarEn,
  es: avatarEs,
  it: avatarIt,
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/eugine-chat`;

const QUICK_QUESTIONS: Record<string, string[]> = {
  pt: ['Como o EUGINE funciona?', 'Qual plano escolher?', 'É confiável?', 'Como cancelar?'],
  en: ['How does EUGINE work?', 'Which plan to choose?', 'Is it reliable?', 'How to cancel?'],
  es: ['¿Cómo funciona EUGINE?', '¿Qué plan elegir?', '¿Es confiable?', '¿Cómo cancelar?'],
  it: ['Come funziona EUGINE?', 'Quale piano scegliere?', 'È affidabile?', 'Come cancellare?'],
};

const WELCOME_MSG: Record<string, string> = {
  pt: 'Olá! 👋 Sou o assistente do EUGINE. Como posso te ajudar hoje?',
  en: 'Hello! 👋 I\'m the EUGINE assistant. How can I help you today?',
  es: '¡Hola! 👋 Soy el asistente de EUGINE. ¿Cómo puedo ayudarte hoy?',
  it: 'Ciao! 👋 Sono l\'assistente di EUGINE. Come posso aiutarti oggi?',
};

const HEADER_TITLE: Record<string, string> = {
  pt: 'Assistente EUGINE',
  en: 'EUGINE Assistant',
  es: 'Asistente EUGINE',
  it: 'Assistente EUGINE',
};

const PLACEHOLDER: Record<string, string> = {
  pt: 'Faça sua pergunta...',
  en: 'Ask your question...',
  es: 'Haz tu pregunta...',
  it: 'Fai la tua domanda...',
};

export function EugineChat() {
  const { language } = useLanguage();
  const avatar = avatarByLang[language] || avatarPt;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MSG[language] || WELCOME_MSG.pt }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      // Map scroll percentage to vertical position (80px from top to 80px from bottom)
      const minTop = 80;
      const maxTop = window.innerHeight - 80;
      setScrollY(minTop + scrollPercent * (maxTop - minTop));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Reset messages when language changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME_MSG[language] || WELCOME_MSG.pt }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-10),
          language,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao conectar');
      }

      if (!resp.body) throw new Error('Stream não disponível');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar mensagem');
      if (!assistantContent) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, houve um erro. Tente novamente.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center overflow-hidden animate-[bounce_2s_infinite]"
          style={{ top: `${scrollY}px`, transition: 'top 0.15s ease-out' }}
          aria-label="Abrir chat"
        >
          <img src={avatar} alt="Assistente EUGINE" className="w-full h-full object-cover" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">{HEADER_TITLE[language] || HEADER_TITLE.pt}</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {msg.content || (isLoading && i === messages.length - 1 ? '...' : '')}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {(QUICK_QUESTIONS[language] || QUICK_QUESTIONS.pt).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-3 py-1 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={PLACEHOLDER[language] || PLACEHOLDER.pt}
                disabled={isLoading}
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="rounded-lg px-3">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
