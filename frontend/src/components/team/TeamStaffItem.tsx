import { IStaffItem } from '@/types/TeamPageTypes';
import { LinkedInLink } from './LinkedInLink';

interface TeamStaffItem {
  data: IStaffItem;
}

export const TeamStaffItem = ({ data }: TeamStaffItem) => {
  return (
    <div>
      <div className="flex h-full w-[400px] flex-col items-center gap-6 overflow-hidden text-center">
        {data.src ? (
          <div className="h-[400px] w-[400px]">
            <img
              src={data.src}
              className="h-full w-full rounded-3xl object-cover"
            />
          </div>
        ) : (
          <div className="h-[400px] w-[400px]">
            <div className="h-[400px] w-[400px] rounded-3xl bg-black" />
          </div>
        )}
        <div className="flex flex-col gap-2 text-center">
          <p className="font-montserrat text-2xl font-semibold">{data.name}</p>
          <p className="font-sans text-xl">{data.title}</p>
          <p>{data.description}</p>
        </div>
        {data.linkedin && (
          <div className="mt-auto">
            <LinkedInLink src={data.linkedin} />
          </div>
        )}
      </div>
    </div>
  );
};
