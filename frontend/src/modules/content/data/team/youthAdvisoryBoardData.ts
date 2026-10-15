import AashniSridharImg from '@/modules/content/assets/team/youth-advisory-board/aashni-sridhar.webp';
import AdaezeFavourOnwubikoImg from '@/modules/content/assets/team/youth-advisory-board/adaeze-favour-onwubiko.webp';
import AnwitaBImg from '@/modules/content/assets/team/youth-advisory-board/anwita-b.webp';
import DairaMinhyeChoiImg from '@/modules/content/assets/team/youth-advisory-board/daira-minhye-choi.webp';
import GraceRuiyangGImg from '@/modules/content/assets/team/youth-advisory-board/grace-ruiyang-g.webp';
import IvanZaklyazminskiyImg from '@/modules/content/assets/team/youth-advisory-board/ivan-zaklyazminskiy.webp';
import IvankaLexiImg from '@/modules/content/assets/team/youth-advisory-board/ivanka-lexi.webp';
import JessicaYImg from '@/modules/content/assets/team/youth-advisory-board/jessica-y.webp';
import KellyKImg from '@/modules/content/assets/team/youth-advisory-board/kelly-k.webp';
import MandaDImg from '@/modules/content/assets/team/youth-advisory-board/manda-d.webp';
import MohammadManiRabieiImg from '@/modules/content/assets/team/youth-advisory-board/mohammad-mani-rabiei.webp';
import MuhammadZayyanSaeedImg from '@/modules/content/assets/team/youth-advisory-board/muhammad-zayyan-saeed.webp';

export interface YouthAdvisoryBoardMember {
  image: string;
  name: string;
  location: string;
  link?: string;
  imagePosition?: string;
  objectPositionOverride?: string;
}

export const youthAdvisoryBoardData: YouthAdvisoryBoardMember[] = [
  {
    image: AashniSridharImg,
    name: 'Aashni Sridhar',
    location: 'Georgia',
  },
  {
    image: AdaezeFavourOnwubikoImg,
    name: 'Adaeze Favour Onwubiko',
    location: 'Nigeria',
  },
  {
    image: AnwitaBImg,
    name: 'Anwita B.',
    location: 'California',
    imagePosition: 'center 58%',
  },
  {
    image: DairaMinhyeChoiImg,
    name: 'Daira Minhye Choi',
    location: 'Argentina',
  },
  {
    image: GraceRuiyangGImg,
    name: 'Grace Ruiyang G.',
    location: 'Texas',
  },
  {
    image: IvanZaklyazminskiyImg,
    name: 'Ivan Zaklyazminskiy',
    location: 'Texas',
    objectPositionOverride: 'object-[calc(50%_+_40px)_center]',
  },
  {
    image: IvankaLexiImg,
    name: 'Ivanka Lexi',
    location: 'Maryland',
    link: 'https://ivankalexi.com/',
    imagePosition: 'center 43%',
  },
  {
    image: JessicaYImg,
    name: 'Jessica Y.',
    location: 'Maryland',
  },
  {
    image: KellyKImg,
    name: 'Kelly K.',
    location: 'Washington, DC',
  },
  {
    image: MandaDImg,
    name: 'Manda D.',
    location: 'Nebraska',
    imagePosition: 'center 20%',
  },
  {
    image: MohammadManiRabieiImg,
    name: 'Mohammad Mani Rabiei',
    location: 'Iran',
    link: 'https://mohammadmanirabiei.ir/',
  },
  {
    image: MuhammadZayyanSaeedImg,
    name: 'Muhammad Zayyan Saeed',
    location: 'Pakistan',
  },
];
