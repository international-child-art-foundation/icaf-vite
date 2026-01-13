import React from 'react';
import QuoteBannerImg from '@/assets/donate/QuoteBanner.png';

const QuoteBanner: React.FC = () => {
  return (
    <div className="w-full py-12">
      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Image */}
          <div className="lg:w-1/2">
            <img
              src={QuoteBannerImg}
              alt="Young dancers performing on stage"
              className="h-64 w-full object-cover lg:h-full"
            />
          </div>

          {/* Right Side - Quote */}
          <div className="flex items-center justify-center bg-blue-100 p-8 lg:w-1/2 lg:p-12">
            <div className="text-center lg:text-left">
              <blockquote className="mb-4 text-xl font-medium leading-relaxed text-gray-900 lg:text-2xl">
                "Children who engage in the arts show higher levels of empathy
                and prosocial behavior."
              </blockquote>
              <cite className="text-base font-black text-black underline">
                <a
                  href="https://www.oecd.org/en/publications/art-for-art-s-sake_9789264180789-en.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-blue-600"
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
