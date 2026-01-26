import { CurvedImage } from './CurvedImage';
import WorldMural from '@/assets/impact/WorldMural.webp';
import AccordionDropdowns from '@/components/shared/AccordionDropdowns';
import MissionDropdownData from '@/data/impact/impactMissionDropdownData';
import DancingImg from '@/assets/impact/Dancing.webp';
import { ContentCarousel } from '@/components/impact/ContentCarousel';
import { ImpactContentCarouselData } from '@/data/impact/impactContentCarouselData';
import { Seo } from '@/components/shared/Seo';
import DonateButton from '@/components/ui/donateButton';
import YourDonations from '@/components/shared/YourDonations';

const impactMetadata = {
  title: 'Impact | ICAF',
  description: 'Learn about how ICAF has made difference in the world.',
  path: '/impact',
};

const Impact = () => {
  return (
    <>
      <Seo {...impactMetadata} />
      <div className="relative w-full">
        {/* Header */}
        <div className="grid h-[550px] grid-cols-1 grid-rows-1">
          <div className="col-start-1 row-start-1">
            <CurvedImage
              src={WorldMural}
              curveStyle={'Ellipse'}
              darkened={true}
              gradientDefinition={'bg-gradient-to-b from-black/50 to-black/30'}
            />
          </div>
          <p className="margin-auto font-montserrat z-20 col-start-1 row-start-1 -mt-14 content-center place-self-center text-6xl font-extrabold text-white">
            Impact
          </p>
        </div>
        {/* Body */}
        <div className="relative mt-16 grid w-full gap-20">
          {/* Better World with Creativity Section */}
          <div className="grid max-w-screen-2xl gap-8 px-8 md:px-12 lg:px-16 xl:px-20">
            <h2 className="font-montserrat text-center text-3xl font-extrabold">
              Building a Better World with Creativity
            </h2>
            <p className="text-xl">
              At ICAF, we're working to make the world more peaceful,
              prosperous, and sustainable. We believe that helping kids grow
              creatively and empathetically can help achieve six important goals
              set by the United Nations. These goals include:
            </p>
            <AccordionDropdowns data={MissionDropdownData} />
          </div>
          {/* Making an Impact section */}
          <div className="grid-col grid max-w-screen-2xl gap-20 px-8 md:px-12 lg:px-16 xl:px-20">
            <div className="grid gap-8">
              <h2 className="font-montserrat text-center text-3xl font-extrabold">
                Making an Impact
              </h2>
              <p className="text-xl">
                Every day, thousands of kids learn about ICAF and its programs
                from their friends or online. Participation in our programs can
                help them see themselves as creative individuals. Through art,
                children realize that their imagination can lead to new
                discoveries and innovations, and that their creations are a true
                and honest form of expression.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="order-2 flex flex-col justify-center gap-8 lg:order-1">
                <div className="grid gap-3">
                  <h3 className="font-montserrat text-2xl font-bold">
                    5M Children
                  </h3>
                  <p className="text-xl">
                    ICAF has reached more than five million children,
                    encouraging them to create original artworks through our
                    programs.{' '}
                  </p>
                </div>
                <div className="grid gap-3">
                  <h3 className="font-montserrat text-2xl font-bold">
                    2.5M Participants
                  </h3>
                  <p className="text-xl">
                    Our festivals and exhibitions have attracted about 2.5
                    million participants and visitors in major cities worldwide.
                  </p>
                </div>
                <div className="grid gap-3">
                  <h3 className="font-montserrat text-2xl font-bold">
                    Making People Smile since 1998
                  </h3>
                  <p className="text-xl">
                    Over a million children, parents, teachers, and librarians
                    have enjoyed our quarterly ChildArt magazine since 1998.
                  </p>
                </div>
                <div className="mx-auto flex">
                  <DonateButton
                    text="Donate to our Campaign"
                    className="px-6"
                  />
                </div>
              </div>
              <div className="relative order-1 content-center lg:order-2">
                <div className="relative h-full self-center overflow-hidden rounded-[30px]">
                  <img
                    src={DancingImg}
                    className="h-full w-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Children's voices section */}
          <div className="flex max-w-screen-2xl flex-col gap-8 overflow-hidden px-8 md:px-12 lg:px-16 xl:px-20">
            <h2 className="font-montserrat text-center text-3xl font-extrabold">
              Bringing Children's Voices to the World
            </h2>
            <ContentCarousel carouselData={ImpactContentCarouselData} />
          </div>
        </div>
        {/* Donation section */}
        <YourDonations />
      </div>
    </>
  );
};

export default Impact;
