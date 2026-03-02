import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { StandardFooter } from '@/components/StandardFooter';

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/auth" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <LanguageSelector />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t('privacy.title')}</h1>
          <p className="text-muted-foreground">{t('common.lastUpdate')}: 14 January 2026</p>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 space-y-6 text-muted-foreground border border-border/50" style={{ background: 'hsl(var(--card))' }}>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section1.title')}</h2>
            <p className="leading-relaxed">{t('privacy.section1.text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section2.title')}</h2>
            <p className="leading-relaxed mb-3">{t('privacy.section2.intro')}</p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-primary">{t('privacy.section2.registration')}</h3>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  {(t('privacy.section2.registrationList') as unknown as string[]).map((item: string, index: number) => (<li key={index}>{item}</li>))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-primary">{t('privacy.section2.usage')}</h3>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  {(t('privacy.section2.usageList') as unknown as string[]).map((item: string, index: number) => (<li key={index}>{item}</li>))}
                </ul>
              </div>
            </div>
          </section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section3.title')}</h2><p className="leading-relaxed">{t('privacy.section3.intro')}</p><ul className="list-disc list-inside mt-2 space-y-1 ml-4">{(t('privacy.section3.list') as unknown as string[]).map((item: string, index: number) => (<li key={index}>{item}</li>))}</ul></section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section4.title')}</h2><p className="leading-relaxed">{t('privacy.section4.intro')}</p><ul className="list-disc list-inside mt-2 space-y-1 ml-4">{(t('privacy.section4.list') as unknown as string[]).map((item: string, index: number) => (<li key={index}>{item}</li>))}</ul></section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section5.title')}</h2><p className="leading-relaxed">{t('privacy.section5.intro')}</p><ul className="list-disc list-inside mt-2 space-y-1 ml-4">{(t('privacy.section5.list') as unknown as string[]).map((item: string, index: number) => (<li key={index}>{item}</li>))}</ul></section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section6.title')}</h2>
            <p className="leading-relaxed">{t('privacy.section6.intro')}</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>{t('privacy.section6.access').split(':')[0]}:</strong> {t('privacy.section6.access').includes(':') ? t('privacy.section6.access').split(':').slice(1).join(':').trim() : t('privacy.section6.access')}</li>
              <li><strong>{t('privacy.section6.correction').split(':')[0]}:</strong> {t('privacy.section6.correction').includes(':') ? t('privacy.section6.correction').split(':').slice(1).join(':').trim() : t('privacy.section6.correction')}</li>
              <li><strong>{t('privacy.section6.deletion').split(':')[0]}:</strong> {t('privacy.section6.deletion').includes(':') ? t('privacy.section6.deletion').split(':').slice(1).join(':').trim() : t('privacy.section6.deletion')}</li>
              <li><strong>{t('privacy.section6.portability').split(':')[0]}:</strong> {t('privacy.section6.portability').includes(':') ? t('privacy.section6.portability').split(':').slice(1).join(':').trim() : t('privacy.section6.portability')}</li>
              <li><strong>{t('privacy.section6.opposition').split(':')[0]}:</strong> {t('privacy.section6.opposition').includes(':') ? t('privacy.section6.opposition').split(':').slice(1).join(':').trim() : t('privacy.section6.opposition')}</li>
            </ul>
          </section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section7.title')}</h2><p className="leading-relaxed">{t('privacy.section7.intro')}</p><ul className="list-disc list-inside mt-2 space-y-1 ml-4">{(t('privacy.section7.list') as unknown as string[]).map((item: string, index: number) => (<li key={index}>{item}</li>))}</ul></section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section8.title')}</h2><p className="leading-relaxed">{t('privacy.section8.text')}</p></section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section9.title')}</h2><p className="leading-relaxed">{t('privacy.section9.text')}</p></section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section10.title')}</h2><p className="leading-relaxed">{t('privacy.section10.text')}</p></section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section11.title')}</h2><div className="space-y-3"><p className="leading-relaxed">{t('privacy.section11.p1')}</p><p className="leading-relaxed">{t('privacy.section11.p2')}</p></div></section>
          <section><h2 className="text-xl font-bold text-foreground mb-3">{t('privacy.section12.title')}</h2><p className="leading-relaxed">{t('privacy.section12.text')}</p></section>
          <section className="p-6 rounded-xl border border-primary/20 bg-primary/5">
            <h2 className="text-xl font-bold text-primary mb-4">{t('privacy.declaration.title')}</h2>
            <p className="leading-relaxed text-foreground/90">{t('privacy.declaration.text')}</p>
          </section>
          <div className="pt-6 border-t border-border/30">
            <p className="text-sm text-muted-foreground/60 text-center">{t('privacy.footer')}</p>
          </div>
        <StandardFooter className="mt-8" />
        </div>
      </div>
    </div>
  );
}
