import { useState, useEffect } from 'react';

type Dimensions = {
  windowWidth: number;
  windowHeight: number;
  orientation: 'landscape' | 'portrait';
};

function useWindowDimensions() {
  const isClient = typeof window === 'object';

  const [dimensions, setDimensions] = useState<Dimensions>({
    windowWidth: 0,
    windowHeight: 0,
    orientation: 'portrait',
  });
  const [touchScreenPrimary, setTouchScreenPrimary] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    function handleResize() {
      setDimensions({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        orientation:
          window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    const hasTouchScreen = () =>
      window.matchMedia('(pointer: coarse)').matches;
    setTouchScreenPrimary(hasTouchScreen());

    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  return { ...dimensions, touchScreenPrimary };
}

export default useWindowDimensions;
