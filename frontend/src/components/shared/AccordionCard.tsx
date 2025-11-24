import { useState } from 'react';
import { IAccordionCard } from '@/types/AccordionCardTypes';
import { ArrowDownCircle } from 'lucide-react';
import { renderExtendedDescription } from './RenderExtendedDescription';
import { FlairColorMap } from './FlairColorMap';

interface MissionDropdownProps {
  data: IAccordionCard;
}

const AccordionCard = ({ data }: MissionDropdownProps) => {
  const [open, setOpen] = useState(false);
  const iconColor = FlairColorMap[data.color]?.icon;

  return (
    <div
      key={data.id}
      className={`mx-auto w-full rounded-3xl border-4 ${open && FlairColorMap[data.color]?.background} bg-opacity-8 transition-colors duration-500 ${FlairColorMap[data.color]?.border} cursor-pointer p-12`}
      onClick={() => setOpen((prev) => !prev)}
    >
      <div className="grid-col grid h-full flex-col justify-items-center gap-2">
        <data.Icon colorClass={iconColor} />
        <div className="min-h-[50px] content-center">
          <p className="text-center text-xl font-semibold">{data.title}</p>
        </div>
        <div
          className={`grid transition-all duration-500 ${open ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
        >
          <div className="overflow-hidden">
            <p
              className={`text-center text-base font-normal transition-all duration-500 ${open ? 'opacity-0' : 'opacity-100'}`}
            >
              {data.shortDescription}
            </p>
          </div>
        </div>
        <div
          className={`grid transition-all duration-500 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div
              className={`text-sm transition-all duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
            >
              {renderExtendedDescription(data.extendedDescription)}
            </div>
          </div>
        </div>
        <ArrowDownCircle className="mt-auto cursor-pointer justify-self-center" />
      </div>
    </div>
  );
};

export default AccordionCard;
