import { IBrandCampaignCard } from '@/modules/content/types/SponsorshipTypes';
import sponsorFourSeasons from '@/modules/content/assets/sponsorship/SponsorFourSeasons.webp';
import sponsorMadewell from '@/modules/content/assets/sponsorship/SponsorMadewell.webp';
import sponsorFaber from '@/modules/content/assets/sponsorship/SponsorFaber.webp';

import FaberCastellLogo from '@/modules/content/assets/sponsorship/FaberCastellLogo.webp';
import FourSeasonsLogo from '@/modules/content/assets/sponsorship/FourSeasonsLogo.webp';
import MadewellLogo from '@/modules/content/assets/sponsorship/MadewellLogo.webp';
import AnthroLogo from '@/modules/content/assets/sponsorship/Anthropologie.webp';
import AnthroContent from '@/modules/content/assets/sponsorship/Anthro 1.webp';

export const brandCampaignCardData: IBrandCampaignCard[] = [
  {
    id: 'madewell',
    mainImg: sponsorMadewell,
    logo: MadewellLogo,
  },
  {
    id: 'four-seasons',
    mainImg: sponsorFourSeasons,
    logo: FourSeasonsLogo,
  },
  {
    id: 'faber-castell',
    mainImg: sponsorFaber,
    logo: FaberCastellLogo,
  },
  {
    id: 'anthropologie',
    mainImg: AnthroContent,
    logo: AnthroLogo,
  },
];
