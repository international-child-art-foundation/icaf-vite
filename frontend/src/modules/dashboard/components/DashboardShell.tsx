import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ClipboardCheck,
  GalleryHorizontal,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';
import type { Role } from '@icaf/shared';
import { canAdmin, canReview } from '../utils/dashboardFormat';

export type DashboardTab = 'overview' | 'submissions' | 'review' | 'admin';

type DashboardShellProps = {
  role: Role | null;
  children: (tab: DashboardTab) => ReactNode;
};

const allTabs: {
  id: DashboardTab;
  label: string;
  description: string;
  icon: ReactNode;
  roles: 'all' | 'review' | 'admin';
}[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Quick links and status',
    icon: <LayoutDashboard size={18} />,
    roles: 'all',
  },
  {
    id: 'submissions',
    label: 'My submissions',
    description: 'Artwork and groups you manage',
    icon: <GalleryHorizontal size={18} />,
    roles: 'all',
  },
  {
    id: 'review',
    label: 'Review queues',
    description: 'Approve or reject pending work',
    icon: <ClipboardCheck size={18} />,
    roles: 'review',
  },
  {
    id: 'admin',
    label: 'Admin tools',
    description: 'Last-resort corrections',
    icon: <ShieldAlert size={18} />,
    roles: 'admin',
  },
];

export function DashboardShell({ role, children }: DashboardShellProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabs = allTabs.filter((tab) => {
    if (tab.roles === 'admin') return canAdmin(role);
    if (tab.roles === 'review') return canReview(role);
    return true;
  });
  const requestedTab = searchParams.get('tab') as DashboardTab | null;
  const activeTab: DashboardTab =
    requestedTab && tabs.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : tabs[0].id;

  return (
    <div className="site-w m-pad py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            My ICAF
          </p>
          <h1 className="font-montserrat mt-2 text-4xl font-bold text-neutral-950 md:text-5xl">
            Workspace
          </h1>
        </div>
        <Link
          to="/submit-artwork"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-secondary-blue"
        >
          Submit artwork
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto rounded-lg border border-black/10 bg-white p-2 shadow-sm lg:flex-col">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`flex min-w-[190px] items-start gap-3 rounded-md px-3 py-3 text-left transition lg:min-w-0 ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span className="mt-0.5 flex-none">{tab.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {tab.label}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        active ? 'text-white/70' : 'text-neutral-500'
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-col gap-6">{children(activeTab)}</div>
      </div>
    </div>
  );
}
