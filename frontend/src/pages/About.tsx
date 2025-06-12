import heroImage from '@/assets/shared/images/about/aboutUs.webp';
import WhoWeAre from '@/components/about/WhoWeAre';
import { CurvedImage } from './CurvedImage';
import WhatWeWant from '@/components/about/WhatWeWant';
import YourDonations from '@/components/about/YourDonations';
// import Testimonials from '@/components/about/Testimonials/Testimonials';
import { TestimonialsCarousel } from '@/components/about/testimonials/TestimonialsCarousel';
import { MoreCarousel } from '@/components/about/more/MoreCarousel';

export default function About() {
  return (
    <div className="overflow-x-hidden">
      <div className="">
        {/* Hero Section */}
        <div>
          <figure className="relative">
            <CurvedImage src={heroImage} />
            <figcaption className="sr-only">About Us hero image</figcaption>
            <div className="absolute inset-0 top-1/3 flex justify-center text-[40px] font-extrabold text-white lg:text-[60px]">
              <h1>About Us</h1>
            </div>
          </figure>
        </div>
        <div className="px-6 lg:px-10 xl:px-20">
          <WhoWeAre />
          <WhatWeWant />
          <MoreCarousel />
        </div>
      </div>
      {/* How Do We Do It */}
      {/* Explore Our Projects */}

      <TestimonialsCarousel />
      <div className="px-6 lg:px-10 xl:px-20">
        <YourDonations />
      </div>
    </div>
  );
}
