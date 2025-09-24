import { IAccordionCard } from '@/types/AccordionCardTypes';
import { HelpingHandIcon } from '@/assets/shared/icons/HelpingHandIcon';
import { EducationIcon } from '@/assets/shared/icons/EducationIcon';
import { GroupIcon } from '@/assets/shared/icons/GroupIcon';
import { HealthIcon } from '@/assets/shared/icons/HealthIcon';
import { GenderEqualityIcon } from '@/assets/shared/icons/GenderEqualityIcon';
import { PeaceIcon } from '@/assets/shared/icons/PeaceIcon';

const MissionDropdownData: IAccordionCard[] = [
  {
    id: 'reducing-poverty',
    title: 'Reducing Poverty',
    Icon: HelpingHandIcon,
    color: 'red',
    extendedDescription:
      'We encourage creativity and innovation among children, which can lead to future opportunities in the creative industries. By nurturing their talents, the foundation helps children develop skills that can contribute to economic growth and reduce poverty.',
  },
  {
    id: 'providing-quality-education',
    title: 'Providing Quality Education',
    Icon: EducationIcon,
    color: 'yellow',
    extendedDescription:
      'We offer art programs that complement traditional education, promoting creativity, critical thinking, and emotional intelligence. These programs provide quality educational experiences that empower children to think beyond conventional learning.',
  },
  {
    id: 'reducing-inequities',
    title: 'Reducing Inequities',
    Icon: GroupIcon,
    color: 'purple',
    extendedDescription:
      'Our global reach ensures that children from diverse backgrounds, including those in underserved communities, have access to art education and creative opportunities. This helps bridge the gap between different socioeconomic groups and promotes inclusivity.',
  },
  {
    id: 'promoting-good-health',
    title: 'Promoting Good Health',
    Icon: HealthIcon,
    color: 'blue',
    extendedDescription:
      'ICAF recognizes the therapeutic benefits of art in promoting mental and emotional well-being. By engaging children in creative activities, the foundation contributes to their overall health, helping them express emotions, reduce stress, and build resilience.',
  },
  {
    id: 'ensuring-gender-equality',
    title: 'Ensuring Gender Equality',
    Icon: GenderEqualityIcon,
    color: 'green',
    extendedDescription:
      'We promote equal participation of boys and girls in its programs, ensuring that all children, regardless of gender, have equal opportunities to develop their artistic talents and express their creativity.',
  },
  {
    id: 'building-peace',
    title: 'Building Peace',
    Icon: PeaceIcon,
    color: 'red',
    extendedDescription:
      'Through global art exhibitions and collaborations, we foster cross-cultural understanding and dialogue among children. By encouraging them to create art that reflects their experiences and aspirations, the foundation helps build a culture of peace and tolerance from a young age.',
  },
];

export default MissionDropdownData;
