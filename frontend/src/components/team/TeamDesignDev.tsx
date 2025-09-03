import { DesignersSmall, DesignersLarge } from './Designers';
import { useWindowSize } from 'usehooks-ts';

export const TeamDesignDev = () => {
  const size = useWindowSize();

  return size.width > 1280 ? <DesignersLarge /> : <DesignersSmall />;
};
