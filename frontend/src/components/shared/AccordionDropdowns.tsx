import AccordionCard from './AccordionCard';
import { IAccordionCard } from '@/types/AccordionCardTypes';

type AccordionDropdownProps = {
  data: IAccordionCard[];
};

const AccordionDropdowns = ({ data }: AccordionDropdownProps) => {
  console.log(data);
  return (
    <div>
      <div className="mx-auto grid auto-rows-min grid-cols-1 gap-8 sm:grid-cols-2 md:max-w-[100%] lg:max-w-[100%] xl:max-w-[90%] xl:grid-cols-3">
        {data.map((itemData) => {
          return <AccordionCard data={itemData} key={itemData.id} />;
        })}
      </div>
    </div>
  );
};

export default AccordionDropdowns;
