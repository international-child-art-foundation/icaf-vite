import { TMomentsCarouselData } from '@/types/History';

interface HistoryMomentCardProps {
  cardData: TMomentsCarouselData;
  isActive: boolean;
}

export const HistoryMomentCard = ({
  cardData,
  isActive,
}: HistoryMomentCardProps) => {
  return (
    <div
      className={`${isActive ? 'scale-100 md:scale-[0.85]' : 'scale-95 md:scale-[0.7]'} relative select-none transition-transform duration-300`}
    >
      <div className="relative flex flex-col overflow-hidden rounded-xl shadow-md">
        {cardData.src ? (
          <img className="" src={cardData.src} />
        ) : (
          <div className="relative aspect-[9/12] h-full bg-gray-300">
            <p className="text-3xl font-bold">Placeholder</p>
          </div>
        )}
      </div>
    </div>
  );
};
