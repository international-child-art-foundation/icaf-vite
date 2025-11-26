import { GoalCards } from '@/data/healingArts/healingArtsData';
import { GoalCard } from './GoalCard';

export const ProgramPhilosophy = () => {
  return (
    <div>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-montserrat text-2xl font-extrabold md:text-[40px] md:leading-[50px]">
            Our Program Philosophy
          </h2>
          <p className="mx-auto font-sans text-[20px] md:max-w-[700px]">
            We encourage children to be active participants in their recovery,
            rather than passive victims of a disaster. Our program follows these
            principles:{' '}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GoalCards.map((card) => (
            <GoalCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};
