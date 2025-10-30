import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IPTACard {
  title: string;
  body: string;
  color: ColorKey;
}

export interface IYoungArtistArtworks {
  id: number;
  label: string;
  imgSrc: string;
}

export interface IPTALabeledLink {
  source: string;
  title: string;
  link?: string;
}
