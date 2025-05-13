import heroImage from '../assets/shared/images/about/aboutUs768.png';
import WhoWeAre from '@/components/about/WhoWeAre';

export default function About() {
  return (
    <div className="mx-6">
      {/* Hero Section */}
      <div className="">
        <picture>
          <img
            src={heroImage}
            alt="children playing instruments"
            className=""
          />
        </picture>
      </div>
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
  );
}
