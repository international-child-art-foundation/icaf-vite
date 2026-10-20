export interface IActivityItem {
  img: string;
  title: string;
  description: string;
  id: number;
  href?: string;
}

export type IActivityItemPair = [IActivityItem, IActivityItem];

export type IActivitySection = IActivityItemPair[];
