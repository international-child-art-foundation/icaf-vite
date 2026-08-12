import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/modules/content/components/shared/GlobalContext';

type GoogleAnalyticsProps = {
  DEPLOYMENT_COMMIT: string | undefined;
  GA_MEASUREMENT_ID: string | undefined;
};

const tokenLinkPaths = new Set([
  '/verify-account',
  '/create-account',
  '/confirm-forgot-password',
  '/unsubscribe',
  '/unsubscribe/artwork',
]);

function analyticsPath(pathname: string, search: string): string {
  return tokenLinkPaths.has(pathname) ? pathname : `${pathname}${search}`;
}

export default function GoogleAnalytics({
  DEPLOYMENT_COMMIT,
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

    window.gtag('config', GA_MEASUREMENT_ID, {
      deployment_commit: DEPLOYMENT_COMMIT,
      page_path: analyticsPath(location.pathname, location.search),
    });
  }, [
    DEPLOYMENT_COMMIT,
    GA_MEASUREMENT_ID,
    isCookieConsentAcquired,
    location.pathname,
    location.search,
  ]);

  return null;
}
