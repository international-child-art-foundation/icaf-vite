import WorldMap from '@/assets/healingArts/world.svg';
import WorldMapSmall from '@/assets/healingArts/world-small.svg';
import { useWindowSize } from 'usehooks-ts';

export const AidMap = () => {
  const { width } = useWindowSize();
  const isSmall = width < 640;

  return (
    <div>
      <div>
        <img
          src={isSmall ? WorldMapSmall : WorldMap}
          className="w-full"
          alt="World map showing various natural disasters which have associated ICAF programs"
        />
      </div>
    </div>
  );
};
