import { IStaffItem } from '@/types/TeamPageTypes';
import { LinkedInLink } from './LinkedInLink';

interface TeamStaffItem {
  data: IStaffItem;
}

export const TeamStaffItem = ({ data }: TeamStaffItem) => {
  return (
    <div>
      <div className="flex max-w-[400px] flex-col gap-6">
        <img src={data.src} className="rounded-3xl" />
        <div className="flex flex-col gap-2 text-center">
          <p className="font-montserrat text-2xl font-semibold">{data.name}</p>
          <p className="font-sans text-xl">{data.title}</p>
          <p>{data.description}</p>
          {data.linkedin && <LinkedInLink src={data.linkedin} />}
        </div>
      </div>
    </div>
  );
};
