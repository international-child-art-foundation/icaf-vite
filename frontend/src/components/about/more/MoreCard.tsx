import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MoreOnOurSite } from '@/data/about/moreOnOurSite';
import { HeartIcon } from 'lucide-react';

/**
 *Renders an image and text content for the MoreCarousel
 * Uses Shadcn's Card components and Button
 * Props:
 * - item: {
 *     id: number;
 *     title: string;
 *     description: string;
 *     image?: string;
 *   }
 * Todo: set the correct button link
 */

export const MoreCard = ({ item }: { item: MoreOnOurSite }) => {
  return (
    <Card className="mx-auto flex h-[500px] w-[320px] flex-col rounded-[40px] bg-[#FFECCB] py-0 transition-all duration-300 sm:w-[380px] md:h-[360px] md:w-full md:flex-row-reverse lg:h-[320px]">
      <div className="h-48 w-full overflow-hidden rounded-t-[40px] md:h-auto md:w-1/2 md:rounded-r-[40px] md:rounded-t-none">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full scale-105 object-cover md:scale-100"
        />
      </div>
      {/* Card Content  */}
      <div className="flex flex-col px-6 md:w-1/2 md:justify-center md:px-8 xl:px-16 2xl:px-20">
        <CardHeader className="items-start gap-0 p-0">
          <CardTitle className="font-montserrat mb-4 text-center text-2xl font-extrabold">
            {item.title}
          </CardTitle>
          <CardDescription className="mb-4 font-sans text-base text-black">
            {item.description}
          </CardDescription>
          <div className="flex w-full justify-center">
            <Button
              variant="secondary"
              className="text-sans h-14 w-[210px] justify-center rounded-full font-semibold text-black"
            >
              {/*Will need to come back and correct this link */}
              <a
                href="https://icaf.org/donate"
                target="blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4"
              >
                <HeartIcon
                  strokeWidth={2}
                  className="!h-6 !w-6 stroke-black lg:!h-6 lg:!w-6"
                />
                Learn More Here
              </a>
            </Button>
          </div>
        </CardHeader>
      </div>
    </Card>
  );
};
