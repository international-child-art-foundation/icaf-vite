import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/components/shared/GlobalContext';

type GoogleAnalyticsProps = {
  GA_MEASUREMENT_ID: string | undefined;
};

export default function GoogleAnalytics({
  GA_MEASUREMENT_ID,
}: GoogleAnalyticsProps) {
  const { isCookieConsentAcquired } = useGlobalContext();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.gtag) return;

    window.gtag('consent', 'update', {
      analytics_storage: isCookieConsentAcquired ? 'granted' : 'denied',
    });
  }, [isCookieConsentAcquired]);

  // Only send config/pageviews when consent is granted
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.gtag) return;
    if (GA_MEASUREMENT_ID === undefined) return;
    if (!isCookieConsentAcquired) return;

    const path = location.pathname + location.search;

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }, [
    GA_MEASUREMENT_ID,
    isCookieConsentAcquired,
    location.pathname,
    location.search,
  ]);

  return null;
}
