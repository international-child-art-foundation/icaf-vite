import { IProfessionalsHowToItem } from '@/types/Professionals';
import { FlairColorMap } from '../shared/FlairColorMap';

export const ProfessionalsHowToItem = ({
  title,
  description,
  color,
  imgSrc,
}: IProfessionalsHowToItem) => {
  return (
    <div
      className={`${FlairColorMap[color].border} flex max-w-screen-2xl flex-row gap-8 overflow-hidden rounded-xl border-4 p-4 px-8 md:px-12 lg:px-16 xl:px-20`}
    >
      <div className="grid grid-cols-[150px_1fr] items-center overflow-hidden">
        <img src={imgSrc} className="w-[150px] object-cover" />
      </div>
      <div className="h-full w-[10px] bg-gray-500"></div>
      <div className="flex flex-col justify-center">
        <p className="font-montserrat font-xl text-xl font-semibold">{title}</p>
        <p>{description}</p>
      </div>
    </div>
  );
};
