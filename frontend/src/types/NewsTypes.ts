interface INewsItemBase {
  source?: string;
  place?: string;
  body: string;
  date?: string;
}

export interface INewsLinkItem extends INewsItemBase {
  kind?: 'link';
  link?: string;
}

export interface INewsAudioItem extends INewsItemBase {
  kind: 'audio';
  src: string;
  downloadFilename?: string;
  link?: string;
  transcriptSrc?: string;
}

export type INewsItem = INewsLinkItem | INewsAudioItem;

export const isAudioNewsItem = (item: INewsItem): item is INewsAudioItem =>
  item.kind === 'audio';

export const isLinkNewsItem = (item: INewsItem): item is INewsLinkItem =>
  item.kind === undefined || item.kind === 'link';
