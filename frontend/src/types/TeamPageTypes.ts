export interface IStaffItem {
  src?: string;
  name: string;
  title: string;
  link?: string;
  description?: string;
}

export type TStaffData = IStaffItem[];
