import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    const isOpeningSlideshow =
      prevPath.current === '/gallery' && pathname === '/gallery/slideshow';
    const isClosingSlideshow =
      prevPath.current === '/gallery/slideshow' && pathname === '/gallery';

    if (!isOpeningSlideshow && !isClosingSlideshow) {
      window.scrollTo(0, 0);
    }

    prevPath.current = pathname;
  }, [pathname]);

  return null;
}
