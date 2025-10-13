import { TSpecialProjectGroup } from '@/types/SpecialProjectTypes';
import { ProjectWindow } from './ProjectWindow';
import React from 'react';

interface ProjectWindowsProps {
  windowArray: TSpecialProjectGroup;
}

type CSSVars = React.CSSProperties & { ['--cols']: string };

export const ProjectWindows = ({ windowArray }: ProjectWindowsProps) => {
  const style: CSSVars = { '--cols': String(windowArray.length) };

  return (
    <div>
      <div
        className="relative grid min-h-[150px] grid-cols-1 gap-6 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        style={style}
      >
        {windowArray.map((windowData) => (
          <ProjectWindow windowData={windowData} key={windowData.id} />
        ))}
      </div>
    </div>
  );
};
