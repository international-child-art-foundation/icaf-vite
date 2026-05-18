import { ColorKey } from '@/modules/content/components/shared/FlairColorMap';

export interface IProfessionalsHowToItem {
  title: string;
  description: string | React.ReactNode;
  color: ColorKey;
  imgSrc: string;
}
