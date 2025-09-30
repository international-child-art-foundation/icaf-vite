import { IBrandCampaignCard } from '@/types/SponsorshipTypes';
import sponsorFourSeasons from '@/assets/sponsorship/SponsorFourSeasons.webp';
import sponsorMadewell from '@/assets/sponsorship/SponsorMadewell.webp';
import sponsorFaber from '@/assets/sponsorship/SponsorFaber.webp';

import FaberCastellLogo from '@/assets/sponsorship/FaberCastellLogo.webp';
import FourSeasonsLogo from '@/assets/sponsorship/FourSeasonsLogo.webp';
import MadewellLogo from '@/assets/sponsorship/MadewellLogo.webp';
import AnthroLogo from '@/assets/sponsorship/Anthropologie.webp';
import AnthroContent from '@/assets/sponsorship/Anthro 1.webp';

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
