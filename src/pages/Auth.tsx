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

// Country data with phone codes, timezones, and phone validation rules
const COUNTRIES = [
  { code: 'BR', name: 'Brasil', phoneCode: '+55', timezone: 'America/Sao_Paulo', flag: '🇧🇷', phoneDigits: { min: 10, max: 11 }, phoneExample: '11999999999' },
  { code: 'US', name: 'United States', phoneCode: '+1', timezone: 'America/New_York', flag: '🇺🇸', phoneDigits: { min: 10, max: 10 }, phoneExample: '2025551234' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351', timezone: 'Europe/Lisbon', flag: '🇵🇹', phoneDigits: { min: 9, max: 9 }, phoneExample: '912345678' },
  { code: 'ES', name: 'España', phoneCode: '+34', timezone: 'Europe/Madrid', flag: '🇪🇸', phoneDigits: { min: 9, max: 9 }, phoneExample: '612345678' },
  { code: 'IT', name: 'Italia', phoneCode: '+39', timezone: 'Europe/Rome', flag: '🇮🇹', phoneDigits: { min: 9, max: 10 }, phoneExample: '3123456789' },
  { code: 'DE', name: 'Deutschland', phoneCode: '+49', timezone: 'Europe/Berlin', flag: '🇩🇪', phoneDigits: { min: 10, max: 12 }, phoneExample: '15123456789' },
  { code: 'FR', name: 'France', phoneCode: '+33', timezone: 'Europe/Paris', flag: '🇫🇷', phoneDigits: { min: 9, max: 9 }, phoneExample: '612345678' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44', timezone: 'Europe/London', flag: '🇬🇧', phoneDigits: { min: 10, max: 11 }, phoneExample: '7911123456' },
  { code: 'AR', name: 'Argentina', phoneCode: '+54', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷', phoneDigits: { min: 10, max: 10 }, phoneExample: '1123456789' },
  { code: 'MX', name: 'México', phoneCode: '+52', timezone: 'America/Mexico_City', flag: '🇲🇽', phoneDigits: { min: 10, max: 10 }, phoneExample: '5512345678' },
  { code: 'CO', name: 'Colombia', phoneCode: '+57', timezone: 'America/Bogota', flag: '🇨🇴', phoneDigits: { min: 10, max: 10 }, phoneExample: '3001234567' },
  { code: 'CL', name: 'Chile', phoneCode: '+56', timezone: 'America/Santiago', flag: '🇨🇱', phoneDigits: { min: 9, max: 9 }, phoneExample: '912345678' },
  { code: 'PE', name: 'Perú', phoneCode: '+51', timezone: 'America/Lima', flag: '🇵🇪', phoneDigits: { min: 9, max: 9 }, phoneExample: '912345678' },
  { code: 'JP', name: '日本', phoneCode: '+81', timezone: 'Asia/Tokyo', flag: '🇯🇵', phoneDigits: { min: 10, max: 11 }, phoneExample: '9012345678' },
  { code: 'AU', name: 'Australia', phoneCode: '+61', timezone: 'Australia/Sydney', flag: '🇦🇺', phoneDigits: { min: 9, max: 9 }, phoneExample: '412345678' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', timezone: 'America/Toronto', flag: '🇨🇦', phoneDigits: { min: 10, max: 10 }, phoneExample: '4165551234' },
];

// Helper function to get phone validation error message
const getPhoneValidationMessage = (countryCode: string, t: (key: string) => string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return t('auth.errors.phoneInvalid');
  
  const { min, max } = country.phoneDigits;
  if (min === max) {
    return t('auth.errors.phoneExactDigits').replace('{digits}', min.toString()).replace('{example}', country.phoneExample);
  }
  return t('auth.errors.phoneRangeDigits')
    .replace('{min}', min.toString())
    .replace('{max}', max.toString())
    .replace('{example}', country.phoneExample);
};

// Validate phone based on country
const validatePhoneForCountry = (phone: string, countryCode: string): boolean => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return false;
  
  // Remove non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  const { min, max } = country.phoneDigits;
  
  return digitsOnly.length >= min && digitsOnly.length <= max;
};

// Brazilian states
const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' }, { code: 'AL', name: 'Alagoas' }, { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' }, { code: 'BA', name: 'Bahia' }, { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' }, { code: 'ES', name: 'Espírito Santo' }, { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' }, { code: 'MT', name: 'Mato Grosso' }, { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' }, { code: 'PA', name: 'Pará' }, { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' }, { code: 'PE', name: 'Pernambuco' }, { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' }, { code: 'RN', name: 'Rio Grande do Norte' }, { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' }, { code: 'RR', name: 'Roraima' }, { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' }, { code: 'SE', name: 'Sergipe' }, { code: 'TO', name: 'Tocantins' },
];

// Phone mask function
const applyPhoneMask = (value: string, countryCode: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (countryCode === 'BR') {
    // Brazilian format: (11) 99999-9999
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  
  if (countryCode === 'US' || countryCode === 'CA') {
    // US/Canada format: (202) 555-1234
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  
  // Default: just add spaces every 3 digits
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
};

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
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get selected country data
  const countryData = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  // Helper function to validate age (must be 18+)
  const validateAge = (dateString: string): boolean => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const signUpSchema = z.object({
    email: z.string().trim().email({ message: t('auth.errors.invalidEmail') }),
    phone: z.string().trim()
      .refine((val) => /^\d+$/.test(val.replace(/[\s\-\(\)]/g, '')), { 
        message: t('auth.errors.phoneOnlyDigits') 
      })
      .refine((val) => validatePhoneForCountry(val, selectedCountry), { 
        message: getPhoneValidationMessage(selectedCountry, t) 
      }),
    password: z.string().min(6, { message: t('auth.errors.passwordMin') }),
    country: z.string().min(2, { message: t('auth.errors.countryRequired') }),
    birthDate: z.string()
      .min(1, { message: t('auth.errors.birthDateRequired') })
      .refine((val) => validateAge(val), { message: t('auth.errors.mustBe18') }),
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
        const phoneDigits = phone.replace(/\D/g, '');
        const fullPhone = `${countryData.phoneCode} ${phoneDigits}`;
        const result = signUpSchema.safeParse({ email, phone: phoneDigits, password, country: selectedCountry, birthDate });
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
              city: city.trim() || null,
              state: state || null,
              birth_date: birthDate,
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
                        onChange={(e) => {
                          const masked = applyPhoneMask(e.target.value, selectedCountry);
                          setPhone(masked);
                        }}
                        placeholder={selectedCountry === 'BR' ? '(11) 99999-9999' : countryData.phoneExample}
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {countryData.phoneDigits.min === countryData.phoneDigits.max 
                      ? `${countryData.phoneDigits.min} ${t('auth.phoneDigitsRequired')}`
                      : `${countryData.phoneDigits.min}-${countryData.phoneDigits.max} ${t('auth.phoneDigitsRequired')}`
                    }
                  </p>
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>

                {/* State (for Brazil) */}
                {selectedCountry === 'BR' && (
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-300">{t('profile.state')}</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder={t('profile.selectState')} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                        {BRAZILIAN_STATES.map((s) => (
                          <SelectItem 
                            key={s.code} 
                            value={s.code}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
                          >
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-slate-300">{t('profile.city')}</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t('profile.cityPlaceholder')}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    maxLength={100}
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-slate-300">{t('auth.birthDate')} *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <p className="text-slate-500 text-xs">{t('auth.birthDateHint')}</p>
                  {errors.birthDate && <p className="text-red-400 text-sm">{errors.birthDate}</p>}
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
