import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IGroupsAndMembers {
  name: string;
  members: IMemberLink[];
}

export interface IMemberLink {
  name: string;
  link?: string;
}

export interface ITeamCardData {
  title: string;
  subtitle?: string;
  Icon: React.ComponentType<{ colorClass: string; className?: string }>;
  color: ColorKey;
  groupsOfMembers: IGroupsAndMembers[];
}
