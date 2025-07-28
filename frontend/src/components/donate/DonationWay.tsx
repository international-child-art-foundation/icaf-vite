import { donationWayData } from '@/data/donate/donationWayData';
import { CircleArrowDown, CircleArrowUp } from 'lucide-react';
import { useState } from 'react';

export default function DonationWay() {
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    const toggleCard = (cardId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };

    const isExpanded = (cardId: string) => expandedCards.has(cardId);

    return (
        <div className="py-16">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    More ways to give
                </h2>
                <p className="text-base text-black">
                    Explore different ways to support our mission.
                </p>
            </div>

            {/* Cards - Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {donationWayData.map((way) => (
                    <button
                        key={way.id}
                        type="button"
                        className={`${isExpanded(way.id) ? way.bgColor : 'bg-white'} rounded-2xl p-4 border-4 ${way.borderColor} hover:shadow-lg transition-all duration-700 ease-in-out cursor-pointer`}
                        onClick={() => toggleCard(way.id)}
                    >
                        {/* Icon */}
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <img
                                    src={way.icon}
                                    alt={way.title}
                                    className="w-12 h-12"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-black mb-3">
                                {way.title}
                            </h3>

                            {/* Description - Animated */}
                            <div className="overflow-hidden transition-all duration-700">
                                <p className="text-sm text-black mb-6">
                                    {way.description}
                                </p>

                                {/* Expanded Content */}
                                <div
                                    className={`transition-all duration-700 ${isExpanded(way.id)
                                        ? 'max-h-96 opacity-100 mt-4'
                                        : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    {Array.isArray(way.expandedDescription) ? (
                                        <div className="text-left">
                                            <p className="text-sm text-black mb-3">
                                                {way.expandedDescription[0]}
                                            </p>
                                            <ul className="text-sm text-black space-y-2 list-disc list-inside">
                                                {way.expandedDescription.slice(1).map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-black">
                                            {way.expandedDescription}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Arrow Button */}
                            <div className="flex justify-center">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-700">
                                    {isExpanded(way.id) ? (
                                        <CircleArrowUp className="w-6 h-6" />
                                    ) : (
                                        <CircleArrowDown className="w-6 h-6" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
} 