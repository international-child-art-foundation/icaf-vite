import React from 'react';
import IntroBannerImg from '@/assets/donate/IntroBanner.png';


const IntroBanner: React.FC = () => {
    return (
        <div className="w-full py-12">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Section - Text and Button */}
                    <div className="lg:w-1/2 bg-blue-100 p-8 lg:p-12 flex items-center justify-center">
                        <div className="text-center lg:text-left">
                            <p className="text-base text-gray-800 leading-relaxed mb-6">
                                Established in 1997 as the national arts organization for American children and the global arts organization for children worldwide, ICAF cultivates their creativity and grows mutual empathy for a prosperous and peaceful future.
                            </p>
                            <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                                More about us
                            </button>
                        </div>
                    </div>

                    {/* Right Section - Image */}
                    <div className="lg:w-1/2">
                        <img
                            src={IntroBannerImg}
                            alt="Adult and child engaged in art activity"
                            className="w-full h-64 lg:h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntroBanner;
