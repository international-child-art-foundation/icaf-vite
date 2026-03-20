import type { PictureSrc } from '@/components/shared/Picture';

export interface BannerItem {
  id: string;
  src: PictureSrc;
  bannerText?: string;
  bannerColor: string;
  darkened?: boolean;
  gradientDefinition?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  objectPosition?: string;
  scale?: number;
}
