import { GalleryFilters } from './GalleryFilters';
import { useState } from 'react';

export const GalleryCore = () => {
  const [countryFilter, setCountryFilter] = useState('');
  return <GalleryFilters />;
};
