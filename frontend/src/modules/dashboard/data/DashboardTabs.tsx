import {
  ShieldAlert,
  LayoutDashboard,
  ClipboardCheck,
  GalleryHorizontal,
  Newspaper,
} from 'lucide-react';
import { TabData } from '@/modules/dashboard/types/dashboardTypes';

export const dashboardTabData = {
  overview: {
    id: 'overview',
    label: 'Overview',
    description: 'Quick links and status',
    icon: <LayoutDashboard size={18} />,
    color: 'text-secondary-pink/20',
    roles: 'all',
  },
  submissions: {
    id: 'submissions',
    label: 'My submissions',
    description: 'Artwork and groups you manage',
    icon: <GalleryHorizontal size={18} />,
    color: 'text-secondary-yellow/20',
    roles: 'all',
  },
  review: {
    id: 'review',
    label: 'Review queues',
    description: 'Approve or reject pending work',
    icon: <ClipboardCheck size={18} />,
    color: 'text-secondary-green/20',
    roles: 'review',
  },
  admin: {
    id: 'admin',
    label: 'Admin tools',
    description: 'Last-resort corrections',
    icon: <ShieldAlert size={18} />,
    color: 'text-secondary-purple/60',
    roles: 'admin',
  },
  news: {
    id: 'news',
    label: 'News admin',
    description: 'Create and update news items',
    icon: <Newspaper size={18} />,
    color: 'text-secondary-blue/60',
    roles: 'admin',
  },
} satisfies TabData;

export type DashboardTabKey = keyof typeof dashboardTabData;

export const dashboardTabNames = Object.keys(
  dashboardTabData,
) as DashboardTabKey[];
