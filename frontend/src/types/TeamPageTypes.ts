export interface IStaffItem {
  src?: string;
  name: string;
  title: string;
  link?: string;
  description?: string;
  linkedin?: string;
}

export type TStaffData = IStaffItem[];
