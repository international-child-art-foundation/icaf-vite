import { professionalsData } from '@/data/professionals/professionalsData';
import { ProfessionalsHowToItem } from './ProfessionalsHowToItem';

export const ProfessionalsHowTo = () => {
  return (
    <div className="breakout-w m-pad flex flex-col gap-4">
      {professionalsData.map((item) => (
        <ProfessionalsHowToItem key={item.title} {...item} />
      ))}
    </div>
  );
};
