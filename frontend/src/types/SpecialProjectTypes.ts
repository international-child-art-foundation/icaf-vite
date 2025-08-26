import { ColorKey } from '@/components/shared/FlairColorMap';

export interface ISpecialProject {
  id: number;
  title: string;
  image: string;
  color: ColorKey;
  description: string;
  href?: string;
}

export type TSpecialProjectGroup = ISpecialProject[];
