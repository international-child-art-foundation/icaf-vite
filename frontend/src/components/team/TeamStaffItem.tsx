import { IStaffItem } from '@/types/TeamPageTypes';
import { LinkedInLink } from './LinkedInLink';

interface TeamStaffItem {
  data: IStaffItem;
  height: number;
  width: number;
}

export const TeamStaffItem = ({ data, height, width }: TeamStaffItem) => {
  return (
    <div
      className={`group flex h-full flex-col items-center gap-6 overflow-hidden text-left`}
      style={{ width: width + 'px' }}
    >
      {data.src ? (
        <div style={{ height: height + 'px', width: width + 'px' }}>
          <img
            src={data.src}
            className="h-full w-full rounded-3xl object-cover"
          />
        </div>
      ) : (
        <div
          className={``}
          style={{ height: height + 'px', width: width + 'px' }}
        >
          <div
            className={`flex items-center justify-center rounded-3xl bg-gray-300`}
            style={{ height: height + 'px', width: width + 'px' }}
          >
            <p className="justify-center text-xl italic">Placeholder</p>
          </div>
        </div>
      )}
      <div className="flex w-full flex-col gap-0 text-left">
        {data.link ? (
          <a
            href={data.link}
            rel="noopener noreferrer"
            target="_blank"
            className="font-montserrat text-2xl font-semibold decoration-2 group-hover:underline"
          >
            {data.name}
          </a>
        ) : (
          <p className="font-montserrat text-2xl font-semibold decoration-2 group-hover:underline">
            {data.name}
          </p>
        )}
        <p className="font-sans text-xl">{data.title}</p>
        <p>{data.description}</p>
      </div>
      {data.linkedin && (
        <div className="mt-auto">
          <LinkedInLink src={data.linkedin} />
        </div>
      )}
    </div>
  );
};
