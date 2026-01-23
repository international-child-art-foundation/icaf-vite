import { IResearchAndPublicationsItem } from '@/types/ResearchAndPublicationsTypes';

export const ResearchAndPublicationsItem = ({
  title,
  description,
  imgSrc,
  link,
  author,
  date,
}: IResearchAndPublicationsItem) => {
  return (
    <div className="bg-primary-muted/15 hover:bg-primary-muted/30 group rounded-xl p-4 transition-all sm:p-8">
      <div className="grid h-auto w-full grid-cols-2 grid-rows-[auto_1fr] gap-x-6 overflow-hidden md:h-[400px]">
        <div className="col-span-2 row-start-1 flex flex-col gap-1 md:col-span-1">
          <p className="text-md italic text-gray-900">
            {author}, {date}
          </p>
          <a
            href={link}
            className="font-montserrat text-lg font-bold transition-all group-hover:font-extrabold"
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
          <div className="h-1 w-full bg-black"></div>
        </div>

        <a
          href={link}
          target="_blank"
          className="col-span-1 col-start-2 row-start-2 my-auto overflow-hidden md:row-span-2 md:row-start-1"
          rel="noopener noreferrer"
        >
          <img
            src={imgSrc}
            className="object-cover pt-2 md:mx-auto md:max-h-[400px] md:pt-0 lg:mx-[unset] lg:max-h-[unset]"
            alt={title}
          />
        </a>

        <p className="col-span-1 col-start-1 row-start-2 pt-4 md:pt-2">
          {description}
        </p>
      </div>
    </div>
  );
};
