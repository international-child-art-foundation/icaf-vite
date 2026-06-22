export const LARGE_MEDIA_BASE_URL = 'https://media.icaf.org';

const largeMediaUrl = (fileName: string) =>
  `${LARGE_MEDIA_BASE_URL}/${encodeURIComponent(fileName)}`;

export const largeMedia = {
  icafOverviewCropped: largeMediaUrl('icaf-overview-cropped.mp4'),
  wcfMusicalCelebration: largeMediaUrl('WCF Musical Celebration.mp4'),
  swatchMasterWatchmaker: largeMediaUrl(
    'Swatchs master watchmaker at the World Childrens Festival.mp4',
  ),
  katrinaHealingArtsProgram: largeMediaUrl(
    'ICAF Katrina Healing Arts program.mp4',
  ),
  wcf2021OpeningAddress: largeMediaUrl(
    '2021 World Childrens Festival opening address by Dr. Liston Bochette III.mp4',
  ),
  savingEndangeredSpeciesArtContest: largeMediaUrl(
    '2014 ICAF Judges Saving Endangered Species Art Contest.mp4',
  ),
  artAsSourceOfHealing: largeMediaUrl('art-as-a-source-of-healing.mp4'),
  fourthOfJuly: largeMediaUrl('4th-of-July.mp4'),
  artsOlympiad: largeMediaUrl('Arts-olympiad-styleB.mp4'),
} as const;

export type LargeMediaKey = keyof typeof largeMedia;
