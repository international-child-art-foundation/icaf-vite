import heroImage from '@/assets/about/_MG_5720.webp';
import WhoWeAre from '@/components/about/WhoWeAre';
import { CurvedImage } from './CurvedImage';
import WhatWeWant from '@/components/about/WhatWeWant';
import YourDonations from '@/components/shared/YourDonations';
import { TestimonialsCarousel } from '@/components/about/testimonial/TestimonialsCarousel';
import { MoreCarousel } from '@/components/about/more/MoreCarousel';
import ExploreOurProjects from '@/components/about/ExploreOurProjects';
import HowWeDoIt from '@/components/about/HowWeDoIt';
import { Seo } from '@/components/shared/Seo';

const aboutMetadata = {
  title: 'About | ICAF',
  description:
    'The International Child Art Foundation (ICAF) fosters children’s creativity and empathy through global art programs, festivals, research, and educational initiatives.',
  path: '/about',
};

export default function About() {
  return (
    <>
      <Seo {...aboutMetadata} />

      <div className="content-gap">
        <div className="w-site">
          <figure className="relative">
            <CurvedImage
              src={heroImage}
              gradientDefinition="bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7)_1%,rgba(255,255,255,0)_30%)]"
            />
            <figcaption className="sr-only">About Us hero image</figcaption>
            <div className="absolute inset-0 top-1/3 flex justify-center text-[40px] font-extrabold text-white lg:text-[60px]">
              <h1>About Us</h1>
            </div>
          </figure>
        </div>
        <WhoWeAre />
        <WhatWeWant />
        <HowWeDoIt />
        <ExploreOurProjects /> */}
        {/* <MoreCarousel /> */}
        {/* <TestimonialsCarousel /> */}
        {/* <YourDonations />
      </div>
    </>
  );
}
