export interface TimeLineItem {
  day: string;
  title: string;
  paragraph: string;
  color: ColorKey;
  lineDescription: string;
  lineDescriptionDesktop: string;
  alignDirectionMobile: DirectionKey;
  alignDirectionDesktop: DirectionKey;
}
type ColorKey = '#DA1E40' | '#2057CC';
type DirectionKey = 'right' | 'left';
