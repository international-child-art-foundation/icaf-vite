import {
  theoryOfChange,
  outreach,
  whatWeDo,
  alignment,
} from '@/data/sponsorship/whyPartnerContent';
import { ContentCallout } from './ContentCallout';

export const WhyPartner = () => {
  return (
    <div className="relative flex flex-col gap-20 overflow-hidden">
      <div className="flex flex-col gap-4 text-center">
        <h2 className="font-montserrat text-[40px] font-extrabold">
          Why Partner with ICAF
        </h2>
        <p className="text-lg">
          Let customer and employees admire your company as a child-friendly
          business.
        </p>
      </div>
      <div className="relative flex flex-col gap-24">
        <ContentCallout {...theoryOfChange} />
        <ContentCallout {...outreach} />
        <ContentCallout {...whatWeDo} />
        <ContentCallout {...alignment} />
      </div>
    </div>
  );
};
