import { DonationUsageData } from '@/data/donate/donationUsageData';


export default function HowWeMakeItHappen() {
    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    How we make it happen
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DonationUsageData.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg"
                        style={{ borderColor: item.borderColor }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <img src={item.icon} alt={item.title} className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
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