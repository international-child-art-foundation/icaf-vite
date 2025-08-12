import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IPartners, IPartnerPartial } from 'types/partners';

interface ICarouselSharedContent {
  partners: IPartners;
  activeIndex: number;
  scrollToPartner: (index: number) => void;
}

export const CarouselSharedContent = ({
  partners,
  activeIndex,
  scrollToPartner,
}: ICarouselSharedContent) => {
  const usableIndex = activeIndex % partners.length;

  const activePartner: IPartnerPartial = {
    id: partners[usableIndex].id,
    name: partners[usableIndex].name,
    description: partners[usableIndex].description,
  };

  const handlePrev = () =>
    scrollToPartner((activeIndex - 1 + partners.length) % partners.length);
  const handleNext = () => scrollToPartner((activeIndex + 1) % partners.length);

  return (
    <div key={activePartner.id} className="grid-col grid gap-6 text-center mt-10">
      <p className="font-montserrat text-xl font-bold">{activePartner.name}</p>
      <p className="font-sans text-base leading-relaxed">{activePartner.description}</p>

      <div className="flex items-center justify-center gap-3">
        <button
          aria-label="Previous slide"
          onClick={handlePrev}
          className="rounded-full p-1 hover:bg-gray-100"
          type="button"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        {partners.map((partner, i) => {
          const isActive = i === usableIndex;
          return (
            <span
              key={partner.id}
              className={`block rounded-full transition-all duration-300 ${isActive
                ? 'bg-primary h-3 w-3'
                : 'h-2 w-2 bg-gray-400 hover:bg-gray-500'
                }`}
            />
          );
        })}

        <button
          aria-label="Next slide"
          onClick={handleNext}
          className="rounded-full p-1 hover:bg-gray-100"
          type="button"
        >
          <ArrowRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};
