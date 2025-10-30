import React from 'react';
import QuoteBannerImg from '@/assets/donate/QuoteBanner.png';

const QuoteBanner: React.FC = () => {
    return (
        <div className="w-full py-12">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Side - Image */}
                    <div className="lg:w-1/2">
                        <img
                            src={QuoteBannerImg}
                            alt="Young dancers performing on stage"
                            className="w-full h-64 lg:h-full object-cover"
                        />
                    </div>

                    {/* Right Side - Quote */}
                    <div className="lg:w-1/2 bg-blue-100 p-8 lg:p-12 flex items-center justify-center">
                        <div className="text-center lg:text-left">
                            <blockquote className="text-xl lg:text-2xl font-medium text-gray-900 mb-4 leading-relaxed">
                                "Children who engage in the arts show higher levels of empathy and prosocial behavior."
                            </blockquote>
                            <cite className="text-base font-black text-black underline">
                                <a
                                    href="https://www.oecd.org/en/publications/art-for-art-s-sake_9789264180789-en.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    OECD, 2013
                                </a>
                            </cite>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteBanner; 