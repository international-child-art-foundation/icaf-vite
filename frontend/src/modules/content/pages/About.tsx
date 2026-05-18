import heroImage from '@/modules/content/assets/about/_MG_5720.webp';
import WhoWeAre from '@/modules/content/components/about/WhoWeAre';
import { CurvedImage } from '@/shared/components/CurvedImage';
import WhatWeWant from '@/modules/content/components/about/WhatWeWant';
import YourDonations from '@/modules/content/components/shared/YourDonations';
import { TestimonialsCarousel } from '@/modules/content/components/about/testimonial/TestimonialsCarousel';
import { MoreCarousel } from '@/modules/content/components/about/more/MoreCarousel';
import ExploreOurProjects from '@/modules/content/components/about/ExploreOurProjects';
import HowWeDoIt from '@/modules/content/components/about/HowWeDoIt';
import { Seo } from '@/modules/content/components/shared/Seo';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';

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
              gradientDefinition="bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7)_1%,rgba(255,255,255,0)_55%)]"
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
        <ExploreOurProjects />
        <MoreCarousel />
        <TestimonialsCarousel />
        <YourDonations />
      </div>
      <PageBottomSpacer />
    </>
  );
}
