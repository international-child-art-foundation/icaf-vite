import { CurvedImage } from './CurvedImage';
import WorldMural from '@/assets/impact/WorldMural.png';
import MissionDropdowns from '@/components/impact/MissionDropdowns';
import MissionDropdownData from '@/data/impact/impactMissionDropdownData';
import DancingImg from '@/assets/impact/Dancing.png';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';
import { ContentCarousel } from '@/components/impact/ContentCarousel';
import { ImpactContentCarouselData } from '@/data/impact/impactContentCarouselData';

const Impact = () => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid h-[550px] grid-cols-1 grid-rows-1">
        <div className="col-start-1 row-start-1">
          <CurvedImage
            src={WorldMural}
            curveStyle={'Ellipse'}
            darkened={true}
            gradientDefinition={'bg-gradient-to-b from-black/70 to-black/0'}
          />
        </div>
        <p className="margin-auto z-20 col-start-1 row-start-1 -mt-14 content-center place-self-center text-5xl font-bold text-white">
          Impact
        </p>
      </div>
      {/* Body */}
      <div className="my-8 grid w-full max-w-screen-2xl gap-8 px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Better World with Creativity Section */}
        <div className="grid gap-4">
          <p className="text-center text-5xl font-extrabold">
            Building a Better World with Creativity
          </p>
          <p>
            At ICAF, we're working to make the world more peaceful, prosperous,
            and sustainable. We believe that helping kids grow creatively and
            empathetically can help achieve six important goals set by the
            United Nations. These goals include:
          </p>
          <MissionDropdowns data={MissionDropdownData} />
        </div>
        {/* Making an Impact section */}
        <div className="grid-col grid gap-4">
          <p className="text-center text-5xl font-extrabold">
            Making an Impact
          </p>
          <p>
            Every day, thousands of kids learn about ICAF from their friends or
            online, helping them see themselves as creative individuals. They
            realize that their imagination can lead to new discoveries and
            innovations, and they know that their art is a true and honest form
            of expression.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="order-2 flex flex-col justify-center gap-2 lg:order-1">
              <p className="font-bold">5M Children</p>
              <p className="">
                ICAF has reached more than five million children, encouraging
                them to create original artworks through our programs.{' '}
              </p>
              <p className="font-bold">2.5M Participants</p>
              <p className="">
                Our festivals and exhibitions have attracted about 2.5 million
                participants and visitors in major cities worldwide
              </p>
              <p className="font-bold">Making People Smile since 1998</p>
              <p className="">
                Over a million children, parents, teachers, and librarians have
                enjoyed our quarterly ChildArt magazine since 1998.
              </p>
              <Button
                asChild
                variant="secondary"
                className="mt-4 h-14 self-center rounded-full px-6 text-base tracking-wide"
              >
                <a
                  href="https://icaf.org/donate"
                  target="blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <HeartIcon
                    strokeWidth={2}
                    className="!h-5 !w-5 stroke-black lg:mr-0 lg:!h-5 lg:!w-5"
                  />
                  Donate to our campaign
                </a>
              </Button>
            </div>
            <div className="order-1 content-center lg:order-2">
              <div className="self-center overflow-hidden rounded-[30px]">
                <img src={DancingImg} className="object-cover lg:h-[400px]" />
              </div>
            </div>
          </div>
        </div>
        {/* Children's voices section */}
        <div>
          <p className="text-center text-5xl font-extrabold">
            Bringing Children's Voices to the World
          </p>
          <ContentCarousel carouselData={ImpactContentCarouselData} />
        </div>
      </div>
    </div>
  );
};

export default Impact;
