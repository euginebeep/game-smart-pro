import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import eugineLogo from '@/assets/eugine-logo.png';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  phone: z.string().trim().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }).max(15),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const result = signInSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Erro no login",
              description: "Email ou senha incorretos",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro no login",
              description: error.message,
              variant: "destructive",
            });
          }
        }
      } else {
        const result = signUpSchema.safeParse({ email, phone, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              phone: phone.trim(),
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Erro no cadastro",
              description: "Este email já está cadastrado. Tente fazer login.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Conta criada!",
            description: "Você já pode acessar o sistema.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-2 sm:mb-3">
          <div className="inline-flex items-center justify-center">
            <img 
              src={eugineLogo} 
              alt="EUGINE Logo" 
              loading="eager"
              decoding="async"
              className="w-72 h-72 sm:w-96 md:w-[480px] sm:h-96 md:h-[480px] object-contain drop-shadow-2xl"
            />
          </div>
          <p className="text-slate-400 text-sm sm:text-base -mt-4 sm:-mt-6">Sistema Inteligente Eugine Analytics</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aguarde...
                </>
              ) : isLogin ? (
                'Entrar'
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {!isLogin && (
            <p className="text-center text-slate-400 text-sm mt-4">
              ✨ Ganhe <span className="text-emerald-400 font-semibold">10 dias grátis</span> de acesso ao criar sua conta!
            </p>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-4 sm:mt-6">
          Ao continuar, você concorda com nossos{' '}
          <Link to="/termos-de-uso" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link to="/politica-de-privacidade" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}