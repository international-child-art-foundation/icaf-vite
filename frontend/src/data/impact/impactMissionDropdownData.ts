import { IAccordionCard } from '@/types/AccordionCardTypes';
import HelpingHand from '@/assets/impact/HelpingHand.svg';
import Education from '@/assets/impact/Education.svg';
import Inequities from '@/assets/impact/Inequities.svg';
import Health from '@/assets/impact/Health.svg';
import GenderEquality from '@/assets/impact/GenderEquality.svg';
import Peace from '@/assets/impact/Peace.svg';

const MissionDropdownData: IAccordionCard[] = [
  {
    id: 'reducing-poverty',
    title: 'Reducing Poverty',
    icon: HelpingHand,
    color: 'red',
    extendedDescription:
      'We encourage creativity and innovation among children, which can lead to future opportunities in the creative industries. By nurturing their talents, the foundation helps children develop skills that can contribute to economic growth and reduce poverty.',
  },
  {
    id: 'providing-quality-education',
    title: 'Providing Quality Education',
    icon: Education,
    color: 'yellow',
    extendedDescription:
      'We offer art programs that complement traditional education, promoting creativity, critical thinking, and emotional intelligence. These programs provide quality educational experiences that empower children to think beyond conventional learning.',
  },
  {
    id: 'reducing-inequities',
    title: 'Reducing Inequities',
    icon: Inequities,
    color: 'purple',
    extendedDescription:
      'Our global reach ensures that children from diverse backgrounds, including those in underserved communities, have access to art education and creative opportunities. This helps bridge the gap between different socioeconomic groups and promotes inclusivity.',
  },
  {
    id: 'promoting-good-health',
    title: 'Promoting Good Health',
    icon: Health,
    color: 'blue',
    extendedDescription:
      'ICAF recognizes the therapeutic benefits of art in promoting mental and emotional well-being. By engaging children in creative activities, the foundation contributes to their overall health, helping them express emotions, reduce stress, and build resilience.',
  },
  {
    id: 'ensuring-gender-equality',
    title: 'Ensuring Gender Equality',
    icon: GenderEquality,
    color: 'green',
    extendedDescription:
      'We promote equal participation of boys and girls in its programs, ensuring that all children, regardless of gender, have equal opportunities to develop their artistic talents and express their creativity.',
  },
  {
    id: 'building-peace',
    title: 'Building Peace',
    icon: Peace,
    color: 'red',
    extendedDescription:
      'Through global art exhibitions and collaborations, we foster cross-cultural understanding and dialogue among children. By encouraging them to create art that reflects their experiences and aspirations, the foundation helps build a culture of peace and tolerance from a young age.',
  },
];

export default MissionDropdownData;
