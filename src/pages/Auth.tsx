import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Phone, Lock, Loader2, ArrowLeft, Crown, Globe } from 'lucide-react';
import eugineLogo from '@/assets/eugine-logo-new.png';
import { z } from 'zod';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AuthMode = 'login' | 'register' | 'reset';

// Country data with phone codes and timezones
const COUNTRIES = [
  { code: 'BR', name: 'Brasil', phoneCode: '+55', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { code: 'US', name: 'United States', phoneCode: '+1', timezone: 'America/New_York', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351', timezone: 'Europe/Lisbon', flag: '🇵🇹' },
  { code: 'ES', name: 'España', phoneCode: '+34', timezone: 'Europe/Madrid', flag: '🇪🇸' },
  { code: 'IT', name: 'Italia', phoneCode: '+39', timezone: 'Europe/Rome', flag: '🇮🇹' },
  { code: 'DE', name: 'Deutschland', phoneCode: '+49', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { code: 'FR', name: 'France', phoneCode: '+33', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44', timezone: 'Europe/London', flag: '🇬🇧' },
  { code: 'AR', name: 'Argentina', phoneCode: '+54', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
  { code: 'MX', name: 'México', phoneCode: '+52', timezone: 'America/Mexico_City', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', phoneCode: '+57', timezone: 'America/Bogota', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', phoneCode: '+56', timezone: 'America/Santiago', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', phoneCode: '+51', timezone: 'America/Lima', flag: '🇵🇪' },
  { code: 'JP', name: '日本', phoneCode: '+81', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', phoneCode: '+61', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', timezone: 'America/Toronto', flag: '🇨🇦' },
];

export default function Auth() {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get selected country data
  const countryData = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  const signUpSchema = z.object({
    email: z.string().trim().email({ message: t('auth.errors.invalidEmail') }),
    phone: z.string().trim().min(8, { message: t('auth.errors.phoneMin') }).max(20),
    password: z.string().min(6, { message: t('auth.errors.passwordMin') }),
    country: z.string().min(2, { message: t('auth.errors.countryRequired') }),
  });

  const signInSchema = z.object({
    email: z.string().trim().email({ message: t('auth.errors.invalidEmail') }),
    password: z.string().min(1, { message: t('auth.errors.passwordRequired') }),
  });

  const resetSchema = z.object({
    email: z.string().trim().email({ message: t('auth.errors.invalidEmail') }),
  });

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
      if (mode === 'reset') {
        const result = resetSchema.safeParse({ email });
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

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          toast({
            title: t('auth.errors.resetError'),
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: t('auth.success.resetSent'),
            description: t('auth.success.resetSentDesc'),
          });
          setMode('login');
          setEmail('');
        }
      } else if (mode === 'login') {
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
              title: t('auth.errors.loginError'),
              description: t('auth.errors.invalidCredentials'),
              variant: "destructive",
            });
          } else {
            toast({
              title: t('auth.errors.loginError'),
              description: error.message,
              variant: "destructive",
            });
          }
        }
      } else {
        const fullPhone = `${countryData.phoneCode} ${phone.trim()}`;
        const result = signUpSchema.safeParse({ email, phone, password, country: selectedCountry });
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
              phone: fullPhone,
              country_code: selectedCountry,
              timezone: countryData.timezone,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            toast({
              title: t('auth.errors.registerError'),
              description: t('auth.errors.emailExists'),
              variant: "destructive",
            });
          } else {
            toast({
              title: t('auth.errors.registerError'),
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: t('auth.success.accountCreated'),
            description: t('auth.success.accountCreatedDesc'),
          });
        }
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.genericError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="mb-4">
          <LanguageSelector />
        </div>

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
          <p className="text-slate-400 text-sm sm:text-base -mt-4 sm:-mt-6">{t('auth.systemName')}</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl">
          {mode === 'reset' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin')}
              </button>
              <h2 className="text-xl font-bold text-white mb-2">{t('auth.resetPassword')}</h2>
            </>
          ) : (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {t('auth.login')}
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {t('auth.register')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-slate-300">{t('auth.country')}</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <SelectValue placeholder={t('auth.selectCountry')} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                      {COUNTRIES.map((country) => (
                        <SelectItem 
                          key={country.code} 
                          value={country.code}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700"
                        >
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                            <span className="text-slate-400 text-sm">({country.phoneCode})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-red-400 text-sm">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">{t('auth.phone')}</Label>
                  <div className="relative flex gap-2">
                    <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-md px-3 text-slate-400 text-sm min-w-[70px] justify-center">
                      {countryData.phoneCode}
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t('auth.phonePlaceholder')}
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>
              </>
            )}

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
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
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
              >
                {t('auth.forgotPassword')}
              </button>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('auth.loading')}
                </>
              ) : mode === 'reset' ? (
                t('auth.sendResetLink')
              ) : mode === 'login' ? (
                t('auth.enter')
              ) : (
                t('auth.createAccount')
              )}
            </Button>
          </form>

          {mode === 'register' && (
            <div className="text-center mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold text-sm">PREMIUM</span>
              </div>
              <p className="text-slate-300 text-sm">
                ✨ {t('auth.trialMessage')} <span className="text-emerald-400 font-semibold">{t('auth.trialDays')}</span> {t('auth.trialSuffix')}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-4 sm:mt-6">
          {t('auth.termsPrefix')}{' '}
          <Link to="/termos-de-uso" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
            {t('auth.termsOfUse')}
          </Link>{' '}
          {t('auth.and')}{' '}
          <Link to="/politica-de-privacidade" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
            {t('auth.privacyPolicy')}
          </Link>
        </p>
      </div>
    </div>
  );
}
