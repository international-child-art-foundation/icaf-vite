import { FlairColorMap } from '../shared/FlairColorMap';
import { IContentCallout } from '@/types/SponsorshipTypes';
import { useWindowSize } from 'usehooks-ts';

export const ContentCallout = ({
  title,
  color,
  description,
  content,
  textOnLeft,
}: IContentCallout) => {
  const size = useWindowSize();
  const contentOrder =
    size.width <= 1024 ? 'order-2' : !textOnLeft && 'order-2';
  const textOrder = size.width <= 1024 ? 'order-1' : !textOnLeft && 'order-1';

  return (
    <div className="flex max-w-screen-2xl gap-12 px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="flex w-full flex-col justify-between gap-[5%] lg:flex-row">
        <div className={`${contentOrder} basis-[43%]`}>{content}</div>
        <div className={`${textOrder} flex basis-[50%] flex-col gap-4`}>
          <div>
            <p className="font-montserrat text-left text-2xl font-bold">
              {title}
            </p>
          </div>
          <div
            className={`h-1 w-full rounded-full font-bold ${FlairColorMap[color].background}`}
          ></div>
          {description}
        </div>
      </div>
    </div>
  );
};
