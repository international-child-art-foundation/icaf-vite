import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

import { PTALearnMoreData } from '@/data/peaceThroughArt/PeaceThroughArtData';
export const PTALearnMore = () => {
  return (
    <div className="breakout-w mx-auto py-16 sm:pt-32 lg:pt-32 xl:pt-12">
      <div className="m-pad rounded-[20px] bg-[#FFF2D9] py-12">
        <div className="content-w mx-auto flex flex-col gap-4">
          <h2 className="font-montserrat text-[40px] font-extrabold">
            Learn More
          </h2>
          <div className="font-open-sans flex flex-col gap-2 text-[24px]">
            {PTALearnMoreData.map((learnMoreItem) =>
              learnMoreItem.link ? (
                <p key={learnMoreItem.title}>
                  {learnMoreItem.source} –{' '}
                  <a
                    className="font-bold hover:underline hover:decoration-2"
                    href={learnMoreItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {learnMoreItem.title}
                  </a>
                </p>
              ) : (
                <div key={learnMoreItem.title}>
                  <p className="italic text-red-500">
                    Missing link for {learnMoreItem.source} -{' '}
                    {learnMoreItem.title}
                  </p>
                </div>
              ),
            )}
          </div>
          <p className="font-sans text-[24px]">
            This is{' '}
            <span className="font-bold">
              more than a program—it's a movement.
            </span>{' '}
            Will you be part of it?
          </p>
          <Link
            to={'/get-involved/volunteers'}
            className="z-20 my-2 cursor-pointer"
          >
            <Button variant="secondary" className="mx-auto rounded-full">
              <div className="flex items-center gap-2 leading-none">
                <p className="px-6 text-xl">Get Involved</p>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
