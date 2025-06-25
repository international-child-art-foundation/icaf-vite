export interface IMissionDropdownData {
  title: string;
  image: string;
  color: string;
  body: string;
}

export interface IContentCarouselItem {
  icon: string;
  title: string;
  body: string;
  contentType: ContentType;
  content: string;
}
type ContentType = 'img' | 'vid';

export type ContentCarouselData = IContentCarouselItem[];
