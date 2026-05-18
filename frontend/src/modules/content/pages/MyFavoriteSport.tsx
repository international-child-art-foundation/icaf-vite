// This page is currently intentionally unused.
import { MFSHeader } from '@/modules/content/components/myFavoriteSport/MFSHeader';
import { MFSGuidelines } from '@/modules/content/components/myFavoriteSport/MFSGuidelines';
import { MFSCTA } from '@/modules/content/components/myFavoriteSport/MFSCTA';
import { MFSCards } from '@/modules/content/components/myFavoriteSport/MFSCards';
import { MFSVision } from '@/modules/content/components/myFavoriteSport/MFSVision';

export const MyFavoriteSport = () => {
  return (
    <div>
      <div>
        <MFSHeader />
        <div className="flex max-w-screen-2xl flex-col gap-8 px-8 md:px-12 lg:gap-12 lg:px-16 xl:px-20">
          <MFSVision />
          <MFSGuidelines />
          <MFSCards />
          <MFSCTA />
        </div>
      </div>
    </div>
  );
};
