type MagazineSortInput = {
  name?: string;
  period?: string;
  slug?: string;
  ts?: number;
  volume?: string;
};

const MONTH_NUMBERS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function monthNumber(month: string | undefined): number | null {
  if (!month) return null;
  return MONTH_NUMBERS[month.trim().toLowerCase()] ?? null;
}

export function magazinePeriodSortKey(period: string | undefined): number {
  if (!period) return Number.NEGATIVE_INFINITY;

  const normalizedPeriod = period.trim().replace(/[\u2010-\u2015]/g, '-');
  const match = normalizedPeriod.match(
    /^([A-Za-z]+)(?:\s*-\s*([A-Za-z]+))?\s+(\d{4})$/,
  );
  if (!match) return Number.NEGATIVE_INFINITY;

  const startMonth = monthNumber(match[1]);
  const endMonth = monthNumber(match[2]) ?? startMonth;
  const year = Number(match[3]);

  if (!endMonth || !Number.isInteger(year)) return Number.NEGATIVE_INFINITY;
  return year * 100 + endMonth;
}

export function magazineVolumeNumber(volume: string | undefined): number {
  if (!volume) return Number.NEGATIVE_INFINITY;

  const match = volume.match(/\bNumber\s+(\d+)\b/i);
  if (!match) return Number.NEGATIVE_INFINITY;

  const number = Number(match[1]);
  return Number.isFinite(number) ? number : Number.NEGATIVE_INFINITY;
}

export function compareMagazinesByPublicationDesc(
  a: MagazineSortInput,
  b: MagazineSortInput,
): number {
  const periodDelta =
    magazinePeriodSortKey(b.period) - magazinePeriodSortKey(a.period);
  if (periodDelta !== 0) return periodDelta;

  const volumeDelta =
    magazineVolumeNumber(b.volume) - magazineVolumeNumber(a.volume);
  if (volumeDelta !== 0) return volumeDelta;

  const aTs = typeof a.ts === 'number' && Number.isFinite(a.ts) ? a.ts : 0;
  const bTs = typeof b.ts === 'number' && Number.isFinite(b.ts) ? b.ts : 0;
  const timestampDelta = bTs - aTs;
  if (timestampDelta !== 0) return timestampDelta;

  const aLabel = a.slug ?? a.name ?? '';
  const bLabel = b.slug ?? b.name ?? '';
  return aLabel.localeCompare(bLabel);
}
