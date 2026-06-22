import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { AuthStatusResponse } from '@icaf/shared';
import { getAuthStatus, logout } from '@/api/auth';
import {
  buildLoginRedirectPath,
  clearLastKnownUser,
  getLastKnownUser,
  saveLastKnownUser,
} from '@/shared/utils/authSession';
import { Button } from '@/shared/components/ui/button';
import { clearSubmissionDrafts } from '@/modules/submissions/utils/submissionDraftStorage';
import { LogOut } from 'lucide-react';
import { ModuleState } from './DashboardModule';
import { Dashboard } from '../pages/Dashboard';

type GateState =
  | { status: 'loading' }
  | { status: 'authorized'; auth: AuthStatusResponse & { authenticated: true } }
  | { status: 'unauthorized' }
  | { status: 'error' };

export function MyIcafAccessGate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>({ status: 'loading' });
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  useEffect(() => {
    let active = true;

    void getAuthStatus()
      .then((auth) => {
        if (!active) return;

        if (auth.authenticated) {
          saveLastKnownUser(auth);
          setState({ status: 'authorized', auth });
          return;
        }

        setState({ status: 'unauthorized' });
      })
      .catch(() => {
        if (!active) return;

        setState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, []);

  const loginPath = useMemo(() => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const hasLocalAccountHint = getLastKnownUser() !== null;
    const reason =
      state.status === 'unauthorized' && hasLocalAccountHint
        ? 'stale-auth'
        : 'auth-required';
    return buildLoginRedirectPath(currentPath, reason);
  }, [location.hash, location.pathname, location.search, state.status]);

  const handleLogout = async () => {
    setLogoutBusy(true);
    setLogoutError(false);

    try {
      await logout();
      clearLastKnownUser();
      clearSubmissionDrafts();
      void navigate('/login', { replace: true });
    } catch {
      setLogoutError(true);
      setLogoutBusy(false);
    }
  };

  if (state.status === 'loading') {
    return (
      <div className="site-w m-pad py-16">
        <ModuleState>Loading My ICAF...</ModuleState>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="site-w m-pad py-16">
        <section className="border-primary/10 shadow-primary/5 mx-auto max-w-2xl rounded-lg border bg-white p-6 shadow-sm md:p-8">
          <p className="text-primary text-sm font-semibold uppercase tracking-wide">
            My ICAF
          </p>
          <h1 className="font-montserrat mt-2 text-3xl font-bold text-neutral-950">
            We couldn&apos;t open your account
          </h1>
          <p className="mt-3 max-w-xl leading-7 text-neutral-600">
            Your saved session could not be verified. Please log out, then sign
            in again to continue to My ICAF.
          </p>
          <Button
            className="mt-6"
            disabled={logoutBusy}
            onClick={() => void handleLogout()}
          >
            <LogOut />
            {logoutBusy ? 'Logging out...' : 'Log out and sign in again'}
          </Button>
          {logoutError && (
            <div className="mt-4">
              <ModuleState tone="error">
                We couldn&apos;t log you out right now. Please try again.
              </ModuleState>
            </div>
          )}
        </section>
      </div>
    );
  }

  if (state.status === 'unauthorized') {
    return <Navigate replace to={loginPath} />;
  }

  return <Dashboard auth={state.auth} />;
}
