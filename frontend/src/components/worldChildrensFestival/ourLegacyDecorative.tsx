import { WhiteBannerMobile } from '@/assets/worldChildrensFestival/whiteBannerMobile';
import { BlueBannerMobile } from '@/assets/worldChildrensFestival/blueBannerMobile';
import { BlueBanner } from '@/assets/worldChildrensFestival/blueBanner';
import Graphic from '@/assets/shared/images/about/more/Group 514888.svg';
import { AboutGraphic2 } from '@/assets/shared/images/about/AboutGraphic2';
import { WhiteBanner } from '@/assets/worldChildrensFestival/whiteBanner';
import congress from '@/assets/worldChildrensFestival/congress.png';
import { AboutGraphic1 } from '@/assets/shared/images/about/AboutGraphic1';
import YellowConfetti from '@/assets/worldChildrensFestival/yellowConfetti.svg';

export default function OurLegacyDecorative() {
  return (
    <div>
      <div className="md:mt-76 relative z-0 mb-32 mt-44 w-full sm:mt-72">
        {/*3 Line Swoop Decoration */}
        <div className="absolute bottom-0 left-0 z-30 hidden w-full overflow-hidden md:-bottom-[58rem] md:block lg:-bottom-[47rem] xl:-bottom-[48rem] 2xl:-bottom-[50rem]">
          <div className="pointer-events-none relative left-1/2 w-[130%] -translate-x-1/2 sm:bottom-[-10%] sm:left-1/2 md:bottom-0 2xl:bottom-[-12%]">
            <img
              src={Graphic}
              className="pointer-events-none h-auto w-full object-cover"
            />
          </div>
        </div>

        {/*Mobile and Desktop Background Single Swoop*/}
        <WhiteBannerMobile className="absolute left-0 top-4 z-20 h-[900px] w-full md:h-[1000px] lg:hidden" />
        <BlueBannerMobile className="absolute z-10 h-[900px] w-full md:h-[1000px] lg:hidden" />

        <BlueBanner className="absolute left-0 top-0 z-10 hidden h-[700px] w-full lg:block lg:h-[800px] xl:h-[850px] 2xl:h-[900px]" />
        <WhiteBanner className="absolute left-0 top-4 z-20 hidden h-[700px] w-full lg:block lg:h-[800px] xl:h-[850px] 2xl:h-[900px]" />

        {/*Capitol Building Image*/}
        <img
          src={congress}
          alt="Capitol building"
          className="2xl:[700px] xl:tranlate-y-[75%] absolute top-0 z-[-10] w-[270px] translate-y-[-80%] sm:w-[350px] sm:translate-y-[-76%] md:translate-y-[-85%] lg:w-[470px] lg:translate-y-[-70%] xl:w-[600px]"
        />

        {/* Confetti Decorations */}
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
        {/*Bottom Confetti Decoration */}
        <div className="absolute -bottom-[60rem] right-6 z-50 md:-bottom-[70rem] md:right-10 lg:-bottom-[55rem] xl:-bottom-[60rem] xl:right-16">
          <AboutGraphic2 className="h-32 w-32 sm:h-44 sm:w-44 xl:h-60 xl:w-60" />
        </div>
      </div>
    </div>
  );
}
