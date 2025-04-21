import HomeHeader from "@/components/home/HomeHeader";
import {
  childrenImage1536,
  childrenImage768,
  childrenImage428,
} from "@/assets/shared/images/home/children";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "@/assets/shared/icons/HeartIcon";

export default function Home() {
  return (
    <div>
      <div className="relative h-[565px] md:h-[541px] lg:h-[676px] p-0 overflow-hidden">
        <picture>
          <source media="(min-width: 1024px)" srcSet={childrenImage1536} />
          <source media="(min-width: 768px)" srcSet={childrenImage768} />
          <source media="(max-width: 767px)" srcSet={childrenImage428} />
          <img
            src={childrenImage1536}
            alt="Children holding art"
            className="absolute inset-0 h-full w-full object-cover object-left transition-opacity duration-300 ease-in-out"
          />
        </picture>
        <div className="absolute flex flex-col top-0 left-0 gap-10 px-6 pt-10 md:px-5 md:w-[486px] lg:pt-[90px] lg:pl-20 lg:gap-8 lg:w-[744px]">
          <h1 className="font-montserrat text-4xl font-extrabold leading-normal tracking-normal lg:text-6xl">
            Welcome to ICAF Inspiring Creativity, Transforming Lives
          </h1>
          <p className="font-sans text-base tracking-normal lg:font-semibold lg:text-xl lg:leading-8">
            Empowering children through the arts to foster creativity and
            positive change since 1997.
          </p>
          <div>
            <Button
              variant={"secondary"}
              size={"lg"}
              className="font-semibold text-base rounded-full"
            >
              {" "}
              <HeartIcon
                width={24}
                height={24}
                strokeWidth={2}
                className="stroke-black w-6 !h-6 md:!w-6 md:!h-6 md:mr-0"
              />
              Donate to our campaign
            </Button>
          </div>
        </div>
      </div>
      <HomeHeader />
    </div>
  );
}
