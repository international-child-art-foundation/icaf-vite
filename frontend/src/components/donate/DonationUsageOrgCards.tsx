import React from 'react';
import { donationUsageData } from '../../data/donate/donationUsageOrgData';
import { FlairColorMap } from '../shared/FlairColorMap';

import { CircleArrowRight } from 'lucide-react';

const DonationUsageCards: React.FC = () => {
  // TODO: Replace with href once pages are linkable
  const handleCardClick = (redirectTo: string) => {
    console.log(`Redirecting to: ${redirectTo}`);
  };

  return (
    <div className="w-full py-12">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
          Where your support goes
        </h2>
        <p className="text-lg text-gray-600">
          90% of your donation directly funds:
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {donationUsageData.map((card) => (
          <button
            type="button"
            key={card.id}
            className={`group w-full cursor-pointer rounded-2xl border-2 border-white ${FlairColorMap[card.color].borderHover} bg-opacity-8 p-6 text-left shadow-[2px_4px_4px_rgba(54,53,53,0.1)] transition-all duration-300 hover:shadow-xl lg:p-8`}
            onClick={() => handleCardClick(card.redirectTo)}
            aria-label={`Learn more about ${card.title}`}
          >
            {/* Icon Section */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center lg:h-24 lg:w-24">
                <img
                  src={card.icon}
                  alt={card.title}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="text-center">
              <h3 className="mb-4 text-xl font-bold text-gray-900 lg:text-2xl">
                {card.title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-600 lg:text-base">
                {card.description}
              </p>

              {/* Action Button */}
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white transition-transform duration-200 group-hover:scale-110">
                {/* <ArrowRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" /> */}
                <CircleArrowRight />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DonationUsageCards;
