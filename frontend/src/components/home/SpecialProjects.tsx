import { specialProjectData } from '@/data/home/homeSpecialProjects';
import { ProjectWindows } from './ProjectWindows';

export const SpecialProjects = () => {
  return (
    <div className="flex flex-col gap-4 px-8 md:px-12 lg:px-16 xl:px-20">
      <p className="font-montserrat text-center text-[40px] font-extrabold">
        Special Projects Websites
      </p>
      <div>
        <ProjectWindows windowArray={specialProjectData} />
      </div>
    </div>
  );
};
