import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveLastVisitedPath } from '@/shared/utils/authSession';

const accountRoutePaths = new Set([
  '/login',
  '/register',
  '/verify-account',
  '/create-account',
  '/forgot-password',
  '/confirm-forgot-password',
]);

export function LastVisitedPathListener() {
  const location = useLocation();

  useEffect(() => {
    if (!accountRoutePaths.has(location.pathname)) {
      saveLastVisitedPath(
        `${location.pathname}${location.search}${location.hash}`,
      );
    }
  }, [location.hash, location.pathname, location.search]);

  return null;
}
