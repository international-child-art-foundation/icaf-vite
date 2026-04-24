import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { linkClasses } from '@/data/linkClasses';

export const WCACTA = () => {
  return (
    <div className="m-pad breakout-w">
      <div className="rounded-[40px] bg-[#E0E8F8] p-10">
        <p className="text-md font-semibold leading-[24px]">
          If you are between the ages of 14 and 20, you have the opportunity to
          nominate a business, philanthropic organization, educator, or cultural
          leader for the 2026 World Children’s Award. Please share your nominee
          and the reasons for your nomination{' '}
          <Link className={linkClasses} to={'/contact'}>
            here
          </Link>
          .
        </p>
        <div className="mt-auto flex w-full flex-col gap-6 pt-6 text-center sm:flex-row md:w-auto md:text-left">
          <Link to={'/contact'}>
            <Button
              variant={'secondary'}
              className="md:text-md w-full rounded-full p-6 text-lg font-semibold md:p-3 md:px-6"
            >
              Partner with ICAF
            </Button>
          </Link>
          <Link
            to={'/get-involved/volunteers'}
            className="overflow-hidden rounded-xl"
          >
            <Button className="md:text-md w-full rounded-full p-6 text-lg md:p-3 md:px-6">
              Get Involved
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
