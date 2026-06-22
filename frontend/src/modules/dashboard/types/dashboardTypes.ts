import { ReactNode } from 'react';

export interface ITabTypes {
  id: string;
  label: string;
  icon: ReactNode;
  description: string;
  color: string;
  roles: 'all' | 'review' | 'admin';
}
export type TabData = Record<string, ITabTypes>;
