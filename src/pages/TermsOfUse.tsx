import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function TermsOfUse() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/auth" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <LanguageSelector />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t('terms.title')}</h1>
          <p className="text-muted-foreground">{t('common.lastUpdate')}: 14 January 2026</p>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 space-y-8 text-muted-foreground border border-border/50" style={{ background: 'hsl(var(--card))' }}>
          <section><p className="leading-relaxed text-foreground/90 font-medium">{t('terms.readCarefully')}</p></section>

          <section><h2 className="text-xl font-bold text-foreground mb-4">{t('terms.section1.title')}</h2><div className="space-y-3"><p className="leading-relaxed"><strong className="text-foreground">1.1.</strong> {t('terms.section1.intro')}</p><ul className="space-y-2 ml-6"><li><strong className="text-primary">"Company"</strong> / <strong className="text-primary">"GS ITALY INVESTMENTS"</strong>: {t('terms.section1.company')}</li><li><strong className="text-primary">"Platform"</strong> / <strong className="text-primary">"EUGINE Analytics"</strong>: {t('terms.section1.platform')}</li><li><strong className="text-primary">"User"</strong>: {t('terms.section1.user')}</li><li><strong className="text-primary">"Services"</strong>: {t('terms.section1.services')}</li><li><strong className="text-primary">"Content"</strong>: {t('terms.section1.content')}</li></ul><p className="leading-relaxed"><strong className="text-foreground">1.2.</strong> {t('terms.section1.clarification')}</p></div></section>

          {[2,3,4,5,6,7,8,9,10,11].map(num => {
            const section = `terms.section${num}` as const;
            const sectionData = t(section as any) as any;
            if (!sectionData) return null;
            return (
              <section key={num}>
                <h2 className="text-xl font-bold text-foreground mb-4">{t(`${section}.title` as any)}</h2>
                <div className="space-y-3">
                  {['p1','p2','p3'].map(p => {
                    const text = t(`${section}.${p}` as any);
                    if (!text || typeof text !== 'string') return null;
                    return <p key={p} className="leading-relaxed"><strong className="text-foreground">{num}.{p === 'p1' ? '1' : p === 'p2' ? '2' : '3'}.</strong> {text}</p>;
                  })}
                  {(() => {
                    const list = t(`${section}.list` as any);
                    if (!list || !Array.isArray(list)) return null;
                    return <ul className="list-disc list-inside ml-6 space-y-1">{(list as string[]).map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>;
                  })()}
                </div>
              </section>
            );
          })}

          <section><h2 className="text-xl font-bold text-foreground mb-4">{t('terms.section12.title')}</h2><div className="space-y-3"><p className="leading-relaxed"><strong className="text-foreground">12.1.</strong> <strong>{t('terms.section12.agreement').split(':')[0]}:</strong> {t('terms.section12.agreement').includes(':') ? t('terms.section12.agreement').split(':').slice(1).join(':') : t('terms.section12.agreement')}</p><p className="leading-relaxed"><strong className="text-foreground">12.2.</strong> <strong>Severability:</strong> {t('terms.section12.severability')}</p><p className="leading-relaxed"><strong className="text-foreground">12.3.</strong> <strong>Waiver:</strong> {t('terms.section12.waiver')}</p><p className="leading-relaxed"><strong className="text-foreground">12.4.</strong> <strong>Assignment:</strong> {t('terms.section12.assignment')}</p></div></section>

          <section><h2 className="text-xl font-bold text-foreground mb-4">{t('terms.section13.title')}</h2><div className="space-y-3"><p className="leading-relaxed"><strong className="text-foreground">13.1.</strong> {t('terms.section13.p1')}</p><p className="leading-relaxed"><strong className="text-foreground">13.2.</strong> {t('terms.section13.p2')}</p><p className="leading-relaxed"><strong className="text-foreground">13.3.</strong> {t('terms.section13.p3')}</p></div></section>

          <section><h2 className="text-xl font-bold text-foreground mb-4">{t('terms.section14.title')}</h2><div className="space-y-3"><p className="leading-relaxed"><strong className="text-foreground">14.1.</strong> {t('terms.section14.p1')}</p><p className="leading-relaxed"><strong className="text-foreground">14.2.</strong> {t('terms.section14.p2')}</p></div></section>

          <section className="p-6 rounded-xl border border-primary/20 bg-primary/5">
            <h2 className="text-xl font-bold text-primary mb-4">{t('terms.declaration.title')}</h2>
            <p className="leading-relaxed text-foreground/90">{t('terms.declaration.text')}</p>
          </section>

          <div className="pt-6 border-t border-border/30">
            <p className="text-sm text-muted-foreground/60 text-center">{t('terms.footer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
