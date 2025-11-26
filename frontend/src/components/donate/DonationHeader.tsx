import MalaysiaChildren from '@/assets/donate/MalaysiaChildren.png';
import MalaysiaChildrenCropped from '@/assets/donate/MalaysiaChildrenCropped.png';
import { useWindowSize } from 'usehooks-ts';

import { CurvedImage } from '@/pages/CurvedImage';
import DonationForm from './DonationForm';
import { DonationHeaderContent } from './DonationHeaderContent';

export const DonationHeader = () => {
  const size = useWindowSize();

  return (
    <div className="relative grid grid-cols-1 grid-rows-1">
      <div className="z-20 col-start-1 row-start-1 mt-6 grid p-4 md:flex md:flex-col md:p-12 lg:col-start-1 lg:row-start-1 lg:grid lg:h-auto lg:grid-cols-2 lg:grid-rows-1 lg:p-16">
        <div className="col-start-1 row-start-1">
          <DonationHeaderContent />
        </div>

        <div className="mx-auto max-w-md md:row-start-2 md:mt-32 lg:row-start-1 lg:mt-0">
          <DonationForm whiteBackdrop={size.width < 1024 && size.width > 768} />
        </div>
      </div>

      <div className="col-start-1 row-start-1">
        {size.width > 1024 ? (
          <CurvedImage
            src={MalaysiaChildren}
            curveStyle={'Ellipse'}
            darkened={true}
            gradientDefinition={'bg-gradient-to-b from-black/60 to-black/60'}
            objectFit="cover"
            objectPosition="center center"
            scale={1}
            height="750px"
          />
        ) : size.width >= 768 ? (
          <CurvedImage
            src={MalaysiaChildren}
            curveStyle="Ellipse"
            darkened={true}
            gradientDefinition="bg-gradient-to-b from-black/60 to-black/60"
            objectFit="cover"
            objectPosition="center center"
            scale={1}
            height="550px"
          />
        ) : (
          <CurvedImage
            src={MalaysiaChildrenCropped}
            curveStyle="Ellipse"
            darkened={true}
            gradientDefinition="bg-gradient-to-b from-black/60 to-black/60"
            objectFit="cover"
            objectPosition="bottom center"
            scale={1}
            height="750px"
          />
        )}
      </div>
    </div>
  );
};
