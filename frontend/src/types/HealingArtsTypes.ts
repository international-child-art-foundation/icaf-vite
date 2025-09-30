import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IGoalCard {
  id: string;
  Icon: React.ComponentType<{ colorClass: string; className?: string }>;
  color: ColorKey;
  title: string;
  description: string;
}

export interface IResourceLink {
  title: string;
  resourceType?: string;
}
