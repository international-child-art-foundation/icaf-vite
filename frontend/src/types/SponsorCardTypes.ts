import { ColorKey } from '@/components/shared/FlairColorMap';

export interface ISponsorCard {
  Icon: React.ComponentType<{ colorClass: string }>;
  text: string;
  color: ColorKey;
}
