// import { VideoWrapper } from '../shared/VideoWrapper';
import { TitleDescriptionCard } from './TitleDescriptionCard';
export const HomeImpact = () => {
  return (
    <div className="grid max-w-screen-2xl grid-cols-10 grid-rows-5 gap-10 px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="col-span-3 col-start-1 row-span-2 row-start-1">
        <TitleDescriptionCard
          title={'Pedagogy'}
          description={
            'ICAF has pioneered STEAMS education to integrate art and sports into STEM instruction.'
          }
          color={'red'}
        />
      </div>
      <div className="col-span-3 col-start-1 row-span-2 row-start-3">
        <TitleDescriptionCard
          title={'Advocacy'}
          description={
            'ICAF is the largest child art exhibitor and organizer of youth panels at conferences.'
          }
          color={'blue'}
        />
      </div>
      <div className="col-span-2 col-start-1 row-span-2 row-start-1">
        <div className="bg-black"></div>
        {/* <VideoWrapper src={}/> */}
      </div>
      <div className="col-span-10 col-start-1 row-span-2 row-start-5">
        <TitleDescriptionCard
          title={'Pedagogy'}
          description={
            'ICAF has pioneered STEAMS education to integrate art and sports into STEM instruction.'
          }
          color={'yellow'}
        />
      </div>
    </div>
  );
};
