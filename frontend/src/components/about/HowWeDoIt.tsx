import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerNoIcon,
} from '@/components/ui/accordion';
import { useState } from 'react';

/**
 * This component takes a hardcoded items array to populate the values on the accordions.  There is a mobile accordion that uses shadcn components to present a traditional layout.  Then a desktop xl+ view that is custom to fit the design requirements.  The active useState only applies to the desktop accordion to toggle between active/selected by the user.
 */

type AccordionStatsItem = {
  number: string;
  title: string;
  description: string;
  color: string;
};

const items: AccordionStatsItem[] = [
  {
    number: '01',
    title: 'Innovative Methodologies Up',
    description:
      'Over the past 27 years, we have developed innovative methodologies for students’ identity development. The Arts Olympiad, our school art program, introduces students to the “Artist-Athlete Ideal” of the creative mind and healthy body (mente sana in corpo sano)',
    color: 'var(--tertiary-red)',
  },
  {
    number: '02',
    title: 'Impact of Artist-Athletes',
    description:
      'Once the number of "artist athletes" grows, their school becomes a more integrated and healthy community, and their towns or cities transform into creative clusters.',
    color: 'var(--tertiary-blue)',
  },
  {
    number: '03',
    title: 'Empowering Low-SES Students',
    description:
      'Creativity can empower low-SES students to blaze new trails that disrupt the vicious cycle of inherited poverty. But creativity can as easily be channeled to destroy, not only to create. Creativity alone is morally neutral and must be infused with empathy to fend off malevolent creativity.',
    color: 'var(--tertiary-yellow)',
  },
  {
    number: '04',
    title: "World Children's Festival",
    description:
      'At our World Children’s Festivals, students intuit past the material boundaries that exaggerate differences to see each other as inseparably human. They begin thinking of themselves and others as "creative empaths" working together to transform this wounded world into a wondrous one.',
    color: 'var(--tertiary-green)',
  },
  {
    number: '05',
    title: 'Inspiring and Uniting Youth',
    description:
      'To inspire and unite young people, we provide them with unique and unprecedented art making opportunities, and we showcase their creative expressions at major venues across America and worldwide.',
    color: 'var(--tertiary-purple)',
  },
];

export default function HowWeDoIt() {
  const [active, setActive] = useState<number>(0);
  return (
    <section className="max-w-screen-2xl">
      <h2 className="font-montserrat mb-10 text-center text-3xl font-extrabold lg:text-[40px]">
        How We Do It
      </h2>
      {/* Mobile vertically styled accordian */}
      <div className="xl:hidden">
        {items.map((item) => (
          <Accordion type="single" collapsible key={item.number}>
            <AccordionItem value={`item-${item.number}`}>
              <div
                className="first-letter:font-montserrat text-[80px] font-extrabold"
                style={{ color: `hsl(${item.color})` }}
              >
                {item.number}
              </div>

              <AccordionTriggerNoIcon
                className="font-montserrat text-2xl font-semibold"
                style={{ color: `hsl(${item.color})` }}
              >
                {item.title}
              </AccordionTriggerNoIcon>
              <AccordionContent className="pb-8 pt-4 font-sans text-base font-light">
                {item.description}
              </AccordionContent>
              <div
                className="border"
                style={{ borderColor: `hsl(${item.color})` }}
              ></div>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      {/* Large desktop horizontally styled accordian */}
      <div className="hidden w-full xl:grid xl:grid-cols-5">
        {items.map((item, index) => {
          const isActive = index === active;
          return (
            <div
              key={item.number}
              className={`col-span-1 flex flex-col items-start justify-start border-r-4 transition-all duration-300`}
              style={{ borderColor: `hsl(${item.color})` }}
            >
              {/* Click target */}
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-expanded={isActive}
                className="group w-full text-left focus:outline-none"
              >
                {/* Top block: number + title. Vertical when collapsed, horizontal when active */}
                <div
                  className={
                    isActive
                      ? 'flex flex-col gap-4 px-4'
                      : 'flex justify-center gap-4'
                  }
                >
                  <span
                    className="font-montserrat text-[80px] font-extrabold leading-none"
                    style={{ color: `hsl(${item.color})` }}
                  >
                    {item.number}
                  </span>
                  <span
                    className={
                      isActive
                        ? 'font-montserrat pb-4 text-2xl font-semibold'
                        : 'font-montserrat text-2xl font-semibold xl:[writing-mode:vertical-rl]'
                    }
                    style={{ color: `hsl(${item.color})` }}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Description only for active item */}
                {isActive && (
                  <p className="px-4 font-sans text-xl leading-normal">
                    {item.description}
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
