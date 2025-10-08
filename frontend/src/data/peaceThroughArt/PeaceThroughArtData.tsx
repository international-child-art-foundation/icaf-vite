import {
  IPTACard,
  IPTALabeledLink,
  IYoungArtistArtworks,
} from '@/types/PeaceThroughArtTypes';
import artAdibHayat from '@/assets/peaceThroughArt/Adib Hayat, 11, Lebanon.webp';
import artAmalAlHajj from '@/assets/peaceThroughArt/Amal Al Hajj (age 9) Yemen 1.webp';
import artAmirReza from '@/assets/peaceThroughArt/Amir Reza,9, Iran.webp';
import artAnnaCarolinaIsrael from '@/assets/peaceThroughArt/Anna Carolina Israel, 12, Brazil.webp';
import artDifeiLi from '@/assets/peaceThroughArt/Difei Li, 10, New Jersey.webp';
import artEllaGordanLatty from '@/assets/peaceThroughArt/Ella Gordan-Latty, 12, New Zealand.webp';
import artFadelAdib from '@/assets/peaceThroughArt/Fadel Adib 9, Lebanon.webp';
import artNathaniaCarolineCandra from '@/assets/peaceThroughArt/Nathania Caroline Candra, 8, Indonesia.webp';
import artNehaSiddiqui from '@/assets/peaceThroughArt/Neha Siddiqui, 11, Pakistan.webp';
import artRoxanaChisalita from '@/assets/peaceThroughArt/Roxana Chisalita, 11, Romania.webp';
import artMiryamBaadsa from '@/assets/peaceThroughArt/Miryam Baadasa, 11, Palestine.webp';
import artTessaCrisman from '@/assets/peaceThroughArt/Tessa Rae Crisman, 11, Colorado.webp';

export const PTACardData: IPTACard[] = [
  {
    title: 'Seed mutual empathy',
    body: 'so children learn to understand, not fear.',
    color: 'red',
  },
  {
    title: 'Disrupt generational trauma',
    body: 'so history doesn’t repeat itself.',
    color: 'blue',
  },
  {
    title: 'Create a new vision',
    body: 'where peace isn’t an ideal, but a reality.',
    color: 'yellow',
  },
];

export const YoungArtistArtworks: IYoungArtistArtworks[] = [
  { id: 1, label: 'Adib Hayat, 11, Lebanon', imgSrc: artAdibHayat },
  { id: 2, label: 'Amal Al Hajj, 9, Yemen', imgSrc: artAmalAlHajj },
  { id: 3, label: 'Amir Reza, 9, Iran', imgSrc: artAmirReza },
  {
    id: 4,
    label: 'Anna Carolina Israel, 12, Brazil',
    imgSrc: artAnnaCarolinaIsrael,
  },
  { id: 5, label: 'Difei Li, 10, New Jersey', imgSrc: artDifeiLi },
  {
    id: 6,
    label: 'Ella Gordan-Latty, 12, New Zealand',
    imgSrc: artEllaGordanLatty,
  },
  { id: 7, label: 'Fadel Adib, 9, Lebanon', imgSrc: artFadelAdib },
  {
    id: 8,
    label: 'Nathania Caroline Candra, 8, Indonesia',
    imgSrc: artNathaniaCarolineCandra,
  },
  { id: 9, label: 'Neha Siddiqui, 11, Pakistan', imgSrc: artNehaSiddiqui },
  {
    id: 10,
    label: 'Roxana Chisalita, 11, Romania',
    imgSrc: artRoxanaChisalita,
  },
  { id: 11, label: 'Miryam Baadasa, 11, Palestine', imgSrc: artMiryamBaadsa },
  { id: 12, label: 'Tessa Rae Crisman, 11, Colorado', imgSrc: artTessaCrisman },
];

export const PTALearnMoreData: IPTALabeledLink[] = [
  // TODO: Find links for all entries
  {
    source: 'The Lancet',
    title: 'Developing Children’s Creativity to Foster Peace',
    link: "/documents/Ishaq - Children's Creativity to Foster Peace.pdf",
  },
  {
    source: 'UNESCO Journal',
    title: 'Prosperity and Peace Through Art',
    link: '/documents/Prosperity and Peace through Art.pdf',
  },
  {
    source: 'SchoolArts',
    title: 'Peace Through Art and Sport',
  },
  {
    source: 'ChildArt',
    title: 'Special 9/11 Messages for Children',
  },
];
