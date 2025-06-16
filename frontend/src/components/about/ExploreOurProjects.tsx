import { Card, CardContent, CardFooter, CardTitle } from '../ui/card';
import ICAFVideo from '@/assets/shared/media/icaf-overview.mp4';
import Poster from '@/assets/shared/images/navigation/programs/worldChildrensFestival_small.webp';

/**
 * Todo: play button for video
 */

export default function ExploreOurProjects() {
  return (
    <section className="my-10 md:my-20">
      <div>
        <h2 className="text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
          Explore our projects
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="">
          <Card className="border-secondary-red bg-secondary-red/10 flex h-72 flex-col items-center justify-center rounded-2xl border-4">
            <CardContent>Logo</CardContent>
            <CardTitle>#MyFavoriteSport</CardTitle>
            <CardFooter>Go to MyFavoriteSport</CardFooter>
          </Card>
        </div>
        <div className="">
          <Card className="border-secondary-red bg-secondary-red/10 flex h-72 flex-col items-center justify-center rounded-2xl border-4">
            <CardContent>Logo</CardContent>
            <CardTitle>#MyFavoriteSport</CardTitle>
            <CardFooter>Go to MyFavoriteSport</CardFooter>
          </Card>
        </div>
        <div>
          <video
            src={ICAFVideo}
            poster={Poster}
            controls
            className="w-full rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
