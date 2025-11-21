import { ClimateChangeVideoCallout } from './ClimateChangeVideoCallout';
import { ClimateChangeVideoCalloutData } from '@/data/climateChange/climateChangeVideoCalloutData';

export const ClimateChangeVideos = () => {
  return (
    <div className="mb-16 flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <p className="font-montserrat text-3xl font-semibold">
          ICAF Initiatives
        </p>
        {ClimateChangeVideoCalloutData.map((data, idx) => (
          <ClimateChangeVideoCallout
            key={data.title}
            {...data}
            side={idx % 2 == 0 ? 'right' : 'left'}
          />
        ))}
      </div>
    </div>
  );
};
