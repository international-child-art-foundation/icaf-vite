import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IProfessionalsHowToItem {
  title: string;
  description: string | React.ReactNode;
  color: ColorKey;
  imgSrc: string;
}
