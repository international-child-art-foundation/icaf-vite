import { CurvedImage } from '@/pages/CurvedImage';
import SponsorshipHeaderImg from '@/assets/sponsorship/SponsorshipHeader.webp';
import { useWindowSize } from 'usehooks-ts';

export const SponsorshipHeader = () => {
  const size = useWindowSize();
  const gradientXL =
    'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.50)_10%,rgba(0,0,0,0.05)_70%,rgba(255,255,255,0.05)_100%)]';
  const gradientLG =
    'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.50)_10%,rgba(0,0,0,0.05)_60%,rgba(255,255,255,0.05)_100%)]';
  const gradientMD =
    'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.50)_10%,rgba(0,0,0,0.05)_60%,rgba(255,255,255,0.05)_100%)]';
  const gradientSM =
    'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.50)_10%,rgba(0,0,0,0.05)_60%,rgba(255,255,255,0.05)_100%)]';

  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition = gradientXL;
  } else if (size.width >= 1024) {
    gradientDefinition = gradientLG;
  } else if (size.width >= 640) {
    gradientDefinition = gradientMD;
  } else {
    gradientDefinition = gradientSM;
  }
  return (
    <div className="grid grid-cols-1 grid-rows-1">
      <div className="col-start-1 row-start-1">
        <CurvedImage
          src={SponsorshipHeaderImg}
          gradientDefinition={gradientDefinition}
        />
      </div>
      <div className="z-10 col-start-1 row-start-1 mb-20 flex items-center justify-self-center">
        <h1 className="text-center text-[40px] font-extrabold text-white sm:text-[60px]">
          Sponsorship
        </h1>
      </div>
    </div>
  );
};
