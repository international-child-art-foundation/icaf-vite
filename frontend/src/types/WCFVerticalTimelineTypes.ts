export interface TimeLineItem {
  day: string;
  title: string;
  paragraph: string;
  color: ColorKey;
  lineDescription: string;
  isOddDay: string;
}
type ColorKey = '#DA1E40' | '#2057CC';
