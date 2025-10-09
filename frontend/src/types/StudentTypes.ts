import { ColorKey } from '@/components/shared/FlairColorMap';

export interface ICreativityItem {
  id: string;
  title: string;
  body: string;
  imgSrc: string;
}

export interface IStudentParticipationItem {
  id: string;
  imgSrc: string;
  title: React.ReactNode;
  forAges: string;
  buttonText: string;
  color: ColorKey;
  link: string;
  bodyText1: string;
  bodyText2: string;
  isExternal: boolean;
}
