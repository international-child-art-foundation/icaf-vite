import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export type FuzzyDropdownOption<Value extends string = string> = {
  value: Value;
  label: string;
  description?: string;
  searchText?: string;
  render?: ReactNode;
};

type FuzzyTextDropdownProps<Value extends string = string> = {
  disabled?: boolean;
  emptyLabel?: string;
  label: string;
  options: FuzzyDropdownOption<Value>[];
  placeholder?: string;
  removable?: boolean;
  selectedValue: Value | null;
  onFilterChange?: (options: FuzzyDropdownOption<Value>[], query: string) => void;
  onSelect: (value: Value | null) => void;
};

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

function isSubsequence(query: string, target: string): boolean {
  let queryIndex = 0;
  for (let targetIndex = 0; targetIndex < target.length; targetIndex += 1) {
    if (query[queryIndex] === target[targetIndex]) queryIndex += 1;
    if (queryIndex === query.length) return true;
  }
  return query.length === 0;
}

function fuzzyScore(optionText: string, query: string): number {
  const normalizedOption = normalizeSearchText(optionText);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 1;

  const compactOption = compactSearchText(optionText);
  const compactQuery = compactSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const optionTokens = normalizedOption.split(/\s+/).filter(Boolean);

  if (normalizedOption === normalizedQuery) return 1000;
  if (compactOption === compactQuery) return 950;
  if (normalizedOption.startsWith(normalizedQuery)) return 900;
  if (compactOption.startsWith(compactQuery)) return 850;
  if (normalizedOption.includes(normalizedQuery)) return 760;
  if (compactOption.includes(compactQuery)) return 720;

  let tokenScore = 0;
  for (const queryToken of queryTokens) {
    const bestTokenScore = optionTokens.reduce((best, optionToken) => {
      if (optionToken === queryToken) return Math.max(best, 110);
      if (optionToken.startsWith(queryToken)) return Math.max(best, 95);
      if (optionToken.includes(queryToken)) return Math.max(best, 70);
      if (isSubsequence(queryToken, optionToken)) return Math.max(best, 45);
      return best;
    }, 0);

    if (bestTokenScore === 0) return 0;
    tokenScore += bestTokenScore;
  }

  if (tokenScore > 0) return tokenScore + Math.max(0, 80 - optionTokens.length);
  return isSubsequence(compactQuery, compactOption) ? 35 : 0;
}

function optionSearchText(option: FuzzyDropdownOption): string {
  return [option.label, option.description, option.searchText]
    .filter(Boolean)
    .join(' ');
}

export function filterFuzzyOptions<Value extends string>(
  options: FuzzyDropdownOption<Value>[],
  query: string,
): FuzzyDropdownOption<Value>[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return options;

  return options
    .map((option, index) => ({
      index,
      option,
      score: fuzzyScore(optionSearchText(option), trimmedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.option);
}

export function FuzzyTextDropdown<Value extends string = string>({
  disabled = false,
  emptyLabel = 'No matches found.',
  label,
  options,
  placeholder = 'Type to filter',
  removable = true,
  selectedValue,
  onFilterChange,
  onSelect,
}: FuzzyTextDropdownProps<Value>) {
  const [query, setQuery] = useState('');
  const filteredOptions = useMemo(
    () => filterFuzzyOptions(options, query),
    [options, query],
  );
  const selectedOption =
    selectedValue === null
      ? null
      : options.find((option) => option.value === selectedValue) ?? null;

  useEffect(() => {
    onFilterChange?.(filteredOptions, query);
  }, [filteredOptions, onFilterChange, query]);

  const selectValue = (value: Value | null) => {
    onSelect(value);
    setQuery('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const nextValue = filteredOptions[0]?.value;
    if (nextValue) selectValue(nextValue);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-neutral-700" htmlFor={`${label}-dropdown`}>
          {label}
        </label>
        {selectedOption && removable && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-neutral-600"
            onClick={() => selectValue(null)}
            disabled={disabled}
          >
            <X aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>
      {selectedOption && (
        <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-primary" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-950">
              {selectedOption.label}
            </p>
            {selectedOption.description && (
              <p className="truncate text-xs text-neutral-600">
                {selectedOption.description}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
        <Input
          id={`${label}-dropdown`}
          value={query}
          placeholder={placeholder}
          className="pl-9"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-md border border-black/10 bg-white p-1 shadow-sm">
        {filteredOptions.length === 0 ? (
          <p className="px-3 py-2 text-sm text-neutral-500">{emptyLabel}</p>
        ) : (
          filteredOptions.map((option, index) => {
            const selected = option.value === selectedValue;
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'flex w-full items-start gap-2 rounded px-3 py-2 text-left text-sm transition',
                  selected
                    ? 'bg-primary text-white'
                    : index === 0 && query.trim()
                      ? 'bg-neutral-100 text-neutral-950'
                      : 'text-neutral-700 hover:bg-neutral-50',
                )}
                onClick={() => selectValue(option.value)}
                disabled={disabled}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {option.render ?? option.label}
                  </span>
                  {option.description && (
                    <span
                      className={cn(
                        'mt-0.5 block truncate text-xs',
                        selected ? 'text-white/75' : 'text-neutral-500',
                      )}
                    >
                      {option.description}
                    </span>
                  )}
                </span>
                {selected && <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
