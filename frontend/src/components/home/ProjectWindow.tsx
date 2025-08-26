import { ISpecialProject } from '@/types/SpecialProjectTypes';
import outbound from '@/assets/home/outbound.svg';

interface ProjectWindowProps {
  windowData: ISpecialProject;
}

export const ProjectWindow = ({ windowData }: ProjectWindowProps) => {
  return (
    <div className="relative">
      <div className="">
        <img
          src={windowData.image}
          className="rounded-l-[20px] rounded-r-[20px] rounded-t-[300px] border-[3px] border-b-0 border-black"
        />
        <div className="-mt-3 flex h-[150px] flex-col border-[3px] border-t-0 border-black p-4 text-center">
          <p className="text-xl font-semibold">{windowData.title}</p>
          <p className="font-sans text-base font-light">
            {windowData.description}
          </p>
          {windowData.href && (
            <div className="mx-auto flex gap-2">
              <p className="cursor-pointer">Go to Website</p>
              <img className="cursor-pointer" src={outbound} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
