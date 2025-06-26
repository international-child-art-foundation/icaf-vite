import { IContentCarouselItem } from '@/types/ImpactPageTypes';

interface ICarouselItemDisplay {
  item: IContentCarouselItem;
  scrollToItem: (index: number) => void;
}

export const CarouselItemDisplay = ({ item }: ICarouselItemDisplay) => {
  const colorClassMap = {
    pink: 'bg-[#E7BDB9]',
    yellow: 'bg-[#FFECCB]',
    blue: 'bg-[#BFD0F2]',
  };
  type ColorKey = keyof typeof colorClassMap;

  return (
    <div className="grid-col grid grid-cols-2">
      <div
        className={`${colorClassMap[item.color as ColorKey]} flex flex-col gap-2 p-10`}
      >
        <img src={item.icon} />
        <p className="font-bold">{item.title}</p>
        <p>{item.body}</p>
      </div>
      <div>
        {item.contentType == 'img' && (
          <img className="h-full w-full object-cover" src={item.content} />
        )}{' '}
        {item.contentType == 'vid' && <video src={item.content} />}
      </div>
    </div>
  );
};
