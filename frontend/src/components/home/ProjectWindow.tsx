import { ISpecialProject } from '@/types/SpecialProjectTypes';
import outbound from '@/assets/home/outbound.svg';
import { FlairColorMap } from '../shared/FlairColorMap';

interface ProjectWindowProps {
  windowData: ISpecialProject;
}

export const ProjectWindow = ({ windowData }: ProjectWindowProps) => {
  return (
    <div className="relative h-full">
      <div className="flex h-full flex-col">
        <div
          className={`${FlairColorMap[windowData.color]?.border} group select-none overflow-hidden rounded-b-[0px] rounded-l-[20px] rounded-r-[20px] rounded-t-[300px] border-[3px] border-b-0`}
        >
          <img
            src={windowData.image}
            className="scale-100 transition-transform duration-300 ease-out group-hover:scale-[1.1]"
            alt=""
          />
        </div>
        <div
          className={`bg-background space-between -mt-3 flex flex-1 flex-col justify-around gap-2 rounded-b-xl border-[3px] border-t-0 ${FlairColorMap[windowData.color]?.border} p-4 text-center lg:min-h-[175px]`}
        >
          <p className="text-xl font-semibold">{windowData.title}</p>
          <p className="font-sans text-base font-light">
            {windowData.description}
          </p>
          {windowData.href ? (
            <a
              href={windowData.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto flex cursor-pointer select-none gap-1"
            >
              <p>Go to Website</p>
              <img alt="" className="cursor-pointer" src={outbound} />
            </a>
          ) : (
            <p>Coming soon</p>
          )}
        </div>
      </div>
    </div>
  );
};
