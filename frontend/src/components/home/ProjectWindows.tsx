import { TSpecialProjectGroup } from '@/types/SpecialProjectTypes';
import { ProjectWindow } from './ProjectWindow';

interface ProjectWindowsProps {
  windowArray: TSpecialProjectGroup;
}

export const ProjectWindows = ({ windowArray }: ProjectWindowsProps) => {
  return (
    <div>
      <div className="flex flex-row gap-6">
        {windowArray.map((windowData) => (
          <ProjectWindow windowData={windowData} key={windowData.id} />
        ))}
      </div>
    </div>
  );
};
