export interface BannerItem {
  id: string;
  src: string;
  bannerText: string;
  bannerColor: string;
  darkened?: boolean;
  gradientDefinition?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  objectPosition?: string;
  scale?: number;
}
