export interface IActivityItem {
  img: string;
  title: string;
  description: string;
  id: number;
}

export type IActivityItemPair = [IActivityItem, IActivityItem];

export type IActivitySection = IActivityItemPair[];
