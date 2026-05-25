import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { AuthStatusResponse } from '@icaf/shared';
import { getAuthStatus } from '@/api/auth';
import {
  buildLoginRedirectPath,
  getLastKnownUser,
  saveLastKnownUser,
} from '@/shared/utils/authSession';
import { ModuleState } from './DashboardModule';
import { Dashboard } from '../pages/Dashboard';

type GateState =
  | { status: 'loading' }
  | { status: 'authorized'; auth: AuthStatusResponse & { authenticated: true } }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unable to verify your access right now.';
}

export function MyIcafAccessGate() {
  const location = useLocation();
  const [state, setState] = useState<GateState>({ status: 'loading' });

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
      .catch((error: unknown) => {
        if (!active) return;

        setState({ status: 'error', message: getErrorMessage(error) });
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
        <ModuleState tone="error">{state.message}</ModuleState>
      </div>
    );
  }

  if (state.status === 'unauthorized') {
    return <Navigate replace to={loginPath} />;
  }

  return <Dashboard auth={state.auth} />;
}
