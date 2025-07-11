import { CountryDropdown } from './CountryDropdown';

interface IGalleryFilters {
  countryFilter: string;
  setCountryFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const GalleryFilters = () => {
  return <CountryDropdown />;
};
