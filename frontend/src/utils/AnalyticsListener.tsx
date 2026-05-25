import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordHit } from './hit';
import { saveLastVisitedPath } from '@/shared/utils/authSession';

export function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    recordHit(location.pathname);
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      saveLastVisitedPath(`${location.pathname}${location.search}${location.hash}`);
    }
  }, [location.hash, location.pathname, location.search]);
  return null;
}
