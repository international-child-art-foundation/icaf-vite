import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const HomeHeader = () => {
  return (
    <section className="relative z-10 mt-[98px]">
      <div className="top-0 m-auto flex h-full w-full max-w-screen-2xl flex-col px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="mt-10 w-full sm:w-2/3 md:mt-20 md:w-3/5 xl:mt-24">
          <h1 className="font-montserrat text-4xl font-extrabold md:text-[32px] lg:text-[40px] xl:text-6xl 2xl:text-5xl">
            Welcome to ICAF:
            <p>Arts = Creativity + Empathy</p>
            <p>for a prosperous + peaceful future</p>
          </h1>
          <p className="font-openSans mt-4 hidden text-base font-normal md:text-xl lg:block lg:text-base xl:text-xl xl:font-semibold">
            Transforming young lives since 1997.
          </p>
        </div>

        <div className="mt-7 sm:mt-4 md:mt-8 lg:mt-4 xl:mt-8">
          <Button>
            {' '}
            <Heart /> Donate to our campaign
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeHeader;
