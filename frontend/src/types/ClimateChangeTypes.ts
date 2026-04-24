import { ColorKey } from '@/components/shared/FlairColorMap';

type TLink = { href: string; text: string };

export interface IClimateChangeVideoCallout {
  video: string;
  thumb: string;
  title: string;
  description: React.ReactNode;
  color: ColorKey;
  link?: TLink;
}
