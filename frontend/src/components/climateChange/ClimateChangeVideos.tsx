import { ClimateChangeVideoCallout } from './ClimateChangeVideoCallout';
import { ClimateChangeVideoCalloutData } from '@/data/climateChange/climateChangeVideoCalloutData';

export const ClimateChangeVideos = () => {
  return (
    <div>
      <div className="flex flex-col gap-8">
        <p>
          ICAF has also partnered with the U.S. Fish and Wildlife Service, the
          Endangered Species Coalition, and the Association of Zoos and
          Aquariums, to promote the “Saving Endangered Species Youth Art
          Contest” and to select the winners.{' '}
        </p>
        <div className="flex flex-col gap-8">
          {ClimateChangeVideoCalloutData.map((data, idx) => (
            <ClimateChangeVideoCallout
              key={data.title}
              {...data}
              side={idx % 2 == 0 ? 'right' : 'left'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
