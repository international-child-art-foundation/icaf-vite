import { IMagazine } from '@/types/Magazines';

export const MagazineEntryWithLink = ({
  name,
  period,
  volume,
  link,
  cover,
}: IMagazine) => {
  return (
    <a
      href={link}
      rel="noopener noreferrer"
      target="_blank"
      className="group flex cursor-pointer flex-col gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-white hover:shadow-md"
    >
      <img src={cover} />
      <div>
        <h1 className="font-montserrat text-2xl font-medium transition-all duration-300 group-hover:font-semibold">
          {name}
        </h1>
        <div className="text-md">
          <p>{period}</p>
          <p className="text-sm">{volume}</p>
        </div>
      </div>
    </a>
  );
};
