import { VolunteerHeader } from '@/components/volunteer/VolunteerHeader';
import { WhyVolunteer } from '@/components/volunteer/WhyVolunteer';
import artworkShowcase from '@/assets/volunteer/icaf3.webp';
import footerImg from '@/assets/volunteer/Conneticut (Jazmine Anderson, 11).webp';
import { ContactForm } from '@/components/contact/ContactForm';
import { contactFormConfigs } from '@/data/contact';

export const Volunteer = () => {
  return (
    <div>
      <VolunteerHeader />
      <WhyVolunteer />
      <ContactForm config={contactFormConfigs['volunteer']} />{' '}
      <div className="w-screen-2xl mx-8 mb-12 grid grid-cols-1 gap-8 rounded-xl md:mx-12 md:grid-cols-10 lg:mx-16 xl:mx-20">
        <img
          src={artworkShowcase}
          className="hidden h-full w-full rounded-xl object-cover md:col-span-3 md:block"
        />
        <div className="relative overflow-hidden rounded-xl md:col-span-7">
          <img src={footerImg} className="object-bottom" />
        </div>
      </div>
    </div>
  );
};
