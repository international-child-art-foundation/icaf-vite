import { DesignersSmall, DesignersLarge } from './Designers';
import { DevelopersSmall, DevelopersLarge } from './Developers';
import { useWindowSize } from 'usehooks-ts';

export const TeamDesignDev = () => {
  const size = useWindowSize();

  return size.width > 1280 ? (
    <div className="flex max-w-screen-2xl flex-col gap-6 px-8 md:px-12 lg:gap-12 lg:px-16 xl:gap-20 xl:px-20">
      <DesignersLarge />
      <DevelopersLarge />
    </div>
  ) : (
    <div className="flex max-w-screen-2xl flex-col gap-16 px-8 md:px-12 lg:px-16 xl:px-20">
      <DesignersSmall />
      <DevelopersSmall />
    </div>
  );
};
