import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordHit } from './hit';
import { saveLastVisitedPath } from '@/shared/utils/authSession';

const accountRoutePaths = new Set([
  '/login',
  '/register',
  '/verify-account',
  '/create-account',
  '/forgot-password',
  '/confirm-forgot-password',
]);

export function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    recordHit(location.pathname);
    if (!accountRoutePaths.has(location.pathname)) {
      saveLastVisitedPath(`${location.pathname}${location.search}${location.hash}`);
    }
  }, [location.hash, location.pathname, location.search]);
  return null;
}
