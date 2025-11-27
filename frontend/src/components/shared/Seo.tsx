// src/components/shared/Seo.tsx
import { Helmet } from 'react-helmet-async';
import { SITE_URL, sharedOpenGraph } from '@/data/shared-metadata';

export type SeoProps = {
  title: string;
  description?: string;
  path?: string;
  openGraph?: {
    image?: string;
    type?: string;
  };
  noIndex?: boolean;
};

export function Seo({
  title,
  description,
  path,
  openGraph,
  noIndex,
}: SeoProps) {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const ogImage = openGraph?.image ?? sharedOpenGraph.defaultImage;
  const ogType = openGraph?.type ?? 'website';

  return (
    <Helmet>
      <title>{title}</title>

      {description && <meta name="description" content={description} />}

      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={sharedOpenGraph.siteName} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      <link rel="canonical" href={url} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
