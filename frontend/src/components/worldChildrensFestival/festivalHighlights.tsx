import VerticalTimeline from './verticalTimeline';
import { TimeLineItem } from '@/types/WCFVerticalTimelineTypes';

const VerticalTimelineData: TimeLineItem[] = [
  {
    day: 'Day 1',
    title: 'Health and Environment Day',
    paragraph:
      'Dive into activities focusing on our planet and children’s well-being.',
    color: '#DA1E40',
    lineDescription: 'top-5 h-[300px]',
    isOddDay: 'true',
  },
  {
    day: 'Day 2',
    title: 'Creativity and Imagination Day',
    paragraph:
      'Unleash your imagination with innovative art projects and inspiring performances.',
    color: '#2057CC',
    lineDescription: 'h-[350px]',
    isOddDay: 'false',
  },
  {
    day: 'Day 3',
    title: 'Health and Environment Day',
    paragraph:
      'Dive into activities focusing on our planet and children’s well-being.',
    color: '#DA1E40',
    lineDescription: 'h-[300px]',
    isOddDay: 'true',
  },
  {
    day: 'Day 4',
    title: 'WCF Awards Banquettion Day',
    paragraph:
      'Celebrate the achievements of young artists before they return home with a life-changing experience.',
    color: '#2057CC',
    lineDescription: ' ',
    isOddDay: 'false',
  },
];

export default function FestivalHighlights() {
  return (
    <section>
      <h2 className="text-center text-3xl font-extrabold lg:mb-16 lg:text-[40px]">
        Festival Highlights
      </h2>
      <VerticalTimeline items={VerticalTimelineData} />
    </section>
  );
}
