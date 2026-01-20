import { useLanguage } from '@/contexts/LanguageContext';
import { UnifiedPricingCards } from './UnifiedPricingCards';

export function PricingSection() {
  const { t } = useLanguage();

  return (
    <section id="pricing-section" className="py-8 sm:py-12 scroll-mt-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {t('pricing.title')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('pricing.subtitle')}
        </p>
      </div>

      <UnifiedPricingCards showManageButton={true} variant="full" />
    </section>
  );
}