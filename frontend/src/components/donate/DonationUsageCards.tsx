import { DonationUsageData } from '@/data/donate/donationUsageData';
import { useState } from 'react';
import { FlairColorMap } from '../shared/FlairColorMap';

export default function HowWeMakeItHappen() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        {DonationUsageData.map((item) => (
          <div
            key={item.id}
            className={`${selectedCard === item.id ? FlairColorMap[item.color]?.background : 'bg-white'} rounded-2xl border-4 p-4 ${FlairColorMap[item.color]?.border} hover:shadow-8 flex cursor-pointer items-center bg-opacity-10 transition-all duration-300`}
            onClick={() => toggleCard(item.id)}
          >
            <div className="flex items-center gap-6">
              <div className="ml-4 flex-shrink-0">
                <img src={item.icon} alt={item.title} className="h-12 w-12" />
              </div>
              <div className="mr-4 flex flex-1 flex-col justify-center">
                <h3 className="mb-2 text-xl font-bold text-black">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-gray-700">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
