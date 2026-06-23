import { ProfessionalsHeader } from '@/modules/content/components/professionals/ProfessionalsHeader';
import { ProfessionalsHowTo } from '@/modules/content/components/professionals/ProfessionalsHowTo';
import { ProfessionalsIntro } from '@/modules/content/components/professionals/ProfessionalsIntro';
import faceCollage from '@/modules/content/assets/professionals/pexels-vanessa-loring-7869442 3.webp';
import { ContactForm } from '@/modules/content/components/contact/ContactForm';
import { contactFormConfigs } from '@/shared/data/contact';
import { Seo } from '@/modules/content/components/shared/Seo';

const professionalsMetadata = {
  title:
    'Professional Opportunities at ICAF — Join Our Global Arts Network',
  description:
    'ICAF welcomes arts educators, administrators, and creative professionals to contribute their expertise to our global programs and mission-driven initiatives.',
  path: '/get-involved/professionals',
};

export const Professionals = () => {
  return (
    <>
      <Seo {...professionalsMetadata} />
      <div className="content-gap">
        <ProfessionalsHeader />
        <ProfessionalsIntro />
        <ProfessionalsHowTo />
        <ContactForm
          config={contactFormConfigs['professionals']}
          headingLevel="h2"
        />
        <div className="flex w-full justify-center overflow-hidden">
          <img src={faceCollage} className="w-full min-w-[1000px]" alt="" />
        </div>
      </div>
    </>
  );
};
