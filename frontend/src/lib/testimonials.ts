export interface Testimonial {
  id: number;
  name: string;
  title: string;
  quote: string;
  image?: string;
}

//Do we have additional testimonials or just the ones on figma?
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Stanishlav Nedzelskyi',
    title: 'Artist and art studio owner',
    quote:
      'The event, sponsored and hosted by the International Child Art Foundation, was a successful attempt at growing fresh flowers in the minds of the next generation.',
  },
  {
    id: 2,
    name: 'Lt. Gen. Joseph Cosumano, Jr.',
    title: 'Commanding General, U.S. Army Space and Missile Defense Command',
    quote:
      'The positive message of peace and hope promoted by the International Child Art Foundation is commendable and worthy of great recognition.',
    image: '/images/about/cosumano.jpg',
  },
  {
    id: 3,
    name: 'Lady Mary Note',
    title: '1st lady of the Marshall Islands',
    quote:
      'ICAF has had a positive impact by allowing us to become involved and giving us a headstart in re-thinking how we can further the arts in the Marshall Islands.',
  },
  {
    id: 4,
    name: 'Stanishlav Nedzelskyi',
    title: 'Artist and art studio owner',
    quote:
      'The event, sponsored and hosted by the International Child Art Foundation, was a successful attempt at growing fresh flowers in the minds of the next generation.',
  },
  {
    id: 5,
    name: 'Lt. Gen. Joseph Cosumano',
    title: 'Commanding General, U.S. Army Space and Missile Defense Command',
    quote:
      'The positive message of peace and hope promoted by the International Child Art Foundation is commendable and worthy of great recognition.',
    image: '/images/about/cosumano.jpg',
  },
];
