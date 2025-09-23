import { IPartnerTestimonialCard } from '@/types/SponsorshipTypes';
import { FlairColorMap } from '../shared/FlairColorMap';
import { FlairRhombus } from '@/assets/shared/icons/FlairRhombus';
import { FlairDiamond } from '@/assets/shared/icons/FlairDiamond';

interface PartnerTestimonialCardProps {
  data: IPartnerTestimonialCard;
  windowWidth: number;
  windowHeight: number;
}

export const PartnerTestimonialCard = ({
  data,
  windowWidth,
}: PartnerTestimonialCardProps) => {
  return (
    <div className="relative select-none py-12">
      <div className="bg-background relative z-10 mx-auto flex min-h-[470px] w-[90%] overflow-hidden rounded-3xl py-8 shadow-[2px_4px_12px_0px_rgba(0,0,0,0.25)] md:min-h-[380px] md:py-8 lg:py-12 xl:py-16">
        {data.content && data.speakerTitle ? (
          <div className="mx-auto flex w-[90%] flex-col gap-5 md:w-[90%] lg:w-[80%] xl:w-[77%]">
            <div className="flex flex-col gap-2">
              <div
                className={`overflow-hidden rounded-full border-2 ${FlairColorMap[data.color].border} mx-auto h-14 w-14`}
              >
                <img src={data.logo} className="object-cover" />
              </div>
              <p className="mx-auto font-bold">{data.speakerName}</p>
              <p className="mx-auto font-light">{data.speakerTitle}</p>
            </div>
            <p>{data.content}</p>
          </div>
        ) : (
          <div className="h-full w-full content-center self-center bg-gray-300 text-center font-bold">
            <p className="mx-auto my-auto min-h-[300px] content-center text-3xl lg:min-h-[150px]">
              Placeholder
            </p>
          </div>
        )}
      </div>
      {windowWidth > 768 ? (
        <>
          <FlairRhombus
            colorClass="text-tertiary-red "
            className="absolute -left-4 top-0"
            width="360"
            height="360"
          />
          <FlairDiamond
            colorClass="text-tertiary-yellow"
            className="absolute -right-4 bottom-0"
            width="360"
            height="360"
          />
        </>
      ) : (
        <FlairRhombus
          colorClass={FlairColorMap[data.color].icon}
          className="absolute -left-16 top-0"
          width="480"
          height="480"
        />
      )}
    </div>
  );
};
