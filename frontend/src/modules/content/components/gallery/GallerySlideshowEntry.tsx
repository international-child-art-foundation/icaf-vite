import { useEffect, useState } from 'react';
import { GallerySlideshow } from './GallerySlideshow';
import { GallerySlideshowMobile } from './GallerySlideshowMobile';

const MOBILE_MQ = '(pointer: coarse) and (max-width: 768px)';

const useMobileSlideshow = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_MQ).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

export const GallerySlideshowEntry = () => {
  const isMobile = useMobileSlideshow();
  return isMobile ? <GallerySlideshowMobile /> : <GallerySlideshow />;
};
