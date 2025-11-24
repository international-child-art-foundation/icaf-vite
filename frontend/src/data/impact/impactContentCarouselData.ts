import { ContentCarouselData } from '@/types/ImpactPageTypes';
import palette from '@/assets/impact/palette.svg';
import camera from '@/assets/impact/camera.svg';
import award_star from '@/assets/impact/award_star.svg';
import painting from '@/assets/impact/Painting.png';
import awards from '@/assets/impact/Awards.png';
import childrenFromMalaysia from '@/assets/impact/Children from Malaysia.png';

export const ImpactContentCarouselData: ContentCarouselData = [
  {
    icon: palette,
    title: 'Child Art Exhibitions',
    body: "We lead the world in showcasing children's art. Kids express their imagination through their artwork, offering a pure and honest perspective that can inspire us all.",
    contentType: 'img',
    content: painting,
    color: 'yellow',
  },
  {
    icon: camera,
    title: "Children's Panels at Major Conferences",
    body: 'We train and select talented young panelists to discuss important issues that affect the future, making sure their voices are heard.',
    contentType: 'img',
    content: childrenFromMalaysia,
    color: 'blue',
  },
  {
    icon: award_star,
    title: "World Children's Award",
    body: "Since 2007, we've honored business and cultural leaders chosen by children. Past winners include LEGO, the Swatch Group, and the W. K. Kellogg Foundation, with awards designed by renowned artists like Karim Rashid and Tiffany & Company.",
    contentType: 'img',
    content: awards,
    color: 'pink',
  },
];
