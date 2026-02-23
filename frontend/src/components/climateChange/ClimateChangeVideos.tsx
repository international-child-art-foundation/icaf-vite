import { ClimateChangeVideoCallout } from './ClimateChangeVideoCallout';
import { ClimateChangeVideoCalloutData } from '@/data/climateChange/climateChangeVideoCalloutData';

export const ClimateChangeVideos = () => {
  return (
    <div className="content-w m-pad flex flex-col gap-8">
      <h2 className="font-montserrat text-3xl font-semibold">
        ICAF Initiatives
      </h2>
      {ClimateChangeVideoCalloutData.map((data, idx) => (
        <ClimateChangeVideoCallout
          key={data.title}
          {...data}
          side={idx % 2 == 0 ? 'right' : 'left'}
        />
      ))}
    </div>
  );
};
