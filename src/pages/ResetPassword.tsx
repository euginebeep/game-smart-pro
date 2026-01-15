import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from 'lucide-react';
import eugineLogo from '@/assets/eugine-logo-new.png';
import { z } from 'zod';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ResetPassword() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordSchema = z.object({
    password: z.string().min(6, { message: t('auth.errors.passwordMin') }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.errors.passwordMismatch'),
    path: ['confirmPassword'],
  });

  useEffect(() => {
    // Check if user came from a password reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL hash for recovery token (Supabase appends it to the URL)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Set the session from the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (!error) {
          setIsValidSession(true);
        } else {
          toast({
            title: t('auth.errors.resetError'),
            description: t('auth.errors.invalidResetLink'),
            variant: "destructive",
          });
          navigate('/auth');
        }
      } else if (session) {
        // User already has a session (maybe clicked link while logged in)
        setIsValidSession(true);
      } else {
        toast({
          title: t('auth.errors.resetError'),
          description: t('auth.errors.invalidResetLink'),
          variant: "destructive",
        });
        navigate('/auth');
      }
      
      setCheckingSession(false);
    };

    checkSession();

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
          setCheckingSession(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const result = passwordSchema.safeParse({ password, confirmPassword });
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

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: t('auth.errors.resetError'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSuccess(true);
        toast({
          title: t('auth.success.passwordUpdated'),
          description: t('auth.success.passwordUpdatedDesc'),
        });
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
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

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!isValidSession) {
    return null;
  }

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

        {/* Reset Password Card */}
        <div className="glass-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t('auth.success.passwordUpdated')}</h2>
              <p className="text-slate-400">{t('auth.success.redirecting')}</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">{t('auth.newPassword')}</h2>
              <p className="text-slate-400 text-sm mb-6">{t('auth.newPasswordDesc')}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">{t('auth.newPasswordLabel')}</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                </div>

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
                  ) : (
                    t('auth.updatePassword')
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
