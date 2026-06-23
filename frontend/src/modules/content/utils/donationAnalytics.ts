const WCF_SITE_HOST = 'worldchildrensfestival.org';

type DonationPageViewParams = {
  page_location: string;
  page_path: string;
  page_title: string;
  referrer: string;
  referrer_domain: string;
  traffic_source: string;
  traffic_medium: string;
  traffic_campaign: string;
  traffic_content: string;
  traffic_term: string;
  wcf_site_referral: string;
  wcf_site_domain: string;
};

function normalizeHost(value: string): string {
  return value.toLowerCase().replace(/^www\./, '');
}

function hostnameFromUrl(value: string): string {
  if (!value) return '';

  try {
    return normalizeHost(new URL(value).hostname);
  } catch {
    return '';
  }
}

function sourceLooksLikeWCFSite(value: string): boolean {
  const source = normalizeHost(value);

  return source === WCF_SITE_HOST || source.endsWith(`.${WCF_SITE_HOST}`);
}

export function donationPageViewParams(
  location: Location,
  referrer: string,
): DonationPageViewParams {
  const searchParams = new URLSearchParams(location.search);
  const referrerDomain = hostnameFromUrl(referrer);
  const utmSource = searchParams.get('utm_source') ?? '';
  const source = utmSource || referrerDomain || 'direct';

  const isWCFSiteReferral =
    sourceLooksLikeWCFSite(referrerDomain) ||
    sourceLooksLikeWCFSite(utmSource) ||
    sourceLooksLikeWCFSite(searchParams.get('source') ?? '');

  return {
    page_location: location.href,
    page_path: `${location.pathname}${location.search}`,
    page_title: document.title,
    referrer,
    referrer_domain: referrerDomain,
    traffic_source: source,
    traffic_medium: searchParams.get('utm_medium') ?? '',
    traffic_campaign: searchParams.get('utm_campaign') ?? '',
    traffic_content: searchParams.get('utm_content') ?? '',
    traffic_term: searchParams.get('utm_term') ?? '',
    wcf_site_referral: isWCFSiteReferral ? 'true' : 'false',
    wcf_site_domain: WCF_SITE_HOST,
  };
}

export function trackDonationPageView(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;

  window.gtag(
    'event',
    'donation_page_view',
    donationPageViewParams(window.location, document.referrer),
  );
}
