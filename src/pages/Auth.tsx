import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Phone, Lock, Loader2, ArrowLeft, Sparkles, Globe, Shield } from 'lucide-react';
import eugineLogo from '@/assets/eugine-logo-new.png';
import { z } from 'zod';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import ParticlesBackground from '@/components/ParticlesBackground';
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
  const [underageError, setUnderageError] = useState(false);
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
          navigate('/dashboard');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/dashboard');
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
        // Check for underage FIRST before any other validation
        if (birthDate && !validateAge(birthDate)) {
          setUnderageError(true);
          setLoading(false);
          return;
        }
        setUnderageError(false);
        
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        toast({
          title: t('auth.errors.loginError'),
          description: error.message,
          variant: "destructive",
        });
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Particles Background */}
      <ParticlesBackground />
      
      {/* Background Effects - Cyan Theme */}
      <div className="absolute inset-0 circuit-pattern pointer-events-none opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md relative z-10">
        {/* Language Selector - Centered at Top */}
        <div className="mb-6 flex justify-center">
          <LanguageSelector />
        </div>

        {/* Logo/Brand - Improved Brain Icon */}
        <div className="text-center mb-6">
          {/* Stylized Brain Icon */}
          <div className="inline-flex items-center justify-center mb-4 relative">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center animate-glow relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(185 100% 50%) 0%, hsl(220 80% 50%) 50%, hsl(260 80% 60%) 100%)',
                boxShadow: '0 0 40px hsla(185, 100%, 50%, 0.4), 0 0 80px hsla(220, 80%, 50%, 0.2)',
              }}
            >
              {/* Abstract brain pattern */}
              <svg viewBox="0 0 64 64" className="w-12 h-12 text-white">
                {/* Central neural core */}
                <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.9"/>
                
                {/* Brain hemispheres */}
                <path d="M20 24c-4 0-8 4-8 10s4 10 8 10c2 0 4-1 5-3" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.85"/>
                <path d="M44 24c4 0 8 4 8 10s-4 10-8 10c-2 0-4-1-5-3" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.85"/>
                
                {/* Neural connections */}
                <path d="M25 29c4-2 10-2 14 0" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
                <path d="M25 35c4 2 10 2 14 0" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
                
                {/* Top wave patterns */}
                <path d="M18 20c3-4 8-6 14-6s11 2 14 6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
                <path d="M22 16c2-2 6-4 10-4s8 2 10 4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
                
                {/* Pulse dots */}
                <circle cx="20" cy="32" r="2" fill="currentColor" className="animate-pulse"/>
                <circle cx="44" cy="32" r="2" fill="currentColor" className="animate-pulse"/>
                <circle cx="32" cy="22" r="1.5" fill="currentColor" className="animate-pulse"/>
                <circle cx="32" cy="42" r="1.5" fill="currentColor" className="animate-pulse"/>
              </svg>
            </div>
            {/* Glow ring effect */}
            <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-primary/30 animate-pulse" />
          </div>
          
          <h1 className="font-display text-3xl font-bold">
            <span className="text-foreground">EUGINE</span>
            <span className="text-primary text-lg ml-2">v4.0</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">{t('auth.systemName')}</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-6 sm:p-8 rounded-xl border border-border">
          {mode === 'reset' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin')}
              </button>
              <h2 className="text-xl font-bold text-foreground mb-2">{t('auth.resetPassword')}</h2>
            </>
          ) : (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('auth.login')}
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('auth.register')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                />
              </div>
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-foreground">{t('auth.country')}</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder={t('auth.selectCountry')} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-60">
                      {COUNTRIES.map((country) => (
                        <SelectItem 
                          key={country.code} 
                          value={country.code}
                          className="text-foreground hover:bg-secondary focus:bg-secondary"
                        >
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                            <span className="text-muted-foreground text-sm">({country.phoneCode})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-destructive text-sm">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">{t('auth.phone')}</Label>
                  <div className="relative flex gap-2">
                    <div className="flex items-center bg-input border border-border rounded-md px-3 text-muted-foreground text-sm min-w-[70px] justify-center">
                      {countryData.phoneCode}
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const masked = applyPhoneMask(e.target.value, selectedCountry);
                          setPhone(masked);
                        }}
                        placeholder={selectedCountry === 'BR' ? '(11) 99999-9999' : countryData.phoneExample}
                        className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {countryData.phoneDigits.min === countryData.phoneDigits.max 
                      ? `${countryData.phoneDigits.min} ${t('auth.phoneDigitsRequired')}`
                      : `${countryData.phoneDigits.min}-${countryData.phoneDigits.max} ${t('auth.phoneDigitsRequired')}`
                    }
                  </p>
                  {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
                </div>

                {/* State (for Brazil) */}
                {selectedCountry === 'BR' && (
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-foreground">{t('profile.state')}</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder={t('profile.selectState')} />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-h-60">
                        {BRAZILIAN_STATES.map((s) => (
                          <SelectItem 
                            key={s.code} 
                            value={s.code}
                            className="text-foreground hover:bg-secondary focus:bg-secondary"
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
                  <Label htmlFor="city" className="text-foreground">{t('profile.city')}</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t('profile.cityPlaceholder')}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    maxLength={100}
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-foreground">{t('auth.birthDate')} *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      // Check age immediately on change
                      if (e.target.value && !validateAge(e.target.value)) {
                        setUnderageError(true);
                      } else {
                        setUnderageError(false);
                      }
                    }}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-muted-foreground text-xs">{t('auth.birthDateHint')}</p>
                  {errors.birthDate && <p className="text-destructive text-sm">{errors.birthDate}</p>}
                  
                  {/* Underage Warning Alert */}
                  {underageError && (
                    <div className="mt-3 p-4 bg-destructive/20 border-2 border-destructive rounded-lg animate-pulse">
                      <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-destructive" />
                        <span className="text-destructive font-bold text-sm">
                          {t('auth.underageNotAllowed')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="pl-10 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-primary hover:text-primary/80 text-sm transition-colors"
              >
                {t('auth.forgotPassword')}
              </button>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
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

            {/* Social Login Buttons - Only for login mode */}
            {mode === 'login' && (
              <div className="mt-6 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Google Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border-gray-300 font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>

                  {/* Facebook Button */}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2] font-medium"
                    onClick={() => {
                      toast({
                        title: t('common.comingSoon'),
                        description: t('auth.facebookComingSoon'),
                      });
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            )}
          </form>

          {mode === 'register' && (
            <div className="text-center mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold text-sm">PREMIUM</span>
              </div>
              <p className="text-muted-foreground text-sm">
                ✨ {t('auth.trialMessage')} <span className="text-primary font-semibold">{t('auth.trialDays')}</span> {t('auth.trialSuffix')}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4 sm:mt-6">
          {t('auth.termsPrefix')}{' '}
          <Link to="/termos-de-uso" className="text-primary hover:text-primary/80 underline transition-colors">
            {t('auth.termsOfUse')}
          </Link>{' '}
          {t('auth.and')}{' '}
          <Link to="/politica-de-privacidade" className="text-primary hover:text-primary/80 underline transition-colors">
            {t('auth.privacyPolicy')}
          </Link>
        </p>
      </div>
    </div>
  );
}
