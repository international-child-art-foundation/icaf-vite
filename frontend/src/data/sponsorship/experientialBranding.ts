import { TExperientialBrandingCarousel } from '@/types/SponsorshipTypes';
import legoExhibitImg from '@/assets/sponsorship/LegoExhibit.webp';
import legoLogo from '@/assets/sponsorship/LegoLogo.webp';
import anthropologieLogo from '@/assets/sponsorship/anthropologie.svg';
import anthropologiePromotion from '@/assets/sponsorship/HolidayAnimals_small.webp';
import rothLogo from '@/assets/sponsorship/Roth Gallery logo.webp';
import rothPromotion from '@/assets/sponsorship/Roth Gallery.webp';
import cannesLionsPromotion from '@/assets/sponsorship/Cannes Lions.webp';
import cannesLionsLogo from '@/assets/sponsorship/cannes-lions-logo.svg';

export const experientialBrandingCarouselData: TExperientialBrandingCarousel = [
  {
    id: 'lego',
    largeImgSrc: legoExhibitImg,
    logoSrc: legoLogo,
    color: 'tertiaryBlue',
  },
  {
    id: 'anthro',
    color: 'green',
    largeImgSrc: anthropologiePromotion,
    logoSrc: anthropologieLogo,
  },
  {
    id: 'roth-gallery',
    color: 'red',
    largeImgSrc: rothPromotion,
    logoSrc: rothLogo,
  },
  {
    id: 'cannes-lions',
    color: 'purple',
    largeImgSrc: cannesLionsPromotion,
    logoSrc: cannesLionsLogo,
  },
];
