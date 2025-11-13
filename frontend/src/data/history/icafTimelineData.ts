export interface IicafTimelineEvent {
  year: number;
  title: string;
  description: string;
  willBreak?: boolean; // If the text is too long for a single line, true
}

export type IicafTimelineData = IicafTimelineEvent[];

export const icafTimelineData: IicafTimelineData = [
  {
    year: 1997,
    title: 'ICAF Founded',
    description:
      'Founded ICAF as a 501(c)(3) nonprofit to promote children’s creativity worldwide.',
  },
  {
    year: 1998,
    title: 'First National Children’s Art Festival',
    description:
      'Hosted America’s first national children’s art festival; launched ChildArt magazine.',
    willBreak: true,
  },
  {
    year: 1999,
    title: 'First World Children’s Festival',
    description:
      'Held on the National Mall, Washington, D.C.; exhibitions at UN and World Bank/IMF.',
    willBreak: true,
  },
  {
    year: 2001,
    title: 'Leadership Recognition',
    description:
      'Received innovation leadership recognition from the Drucker Foundation and Frances Hesselbein.',
  },
  {
    year: 2002,
    title: 'Peace through Art',
    description:
      'Launched “Peace through Art” program with Fulbright Commission in Cyprus.',
  },
  {
    year: 2003,
    title: 'Children’s Peace Day',
    description:
      'Proclaimed by the Mayor of Washington, D.C.; art showcased at World Bank/IMF meetings.',
  },
  {
    year: 2004,
    title: 'Arts Olympiad in Olympic Bids',
    description:
      'Arts Olympiad featured in Olympic bid campaigns; launched post-disaster recovery art program with the World Bank.',
    willBreak: true,
  },
  {
    year: 2006,
    title: 'Global Exhibitions',
    description:
      'Exhibited at Turin Winter Olympics, Lisbon’s “Children of Katrina,” and Munich’s European Children’s Festival.',
  },
  {
    year: 2007,
    title: 'World Children’s Award',
    description:
      'Established the World Children’s Award; LEGO honored as the first recipient.',
  },
  {
    year: 2010,
    title: 'Healing Arts for Disaster Recovery',
    description:
      'Programs for children in Haiti and Chile; organized International Children’s Panel in Riyadh.',
    willBreak: true,
  },
  {
    year: 2011,
    title: 'Award to W.K. Kellogg Foundation',
    description: 'W.K. Kellogg Foundation received the World Children’s Award.',
    willBreak: true,
  },
  {
    year: 2012,
    title: 'Arts in Japan',
    description:
      'Arts Olympiad works displayed at 21st Century Museum of Contemporary Art, Kanazawa.',
  },
  {
    year: 2013,
    title: 'Tribute to Nelson Mandela',
    description: 'Special exhibition at THEARC in Washington, D.C.',
  },
  {
    year: 2014,
    title: 'Cannes Lions Collaboration',
    description: 'Partnered on World Children’s Festival logo design contest.',
  },
  {
    year: 2015,
    title: '5th World Children’s Festival',
    description: 'Held on the White House Ellipse, Washington, D.C.',
    willBreak: true,
  },
  {
    year: 2017,
    title: 'ChildArt – Brain Science Issue',
    description: 'Published with Johns Hopkins Brain Science Institute.',
    willBreak: true,
  },
  {
    year: 2018,
    title: 'ChildArt – Architecture Issue',
    description: 'Published with the American Institute of Architects.',
    willBreak: true,
  },
  {
    year: 2020,
    title: 'Virtual Expansion',
    description:
      'Launched online programs during pandemic, reaching 1M+ children.',
  },
  {
    year: 2023,
    title: 'Media Spotlight',
    description:
      'Featured in Los Angeles Times; published ChildArt AI edition.',
  },
];

export const leftIcafTimelineData: IicafTimelineData = icafTimelineData.filter(
  (_, idx) => idx % 2 == 0,
);
export const rightIcafTimelineData: IicafTimelineData = icafTimelineData.filter(
  (_, idx) => idx % 2 == 1,
);
