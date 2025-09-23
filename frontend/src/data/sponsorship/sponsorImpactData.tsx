import { ISponsorImpact } from '@/types/SponsorshipTypes';

export const SponsorImpactData: ISponsorImpact[] = [
  {
    key: 'sponsor-mall',
    numberLabel: '01',
    color: 'red',
    text: 'Make your mark at the National Mall as a World Children’s Festival sponsor.',
  },
  {
    key: 'branding-next-gen',
    numberLabel: '02',
    color: 'tertiaryBlue',
    text: 'Develop intergenerational branding by winning over the hearts of the next generation of consumers.',
  },
  {
    key: 'employee-volunteer',
    numberLabel: '03',
    color: 'yellow',
    text: 'Offer employees volunteer opportunities to bring the arts to their neighborhood schools.',
  },
  {
    key: 'inner-child-innovation',
    numberLabel: '04',
    color: 'green',
    text: 'Inspire employees’ “inner child” for collaborative innovation by hosting a child art exhibition.',
  },
  {
    key: 'licensing-art',
    numberLabel: '05',
    color: 'tertiaryPurple',
    text: 'Leverage the imagination of the world’s children by licensing their art for products or marketing materials.',
  },
  {
    key: 'co-branded-campaigns',
    numberLabel: '06',
    color: 'black',
    text: (
      <>
        Launch co-branded campaigns such as{' '}
        <a
          href="https://MyFavoriteSport.org"
          target="_blank"
          rel="noopener noreferrer"
          className="italic underline"
        >
          https://MyFavoriteSport.org
        </a>{' '}
        to reach new audiences and promote social good.
      </>
    ),
  },
  {
    key: 'adopt-icaf',
    numberLabel: '07',
    color: 'blue',
    text: 'Join the grassroots movement to democratize creativity and mainstream empathy by adopting ICAF as your charity organization.',
  },
];
