import { IResearchAndPublicationsItem } from '@/types/ResearchAndPublicationsTypes';
import theCreativityRevolutionImg from '@/assets/researchAndPublications/the_creativity_revolution.webp';
import creativeEmpathsImg from '@/assets/researchAndPublications/dynamische_psychiatrie.webp';
import steamJournalImg from '@/assets/researchAndPublications/steam_journal.webp';
import theLancetImg from '@/assets/researchAndPublications/the_lancet.webp';
import theGreatCulturalAwakeningImg from '@/assets/researchAndPublications/the_great_cultural_awakening.webp';
import disruptScienceImg from '@/assets/researchAndPublications/disrupt_science.webp';

export const researchAndPublicationsData: IResearchAndPublicationsItem[] = [
  {
    title: 'The Creativity Revolution',
    imgSrc: theCreativityRevolutionImg,
    description:
      'An exploration of the shift from an economic-focused age to a creativity-centered future, providing a roadmap for utilizing human imagination to solve pressing global challenges.',
    author: 'Ashfaq Ishaq',
    date: 'July 2013',
    link: 'https://www.amazon.com/dp/B00D7MQ2PU',
  },
  {
    title: 'Disrupt Science: The Future Matters',
    imgSrc: disruptScienceImg,
    description:
      'A provocative analysis of the limitations of current scientific paradigms, arguing for a move toward anticipatory systems and "disruptive" thinking to secure the future of humanity.',
    author: 'Mihai Nadin',
    date: '2023',
    link: 'https://link.springer.com/book/10.1007/978-3-031-43957-5',
  },
  {
    title: 'The Great Cultural Awakening',
    imgSrc: theGreatCulturalAwakeningImg,
    description:
      'A comprehensive work detailing the global transition toward a "cultural age," advocating for a holistic worldview where sustainability and harmony are prioritized over economic growth.',
    author: 'D. Paul Schafer',
    date: 'January 2024',
    link: 'https://www.amazon.com/Great-Cultural-Awakening-Sustainable-Harmonious/dp/1772443166',
  },

  {
    title: 'Schooling "Creative-Empaths"',
    imgSrc: creativeEmpathsImg,
    description:
      'A study on the International Child Art Foundation’s (ICAF) mission to foster the "creative empath" in children, bridging the gap between imagination and social responsibility to develop future leaders.',
    author: 'Ashfaq Ishaq',
    date: '2020',
    link: '/documents/CreativeEmpaths.pdf',
  },

  {
    title: 'The Art of Empathy',
    imgSrc: steamJournalImg,
    description:
      'Published in The STEAM Journal, this article discusses why the arts are essential for a holistic creative economy and how they drive meaningful social and economic transformation.',
    author: 'Ashfaq Ishaq',
    date: 'December 2018',
    link: 'https://scholarship.claremont.edu/steam/vol3/iss2/3/',
  },
  {
    title: 'Fostering Peace',
    imgSrc: theLancetImg,
    description:
      'A feature in the prestigious medical journal highlighting the critical link between children’s artistic expression and their mental health, well-being, and developmental growth.',
    author: 'Ashfaq Ishaq',
    date: 'December 2006',
    link: '/documents/The Lancet.pdf',
  },
];
