import { Link } from 'react-router-dom';
import { linkClasses } from '@/data/linkClasses';
import { Button } from '../ui/button';
import nominationImg from '@/assets/worldChildrensAward/wca-content-img1.webp';

export const WCANominations = () => {
  return (
    <div className="m-pad flex flex-col gap-10">
      <h2 className="font-montserrat mx-auto text-center text-[40px] font-extrabold">
        Nominations
      </h2>
      <div className="grid grid-rows-2 gap-2 overflow-hidden rounded-[40px] bg-[#FFECCB] sm:min-h-[550px] md:grid-cols-2 md:grid-rows-1 md:gap-10 lg:min-h-[500px]">
        <div className="space-between flex flex-col p-8 md:p-10">
          <div className="flex flex-col gap-4">
            <p>
              If you are between the ages of 14 and 20, you have the opportunity
              to nominate a business, philanthropic organization, educator, or
              cultural leader for the 2026 World Children’s Award. Please share
              your nominee and the reasons for your nomination on our{' '}
              <Link className={linkClasses} to={'/contact'}>
                Contact page
              </Link>
              .
            </p>
            <p>
              Professionals are also encouraged to submit their nominations. Be
              sure to specify why you believe your nominee or business deserves
              the Award and describe your relationship to the nominee on our{' '}
              <Link className={linkClasses} to={'/contact'}>
                Contact page
              </Link>
              .
            </p>
          </div>
          <div className="mx-auto mt-auto pt-6">
            <Link to={'/contact'}>
              <Button className="mx-auto rounded-full p-6 text-[16px]">
                Submit Nomination
              </Button>
            </Link>
          </div>
        </div>
        <div className="">
          <img
            className="h-full w-full object-cover object-[20%]"
            src={nominationImg}
          />
        </div>
      </div>
    </div>
  );
};
