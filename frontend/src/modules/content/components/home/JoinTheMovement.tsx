import { ArrowRight, Gift, Lightbulb, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeartHeadIcon } from '@/shared/assets/icons/HeartHeadIcon';
import redBlueFirework from '@/shared/assets/images/RedBlueFirework.svg';

const waysToHelp = [
  {
    title: 'Inspire a child.',
    description:
      'Subscribe to ChildArt magazine for a child you love, your neighborhood school, or your local public library.',
    href: '/programs/childart-magazine',
    linkLabel: 'Subscribe to ChildArt',
    backgroundClass: 'bg-secondary-blue/10',
    icon: (
      <Lightbulb
        className="h-12 w-12 text-secondary-blue"
        strokeWidth={2.25}
        aria-hidden="true"
      />
    ),
  },
  {
    title: 'Unleash your team’s creativity.',
    description:
      'Host a masterclass that awakens your team’s creative inner child and sparks collaborative innovation.',
    href: '/contact',
    linkLabel: 'Ask about a masterclass',
    backgroundClass: 'bg-secondary-yellow/15',
    icon: (
      <Users
        className="h-12 w-12 text-secondary-yellow"
        strokeWidth={2.25}
        aria-hidden="true"
      />
    ),
  },
  {
    title: 'Celebrate an artist you love.',
    description:
      'Honor their legacy by supporting children’s art and imagination.',
    href: '/get-involved/art-lovers',
    linkLabel: 'Honor an Art Lover',
    backgroundClass: 'bg-secondary-pink/10',
    icon: (
      <Gift
        className="h-12 w-12 text-error"
        strokeWidth={2.25}
        aria-hidden="true"
      />
    ),
  },
  {
    title: 'Create a lasting legacy.',
    description:
      'Support the next generation in loving memory of a children’s champion.',
    href: '/get-involved/in-loving-memory',
    linkLabel: 'Give in Loving Memory',
    backgroundClass: 'bg-secondary-green/10',
    icon: <HeartHeadIcon colorClass="text-tertiary-green" className="h-12 w-12" />,
  },
];

export const JoinTheMovement = () => {
  return (
    <section
      aria-labelledby="join-the-movement-heading"
      className="breakout-w m-pad relative"
    >
      <img
        src={redBlueFirework}
        alt=""
        className="pointer-events-none absolute -top-12 right-6 hidden w-24 lg:block"
        loading="lazy"
      />

      <div className="relative mx-auto mb-10 max-w-4xl text-center">
        <h2
          id="join-the-movement-heading"
          className="font-montserrat text-[32px] font-extrabold text-black md:text-[40px]"
        >
          Join the global movement
        </h2>
        <p className="mt-6 font-sans text-xl leading-relaxed text-black md:text-2xl">
          Join the global movement to cultivate creativity and nurture empathy.
          Here’s how you can make a difference:
        </p>
      </div>

      <ul className="relative mx-auto grid max-w-6xl gap-6 md:grid-cols-2 md:gap-8">
        {waysToHelp.map((way) => (
          <li
            key={way.href}
            className={`flex flex-col items-start rounded-2xl p-6 md:p-8 ${way.backgroundClass}`}
          >
            {way.icon}
            <h3 className="mt-6 font-montserrat text-2xl font-semibold text-black">
              {way.title}
            </h3>
            <p className="mb-6 mt-4 font-sans text-lg leading-relaxed text-black">
              {way.description}
            </p>
            <Link
              to={way.href}
              className="group mt-auto inline-flex items-center gap-3 rounded-sm py-2 font-sans text-lg font-semibold text-primary underline underline-offset-4 transition-colors hover:text-secondary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {way.linkLabel}
              <ArrowRight
                className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
