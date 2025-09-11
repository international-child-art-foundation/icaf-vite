import {
  theoryOfChange,
  outreach,
  whatWeDo,
} from '@/data/sponsorship/whyPartnerContent';
import { ContentCallout } from './ContentCallout';

export const WhyPartner = () => {
  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col gap-4 text-center">
        <p className="font-montserrat text-[40px] font-extrabold">
          Why Partner with ICAF
        </p>
        <p>
          Let customer and employees admire your company as a child-friendly
          business.
        </p>
      </div>
      <div className="flex flex-col gap-24">
        <ContentCallout {...theoryOfChange} />
        <ContentCallout {...outreach} />
        <ContentCallout {...whatWeDo} />
      </div>
      {/* <ContentCallout {...alignment} /> */}
    </div>
  );
};
