import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { VideoWrapperPlaceholder } from '../shared/VideoWrapperPlaceholder';
import healingArtsImg from '@/assets/shared/images/navigation/programs/healingArtsProgram_smaller.webp';

export const ImpactVideo = () => {
  // TODO: Replace VideoWrapperPlaceholder with actual video
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl">
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <VideoWrapperPlaceholder />
        </div>
        <div className="flex w-full flex-row overflow-hidden rounded-[20px] bg-[#DFE7F8]">
          <div className="relative flex flex-col gap-10 p-8">
            <div className="flex w-full flex-col gap-2">
              <p className="font-montserrat text-2xl font-bold">
                View our impact
              </p>
              <p className="">See how children cope and recover from pain.</p>
            </div>
            <Button size="lg" className="self-start rounded-full px-12">
              <Link to="/gallery" className="font-sans text-xl">
                View art gallery
              </Link>
            </Button>
          </div>
          <div className="relative max-h-[20%] overflow-hidden">
            <img src={healingArtsImg} className="rounded-[16px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
