import TeamImage from '@/assets/shared/images/TeamHeader.webp';
import EthicsImage from '@/assets/shared/images/about/more/Ethics.webp';
import PartnersImage from '@/assets/shared/images/about/more/Partners.webp';
import ImpactImage from '@/assets/shared/images/about/more/Impact.webp';

//images converted to webp, but may need check resizing later
export interface MoreOnOurSite {
  id: number;
  title: string;
  description: string;
  link?: string;
  buttonText: string;
  external?: boolean;
  image?: string;
}

export const moreOnOurSiteData: MoreOnOurSite[] = [
  // {
  //   id: 1,
  //   title: 'Leadership',
  //   description:
  //     "Meet the dedicated leaders who oversee ICAF's strategic direction and ensure the fulfillment of its mission. Their expertise drives the organization’s long-term success and impact.",
  //   image: BoardOfDirectorsImage,
  //   link: '/about/team',
  // },
  // TODO: Financials page and link
  // {
  //   id: 2,
  //   title: 'Financials',
  //   description:
  //     "Explore ICAF's financial transparency through detailed reports on funding and expenditures. This section demonstrates ICAF’s commitment to accountability and responsible stewardship of resources.",
  //   image: FinancialsImage,
  // },
  {
    id: 3,
    title: 'Team Members',
    description:
      'Learn more about the passionate individuals working behind the scenes at ICAF. Their commitment ensures that ICAF continues to serve and inspire children globally.',
    image: TeamImage,
    buttonText: 'Meet Our Team',
    link: '/about/team',
  },
  {
    id: 4,
    title: 'Code of Ethics',
    description:
      "Review ICAF's comprehensive ethical guidelines, which govern its operations and partnerships. These principles ensure integrity and fairness in all that the organization does.",
    image: EthicsImage,
    buttonText: 'Code of Ethics (PDF)',
    external: true,
    link: '/documents/code-of-ethics-icaf.pdf',
  },
  {
    id: 5,
    title: 'Partners',
    description:
      'Discover the organizations that collaborate with ICAF to expand its reach and amplify its impact. Together, they help create opportunities for children to thrive through art and creativity.',
    image: PartnersImage,
    buttonText: 'See Our Partners',
    link: '/about/partners',
  },
  {
    id: 6,
    title: 'Impact',
    description:
      "See the measurable difference ICAF is making in the lives of children across the globe. This section highlights key achievements and the lasting influence of ICAF's programs.",
    image: ImpactImage,
    buttonText: 'Review our Impact',
    link: '/about/impact',
  },
];
