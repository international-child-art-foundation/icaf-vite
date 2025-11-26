// components/shared/TestimonialBlock.tsx
import RedBlockSVG from '@/assets/shared/images/testimonial/red-block.svg';
import YellowBlockSVG from '@/assets/shared/images/testimonial/yellow-block.svg';
import ThreeLines1536 from '@/assets/shared/images/testimonial/three-lines.svg';
import ThreeLinesDefault from '@/assets/shared/images/testimonial/three-lines-1280.svg';
import ThreeLinesMobile from '@/assets/shared/images/testimonial/three-lines-mobile.svg';

export default function TestimonialBlock() {
  return (
    <section className="relative w-full overflow-hidden px-1 py-16 md:px-12 lg:px-20 xl:px-24 2xl:px-32">
      {/* Outer container with max width */}
      {/* <div className="relative mx-auto max-w-[1100px]"> */}
      <div className="relative mx-auto mb-20 w-full max-w-[500px] px-6 sm:max-w-[600px] sm:px-6 md:max-w-[1100px] md:px-0">
        {/* Red block positioned relative to the card */}
        <img
          src={RedBlockSVG}
          alt=""
          className="absolute left-[-60px] top-[-50px] z-0 w-[360px]"
        />

        {/* Yellow block positioned relative to the card */}
        <img
          src={YellowBlockSVG}
          alt=""
          className="absolute bottom-[-60px] right-[-60px] z-0 w-[360px]"
        />

        {/* Decorative three lines centered behind the card */}
        {/* mobile version */}
        <img
          src={ThreeLinesMobile}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[40%] z-[-1] block w-[150%] max-w-none -translate-x-1/2 sm:hidden"
        />

        {/* default version for tablet & desktop */}
        <img
          src={ThreeLinesDefault}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[60%] z-[-1] hidden w-[150%] max-w-none -translate-x-1/2 sm:block xl:hidden"
        />

        {/* xl version (≥1536px) */}
        <img
          src={ThreeLines1536}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[10%] z-[-1] hidden w-[150%] max-w-none -translate-x-1/2 xl:block"
        />

        {/* Testimonial Card */}
        <div className="relative z-10 rounded-3xl bg-white px-6 py-12 shadow-lg md:px-20 md:py-16">
          {/* Left top quotation mark */}
          <span className="absolute left-6 top-10 select-none font-serif text-9xl leading-none text-blue-600">
            “
          </span>

          {/* Right bottom quotation mark */}
          <span className="absolute bottom-0 right-6 translate-y-12 select-none font-serif text-9xl leading-none text-blue-600">
            ”
          </span>

          {/* Card content */}
          <div className="flex flex-col items-center text-center">
            {/* Logo circle */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-xs font-bold leading-tight text-white">
              teacher
              <br />
              librarian
            </div>

            {/* Heading */}
            <h3 className="mb-4 text-base font-bold text-gray-900 md:text-lg">
              Teacher Librarian: The Journal for School Library Professionals.
            </h3>

            {/* Paragraph */}
            <p className="text-left text-sm leading-relaxed text-gray-800 md:text-base">
              The International Child Art Foundation publishes ChildArt … that
              fosters learning, self-discovery, and global education for
              children through all types of art and design projects and
              activities. Vibrant color illustrations and photographs show art
              created by children and illustrate step-by-step craft projects
              from around the world that can be done in the classroom.
              Teacher-librarians will find ChildArt to be an excellent source
              for creative multi-cultural projects to recommend to teachers and
              students.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
