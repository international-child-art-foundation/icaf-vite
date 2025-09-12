import { ReactNode } from 'react';
import { ColorKey } from '@/components/shared/FlairColorMap';

export interface ISponsorImpact {
  key: string;
  numberLabel: string;
  text: string | ReactNode;
  color: ColorKey;
}
