import { useEffect, useState } from 'react';
import type { Role } from '@icaf/shared';
import {
  hasActiveTakedownRequests,
  TAKEDOWN_ACTIVITY_CACHE_MS,
} from '@/api/admin';
import { MySubmissionsModule } from '../components/MySubmissionsModule';
import { OverviewModules } from '../components/OverviewModules';
import { NewsAdminPanel } from '../components/NewsAdminPanel';
import { ThemeAdminPanel } from '../components/ThemeAdminPanel';
import { TakedownRequestsPanel } from '../components/TakedownRequestsPanel';
import { ReviewArtworkQueue } from '../components/ReviewArtworkQueue';
import { ReviewQueuesPanel } from '../components/ReviewQueuesPanel';
import { canAdmin, canReview } from '@/modules/dashboard/utils/dashboardFormat';
import {
  dashboardTabData,
  getDashboardTabsForRole,
} from '@/modules/dashboard/data/DashboardTabs';
import { SetURLSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { logout } from '@/api/auth';
import { clearLastKnownUser } from '@/shared/utils/authSession';

type DashboardShellProps = {
  role: Role | null;
  email: string;
  className: string;
  activeTab: string;
  setSearchParams: SetURLSearchParams;
};

export function DashboardShell({
  role,
  email,
  className,
  activeTab,
  setSearchParams,
}: DashboardShellProps) {
  const navigate = useNavigate();
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [hasActiveTakedowns, setHasActiveTakedowns] = useState(false);

  useEffect(() => {
    if (!canAdmin(role)) {
      setHasActiveTakedowns(false);
      return;
    }

    let canceled = false;
    void hasActiveTakedownRequests({
      cacheTtlMs: TAKEDOWN_ACTIVITY_CACHE_MS,
    })
      .then((hasActive) => {
        if (!canceled) setHasActiveTakedowns(hasActive);
      })
      .catch(() => {
        if (!canceled) setHasActiveTakedowns(false);
      });

    return () => {
      canceled = true;
    };
  }, [role]);

  const handleLogout = () => {
    setLogoutBusy(true);
    setLogoutError(null);

    void logout()
      .then(() => {
        void clearLastKnownUser();
        void navigate('/login', { replace: true });
      })
      .catch((error: unknown) => {
        setLogoutError(
          error instanceof Error ? error.message : 'Unable to log out.',
        );
      })
      .finally(() => {
        setLogoutBusy(false);
      });
  };

  let content;
  if (activeTab === 'submissions') {
    content = <MySubmissionsModule />;
  } else if (activeTab === 'review' && canReview(role)) {
    content = <ReviewQueuesPanel admin={canAdmin(role)} />;
  } else if (activeTab === 'admin' && canAdmin(role)) {
    content = <ReviewArtworkQueue key="admin-artwork-queue" admin />;
  } else if (activeTab === 'news' && canAdmin(role)) {
    content = <NewsAdminPanel />;
  } else if (activeTab === 'takedowns' && canAdmin(role)) {
    content = <TakedownRequestsPanel onActiveChange={setHasActiveTakedowns} />;
  } else if (activeTab === 'themes' && canReview(role)) {
    content = <ThemeAdminPanel />;
  } else {
    content = <OverviewModules role={role} />;
  }
  const tabsArray = getDashboardTabsForRole(role);

  return (
    <div className={`${className} site-w m-pad z-10 py-10`}>
      <div className="mb-8 flex flex-row justify-between gap-4 md:items-end">
        <div>
          <p className="text-primary text-sm font-semibold uppercase tracking-wide">
            My ICAF
          </p>
          <h1 className="font-montserrat mt-2 text-4xl font-bold text-neutral-950 md:text-5xl">
            Home
          </h1>
        </div>
        <div className="my-auto mr-0 flex flex-col gap-4">
          {activeTab != 'overview' && (
            <Button onClick={() => setSearchParams({ tab: 'overview' })}>
              <ChevronLeft />
              Back to overview
            </Button>
          )}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <p className="flex flex-col text-right text-sm font-semibold text-neutral-700">
                <span>You are authenticated as</span>
                <span>
                  <span className="text-secondary-blue break-all">{email}</span>
                  .
                </span>
              </p>
              <Button
                onClick={handleLogout}
                disabled={logoutBusy}
                className="ml-auto"
              >
                {logoutBusy ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          )}
          {logoutError && (
            <p className="max-w-48 text-sm font-semibold text-red-700">
              {logoutError}
            </p>
          )}
        </div>
        {/* <Link
          to="/submit-artwork"
          className="bg-primary hover:bg-secondary-blue inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition"
        >
          Submit artwork
        </Link> */}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <nav className="flex gap-2 overflow-x-auto rounded-lg border border-black/10 bg-white p-2 shadow-sm lg:flex-col">
            {tabsArray.map((tabName) => {
              const tab = dashboardTabData[tabName];
              const active = tab.id === activeTab;
              const showTakedownPip =
                tab.id === 'takedowns' && hasActiveTakedowns;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`relative flex min-w-[190px] items-start gap-3 rounded-md px-3 py-3 text-left transition lg:min-w-0 ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {showTakedownPip && (
                    <span className="bg-secondary-blue absolute right-2 top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white" />
                  )}
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
        <div className="z-10 flex min-w-0 flex-col gap-6 rounded-md bg-white">
          {content}
        </div>
      </div>
    </div>
  );
}
