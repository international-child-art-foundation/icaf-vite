import { Button } from '../ui/button';
import { HeartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SponsorshipCTA = () => {
  return (
    <div>
      <div className="flex flex-col items-center gap-8">
        <p className="font-montserrat text-[32px] font-extrabold">
          Let's work together
        </p>
        <p className="font-open-sans text-normal">
          Let’s build a peaceful, creative, and caring world with children’s
          help.
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="mx-auto rounded-[40px]"
        >
          <div className="flex flex-row gap-2 px-2">
            <HeartIcon
              strokeWidth={2}
              className="!h-6 !w-6 stroke-black lg:!h-6 lg:!w-6"
            />

            <Link
              className="font-open-sans text-base font-semibold"
              to="/donate"
            >
              Sponsor our campaign
            </Link>
          </div>
        </Button>
      </div>
    </div>
  );
};
