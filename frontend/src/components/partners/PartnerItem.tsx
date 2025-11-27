import { IPartner } from 'types/partners';

interface IPartnerItem {
  partner: IPartner;
  index: number;
  activeCarouselIndex: number;
  carouselLength: number;
  scrollToPartner: (index: number) => void;
}

export const PartnerItem = ({
  partner,
  index,
  activeCarouselIndex,
  carouselLength,
  scrollToPartner,
}: IPartnerItem) => {
  const isActive = index === activeCarouselIndex % carouselLength;

  const getLogoClass = (name: string) => {
    if (
      name === 'American Institute of Architects (AIA)' ||
      name === 'Endangered Species Coalition'
    ) {
      return 'h-full w-full object-contain scale-125';
    }
    return 'h-full w-full object-contain';
  };

  return (
    <div
      className={`relative m-auto my-4 flex h-[220px] w-[220px] cursor-pointer select-none rounded-full transition-opacity hover:opacity-100 ${
        isActive ? 'opacity-100' : 'opacity-50'
      }`}
      onClick={() => scrollToPartner(index)}
    >
      <div
        className={`after:ring-primary relative m-4 flex rounded-full after:absolute after:inset-0 after:rounded-full after:ring-4 after:transition-opacity after:duration-300 ${isActive ? 'after:opacity-100' : 'after:opacity-0'} `}
      >
        <div className="relative m-4 rounded-full">
          <div className="relative m-auto flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            <img
              src={partner.logo}
              alt=""
              className={getLogoClass(partner.name)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
