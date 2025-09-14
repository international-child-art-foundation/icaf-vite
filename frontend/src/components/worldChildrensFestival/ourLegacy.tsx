import blue from '@/assets/worldChildrensFestival/blueBanner.svg';
import white from '@/assets/worldChildrensFestival/whiteBanner.svg';
import congress from '@/assets/worldChildrensFestival/congress.png';
import { AboutGraphic1 } from '@/assets/shared/images/about/AboutGraphic1';
import YellowConfetti from '@/assets/worldChildrensFestival/yellowConfetti.svg';

export default function OurLegacy() {
  return (
    <section>
      <div className="sm md:mt-76 relative z-0 mt-44 w-full sm:mt-72">
        <img
          src={blue}
          alt="blue background"
          className="relative z-10 w-full"
        />

        <img
          src={white}
          alt="white background"
          className="absolute inset-0 z-20 w-full translate-y-[4%]"
        />
        <img
          src={congress}
          alt="Capitol building"
          className="2xl:[700px] absolute top-0 z-[-10] w-[270px] translate-y-[-80%] sm:w-[350px] sm:translate-y-[-76%] md:translate-y-[-68%] lg:w-[470px] xl:w-[600px]"
        />
        <div className="absolute -top-48 translate-x-[160%] sm:translate-x-[220%] md:translate-x-[250%] lg:-top-56 lg:translate-x-[250%] xl:translate-x-[290%] 2xl:-top-64">
          <AboutGraphic1
            fill="#0050FA"
            className="h-32 w-32 lg:h-48 lg:w-48 xl:h-52 xl:w-52 2xl:h-64 2xl:w-64"
          />
        </div>
        <div className="absolute -top-72 hidden translate-x-[160%] sm:block sm:translate-x-[220%] md:translate-x-[250%] lg:-top-96 lg:translate-x-[280%] 2xl:-top-[450px]">
          <img
            src={YellowConfetti}
            className="h-48 w-48 lg:h-64 lg:w-64 xl:h-80 xl:w-80 2xl:h-96 2xl:w-96"
          />
        </div>
      </div>
    </section>
  );
}
