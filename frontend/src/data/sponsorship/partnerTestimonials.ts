import { TPartnerTestimonialCarousel } from '@/types/SponsorshipTypes';
import legoLogo from '@/assets/sponsorship/LegoLogo.webp';
import fourSeasonsLogo from '@/assets/sponsorship/FourSeasonsLogo.webp';
import galeriaKaufhofLogo from '@/assets/sponsorship/Galeria Kaufhof logo.webp';
import NYCLogo from '@/assets/sponsorship/New York Citys Olympic Games Bid Document.webp';
import hillaryImg from '@/assets/sponsorship/hillary-clinton.webp';

export const partnerTestimonialData: TPartnerTestimonialCarousel = [
  {
    color: 'yellow',
    id: 'michael-mcnally',
    logo: legoLogo,
    speakerName: 'Michael McNally',
    speakerTitle: 'LEGO Brand Relations Director',
    content:
      'We are thrilled to bring a LEGO building experience to the world’s largest celebration of creativity and imagination on the National Mall. What the International Child Art Foundation does to encourage a child’s inner creativity is something we passionately admire and are proud to support, because we believe children who are exposed to creative activities from a very young age go on to become the world’s most meaningful contributors.',
  },
  {
    color: 'red',
    id: 'marc-speichert',
    logo: fourSeasonsLogo,
    speakerName: 'Marc Speichert',
    speakerTitle: 'Chief Commercial Officer, Four Seasons',
    content:
      'The ICAF was the perfect choice for us. It has a 25-plus year history of providing free school art programs and educational events for children, and mission is one that we are proud to support as we continue to inspire the world to lead with genuine heart.',
  },
  {
    color: 'blue',
    id: 'galeria-kaufhof',
    logo: galeriaKaufhofLogo,
    speakerName: 'Reimund Bauheier',
    speakerTitle: 'Managing Director, Galeria Kaufhof',
    content:
      'The FIFA World Cup in Germany was a global event, and while grappling with this theme, only one global solution came into consideration. In cooperation with our partner, ICAF, we gave birth to this idea as an art project… This is art in its purest form… For us, this exhibition was a huge success and was very well received by our customers.',
  },
  {
    color: 'green',
    id: 'nyc-olympic',
    logo: NYCLogo,
    speakerName: 'New York City Olympic Bid',
    speakerTitle: 'Candidature File for the Games of the XXX Olympiad',
    content:
      'A Youth Arts Olympiad on the theme of “Sport and Art for Peace” will be developed with the International Child Art Foundation to coincide with the Cultural Olympiad.',
  },
  {
    color: 'black',
    id: 'hillary-clinton',
    logo: hillaryImg,
    speakerName: 'Hillary Clinton',
    speakerTitle: 'First Lady',
    content:
      'I am grateful to organizations like the International Child Art Foundation that give us the opportunity to see the world through the eyes of our nation’s young people. I encourage you to continue to support programs that help children to discover their talents and believe in themselves.  ',
  },
];
