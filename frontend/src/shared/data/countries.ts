const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(
  ' ',
);

const COUNTRY_ALIASES = new Map<string, string>([
  ['america', 'US'],
  ['united states of america', 'US'],
  ['usa', 'US'],
  ['u.s.a.', 'US'],
  ['u.s.', 'US'],
  ['us', 'US'],
  ['uk', 'GB'],
  ['u.k.', 'GB'],
]);

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

const normalizeCountry = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');

export const countries = COUNTRY_CODES.map((code) => ({
  code,
  flagUrl: `/assets/flags/${code.toLocaleLowerCase()}.svg`,
  name: displayNames.of(code) ?? code,
})).sort((a, b) => a.name.localeCompare(b.name));

export type Country = (typeof countries)[number];

const countryByNormalizedName = new Map<string, Country>(
  countries.flatMap((country): Array<[string, Country]> => [
    [normalizeCountry(country.name), country],
    [country.code.toLocaleLowerCase(), country],
  ]),
);

export function getCountry(country?: string): Country | null {
  const normalized = country ? normalizeCountry(country) : '';
  if (!normalized) return null;

  const aliasedCode = COUNTRY_ALIASES.get(normalized);
  if (aliasedCode) {
    return countryByNormalizedName.get(aliasedCode.toLocaleLowerCase()) ?? null;
  }

  return countryByNormalizedName.get(normalized) ?? null;
}
