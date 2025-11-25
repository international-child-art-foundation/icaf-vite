import { Card, CardContent, CardFooter } from '../ui/card';
import ICAFVideo from '@/assets/shared/media/icaf-overview-cropped.mp4';
import Poster from '@/assets/shared/images/about/map-video-cover.webp';
import { FavoriteSportLogo } from '@/assets/shared/images/about/FavoriteSportLogo';
import { ChevronRight } from 'lucide-react';
import { VRHeaven } from '@/assets/shared/images/about/VRHeaven';
import { VideoWrapper } from '../shared/VideoWrapper';
import { Link } from 'react-router-dom';

/**
 *
 * The hyperlinks will need updating
 */

export default function ExploreOurProjects() {
  return (
    <section className="my-10 md:my-20 lg:mx-24 xl:mx-0">
      <div className="my-10">
        <h2 className="text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
          Explore our projects
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-1 xl:row-start-1">
          <Card className="border-secondary-red bg-secondary-red/10 flex h-72 flex-col items-center justify-center rounded-2xl border-4 md:h-[400px] xl:h-[300px] 2xl:h-[325px]">
            <CardContent>
              <FavoriteSportLogo />
            </CardContent>
            <CardFooter className="text-primary gap-1 text-lg underline">
              <Link
                to="https://myfavoritesport.org/"
                className="flex flex-row items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to MyFavoriteSport <ChevronRight />
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div className="xl:col-span-1 xl:row-start-2">
          <Card className="border-tertiary-blue bg-tertiary-blue/10 flex h-72 flex-col items-center justify-center rounded-2xl border-4 md:h-[400px] xl:h-[300px] 2xl:h-[325px]">
            <CardContent>
              <VRHeaven />
            </CardContent>
            <CardFooter className="text-primary gap-1 text-lg underline">
              <p className="flex flex-row items-center">
                VRHeaven (coming soon) <ChevronRight />
              </p>
            </CardFooter>
          </Card>
        </div>
        <div className="md:col-span-2 xl:col-span-2 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <VideoWrapper
            src={ICAFVideo}
            thumbnail={Poster}
            className="w-full rounded-2xl object-cover md:h-[600px] xl:h-full"
          />
        </div>
      </div>
    </section>
  );
}
