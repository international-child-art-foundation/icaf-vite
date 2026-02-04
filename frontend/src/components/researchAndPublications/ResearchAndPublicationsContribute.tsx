import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

export default function ResearchAndPublicationsContribute() {
  return (
    <div className="overflow-x-hidden py-16">
      <section className="mb-8">
        <div className="relative flex h-[332px] w-full flex-col justify-center overflow-visible rounded-2xl bg-[#FFECCB]/80 px-6 md:h-[300px] md:px-12 lg:h-[320px] lg:items-center xl:h-[280px]">
          <h2 className="font-montserrat text-2xl font-semibold leading-loose md:max-w-[85%] lg:text-3xl 2xl:max-w-[70%]">
            Interested in working alongside ICAF?
          </h2>
          <p className="mt-2">You may have more influence than you think.</p>
          <div className="mt-6 flex">
            <Link to="/get-involved/professionals" className="">
              <Button className="h-full w-full rounded-full font-sans text-base 2xl:text-xl">
                <p className="">Learn how to contribute</p>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
