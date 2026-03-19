import wcaCarousel1 from '@/assets/worldChildrensAward/wca-header.webp';
import wcaCarousel2 from '@/assets/worldChildrensAward/wca-carousel-2.webp';
import wcaCarousel3 from '@/assets/worldChildrensAward/wca-carousel-3.webp';
import { ColorKey } from '@/components/shared/FlairColorMap';

export interface IWCAImgShowcase {
  text: string;
  color: ColorKey;
  img: string;
}

export const WCAGlobalLeadersData: IWCAImgShowcase[] = [
  {
    text: "The inaugural World Children’s Award was awarded to LEGO in recognition of its role in fostering children's creativity. This prestigious award was designed by Tiffany & Co.",
    img: wcaCarousel1,
    color: 'red',
  },
  {
    text: 'The 2nd World Children’s Award honored the W. K. Kellogg Foundation for its commitment to promoting children’s health. This award was crafted by renowned industrial designer Karim Rashid.',
    img: wcaCarousel2,
    color: 'yellow',
  },
  {
    text: "The 3rd World Children’s Award was presented to three individuals: Shona Hammond Boys from New Zealand, Fato Abraham Wheremonger from Liberia, and Mike Ssembiro from Uganda, all recognized for their contributions to children's art and creativity. The award was designed by Sergey Eylanbekov, the sculptor behind the Dwight D. Eisenhower Memorial on the National Mall.",
    img: wcaCarousel3,
    color: 'tertiaryBlue',
  },
];
