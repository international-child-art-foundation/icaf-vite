import { artsOlympiadHelpfulLinks } from '@/data/artsOlympiad/artsOlympiadData';
import type { ArtsOlympiadHelpfulLink } from '@/types/ArtsOlympiadTypes';

export const ArtsOlympiadHelpfulLinks = () => {
  const renderLinkCard = (item: ArtsOlympiadHelpfulLink) => {
    const isExternal = item.external !== false;

    return (
      <li
        key={item.id}
        className="group relative mx-auto grid w-[300px] flex-shrink-0 grid-cols-1 grid-rows-2 overflow-hidden rounded-[9px] xl:w-auto"
      >
        <div className="relative col-start-1 row-span-2 row-start-1 w-full overflow-hidden">
          <img
            src={item.imageSrc}
            alt={item.label}
            className="h-full w-full rounded-[9px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <a
          href={item.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="bg-primary/90 z-10 col-start-1 row-span-1 row-start-2 flex items-center rounded-b-[9px] px-6 py-4"
        >
          <p className="font-openSans mx-auto text-center text-xl font-normal leading-relaxed text-white xl:text-[1rem]">
            {item.description}
          </p>
        </a>
      </li>
    );
  };

  return (
    <section className="helpful-links w-full rounded-[9px] px-4 py-10 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto flex w-full flex-col items-center gap-12 xl:gap-10">
        <h2 className="hl-title font-montserrat text-primary text-center text-3xl font-bold sm:text-[2.25rem] sm:leading-[2.8rem]">
          Helpful Materials
        </h2>
        <ul className="link-card-container grid w-full grid-flow-col gap-5 overflow-x-auto py-8 md:gap-6 xl:grid-cols-5 xl:grid-rows-1 xl:flex-wrap xl:justify-center xl:gap-5 xl:overflow-hidden">
          {artsOlympiadHelpfulLinks.map(renderLinkCard)}
        </ul>
      </div>
    </section>
  );
};
