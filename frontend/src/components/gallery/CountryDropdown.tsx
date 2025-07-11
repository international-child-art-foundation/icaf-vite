import { useState } from 'react';
import '/node_modules/flag-icons/css/flag-icons.min.css';

export const CountryDropdown = () => {
  const [countryCode, setCountryCode] = useState('pe');
  return (
    <div className="border-1 rounded-md border-black shadow-md">
      <div>
        <p>Flag area</p>
        <div className={`fi fi-${countryCode}`}></div>
      </div>
    </div>
  );
};
