export interface IContentCarouselItem {
  icon: string;
  title: string;
  body: string;
  contentType: ContentType;
  content: string;
  color: string;
}
type ContentType = 'img' | 'vid';

export type ContentCarouselData = IContentCarouselItem[];
