import CousumanoImage from '@/assets/shared/images/about/Cosumano.webp';
import LadyMaryNoteImage from '@/assets/about/Lady Mary Note.webp';
import ListonBrochetteImage from '@/assets/about/Liston Brochette.webp';
import StanislavNedzelskyiImage from '@/assets/about/Stanislav Nedzelskyi.webp';
import WookChoiImage from '@/assets/about/Wook Choi.webp';

export interface Testimonial {
  id: number;
  name: string;
  title: string;
  quote: string;
  image?: string;
}

//Will need to update this with proper images
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Stanislav Nedzelskyi',
    title: 'Artist and art studio owner',
    quote:
      'The event, sponsored and hosted by the International Child Art Foundation, was a successful attempt at growing fresh flowers in the minds of the next generation.',
    image: StanislavNedzelskyiImage,
  },
  {
    id: 2,
    name: 'Lt. Gen. Joseph Cosumano, Jr.',
    title: 'Commanding General, U.S. Army Space and Missile Defense Command',
    quote:
      'The positive message of peace and hope promoted by the International Child Art Foundation is commendable and worthy of great recognition.',
    image: CousumanoImage,
  },
  {
    id: 3,
    name: 'Lady Mary Note',
    title: '1st lady of the Marshall Islands',
    quote:
      'ICAF has had a positive impact by allowing us to become involved and giving us a headstart in re-thinking how we can further the arts in the Marshall Islands.',
    image: LadyMaryNoteImage,
  },
  {
    id: 4,
    name: 'Liston D. Bochette III Ph.D.',
    title: 'Olympian, artist, and educator',
    quote:
      'Olympians around the world could not be more proud of the young talent involved in the International Child Art Foundation events. ',
    image: ListonBrochetteImage,
  },
  {
    id: 5,
    name: 'Wook Choi',
    title: 'Founder of Oogie Haus, Wook Choi Gallery, New York, NY',
    quote:
      "The World Children's Festival is one of those uplifting experiences my students and I will never forget.",
    image: WookChoiImage,
  },
];
