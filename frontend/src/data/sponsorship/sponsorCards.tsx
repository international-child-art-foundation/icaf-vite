import { ISponsorCard } from '@/types/SponsorshipTypes';
import { HealthIcon } from '@/assets/shared/icons/HealthIcon';
import { EducationIcon } from '@/assets/shared/icons/EducationIcon';
import { GenderEqualityIcon } from '@/assets/shared/icons/GenderEqualityIcon';
import { GroupIcon } from '@/assets/shared/icons/GroupIcon';
import { PeaceIcon } from '@/assets/shared/icons/PeaceIcon';

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
