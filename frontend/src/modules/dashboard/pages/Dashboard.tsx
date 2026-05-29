import type { AuthStatusResponse, Role } from '@icaf/shared';
import { Seo } from '@/modules/content/components/shared/Seo';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { DashboardShell } from '../components/DashboardShell';
import { canAdmin, canReview } from '../utils/dashboardFormat';
import { DashboardSplash } from '@/modules/dashboard/assets/DashboardSplash';
import { useSearchParams } from 'react-router-dom';
import {
  dashboardTabData,
  DashboardTabKey,
} from '@/modules/dashboard/data/DashboardTabs';
import { dashboardTabNames } from '@/modules/dashboard/data/DashboardTabs';

const dashboardMetadata = {
  title: 'My ICAF | ICAF',
  description: 'Manage ICAF submissions, review queues, and admin actions.',
  path: '/my-icaf',
};

type DashboardProps = {
  auth: AuthStatusResponse & { authenticated: true };
};

export function Dashboard({ auth }: DashboardProps) {
  const role: Role = auth.role;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabs = dashboardTabNames.filter((tabName) => {
    if (dashboardTabData[tabName].roles === 'admin') return canAdmin(role);
    if (dashboardTabData[tabName].roles === 'review') return canReview(role);
    return true;
  });
  const requestedTab = searchParams.get('tab') as DashboardTabKey;
  const activeTab =
    requestedTab &&
    tabs.some((tabName) => dashboardTabData[tabName].id === requestedTab)
      ? requestedTab
      : (dashboardTabData['overview'].id as DashboardTabKey);

  return (
    <div className="relative flex h-full flex-grow overflow-hidden">
      <Seo {...dashboardMetadata} />
      <DashboardSplash
        className="absolute"
        colorClass={dashboardTabData[activeTab].color}
      />
      <DashboardShell
        role={role}
        className={'col-start-1 row-start-1'}
        activeTab={activeTab}
        setSearchParams={setSearchParams}
      />
      <PageBottomSpacer />
    </div>
  );
}
