import { IMissionDropdownData } from '@/types/ImpactPageTypes';
import MissionDropdown from './MissionDropdown';

type MissionDropdownsProps = {
  data: IMissionDropdownData[];
};

const MissionDropdowns = ({ data }: MissionDropdownsProps) => {
  console.log(data);
  return (
    <div>
      <div className="mx-auto grid auto-rows-min grid-cols-1 gap-8 sm:grid-cols-2 md:max-w-[100%] lg:max-w-[100%] xl:max-w-[90%] xl:grid-cols-3">
        {data.map((itemData) => {
          return <MissionDropdown data={itemData} key={itemData.title} />;
        })}
      </div>
    </div>
  );
};

export default MissionDropdowns;
