import React from 'react';
import { donationUsageData } from '../../data/donate/donationUsageData';

import { CircleArrowRight } from 'lucide-react';

const DonationUsageCards: React.FC = () => {
    const handleCardClick = (redirectTo: string) => {
        console.log(`Redirecting to: ${redirectTo}`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Where your support goes
                </h2>
                <p className="text-lg text-gray-600">
                    90% of your donation directly funds:
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {donationUsageData.map((card) => (
                    <button
                        key={card.id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 lg:p-8 border border-gray-100 cursor-pointer group text-left w-full"
                        style={{
                            borderColor: 'transparent',
                            '--hover-color': card.hoverColor
                        } as React.CSSProperties}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = card.hoverColor;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                        onClick={() => handleCardClick(card.redirectTo)}
                        aria-label={`Learn more about ${card.title}`}
                    >
                        {/* Icon Section */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                                <img
                                    src={card.icon}
                                    alt={card.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="text-center">
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                                {card.title}
                            </h3>
                            <p className="text-gray-600 text-sm lg:text-base leading-relaxed mb-6">
                                {card.description}
                            </p>

                            {/* Action Button */}
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white group-hover:scale-110 transition-transform duration-200">
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