import React from 'react';
import IntroBannerImg from '@/assets/donate/IntroBanner.png';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const IntroBanner: React.FC = () => {
  return (
    <div className="w-full py-12">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="flex flex-col-reverse lg:flex-row">
          {/* Left Section - Text and Button */}
          <div className="flex items-center justify-center bg-blue-100 p-8 lg:w-1/2 lg:p-12">
            <div className="text-center lg:text-left">
              <p className="mb-6 text-base leading-relaxed text-gray-800">
                Established in 1997 as the national arts organization for
                American children and the global arts organization for children
                worldwide, ICAF cultivates their creativity and grows mutual
                empathy for a prosperous and peaceful future.
              </p>
              <div className="mt-4">
                <Link to={'/about'}>
                  <Button className="mx-auto block h-14 rounded-full px-6 text-base tracking-wide">
                    More about us
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="lg:w-1/2">
            <img
              src={IntroBannerImg}
              alt="Adult and child engaged in art activity"
              className="h-64 w-full object-cover lg:h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroBanner;
