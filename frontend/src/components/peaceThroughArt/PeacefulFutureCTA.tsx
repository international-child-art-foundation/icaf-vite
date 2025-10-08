import globeImg from '@/assets/peaceThroughArt/New-York-_Michael-Wong_---11-ai-brush-removebg-zcxjjze 2.webp';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const PeacefulFutureCTA = () => {
  return (
    <div>
      <div className="z-20 flex flex-col gap-4 text-center">
        <img src={globeImg} className="mx-auto" />
        <p className="font-montserrat text-[40px] font-extrabold leading-[48px]">
          Help Us Shape a Peaceful Future
        </p>
        <p className="z-20">
          Art has the power to heal. Children have the power to change the
          world.
        </p>
        <Link to={'/donate'} className="z-20 my-2 cursor-pointer">
          <Button variant="secondary" className="mx-auto rounded-full">
            <div className="flex items-center gap-2 leading-none">
              <Heart className="shrink-0" />
              <p className="text-[16px]">Support Peace Through Art</p>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
};
