import { donationWayData } from '@/data/donate/donationWayData';
import { CircleArrowDown } from 'lucide-react';

export default function DonationWay() {
    return (
        <div className="py-16">
            <div className="px-8 md:px-8 lg:px-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                        More ways to give
                    </h2>
                    <p className="text-base text-black">
                        Explore different ways to support our mission.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {donationWayData.map((way) => (
                        <div
                            key={way.id}
                            className={`bg-white rounded-2xl p-6 border-2 ${way.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}
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
                                <p className="text-sm text-black mb-6">
                                    {way.description}
                                </p>

                                {/* Arrow Button */}
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                        <CircleArrowDown />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 