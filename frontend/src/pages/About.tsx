import heroImage from '@/assets/shared/images/about/AboutUsHero.webp';
import WhoWeAre from '@/components/about/WhoWeAre';
import { CurvedImage } from './CurvedImage';
import WhatWeWant from '@/components/about/WhatWeWant';
import YourDonations from '@/components/shared/YourDonations';
// import Testimonials from '@/components/about/Testimonials/Testimonials';
import { TestimonialsCarousel } from '@/components/about/testimonial/TestimonialsCarousel';
import { MoreCarousel } from '@/components/about/more/MoreCarousel';
import ExploreOurProjects from '@/components/about/ExploreOurProjects';
import HowWeDoIt from '@/components/about/HowWeDoIt';

export default function About() {
  return (
    <div className="overflow-x-hidden">
      <div className="">
        {/* Hero Section */}
        <div>
          <figure className="relative">
            <CurvedImage
              src={heroImage}
              gradientDefinition="bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7)_1%,rgba(255,255,255,0.2)_20%,rgba(255,255,255,0)_40%)]"
            />
            <figcaption className="sr-only">About Us hero image</figcaption>
            <div className="absolute inset-0 top-1/3 flex justify-center text-[40px] font-extrabold text-white lg:text-[60px]">
              <h1>About Us</h1>
            </div>
          </figure>
        </div>
        <div className="px-6 lg:px-10 xl:px-20">
          <WhoWeAre />
          <WhatWeWant />
          <HowWeDoIt />
          <ExploreOurProjects />
          <MoreCarousel />
        </div>
      </div>
      {/* How Do We Do It */}
      {/* Explore Our Projects */}

      <TestimonialsCarousel />
      <YourDonations />
    </div>
  );
}
