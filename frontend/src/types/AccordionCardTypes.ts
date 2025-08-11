import { ColorKey } from '@/components/shared/FlairColorMap';

type Inline =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; href: string };

type Block =
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'bullet'; children: Inline[] }
  | { type: 'space' };

export type ExtendedDescription = string | Block[];

export interface IAccordionCard {
  id: string;
  title: string;
  icon: string;
  shortDescription?: string;
  extendedDescription: string | ExtendedDescription;
  color: ColorKey;
  backgroundColor?: boolean;
}
