import {
  useEffect,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { getCountry } from '@/shared/data/countries';

type CountryFlagProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt'
> & {
  country?: string;
  fallback?: ReactNode;
};

export function CountryFlag({
  country,
  fallback = null,
  onError,
  ...props
}: CountryFlagProps) {
  const resolvedCountry = getCountry(country);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  useEffect(() => {
    setFailedUrl(null);
  }, [resolvedCountry?.flagUrl]);

  if (!resolvedCountry || failedUrl === resolvedCountry.flagUrl) {
    return fallback;
  }

  return (
    <img
      {...props}
      src={resolvedCountry.flagUrl}
      alt={`${resolvedCountry.name} flag`}
      loading={props.loading ?? 'lazy'}
      decoding={props.decoding ?? 'async'}
      onError={(event) => {
        setFailedUrl(resolvedCountry.flagUrl);
        onError?.(event);
      }}
    />
  );
}
