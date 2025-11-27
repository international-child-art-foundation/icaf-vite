import { ProfessionalsHeader } from '@/components/professionals/ProfessionalsHeader';
import { ProfessionalsHowTo } from '@/components/professionals/ProfessionalsHowTo';
import { ProfessionalsIntro } from '@/components/professionals/ProfessionalsIntro';
import faceCollage from '@/assets/professionals/pexels-vanessa-loring-7869442 3.webp';
import { ContactForm } from '@/components/contact/ContactForm';
import { contactFormConfigs } from '@/data/contact';
import { Seo } from '@/components/shared/Seo';

const professionalsMetadata = {
  title: 'Professionals | ICAF',
  description:
    'ICAF partners with professionals around the world to democratize creativity and spread empathy.',
  path: '/get-involved/professionals',
};

export const Professionals = () => {
  return (
    <>
      <Seo {...professionalsMetadata} />
      <div>
        <ProfessionalsHeader />
        <div className="flex flex-col gap-12">
          <ProfessionalsIntro />
          <ProfessionalsHowTo />
          <ContactForm config={contactFormConfigs['professionals']} />{' '}
          <div className="flex w-full justify-center overflow-hidden">
            <img src={faceCollage} className="w-full min-w-[1000px]" alt="" />
          </div>
          <div className="h-8"></div>
        </div>
      </div>
    </>
  );
};
