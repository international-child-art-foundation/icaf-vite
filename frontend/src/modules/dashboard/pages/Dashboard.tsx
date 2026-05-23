import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AuthStatusResponse, Role } from '@icaf/shared';
import { getAuthStatus } from '@/api/auth';
import { Seo } from '@/modules/content/components/shared/Seo';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardModule, ModuleState } from '../components/DashboardModule';
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

export function Dashboard() {
  const [auth, setAuth] = useState<AuthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuthStatus()
      .then(setAuth)
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load My ICAF access',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const role: Role | null = auth?.authenticated ? auth.role : null;

  return (
    <>
      <Seo {...dashboardMetadata} />
      {loading ? (
        <div className="site-w m-pad py-16">
          <ModuleState>Loading My ICAF...</ModuleState>
        </div>
      ) : error ? (
        <div className="site-w m-pad py-16">
          <ModuleState tone="error">{error}</ModuleState>
        </div>
      ) : !auth?.authenticated ? (
        <div className="site-w m-pad py-16">
          <DashboardModule
            title="Sign in required"
            description="Use your account to view submissions and My ICAF tools."
          >
            <Link
              to="/login"
              className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-secondary-blue"
            >
              Sign in
            </Link>
          </DashboardModule>
        </div>
      ) : (
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
      )}
      <PageBottomSpacer />
    </>
  );
}
