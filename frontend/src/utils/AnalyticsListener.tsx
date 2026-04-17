import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordHit } from '../lib/hit';

export function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    recordHit(location.pathname);
  }, [location.pathname]);
  return null;
}
