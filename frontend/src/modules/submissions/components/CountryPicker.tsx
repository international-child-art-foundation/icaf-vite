import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/utils';

const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(
  ' ',
);

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = COUNTRY_CODES.map((code) => ({
  code,
  flag: String.fromCodePoint(
    ...code.split('').map((letter) => 127397 + letter.charCodeAt(0)),
  ),
  name: displayNames.of(code) ?? code,
})).sort((a, b) => a.name.localeCompare(b.name));

type CountryPickerProps = {
  error?: string;
  label?: string;
  name?: string;
  onChange: (country: string) => void;
  required?: boolean;
  value: string;
};

export function CountryPicker({
  error,
  label = 'Country',
  name = 'country',
  onChange,
  required,
  value,
}: CountryPickerProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);
  const errorId = error ? `${id}-error` : undefined;
  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized || query === value) return countries;
    return countries.filter(
      (country) =>
        country.name.toLocaleLowerCase().includes(normalized) ||
        country.code.toLocaleLowerCase() === normalized,
    );
  }, [query, value]);

  useEffect(() => setQuery(value), [value]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const selectCountry = (country: (typeof countries)[number]) => {
    onChange(country.name);
    setQuery(country.name);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative space-y-2">
      <label
        htmlFor={id}
        className="flex items-center justify-between text-sm font-semibold text-slate-900"
      >
        <span>
          {label}
          {required && <span className="text-tertiary-red ml-1">*</span>}
        </span>
        {!error && value && (
          <CheckCircle2
            aria-hidden="true"
            className="text-secondary-green h-4 w-4"
          />
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          value={query}
          required={required}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={`${id}-options`}
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          autoComplete="country-name"
          placeholder="Start typing a country"
          className={cn(
            'focus:border-secondary-blue focus:ring-secondary-blue/20 h-12 w-full rounded-lg border border-slate-300 bg-white/90 px-4 pr-11 text-base shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2',
            error && 'border-tertiary-red bg-red-50/50',
          )}
          onBlur={() => {
            if (!countries.some((country) => country.name === query)) {
              setQuery(value);
            }
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                Math.min(current + 1, matches.length - 1),
              );
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === 'Enter' && open && matches[activeIndex]) {
              event.preventDefault();
              selectCountry(matches[activeIndex]);
            } else if (event.key === 'Escape') {
              setOpen(false);
              setQuery(value);
            }
          }}
        />
        <button
          type="button"
          aria-label="Show countries"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <ul
          id={`${id}-options`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
        >
          {matches.length ? (
            matches.map((country, index) => (
              <li
                key={country.code}
                role="option"
                aria-selected={country.name === value}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100',
                  index === activeIndex && 'bg-slate-100',
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectCountry(country)}
              >
                <span aria-hidden="true" className="text-xl">
                  {country.flag}
                </span>
                <span className="flex-1">{country.name}</span>
                {country.name === value && (
                  <Check
                    aria-hidden="true"
                    className="text-secondary-blue h-4 w-4"
                  />
                )}
              </li>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-slate-500">
              No countries found.
            </li>
          )}
        </ul>
      )}
      {error && (
        <p
          id={errorId}
          className="text-tertiary-red flex items-start gap-1.5 text-xs font-semibold"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          {error}
        </p>
      )}
    </div>
  );
}
