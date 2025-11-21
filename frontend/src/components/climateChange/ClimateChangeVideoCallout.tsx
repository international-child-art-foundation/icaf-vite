import { IClimateChangeVideoCallout } from '@/types/ClimateChangeTypes';
import { VideoWrapper } from '../shared/VideoWrapper';
import { Button } from '../ui/button';

interface ClimateChangeVideoCalloutProps extends IClimateChangeVideoCallout {
  side: 'left' | 'right';
}

export const ClimateChangeVideoCallout = ({
  video,
  thumb,
  title,
  description,
  side,
  link,
}: ClimateChangeVideoCalloutProps) => {
  const columnTemplate =
    side === 'right' ? 'lg:grid-cols-[2fr_3fr]' : 'lg:grid-cols-[3fr_2fr]';

  return (
    <div
      className={`border-primary/50 relative grid grid-cols-1 gap-8 rounded-2xl border-2 bg-blue-100/50 sm:rounded-xl sm:p-8 ${columnTemplate} lg:grid-rows-1`}
    >
      <div
        className={` ${side === 'left' ? 'lg:order-2' : 'lg:order-1'} relative order-2 flex h-full flex-col gap-4 p-8 pt-0 sm:p-0`}
      >
        <p className="font-montserrat text-2xl font-semibold">{title}</p>

        <div className="flex flex-1 items-center">
          <p className="text-lg">{description}</p>
        </div>
        {link && (
          <div className="mx-auto items-center">
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <Button className="px-12">{link?.text}</Button>
            </a>
          </div>
        )}
      </div>

      <div
        className={`${side === 'left' ? 'lg:order-1' : 'lg:order-2'} order-1`}
      >
        <VideoWrapper
          lazyMode="idle"
          thumbnail={thumb}
          curved={true}
          src={video}
        />
      </div>
    </div>
  );
};
