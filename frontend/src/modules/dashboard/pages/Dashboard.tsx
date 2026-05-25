import type { AuthStatusResponse, Role } from '@icaf/shared';
import { Seo } from '@/modules/content/components/shared/Seo';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { DashboardShell } from '../components/DashboardShell';
import { MySubmissionsModule } from '../components/MySubmissionsModule';
import { OverviewModules } from '../components/OverviewModules';
import { ReviewArtworkQueue } from '../components/ReviewArtworkQueue';
import { ReviewGroupQueue } from '../components/ReviewGroupQueue';
import { canAdmin, canReview } from '../utils/dashboardFormat';

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
  return (
    <>
      <Seo {...dashboardMetadata} />
      <DashboardShell role={role}>
        {(tab) => {
          if (tab === 'submissions') {
            return <MySubmissionsModule role={role} />;
          }
          if (tab === 'review' && canReview(role)) {
            return (
              <>
                <ReviewArtworkQueue admin={canAdmin(role)} />
                {!canAdmin(role) && <ReviewGroupQueue />}
              </>
            );
          }
          if (tab === 'admin' && canAdmin(role)) {
            return <ReviewArtworkQueue admin />;
          }
          return <OverviewModules role={role} />;
        }}
      </DashboardShell>
      <PageBottomSpacer />
    </>
  );
}
