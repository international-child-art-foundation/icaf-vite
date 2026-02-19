import { FlairColorMap } from '../shared/FlairColorMap';
import { IContentCallout } from '@/types/SponsorshipTypes';
import { useWindowSize } from 'usehooks-ts';
import { FireworkSnowflake } from '@/assets/shared/icons/FireworkSnowflake';

export const ContentCallout = ({
  title,
  color,
  description,
  content,
  firework,
  fireworkClasses,
  textOnLeft,
}: IContentCallout) => {
  const size = useWindowSize();
  const contentOrder =
    size.width <= 1024 ? 'order-2' : !textOnLeft && 'order-2';
  const textOrder = size.width <= 1024 ? 'order-1' : !textOnLeft && 'order-1';

  return (
    <div className="relative z-10 flex max-w-screen-2xl gap-12">
      <div className="relative flex w-full flex-col justify-end gap-[5%] lg:flex-row">
        <div className={`${contentOrder} grid-col relative grid basis-[43%]`}>
          <div className="relative z-10 col-start-1 row-start-1">{content}</div>
          <div className="relative col-start-1 row-start-1">
            {firework && (
              <FireworkSnowflake
                height="200"
                width="200"
                colorClass={FlairColorMap[color].icon}
                className={`${fireworkClasses}`}
              />
            )}
          </div>
        </div>
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
