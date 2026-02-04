// This page is currently intentionally unused.
import { MFSHeader } from '@/components/myFavoriteSport/MFSHeader';
import { MFSGuidelines } from '@/components/myFavoriteSport/MFSGuidelines';
import { MFSCTA } from '@/components/myFavoriteSport/MFSCTA';
import { MFSCards } from '@/components/myFavoriteSport/MFSCards';
import { MFSVision } from '@/components/myFavoriteSport/MFSVision';

export const MyFavoriteSport = () => {
  return (
    <div>
      <div>
        <MFSHeader />
        <div className="max-w-screen-3xl flex flex-col gap-8 px-8 md:px-12 lg:gap-12 lg:px-16 xl:px-20">
          <MFSVision />
          <MFSGuidelines />
          <MFSCards />
          <MFSCTA />
        </div>
      </div>
    </div>
  );
};
