import { IResearchAndPublicationsItem } from '@/types/ResearchAndPublicationsTypes';

export const ResearchAndPublicationsItem = ({
  title,
  description,
  imgSrc,
}: IResearchAndPublicationsItem) => {
  return (
    <div className="rounded-xl bg-slate-50 p-8">
      <div className="flex h-[400px] w-full flex-row justify-between">
        <div className="flex flex-col gap-4">
          <h2 className="font-montserrat text-lg font-bold">{title}</h2>
          <div className="h-1 w-full bg-black"></div>
          <p>{description}</p>
        </div>
        <img src={imgSrc} className="" />
      </div>
    </div>
  );
};
