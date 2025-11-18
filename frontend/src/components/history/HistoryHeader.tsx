import { CurvedImage } from '@/pages/CurvedImage';
import headerImg from '@/assets/history/historyHeader.webp';
import { OpinionatedGradients } from '@/data/gradientDefinition';
import { useWindowSize } from 'usehooks-ts';
import DonateButtonPartnersPage from '../ui/donateButtonPartnersPage';

export const HistoryHeader = () => {
  const size = useWindowSize();

  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition = OpinionatedGradients.xl;
  } else if (size.width >= 1024) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.4)_60%,rgba(255,255,255,0.2)_100%)]';
  } else if (size.width >= 640) {
    gradientDefinition = OpinionatedGradients.md;
  } else {
    gradientDefinition = OpinionatedGradients.sm;
  }

  return (
    <div className="relative grid grid-cols-1 grid-rows-1">
      <div className="relative col-start-1 row-start-1">
        <CurvedImage
          src={headerImg}
          gradientDefinition={gradientDefinition}
          height={'650px'}
        />
      </div>
      <div className="relative z-10 col-start-1 row-start-1">
        <div className="container mx-auto flex h-full items-start px-8 pt-20 md:items-center md:px-12 md:pt-0 lg:px-16 xl:px-20">
          <div className="text-white">
            <h1 className="font-montserrat mb-3 text-4xl font-bold md:mb-4 md:text-5xl lg:mb-6 lg:text-6xl xl:text-7xl">
              <span className="">Our History </span>
            </h1>
            <p className="mb-6 max-w-2xl font-sans text-base leading-relaxed md:text-lg lg:text-xl">
              Since its founding in 1997, the International Child Art Foundation
              (ICAF) has championed children’s creative and empathic development
              worldwide.
            </p>
            <p className="mb-6 max-w-2xl font-sans text-base leading-relaxed md:text-lg lg:text-xl">
              From pioneering national art festivals to launching global
              programs that unite young artists from over 100 countries, each
              milestone reflects our mission: to nurture imagination, foster
              understanding, and inspire innovation.{' '}
            </p>
            <div className="flex justify-start">
              <DonateButtonPartnersPage className="!w-auto border-0 !px-8 text-gray-900 shadow-lg hover:shadow-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
