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
      className={`${isActive ? 'scale-100 md:scale-[0.85]' : 'scale-95 md:scale-[0.7]'} relative h-full select-none transition-transform duration-300`}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl pb-4 shadow-md">
        {cardData.src ? (
          <div className="flex h-full max-w-full flex-col gap-2 text-center">
            <img className="grow" src={cardData.src} />
            <div className="m-4">
              <p className="font-montserrat text-2xl font-semibold text-black">
                {cardData.title}
              </p>
              <p className="text-xl">{cardData.description}</p>
            </div>
          </div>
        ) : (
          <div className="relative aspect-[9/12] h-full bg-gray-300">
            <p className="text-3xl font-bold">Placeholder</p>
          </div>
        )}
      </div>
    </div>
  );
};
