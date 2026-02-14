import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Phone, MapPin, Building2, Loader2, User, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';
import { applyPhoneMask, getPhoneMaskConfig, removePhoneMask } from '@/lib/phoneMask';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Brazilian states
const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

// Country phone rules
const COUNTRY_PHONE_RULES: Record<string, { min: number; max: number; phoneCode: string }> = {
  BR: { min: 10, max: 11, phoneCode: '+55' },
  US: { min: 10, max: 10, phoneCode: '+1' },
  PT: { min: 9, max: 9, phoneCode: '+351' },
  ES: { min: 9, max: 9, phoneCode: '+34' },
  IT: { min: 9, max: 10, phoneCode: '+39' },
  DE: { min: 10, max: 12, phoneCode: '+49' },
  FR: { min: 9, max: 9, phoneCode: '+33' },
  GB: { min: 10, max: 11, phoneCode: '+44' },
  AR: { min: 10, max: 10, phoneCode: '+54' },
  MX: { min: 10, max: 10, phoneCode: '+52' },
  CO: { min: 10, max: 10, phoneCode: '+57' },
  CL: { min: 9, max: 9, phoneCode: '+56' },
  PE: { min: 9, max: 9, phoneCode: '+51' },
  JP: { min: 10, max: 11, phoneCode: '+81' },
  AU: { min: 9, max: 9, phoneCode: '+61' },
  CA: { min: 10, max: 10, phoneCode: '+1' },
};

export default function Profile() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [countryCode, setCountryCode] = useState('BR');
  const [emailDailyPicks, setEmailDailyPicks] = useState(true);
  const [emailResults, setEmailResults] = useState(true);
  const [preferredTime, setPreferredTime] = useState('10:00');
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      const phoneWithCode = profile.phone || '';
      const phoneRule = COUNTRY_PHONE_RULES[profile.country_code || 'BR'];
      const phoneCode = phoneRule?.phoneCode || '+55';
      const phoneDigits = phoneWithCode.replace(phoneCode, '').replace(/\D/g, '');
      
      setPhone(applyPhoneMask(phoneDigits, profile.country_code || 'BR'));
      setCity(profile.city || '');
      setState(profile.state || '');
      setCountryCode(profile.country_code || 'BR');
    }
  }, [profile]);

  // Load notification preferences
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notification_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setEmailDailyPicks((data as any).email_daily_picks ?? true);
        setEmailResults((data as any).email_results ?? true);
        setPreferredTime((data as any).preferred_time ?? '10:00');
      }
    })();
  }, [user]);

  const handlePhoneChange = (value: string) => {
    const masked = applyPhoneMask(value, countryCode);
    setPhone(masked);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate phone
    const phoneDigits = removePhoneMask(phone);
    const rules = COUNTRY_PHONE_RULES[countryCode];
    
    if (phoneDigits.length < rules.min || phoneDigits.length > rules.max) {
      toast({
        title: t('profile.error'),
        description: t('profile.invalidPhone'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `${rules.phoneCode} ${phoneDigits}`;

      const { error } = await supabase
        .from('profiles')
        .update({
          phone: fullPhone,
          city: city.trim() || null,
          state: state || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('profile.success'),
        description: t('profile.savedSuccessfully'),
      });
    } catch (error: any) {
      toast({
        title: t('profile.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  const phoneConfig = getPhoneMaskConfig(countryCode);
  const phoneRule = COUNTRY_PHONE_RULES[countryCode];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {t('profile.title')}
            </h1>
            <p className="text-muted-foreground">{t('profile.subtitle')}</p>
          </div>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
            <CardDescription>{t('profile.personalInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('profile.email')}</Label>
              <Input value={profile?.email || ''} disabled className="bg-muted" />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t('profile.phone')}</Label>
              <div className="flex gap-2">
                <div className="flex items-center bg-muted border rounded-md px-3 text-muted-foreground text-sm min-w-[70px] justify-center">
                  {phoneRule.phoneCode}
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={phoneConfig.placeholder}
                    maxLength={phoneConfig.maxLength}
                    className="pl-10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {phoneRule.min === phoneRule.max 
                  ? `${phoneRule.min} ${t('auth.phoneDigitsRequired')}`
                  : `${phoneRule.min}-${phoneRule.max} ${t('auth.phoneDigitsRequired')}`
                }
              </p>
            </div>

            {/* State (for Brazil) */}
            {countryCode === 'BR' && (
              <div className="space-y-2">
                <Label htmlFor="state">{t('profile.state')}</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder={t('profile.selectState')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {BRAZILIAN_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">{t('profile.city')}</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('profile.cityPlaceholder')}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t('profile.save')}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {language === 'pt' ? 'Notificações por Email' :
               language === 'es' ? 'Notificaciones por Email' :
               language === 'it' ? 'Notifiche Email' :
               'Email Notifications'}
            </CardTitle>
            <CardDescription>
              {language === 'pt' ? 'Configure quais emails deseja receber' :
               language === 'es' ? 'Configura qué emails deseas recibir' :
               language === 'it' ? 'Configura quali email vuoi ricevere' :
               'Configure which emails you want to receive'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {language === 'pt' ? 'Receber picks do dia' :
                   language === 'es' ? 'Recibir picks del día' :
                   language === 'it' ? 'Ricevi i pick del giorno' :
                   'Receive daily picks'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt' ? 'Melhores apostas do dia no seu email' :
                   language === 'es' ? 'Las mejores apuestas del día en tu email' :
                   language === 'it' ? 'Le migliori scommesse del giorno nella tua email' :
                   'Best bets of the day in your email'}
                </p>
              </div>
              <Switch checked={emailDailyPicks} onCheckedChange={setEmailDailyPicks} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {language === 'pt' ? 'Receber resultados' :
                   language === 'es' ? 'Recibir resultados' :
                   language === 'it' ? 'Ricevi risultati' :
                   'Receive results'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt' ? 'Veja se as sugestões acertaram' :
                   language === 'es' ? 'Mira si las sugerencias acertaron' :
                   language === 'it' ? 'Vedi se i suggerimenti hanno avuto successo' :
                   'See if the suggestions were correct'}
                </p>
              </div>
              <Switch checked={emailResults} onCheckedChange={setEmailResults} />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'pt' ? 'Horário preferido' :
                 language === 'es' ? 'Horario preferido' :
                 language === 'it' ? 'Orario preferito' :
                 'Preferred time'}
              </Label>
              <Select value={preferredTime} onValueChange={setPreferredTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['08:00', '09:00', '10:00', '11:00'].map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={async () => {
                if (!user) return;
                setNotifLoading(true);
                try {
                  await supabase.from('notification_preferences' as any).upsert({
                    user_id: user.id,
                    email_daily_picks: emailDailyPicks,
                    email_results: emailResults,
                    preferred_time: preferredTime,
                    updated_at: new Date().toISOString(),
                  } as any);
                  toast({ title: t('profile.success'), description: t('profile.savedSuccessfully') });
                } catch (err: any) {
                  toast({ title: t('profile.error'), description: err.message, variant: 'destructive' });
                } finally {
                  setNotifLoading(false);
                }
              }}
              disabled={notifLoading}
              className="w-full"
            >
              {notifLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t('profile.save')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
