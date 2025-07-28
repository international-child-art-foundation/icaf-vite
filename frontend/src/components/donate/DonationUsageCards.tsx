import { DonationUsageData } from '@/data/donate/donationUsageData';
import { useState } from 'react';


export default function HowWeMakeItHappen() {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const toggleCard = (cardId: string) => {
        setSelectedCard(prev => prev === cardId ? null : cardId);
    };

    return (
        <div>


            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
                {DonationUsageData.map((item) => (
                    <div
                        key={item.id}
                        className={`${selectedCard === item.id ? item.bgColor : 'bg-white'} rounded-2xl p-4 border-4 ${item.borderColor} transition-all duration-300 hover:shadow-lg cursor-pointer flex items-center`}
                        onClick={() => toggleCard(item.id)}
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0 ml-4">
                                <img src={item.icon} alt={item.title} className="w-12 h-12" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center mr-4">
                                <h3 className="text-xl font-bold text-black mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
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