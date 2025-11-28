import RedFirework from '@/assets/home/RedFirework.svg';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import { VideoWrapper } from '../shared/VideoWrapper';
import IcafHomeVideo from '@/assets/shared/media/icaf-overview-cropped.mp4';
import IcafHomeVideoThumb from '@/assets/home/icaf-overview-cropped-thumb.webp';

export const HomeImpact = () => {
  return (
    <div className="relative flex flex-col gap-8 px-8 md:px-12 lg:px-16 lg:pt-16 xl:px-20">
      <img
        src={RedFirework}
        className="absolute -top-16 right-4 hidden h-auto w-16 md:block md:w-32 lg:w-48"
        alt=""
      />
      <div className="flex flex-col gap-7">
        <h2 className="font-montserrat text-center text-[2rem] font-extrabold xl:text-[40px]">
          Educational & Cultural Impact
        </h2>
        <p className="font-sans text-base md:text-center xl:text-2xl">
          ICAF serves American children as their national art and creativity
          organization and the world’s children as their global art and
          creativity organization.
        </p>
      </div>

      <div className="grid-rows-auto relative grid max-w-screen-2xl grid-cols-1 gap-10 lg:grid-cols-10 lg:grid-rows-5">
        <div className="h-full lg:col-span-3 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <TitleDescriptionCard
            title={'Pedagogy'}
            description={
              'ICAF has pioneered STEAMS education to integrate art and sports into STEM instruction.'
            }
            color={'red'}
          />
        </div>
        <div className="h-full lg:col-span-3 lg:col-start-1 lg:row-span-2 lg:row-start-3">
          <TitleDescriptionCard
            title={'Advocacy'}
            description={
              'ICAF promotes children’s art as the most honest and pure form of human creative expression.'
            }
            color={'blue'}
          />
        </div>
        <div className="lg:col-span-7 lg:col-start-4 lg:row-span-4 lg:row-start-1">
          <VideoWrapper
            lazyMode="idle"
            thumbnail={IcafHomeVideoThumb}
            curved={true}
            src={IcafHomeVideo}
          />
        </div>
        <div className="lg:col-span-10 lg:col-start-1 lg:row-span-2 lg:row-start-5">
          <TitleDescriptionCard
            title={'5M'}
            description={
              'Over the past 29 years, more than five million students have produced original works under ICAF programs, and nearly two million people have attended ICAF’s festivals, exhibitions, and events.'
            }
            color={'yellow'}
          />
        </div>
      </div>
    </div>
  );
};
