import { donationMethodData } from '@/data/donate/donationMethodData';
import AccordionDropdowns from '../shared/AccordionDropdowns';

export default function DonationMethod() {
  return (
    <div className="mx-auto max-w-screen-2xl py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-black md:text-4xl">
          More ways to give
        </h2>
        <p className="text-base text-black">
          Explore different ways to support our mission.
        </p>
      </div>

      {/* Cards - Grid Layout */}
      <div className="">
        <AccordionDropdowns data={donationMethodData} />
      </div>
    </div>
  );
}
