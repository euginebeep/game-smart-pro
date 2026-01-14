import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/auth" 
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <LanguageSelector />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {t('privacy.title')}
          </h1>
          <p className="text-slate-400">{t('common.lastUpdate')}: 14 January 2026</p>
        </div>

        {/* Content */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6 text-slate-300">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section1.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section1.text')}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section2.title')}</h2>
            <p className="leading-relaxed mb-3">
              {t('privacy.section2.intro')}
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-emerald-400">{t('privacy.section2.registration')}</h3>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  {(t('privacy.section2.registrationList') as unknown as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">{t('privacy.section2.usage')}</h3>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  {(t('privacy.section2.usageList') as unknown as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section3.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section3.intro')}
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              {(t('privacy.section3.list') as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section4.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section4.intro')}
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              {(t('privacy.section4.list') as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section5.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section5.intro')}
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              {(t('privacy.section5.list') as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section6.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section6.intro')}
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>{t('privacy.section6.access').split(':')[0]}:</strong> {t('privacy.section6.access').includes(':') ? t('privacy.section6.access').split(':').slice(1).join(':').trim() : t('privacy.section6.access')}</li>
              <li><strong>{t('privacy.section6.correction').split(':')[0]}:</strong> {t('privacy.section6.correction').includes(':') ? t('privacy.section6.correction').split(':').slice(1).join(':').trim() : t('privacy.section6.correction')}</li>
              <li><strong>{t('privacy.section6.deletion').split(':')[0]}:</strong> {t('privacy.section6.deletion').includes(':') ? t('privacy.section6.deletion').split(':').slice(1).join(':').trim() : t('privacy.section6.deletion')}</li>
              <li><strong>{t('privacy.section6.portability').split(':')[0]}:</strong> {t('privacy.section6.portability').includes(':') ? t('privacy.section6.portability').split(':').slice(1).join(':').trim() : t('privacy.section6.portability')}</li>
              <li><strong>{t('privacy.section6.opposition').split(':')[0]}:</strong> {t('privacy.section6.opposition').includes(':') ? t('privacy.section6.opposition').split(':').slice(1).join(':').trim() : t('privacy.section6.opposition')}</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section7.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section7.intro')}
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              {(t('privacy.section7.list') as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section8.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section8.text')}
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section9.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section9.text')}
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section10.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section10.text')}
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section11.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                {t('privacy.section11.p1')}
              </p>
              <p className="leading-relaxed">
                {t('privacy.section11.p2')}
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t('privacy.section12.title')}</h2>
            <p className="leading-relaxed">
              {t('privacy.section12.text')}
            </p>
          </section>

          {/* Declaration */}
          <section className="bg-slate-800/50 p-6 rounded-xl border border-emerald-500/20">
            <h2 className="text-xl font-bold text-emerald-400 mb-4">{t('privacy.declaration.title')}</h2>
            <p className="leading-relaxed text-slate-200">
              {t('privacy.declaration.text')}
            </p>
          </section>

          <div className="pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-500 text-center">
              {t('privacy.footer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
