import {
  Card,
  CardContent,
  CardFooter,
} from '../../../../shared/components/ui/card';
import Poster from '@/modules/content/assets/about/map-video-cover.webp';
import { FavoriteSportLogo } from '@/modules/content/assets/about/FavoriteSportLogo';
import WorldChildrensFestivalLogo from '@/modules/content/assets/about/7th WCF.png';
import { WCF_SITE_URL } from '@/modules/content/utils/outboundLinks';
import { ChevronRight } from 'lucide-react';
import { VideoWrapper } from '../shared/VideoWrapper';
import { Link } from 'react-router-dom';
import { largeMedia } from '@/shared/lib/largeMedia';

/**
 *
 * The hyperlinks will need updating
 */

export default function ExploreOurProjects() {
  return (
    <section className="breakout-w m-pad">
      <div className="mb-10">
        <h2 className="text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
          Explore our projects
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="my-auto xl:col-span-1 xl:row-start-1">
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
        <div className="my-auto xl:col-span-1 xl:row-start-2">
          <Card className="border-secondary-red bg-secondary-red/10 flex h-72 flex-col items-center justify-center rounded-2xl border-4 md:h-[400px] xl:h-[300px] 2xl:h-[325px]">
            <CardContent className="flex min-h-0 flex-1 items-center justify-center pt-6">
              <img
                src={WorldChildrensFestivalLogo}
                alt="World Children’s Festival"
                className="h-full max-h-52 w-full object-contain xl:max-h-44 2xl:max-h-48"
              />
            </CardContent>
            <CardFooter className="text-primary flex-col gap-1 text-center text-lg">
              <h3 className="font-montserrat font-semibold">
                World Children’s Festival
              </h3>
              <Link
                to={WCF_SITE_URL}
                className="flex flex-row items-center underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to the festival website <ChevronRight />
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div className="md:col-span-2 xl:col-span-2 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <VideoWrapper
            src={largeMedia.icafOverviewCropped}
            thumbnail={Poster}
            className="w-full rounded-2xl object-cover md:h-[600px] xl:h-full"
          />
        </div>
      </div>
    </section>
  );
}
