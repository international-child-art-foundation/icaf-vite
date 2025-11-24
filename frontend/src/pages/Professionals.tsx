import { ProfessionalsContact } from '@/components/professionals/ProfessionalsContact';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { ProfessionalsHowTo } from '@/components/professionals/ProfessionalsHowTo';
import { ProfessionalsIntro } from '@/components/professionals/ProfessionalsIntro';
import faceCollage from '@/assets/professionals/pexels-vanessa-loring-7869442 3.webp';

export const Professionals = () => {
  return (
    <div>
      <ProfessionalsHeader />
      <div className="flex flex-col gap-12">
        <ProfessionalsIntro />
        <ProfessionalsHowTo />
        <ProfessionalsContact />
        <div className="flex w-full justify-center overflow-hidden">
          <img src={faceCollage} className="w-full min-w-[1000px]" />
        </div>
        <div className="h-8"></div>
      </div>
    </div>
  );
};
