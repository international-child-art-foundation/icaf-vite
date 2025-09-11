import { ReactNode } from 'react';
import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IContentCallout {
  title: string;
  color: ColorKey;
  description: ReactNode;
  content: ReactNode;
  textOnLeft: boolean;
}
