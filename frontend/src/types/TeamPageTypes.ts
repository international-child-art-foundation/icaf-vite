export interface IStaffItem {
  src?: string;
  name: string;
  title: string;
  description: string;
  linkedin?: string;
}

export type TStaffData = IStaffItem[];
