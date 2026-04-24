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
    <div className="flex h-[650px] max-w-full flex-col overflow-hidden rounded-[40px] sm:grid sm:h-[600px] sm:grid-cols-2">
      <div
        className={`${colorClassMap[item.color as ColorKey]} order-last content-center sm:order-none sm:place-items-center`}
      >
        <div className="flex select-none flex-col gap-6 p-10 sm:max-w-[600px] sm:pt-0">
          <img src={item.icon} className="h-10 w-10" />
          <h3 className="font-montserrat text-2xl font-extrabold">
            {item.title}
          </h3>
          <p className="text-base">{item.body}</p>
        </div>
      </div>
      <div className="min-h-0 flex-initial">
        {item.contentType == 'img' && (
          <img
            className="order-first w-full object-cover object-top sm:order-none sm:h-full"
            src={item.content}
          />
        )}{' '}
        {item.contentType == 'vid' && <video src={item.content} />}
      </div>
    </div>
  );
};
