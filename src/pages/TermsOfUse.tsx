import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function TermsOfUse() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
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
            {t('terms.title')}
          </h1>
          <p className="text-slate-400">{t('common.lastUpdate')}: 14 January 2026</p>
        </div>

        {/* Content */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-8 text-slate-300">
          
          {/* Preamble */}
          <section>
            <p className="leading-relaxed text-slate-200 font-medium">
              {t('terms.readCarefully')}
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section1.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">1.1.</strong> {t('terms.section1.intro')}
              </p>
              <ul className="space-y-2 ml-6">
                <li><strong className="text-emerald-400">"Company"</strong> / <strong className="text-emerald-400">"GS ITALYINVESTMENTS"</strong>: {t('terms.section1.company')}</li>
                <li><strong className="text-emerald-400">"Platform"</strong> / <strong className="text-emerald-400">"EUGINE Analytics"</strong>: {t('terms.section1.platform')}</li>
                <li><strong className="text-emerald-400">"User"</strong>: {t('terms.section1.user')}</li>
                <li><strong className="text-emerald-400">"Services"</strong>: {t('terms.section1.services')}</li>
                <li><strong className="text-emerald-400">"Content"</strong>: {t('terms.section1.content')}</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">1.2.</strong> {t('terms.section1.clarification')}
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section2.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">2.1.</strong> {t('terms.section2.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">2.2.</strong> {t('terms.section2.p2')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">2.3.</strong> {t('terms.section2.p3')}
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section3.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">3.1.</strong> {t('terms.section3.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">3.2.</strong> {t('terms.section3.p2')}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {(t('terms.section3.list') as unknown as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">3.3.</strong> {t('terms.section3.p3')}
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section4.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">4.1.</strong> {t('terms.section4.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">4.2.</strong> {t('terms.section4.p2')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">4.3.</strong> {t('terms.section4.p3')}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section5.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">5.1.</strong> {t('terms.section5.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">5.2.</strong> {t('terms.section5.p2')}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {(t('terms.section5.list') as unknown as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">5.3.</strong> {t('terms.section5.p3')}
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section6.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">6.1.</strong> {t('terms.section6.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">6.2.</strong> {t('terms.section6.p2')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">6.3.</strong> {t('terms.section6.p3')}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {(t('terms.section6.list') as unknown as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section7.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">7.1.</strong> {t('terms.section7.p1')}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {(t('terms.section7.list') as unknown as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">7.2.</strong> {t('terms.section7.p2')}
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section8.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">8.1.</strong> {t('terms.section8.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">8.2.</strong> {t('terms.section8.p2')}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {(t('terms.section8.list') as unknown as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">8.3.</strong> {t('terms.section8.p3')}
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section9.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">9.1.</strong> {t('terms.section9.p1')}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {(t('terms.section9.list') as unknown as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">9.2.</strong> {t('terms.section9.p2')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">9.3.</strong> {t('terms.section9.p3')}
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section10.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">10.1.</strong> {t('terms.section10.p1')}
              </p>
              <ul className="list-disc list-inside ml-6 space-y-1">
                {(t('terms.section10.list') as unknown as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section11.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">11.1.</strong> {t('terms.section11.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">11.2.</strong> {t('terms.section11.p2')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">11.3.</strong> {t('terms.section11.p3')}
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section12.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">12.1.</strong> <strong>{t('terms.section12.agreement').split(':')[0]}:</strong> {t('terms.section12.agreement').includes(':') ? t('terms.section12.agreement').split(':').slice(1).join(':') : t('terms.section12.agreement')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.2.</strong> <strong>Severability:</strong> {t('terms.section12.severability')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.3.</strong> <strong>Waiver:</strong> {t('terms.section12.waiver')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.4.</strong> <strong>Assignment:</strong> {t('terms.section12.assignment')}
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section13.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">13.1.</strong> {t('terms.section13.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">13.2.</strong> {t('terms.section13.p2')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">13.3.</strong> {t('terms.section13.p3')}
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">{t('terms.section14.title')}</h2>
            <div className="space-y-3">
              <p className="leading-relaxed">
                <strong className="text-white">14.1.</strong> {t('terms.section14.p1')}
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">14.2.</strong> {t('terms.section14.p2')}
              </p>
            </div>
          </section>

          {/* Declaration */}
          <section className="bg-slate-800/50 p-6 rounded-xl border border-emerald-500/20">
            <h2 className="text-xl font-bold text-emerald-400 mb-4">{t('terms.declaration.title')}</h2>
            <p className="leading-relaxed text-slate-200">
              {t('terms.declaration.text')}
            </p>
          </section>

          <div className="pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-500 text-center">
              {t('terms.footer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
