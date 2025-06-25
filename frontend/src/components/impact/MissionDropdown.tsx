import { useState } from 'react';
import { IMissionDropdownData } from '@/types/ImpactPageTypes';
import { ArrowDownCircle } from 'lucide-react';

interface MissionDropdownProps {
  data: IMissionDropdownData;
}

const MissionDropdown = ({ data }: MissionDropdownProps) => {
  const [open, setOpen] = useState(false);
  const colorClassMap = {
    red: 'border-secondary-pink',
    yellow: 'border-secondary-yellow',
    purple: 'border-secondary-purple',
    blue: 'border-secondary-blue',
    green: 'border-secondary-green',
  };
  type ColorKey = keyof typeof colorClassMap;
  return (
    <div
      key={data.title}
      className={`mx-auto w-full rounded-3xl border-4 ${colorClassMap[data.color as ColorKey]} cursor-pointer p-12`}
      onClick={() => setOpen((prev) => !prev)}
    >
      <div className="grid-col grid h-full flex-col gap-2">
        <img src={data.image} className="mx-auto h-[80px] w-[80px]" />
        <div className="min-h-[50px] content-center">
          <p className="text-center font-semibold">{data.title}</p>
        </div>
        <div
          className={`grid transition-all duration-500 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <p
              className={`transition-all duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
            >
              {data.body}
            </p>
          </div>
        </div>
        <ArrowDownCircle className="mt-auto cursor-pointer justify-self-center" />
      </div>
    </div>
  );
};

export default MissionDropdown;
