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
      className={`${FlairColorMap[color].border} ${FlairColorMap[color].backgroundHover} max-w-screen-3xl mx-4 grid grid-cols-[100px_2px_1fr] flex-row items-center gap-8 overflow-hidden rounded-xl border-4 p-4 px-4 md:mx-6 md:grid-cols-[150px_2px_1fr] md:px-6 lg:mx-8 lg:px-8 xl:mx-10 xl:px-10`}
    >
      <div className="items-center overflow-hidden">
        <img src={imgSrc} className="object-cover" alt="" />
      </div>
      <div className="my-auto h-[50%] w-[2px] bg-gray-200"></div>
      <div className="flex flex-col justify-center">
        <h3 className="font-montserrat font-xl text-xl font-semibold lg:text-2xl">
          {title}
        </h3>
        <p className="text-normal lg:text-lg">{description}</p>
      </div>
    </div>
  );
};
