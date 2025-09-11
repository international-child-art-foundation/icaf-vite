import { FlairColorMap } from '../shared/FlairColorMap';
import { IContentCallout } from '@/types/ContentCalloutTypes';

export const ContentCallout = ({
  title,
  color,
  description,
  content,
  textOnLeft,
}: IContentCallout) => {
  return (
    <div className="flex max-w-screen-2xl flex-col gap-12 px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="flex justify-between gap-[5%]">
        <div className={`${!textOnLeft && 'order-2'} basis-[40%]`}>
          {content}
        </div>
        <div
          className={`${!textOnLeft && 'order-1'} flex basis-[50%] flex-col gap-4`}
        >
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
