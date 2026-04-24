import { ArtsOlympiadCardData } from '@/data/myFavoriteSport/MFSTodoData';
import { FlairColorMap } from '../shared/FlairColorMap';
import { Button } from '../ui/button';

export const MFSCards = () => {
  return (
    <div className="flex flex-col gap-8">
      <p className="font-montserrat text-3xl font-semibold">Get Involved!</p>
      <div className="space-between grid grid-rows-3 gap-12 lg:grid-cols-3 lg:grid-rows-1">
        {ArtsOlympiadCardData.map((data) => (
          <div
            key={data.title}
            className={`flex flex-col justify-between gap-8 overflow-hidden rounded-xl border-4 p-8 ${FlairColorMap[data.color].backgroundHover} ${FlairColorMap[data.color].border}`}
          >
            <p className="font-montserrat text-2xl font-semibold">
              {data.title}
            </p>
            <p className="text-lg">{data.description}</p>
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-xl"
            >
              <Button className="w-full text-lg">{data.linkText}</Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
