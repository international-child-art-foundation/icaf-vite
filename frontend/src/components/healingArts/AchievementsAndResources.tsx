import { ResourceLinks } from '@/data/healingArts/healingArtsData';
import { IResourceLink } from '@/types/HealingArtsTypes';
import { ResourceLink } from './ResourceLink';

export const AchievementsAndResources = () => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        {ResourceLinks.map((link: IResourceLink) => (
          <ResourceLink key={link.id} {...link} />
        ))}
      </div>
    </div>
  );
};
