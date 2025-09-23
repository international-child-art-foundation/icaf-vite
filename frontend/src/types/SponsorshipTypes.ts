import { ReactNode } from 'react';
import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IContentCallout {
  title: string;
  color: ColorKey;
  description: ReactNode;
  content: ReactNode;
  textOnLeft: boolean;
}

export interface IBrandCampaignCard {
  id: string;
  mainImg: string;
  logo?: string;
}

export interface ISponsorImpact {
  key: string;
  numberLabel: string;
  text: string | ReactNode;
  color: ColorKey;
}

export interface ISponsorCard {
  Icon: React.ComponentType<{ colorClass: string }>;
  text: string;
  color: ColorKey;
}

export interface IExperimentalBrandingCard {
  id: string;
  largeImgSrc?: string;
  logoSrc?: string;
  color: ColorKey;
}

export type TExperimentalBrandingCarousel = IExperimentalBrandingCard[];

export interface IPartnerTestimonialCard {
  id: string;
  logo?: string;
  color: ColorKey;
  speakerName?: string;
  speakerTitle?: string;
  content?: string;
}

export type TPartnerTestimonialCarousel = IPartnerTestimonialCard[];
