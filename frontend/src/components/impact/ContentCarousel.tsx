import {
  ContentCarouselData,
  IContentCarouselItem,
} from '@/types/ImpactPageTypes';

interface ContentCarouselProps {
  carouselData: ContentCarouselData;
}

export const ContentCarousel = ({ carouselData }: ContentCarouselProps) => {
  return (
    <>
      {carouselData.map((item) => {
        return <div key={item.title}>{item.color}</div>;
      })}
    </>
  );
};
