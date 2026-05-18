import { ISponsorCard } from '@/modules/content/types/SponsorshipTypes';
import { HealthIcon } from '@/shared/assets/icons/HealthIcon';
import { EducationIcon } from '@/shared/assets/icons/EducationIcon';
import { GenderEqualityIcon } from '@/shared/assets/icons/GenderEqualityIcon';
import { GroupIcon } from '@/shared/assets/icons/GroupIcon';
import { PeaceIcon } from '@/shared/assets/icons/PeaceIcon';

export const healthSponsorCard: ISponsorCard = {
  color: 'red',
  Icon: HealthIcon,
  text: 'Promote good health',
};

export const educationSponsorCard: ISponsorCard = {
  color: 'yellow',
  Icon: EducationIcon,
  text: 'Support quality education',
};

export const genderEqualitySponsorCard: ISponsorCard = {
  color: 'purple',
  Icon: GenderEqualityIcon,
  text: 'Ensure gender equality',
};

export const inequitiesSponsorCard: ISponsorCard = {
  color: 'blue',
  Icon: GroupIcon,
  text: 'Reduce inequality',
};

export const peaceSponsorCard: ISponsorCard = {
  color: 'green',
  Icon: PeaceIcon,
  text: 'Build peace in communities',
};
