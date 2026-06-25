import { Button } from '../../../../shared/components/ui/button';
import { CountryFlag } from '@/shared/components/CountryFlag';

interface TagProps {
  label: string;
  filterType: string;
  onRemove: () => void;
}

export const Tag = ({ label, filterType, onRemove }: TagProps) => (
  <Button
    type="button"
    variant={'secondary'}
    onClick={onRemove}
    className="my-auto flex max-w-full items-center gap-1 rounded-full border border-gray-600 bg-white px-5 py-1 text-sm hover:bg-gray-100"
  >
    <p className="text-md flex min-w-0 items-center">
      {filterType === 'country' && (
        <CountryFlag
          country={label}
          className="mr-2 h-3 w-[18px] shrink-0 rounded-[1px] object-cover shadow-sm"
        />
      )}
      <span className="min-w-0 truncate">{label}</span>
      <span className="ml-2 shrink-0 text-base leading-none">&times;</span>
    </p>
  </Button>
);
