import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const HomeHeader = () => {
  return (
    <section className="relative z-10 mt-[98px]">
      <div className="m-auto max-w-screen-2xl px-8 md:px-12 lg:px-16 xl:px-20 top-0 w-full h-full flex flex-col">
        <div className="w-full sm:w-2/3 md:w-3/5 mt-10 md:mt-20 xl:mt-24">
          <h1 className="font-montserrat text-4xl md:text-[32px] lg:text-[40px] xl:text-6xl 2xl:text-5xl font-extrabold">
            Welcome to ICAF:
            <p>Arts = Creativity + Empathy</p>
            <p>for a prosperous + peaceful future</p>
          </h1>
          <p className="font-openSans mt-4 text-base md:text-xl lg:text-base xl:text-xl font-normal xl:font-semibold hidden lg:block">
            Transforming young lives since 1997.
          </p>
        </div>

        <div className="mt-7 sm:mt-4 md:mt-8 lg:mt-4 xl:mt-8">
          <Button>
            {" "}
            <Heart /> Donate to our campaign
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeHeader;
