import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IGoalCard {
  id: string;
  Icon: React.ComponentType<{ colorClass: string; className?: string }>;
  color: ColorKey;
  title: string;
  description: string;
}

type TBehavior = 'link' | 'modal';

export interface IResourceLink {
  id: string;
  title: string;
  behavior: TBehavior;
  fileType?: string;
  href?: string;
}
