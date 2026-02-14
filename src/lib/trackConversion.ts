/**
 * Conversion tracking for Meta Pixel, TikTok Pixel, Google Ads
 * Pixels must be installed in index.html (currently commented out)
 */
export function trackConversion(event: string, value?: number) {
  try {
    // Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', event, value ? { value, currency: 'BRL' } : undefined);
    }
    // TikTok Pixel
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track(event, value ? { value, currency: 'BRL' } : undefined);
    }
    // Google Ads
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event === 'Lead' ? 'generate_lead' : 'purchase', {
        value: value || 0,
        currency: 'BRL',
      });
    }
  } catch {
    // Silent
  }
}
