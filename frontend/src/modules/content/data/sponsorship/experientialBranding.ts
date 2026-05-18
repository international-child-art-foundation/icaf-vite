import { TExperientialBrandingCarousel } from '@/modules/content/types/SponsorshipTypes';
import legoExhibitImg from '@/modules/content/assets/sponsorship/LegoExhibit.webp';
import legoLogo from '@/modules/content/assets/sponsorship/LegoLogo.webp';
import anthropologieLogo from '@/modules/content/assets/sponsorship/anthropologie.svg';
import anthropologiePromotion from '@/modules/content/assets/sponsorship/HolidayAnimals_small.webp';
import rothLogo from '@/modules/content/assets/sponsorship/Roth Gallery logo.webp';
import rothPromotion from '@/modules/content/assets/sponsorship/Roth Gallery.webp';
import cannesLionsPromotion from '@/modules/content/assets/sponsorship/Cannes Lions.webp';
import cannesLionsLogo from '@/modules/content/assets/sponsorship/cannes-lions-logo.svg';

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
