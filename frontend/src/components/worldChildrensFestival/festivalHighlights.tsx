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
    lineDescriptionDesktop: 'top-5 h-[200px]',
    alignDirectionMobile: 'right',
    alignDirectionDesktop: 'right',
  },
  {
    day: 'Day 2',
    title: 'Creativity and Imagination Day',
    paragraph:
      'Unleash your imagination with innovative art projects and inspiring performances.',
    color: '#2057CC',
    lineDescription: 'h-[350px]',
    lineDescriptionDesktop: 'h-[200px]',
    alignDirectionMobile: 'right',
    alignDirectionDesktop: 'left',
  },
  {
    day: 'Day 3',
    title: 'Peace and Leadership Day',
    paragraph:
      'Exercise your empathy with collaborative mural making and learn to be change-makers.',
    color: '#DA1E40',
    lineDescription: 'h-[320px]',
    lineDescriptionDesktop: 'h-[200px]',
    alignDirectionMobile: 'right',
    alignDirectionDesktop: 'right',
  },
  {
    day: 'Day 4',
    title: 'WCF Awards Banquet Day',
    paragraph:
      'Celebrate the achievements of young artists before they return home with a life-changing experience.',
    color: '#2057CC',
    lineDescription: '',
    lineDescriptionDesktop: '',
    alignDirectionMobile: 'right',
    alignDirectionDesktop: 'left',
  },
];
/**
 * This component stores the TimeLineItem which helps design the vertical timeline.  It also serves as the section container.  The TimeLineItem is passed into the VerticalTimeline component which is the actual timeline
 */

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
