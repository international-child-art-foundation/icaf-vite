import heroImage from '../assets/shared/images/about/About Us Image.png';
import WhoWeAre from '@/components/about/WhoWeAre';
import { CurvedImage } from './CurvedImage';

export default function About() {
  return (
    <div className="overflow-x-hidden">
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
        {/* Who We Are */}
        <WhoWeAre />
        {/* What We Want */}
        <section className="">
          <h2>What We Want</h2>
        </section>
        {/* How Do We Do It */}
        <section className="">
          <h2>How Do We Do It</h2>
        </section>
        {/* Explore Our Projects */}
        <section className="">
          <h2>Explore Our Projects</h2>
        </section>
        {/* More on Our Projects */}
        <section className="">
          <h2>More on Our Projects</h2>
        </section>
        {/* Testimonials */}
        <section className="">
          <h2>Testimonials</h2>
        </section>
      </div>
    </div>
  );
}
