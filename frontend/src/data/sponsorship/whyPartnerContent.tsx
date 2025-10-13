import { IContentCallout } from '@/types/SponsorshipTypes';
import sponsorArt1 from '@/assets/sponsorship/SponsorArt1.webp';
import sponsorArt2 from '@/assets/sponsorship/SponsorArt2.webp';
import sponsorArt3 from '@/assets/sponsorship/SponsorArt3.webp';
import { RoundedBorderImg } from '@/components/sponsorship/RoundedBorderImg';
import { FiveCards } from '@/components/sponsorship/FiveCards';

export const theoryOfChange: IContentCallout = {
  title: 'Theory of Change',
  description: (
    <p className="text-[20px]">
      Since its founding in 1997, the International Child Art Foundation has
      spearheaded a grassroots movement to democratize creativity and mainstream
      empathy for a peaceful and prosperous future.
    </p>
  ),
  content: <RoundedBorderImg img={sponsorArt1} color="red" />,
  color: 'red',
  firework: true,
  fireworkClasses: 'absolute -bottom-12 lg:-top-16 -right-12 ',
  textOnLeft: false,
};

export const outreach: IContentCallout = {
  title: 'Outreach',
  description: (
    <p className="text-[20px]">
      A 501(c)(3) nonprofit with EIN 52-2032649, ICAF is headquartered in
      Washington, DC, and works in all U.S. states and territories, and more
      than 70 countries worldwide.
    </p>
  ),
  content: <RoundedBorderImg img={sponsorArt2} color="blue" />,
  color: 'blue',
  firework: true,
  fireworkClasses: 'absolute -bottom-12 lg:-bottom-20 -left-20',
  textOnLeft: true,
};

export const whatWeDo: IContentCallout = {
  title: 'What We Do',
  description: (
    <div className="flex flex-col gap-5 font-sans text-[20px]">
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Art & Sports Program</p>
        <p>
          ICAF organizes the Arts Olympiad—the world’s largest school art
          program—under an exclusive license from the U.S. Olympic and
          Paralympic Committee.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Global Events</p>
        <p>
          ICAF produces the World Children’s Festival at the National Mall every
          four years.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Publication</p>
        <p>
          ICAF publishes <span className="italic">ChildArt</span>, an ad-free
          quarterly magazine.{' '}
        </p>
      </div>
    </div>
  ),
  content: <RoundedBorderImg img={sponsorArt3} color="yellow" />,
  color: 'yellow',
  textOnLeft: false,
};

export const alignment: IContentCallout = {
  title: 'Alignment with UN Goals',
  description: (
    <p className="font-sans text-[20px]">
      ICAF’s programs and activities uniquely advance five of the United
      Nations' most important goals.
    </p>
  ),
  content: <FiveCards />,
  color: 'green',
  firework: true,
  fireworkClasses:
    'absolute bottom-0 lg:-top-12 lg:-left-12 right-0 sm:w-32 w-20',
  textOnLeft: true,
};
