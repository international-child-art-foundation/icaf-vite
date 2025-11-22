import { ProfessionalsContact } from '@/components/professionals/ProfessionalsContact';
import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { ProfessionalsHowTo } from '@/components/professionals/ProfessionalsHowTo';
import { ProfessionalsIntro } from '@/components/professionals/ProfessionalsIntro';

export const Professionals = () => {
  return (
    <div>
      <div>
        <ProfessionalsHeader />
        <ProfessionalsIntro />
        <ProfessionalsHowTo />
        <ProfessionalsContact />
      </div>
    </div>
  );
};
