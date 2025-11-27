import { ResourceLinks } from '@/data/healingArts/healingArtsData';
import { IResourceLink } from '@/types/HealingArtsTypes';
import { ResourceLink } from './ResourceLink';

export const AchievementsAndResources = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <h2 className="font-montserrat text-[40px] font-extrabold">
          What We've Achieved
        </h2>
        <p className="font-sans text-xl">
          See the outcomes of some of our initiatives.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {ResourceLinks.map((link: IResourceLink) => (
          <ResourceLink key={link.id} {...link} />
        ))}
      </div>
    </div>
  );
};
