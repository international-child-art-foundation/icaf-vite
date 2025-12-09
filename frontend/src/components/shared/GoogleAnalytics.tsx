import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/components/shared/GlobalContext';

type GoogleAnalyticsProps = {
  GA_MEASUREMENT_ID?: string;
};

const loadGAScript = (id: string) => {
  if (document.getElementById('ga-script')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
};

const initGA = (id: string, analyticsStorage: 'granted' | 'denied') => {
  window.dataLayer = window.dataLayer || [];

  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }

  window.gtag = window.gtag || gtag;

  window.gtag('js', new Date());
  window.gtag('consent', 'default', {
    analytics_storage: analyticsStorage,
  });

  window.gtag('config', id, {
    page_path: window.location.pathname,
  });
};

const sendPageview = (id: string, path: string) => {
  if (!window.gtag) {
    return;
  }

  window.gtag('config', id, {
    page_path: path,
  });
};

export default function GoogleAnalytics({
  GA_MEASUREMENT_ID,
}: GoogleAnalyticsProps) {
  const { isCookieConsentAcquired } = useGlobalContext();
  const location = useLocation();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    loadGAScript(GA_MEASUREMENT_ID);
  }, [GA_MEASUREMENT_ID]);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const analyticsStorage: 'granted' | 'denied' = isCookieConsentAcquired
      ? 'granted'
      : 'denied';

    if (!window.gtag) {
      initGA(GA_MEASUREMENT_ID, analyticsStorage);
    } else {
      window.gtag('consent', 'update', {
        analytics_storage: analyticsStorage,
      });
    }
  }, [GA_MEASUREMENT_ID, isCookieConsentAcquired]);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const path = location.pathname + location.search;
    sendPageview(GA_MEASUREMENT_ID, path);
  }, [GA_MEASUREMENT_ID, location.pathname, location.search]);

  return null;
}
